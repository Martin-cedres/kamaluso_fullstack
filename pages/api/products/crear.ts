import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os' // Importar el módulo os
import { uploadFileToS3 } from '../../../lib/s3-upload'; // Importar la utilidad compartida
import clientPromise from '../../../lib/mongodb';
import { withAuth } from '../../../lib/auth';
import { revalidateProductPaths } from '../../../lib/utils';

function norm(str: string): string {
  return String(str || '')
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-');
}

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Método no permitido' })

  // Helper para obtener el valor de un campo, manejando arrays de formidable
  const getFieldValue = (field: string | string[] | undefined): string => {
    if (Array.isArray(field)) {
      return field[0];
    }
    return field || '';
  };

  // Usar el directorio temporal del sistema operativo
  const form = formidable({ multiples: true, uploadDir: os.tmpdir() })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ error: 'Error al procesar formulario', detalles: String(err) });
    }

    try {
      const client = await clientPromise;
      const db = client.db('kamaluso');

      // --- Lógica de Categorías Refactorizada ---
      let finalCategoriaSlug = '';
      let finalSubCategoriaSlugs: string[] = [];
      
      const leafCategorySlugFromForm = getFieldValue(fields.subCategoria) || getFieldValue(fields.categoria);

      if (leafCategorySlugFromForm) {
        const categorySlug = norm(leafCategorySlugFromForm);
        const leafCategory = await db.collection('categories').findOne({ slug: categorySlug });

        if (!leafCategory) {
          return res.status(400).json({ error: `La categoría con slug '${categorySlug}' no fue encontrada.` });
        }

        if (leafCategory.parent) {
          const parentCategory = await db.collection('categories').findOne({ _id: leafCategory.parent });
          if (!parentCategory) {
            return res.status(500).json({ error: 'No se pudo encontrar la categoría padre asociada.' });
          }
          finalCategoriaSlug = parentCategory.slug;
          finalSubCategoriaSlugs = [leafCategory.slug];
        } else {
          finalCategoriaSlug = leafCategory.slug;
          finalSubCategoriaSlugs = [];
        }
      }
      // --- Fin Lógica de Categorías Refactorizada ---

      // Verificar unicidad del slug
      const slug = String(fields.slug || '');
      if (!slug) {
        return res.status(400).json({ error: 'El campo slug es obligatorio.' });
      }
      const existingProduct = await db.collection('products').findOne({ slug: slug });
      if (existingProduct) {
        return res.status(409).json({ error: `El slug '${slug}' ya existe. Por favor, elige otro.` });
      }

      const filePrincipal = (files.image || files.imagen) as any;
      if (!filePrincipal)
        return res.status(400).json({ error: 'Falta la imagen principal' });
      const fp = Array.isArray(filePrincipal) ? filePrincipal[0] : filePrincipal;
      const imageUrl = await uploadFileToS3(fp as formidable.File);

      const filesArray: formidable.File[] = [];
      Object.keys(files).forEach((k) => {
        if (/^images/i.test(k) || k === 'images') {
          const val = (files as any)[k];
          if (Array.isArray(val))
            val.forEach((f: formidable.File) => filesArray.push(f));
          else filesArray.push(val);
        }
      });
      const imagesUrls: string[] = [];
      for (const f of filesArray) {
        if (f && f.filepath) {
          const url = await uploadFileToS3(f as formidable.File);
          imagesUrls.push(url);
        }
      }
      imagesUrls.unshift(imageUrl);

      let customizationGroups = [];
      try {
        const groupsString = fields.customizationGroups as string;
        if (groupsString) {
          customizationGroups = JSON.parse(groupsString);
        }
      } catch (e) {
        console.error("Error parsing customizationGroups", e);
        return res.status(400).json({ error: 'Formato de grupos de personalización inválido.' });
      }

      // Upload images for customization options
      for (const key in files) {
        if (key.startsWith('optionImage_')) {
          const fileOrFiles = files[key];
          const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;

          if (file) {
            const url = await uploadFileToS3(file as formidable.File);
            const indices = key.split('_')[1]; // e.g., g0o1
            const groupIndex = parseInt(indices.substring(1, indices.indexOf('o')));
            const optionIndex = parseInt(indices.substring(indices.indexOf('o') + 1));

            if (!isNaN(groupIndex) && !isNaN(optionIndex) && customizationGroups[groupIndex]?.options[optionIndex]) {
              customizationGroups[groupIndex].options[optionIndex].image = url;
            }
          }
        }
      }

      const productoDoc: any = {
        nombre: String(fields.nombre || ''),
        slug: String(fields.slug || ''),
        claveDeGrupo: String(fields.claveDeGrupo || ''),
        descripcion: fields.descripcion as string || '',
        basePrice: parseFloat(String(fields.basePrice || '0')) || 0,
        categoria: finalCategoriaSlug,
        subCategoria: finalSubCategoriaSlugs,
        seoTitle: String(fields.seoTitle || ''),
        seoDescription: String(fields.seoDescription || ''),
        seoKeywords:
          typeof fields.seoKeywords === 'string'
            ? fields.seoKeywords.split(',').map((s) => s.trim())
            : [],
        alt: String(fields.alt || ''),
        notes: String(fields.notes || ''),
        status: String(fields.status || 'activo'),
        destacado:
          fields.destacado === 'true' || fields.destacado === true || false,
        showCoverType:
          fields.showCoverType === 'true' || fields.showCoverType === true || false,
        imageUrl,
        images: imagesUrls,
        customizationGroups: customizationGroups, // Guardar el array con las URLs de imagen
        creadoEn: new Date(),
        descripcionBreve: String(fields.descripcionBreve || ''),
        puntosClave: typeof fields.puntosClave === 'string' ? fields.puntosClave.split(',').map(s => s.trim()) : [],
        descripcionExtensa: String(fields.descripcionExtensa || ''),
      };

      const result = await db.collection('products').insertOne(productoDoc);

      // Revalidar las páginas afectadas
      if (productoDoc.slug && productoDoc.categoria) {
        const subCategoriaSlug = productoDoc.subCategoria && productoDoc.subCategoria.length > 0 ? productoDoc.subCategoria[0] : undefined;
        await revalidateProductPaths(
          productoDoc.categoria,
          subCategoriaSlug,
          productoDoc.slug,
          result.insertedId.toString()
        );
      }

      res
        .status(201)
        .json({
          ok: true,
          mensaje: 'Producto creado correctamente',
          id: result.insertedId,
        });
    } catch (error) {
      console.error('CREATE PRODUCT ERROR:', error);
      res.status(500).json({ error: 'Error interno al guardar el producto' });
    }
  });
}

// Exportación corregida
export default withAuth(handler)