import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os' // Importar el módulo os
import { uploadFileToS3, uploadFileToS3Original } from '../../../lib/s3-upload'; // Importar la utilidad compartida
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

      // --- Manejo del Video Preview (WebP Animado) ---
      let videoPreviewUrl = '';
      const videoFile = files.videoPreviewFile as any;
      if (videoFile) {
        const vf = Array.isArray(videoFile) ? videoFile[0] : videoFile;
        if (vf && vf.filepath) {
          videoPreviewUrl = await uploadFileToS3Original(vf as formidable.File);
        }
      }

      // --- Parseo de Campos Complejos (Igual que en editar.ts) ---

      let customizationGroups = [];
      try {
        const groupsString = getFieldValue(fields.customizationGroups);
        if (groupsString) {
          customizationGroups = JSON.parse(groupsString);

          // Asegurarse de que las URLs de las imágenes de los diseños de tapa sean completas (si vinieran pre-cargadas)
          customizationGroups.forEach((group: any) => {
            if (group.name && group.name.startsWith('Diseño de Tapa') && group.options) {
              group.options.forEach((option: any) => {
                if (option.image && !option.image.startsWith('http')) {
                  option.image = `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/processed/${option.image}`;
                }
              });
            }
          });
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

            if (!isNaN(groupIndex) && !isNaN(optionIndex)) {
              // Asegurar que existe la estructura antes de asignar
              if (!customizationGroups[groupIndex]) customizationGroups[groupIndex] = { options: [] };
              if (!customizationGroups[groupIndex].options[optionIndex]) customizationGroups[groupIndex].options[optionIndex] = {};

              customizationGroups[groupIndex].options[optionIndex].image = url;
            }
          }
        }
      }

      // Parsear puntosClave (Robusto: JSON o String)
      let puntosClave = [];
      if (fields.puntosClave) {
        const rawPuntos = String(fields.puntosClave);
        try {
          const parsed = JSON.parse(rawPuntos);
          if (Array.isArray(parsed)) {
            puntosClave = parsed;
          } else {
            puntosClave = rawPuntos.split(',').map(s => s.trim()).filter(s => s);
          }
        } catch (e) {
          puntosClave = rawPuntos.split(',').map(s => s.trim()).filter(s => s);
        }
      }

      // Parsear FAQs
      let faqs = [];
      if (fields.faqs) {
        try {
          const parsedFaqs = JSON.parse(String(fields.faqs));
          if (Array.isArray(parsedFaqs)) {
            faqs = parsedFaqs;
          }
        } catch (e) {
          console.error("Error parsing FAQs:", e);
        }
      }

      // Parsear Use Cases
      let useCases = [];
      if (fields.useCases) {
        try {
          const parsedUseCases = JSON.parse(String(fields.useCases));
          if (Array.isArray(parsedUseCases)) {
            useCases = parsedUseCases;
          }
        } catch (e) {
          console.error("Error parsing Use Cases:", e);
        }
      }

      const productoDoc: any = {
        nombre: String(fields.nombre || ''),
        slug: String(fields.slug || ''),
        claveDeGrupo: String(fields.claveDeGrupo || ''),
        descripcion: getFieldValue(fields.descripcion) || '',
        basePrice: parseFloat(String(fields.basePrice || '0')) || 0,
        categoria: finalCategoriaSlug,
        subCategoria: finalSubCategoriaSlugs,

        // SEO Fields
        seoTitle: String(fields.seoTitle || ''),
        seoDescription: String(fields.seoDescription || ''),
        seoKeywords:
          getFieldValue(fields.seoKeywords)
            ? getFieldValue(fields.seoKeywords).split(',').map((s) => s.trim())
            : [],

        alt: String(fields.alt || ''),
        notes: String(fields.notes || ''),
        status: String(fields.status || 'activo'),
        destacado:
          getFieldValue(fields.destacado) === 'true' || false,
        showCoverType:
          getFieldValue(fields.showCoverType) === 'true' || false,
        imageUrl,
        images: imagesUrls,
        customizationGroups: customizationGroups,
        creadoEn: new Date(),

        // AI Content Fields
        descripcionBreve: String(fields.descripcionBreve || ''),
        descripcionExtensa: String(fields.descripcionExtensa || ''),
        puntosClave: puntosClave,
        faqs: faqs,
        useCases: useCases,
        videoUrl: String(fields.videoUrl || ''),
        videoPreviewUrl,
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