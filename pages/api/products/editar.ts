// Forzando recarga del servidor
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { uploadFileToS3 } from '../../../lib/s3-upload'; // Importar la utilidad compartida
import { ObjectId } from 'mongodb';
import os from 'os'; // Importar os
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
  if (req.method !== 'PUT')
    return res.status(405).json({ error: 'Método no permitido' });

  // Helper para obtener el valor de un campo, manejando arrays de formidable
  const getFieldValue = (field: string | string[] | undefined): string => {
    if (Array.isArray(field)) {
      return field[0];
    }
    return field || '';
  };

  const form = formidable({ multiples: true, uploadDir: os.tmpdir() }); // Usar el directorio temporal del SO

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res
        .status(400)
        .json({ error: 'Error al procesar formulario', detalles: String(err) })

    const idFromFields = fields.id
    const productId = Array.isArray(idFromFields)
      ? idFromFields[0]
      : idFromFields

    if (!ObjectId.isValid(productId)) {
      return res
        .status(400)
        .json({
          error: `El ID de producto proporcionado no es válido: ${productId}`,
        })
    }

    console.log('productId:', productId)
    console.log('fields:', fields)
    console.log('files:', files)

    try {
      const client = await clientPromise
      const db = client.db('kamaluso');

      const updateDoc: any = {};

      // --- Nueva Lógica de Categorías ---
      let leafCategorySlugFromForm: string;
      const subCategoriaFromForm = getFieldValue(fields.subCategoria);

      if (subCategoriaFromForm) {
        leafCategorySlugFromForm = subCategoriaFromForm;
      } else {
        leafCategorySlugFromForm = getFieldValue(fields.categoria);
      }

      if (leafCategorySlugFromForm) {
        const categorySlug = norm(leafCategorySlugFromForm);
        const leafCategory = await db.collection('categories').findOne({ slug: categorySlug });

        if (!leafCategory) {
          return res.status(400).json({ error: `La categoría con slug '${categorySlug}' no fue encontrada.` });
        }

        if (leafCategory.parent) {
          const parentCategory = await db.collection('categories').findOne({ _id: leafCategory.parent });
          if (!parentCategory) {
            return res.status(500).json({ error: 'No se pudo encontrar la categoría padre.' });
          }
          updateDoc.categoria = parentCategory.slug;
          console.log('DEBUG: leafCategory.slug before push:', typeof leafCategory.slug, leafCategory.slug);
          updateDoc.subCategoria = [leafCategory.slug];
        } else {
          updateDoc.categoria = leafCategory.slug;
          updateDoc.subCategoria = [];
        }
      }
      // --- Fin Nueva Lógica de Categorías ---

      // Campos de texto directos (excluyendo `categoria` que ya se manejó)
      if (fields.nombre) updateDoc.nombre = String(fields.nombre);
      if (fields.slug) updateDoc.slug = String(fields.slug);
      if (fields.claveDeGrupo) updateDoc.claveDeGrupo = String(fields.claveDeGrupo);
      if (fields.descripcion) updateDoc.descripcion = String(fields.descripcion);
      if (fields.seoTitle) updateDoc.seoTitle = String(fields.seoTitle);
      if (fields.seoDescription) updateDoc.seoDescription = String(fields.seoDescription);
      if (fields.alt) updateDoc.alt = String(fields.alt);
      if (fields.notes) updateDoc.notes = String(fields.notes);
      if (fields.status) updateDoc.status = String(fields.status);

      // Campo de precio base (numérico)
      if (fields.basePrice) {
        updateDoc.basePrice = parseFloat(String(fields.basePrice)) || 0
      }
      // Campo de precio base (numérico)
      if (fields.basePrice) {
        updateDoc.basePrice = parseFloat(String(fields.basePrice)) || 0
      }

      // Nuevo: Manejo de customizationGroups
      if (fields.customizationGroups) {
        try {
          updateDoc.customizationGroups = JSON.parse(fields.customizationGroups as string);
        } catch (e) {
          console.error("Error parsing customizationGroups on edit", e);
          return res.status(400).json({ error: 'Formato de grupos de personalización inválido.' });
        }
      }

      // Upload images for customization options
      for (const key in files) {
        if (key.startsWith('optionImage_')) {
          const fileOrFiles = files[key];
          const file = Array.isArray(fileOrFiles) ? fileOrFiles[0] : fileOrFiles;

          if (file) {
            const url = await uploadFileToS3(file as formidable.File, 'productos/opciones');
            const indices = key.split('_')[1]; // e.g., g0o1
            const groupIndex = parseInt(indices.substring(1, indices.indexOf('o')));
            const optionIndex = parseInt(indices.substring(indices.indexOf('o') + 1));

            if (!isNaN(groupIndex) && !isNaN(optionIndex)) {
              if (!updateDoc.customizationGroups) {
                  const product = await db.collection('products').findOne({ _id: new ObjectId(productId) });
                  updateDoc.customizationGroups = product?.customizationGroups || [];
              }
              if (updateDoc.customizationGroups[groupIndex]?.options[optionIndex]) {
                updateDoc.customizationGroups[groupIndex].options[optionIndex].image = url;
              }
            }
          }
        }
      }

      // Campo destacado (booleano)
      if (fields.destacado !== undefined) {
        updateDoc.destacado = String(fields.destacado).toLowerCase() === 'true'
      }

      // Campo de keywords (array de strings)
      if (typeof fields.seoKeywords === 'string') {
        updateDoc.seoKeywords = fields.seoKeywords
          .split(',')
          .map((s) => s.trim())
      }

      // Lógica para imágenes (igual que antes)
      const filePrincipal = (files.image || files.imagen) as any
      if (filePrincipal) {
        const fp = Array.isArray(filePrincipal)
          ? filePrincipal[0]
          : filePrincipal;
        updateDoc.imageUrl = await uploadFileToS3(fp as formidable.File, 'productos');
      }

      const filesArray: formidable.File[] = []
      Object.keys(files).forEach((k) => {
        if (/^images/i.test(k)) {
          const val = (files as any)[k]
          if (Array.isArray(val))
            val.forEach((f: formidable.File) => filesArray.push(f))
          else filesArray.push(val)
        }
      })

      if (filesArray.length > 0) {
        const newImagesUrls: string[] = []
        for (const f of filesArray) {
          if (f && f.filepath) {
            const url = await uploadFileToS3(f as formidable.File, 'productos');
            newImagesUrls.push(url);
          }
        }
        updateDoc.images = newImagesUrls
      }

      updateDoc.actualizadoEn = new Date()

      // Ensure image consistency
      if (updateDoc.imageUrl || 'images' in updateDoc) {
        const product = await db
          .collection('products')
          .findOne({ _id: new ObjectId(productId) })
        if (product) {
          const finalImageUrl = updateDoc.imageUrl || product.imageUrl
          let finalImages
          if ('images' in updateDoc) {
            // New secondary images were uploaded
            finalImages = [finalImageUrl, ...(updateDoc.images || [])]
          } else {
            // No new secondary images, but maybe a new main image
            const existingImages = product.images || []
            // We need to remove the old imageUrl from the array, wherever it was
            const oldImageUrl = product.imageUrl
            const existingSecondaryImages = existingImages.filter(
              (img) => img !== oldImageUrl,
            )
            finalImages = [finalImageUrl, ...existingSecondaryImages]
          }
          updateDoc.images = finalImages
        }
      }

      console.log('updateDoc:', updateDoc)

      const result = await db
        .collection('products')
        .updateOne({ _id: new ObjectId(productId) }, { $set: updateDoc })

      console.log('result:', result)

      // Revalidar las páginas afectadas
      const updatedProduct = await db.collection('products').findOne({ _id: new ObjectId(productId) });
      if (updatedProduct && updatedProduct.slug && updatedProduct.categoria) {
        await revalidateProductPaths(updatedProduct.categoria, updatedProduct.slug);
      }

      res
        .status(200)
        .json({ ok: true, mensaje: 'Producto actualizado correctamente' })
    } catch (error) {
      console.error('EDIT PRODUCT ERROR:', error)
      res.status(500).json({ error: 'Error interno al actualizar el producto' })
    }
  })
}

// Exportación corregida
export default withAuth(handler)