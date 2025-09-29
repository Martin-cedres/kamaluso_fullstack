import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import os from 'os' // Importar el módulo os
import { uploadFileToS3 } from '../../../lib/s3-upload'; // Importar la utilidad compartida
import clientPromise from '../../../lib/mongodb';
import { withAuth } from '../../../lib/auth';
import { revalidateProductPaths } from '../../../lib/utils';

export const config = { api: { bodyParser: false } };

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST')
    return res.status(405).json({ error: 'Método no permitido' })

  // Usar el directorio temporal del sistema operativo
  const form = formidable({ multiples: true, uploadDir: os.tmpdir() })

  form.parse(req, async (err, fields, files) => {
    if (err)
      return res
        .status(400)
        .json({ error: 'Error al procesar formulario', detalles: String(err) })

    try {
      const categoria = fields.categoria as string;
      if (!categoria) { // Simplemente chequear que la categoría exista
        return res.status(400).json({
          error: 'La categoría es un campo obligatorio.',
        });
      }

      const filePrincipal = (files.image || files.imagen) as any
      if (!filePrincipal)
        return res.status(400).json({ error: 'Falta la imagen principal' })
      const fp = Array.isArray(filePrincipal) ? filePrincipal[0] : filePrincipal;
      const imageUrl = await uploadFileToS3(fp as formidable.File, 'productos');

      const filesArray: formidable.File[] = []
      Object.keys(files).forEach((k) => {
        if (/^images/i.test(k) || k === 'images') {
          const val = (files as any)[k]
          if (Array.isArray(val))
            val.forEach((f: formidable.File) => filesArray.push(f))
          else filesArray.push(val)
        }
      })
      const imagesUrls: string[] = []
      for (const f of filesArray) {
        if (f && f.filepath) {
          const url = await uploadFileToS3(f as formidable.File, 'productos');
          imagesUrls.push(url);
        }
      }
      imagesUrls.unshift(imageUrl)

      const subCategoriaField = (fields.subCategoria as string) || ''

      const productoDoc: any = {
        nombre: String(fields.nombre || ''),
        slug: String(fields.slug || ''),
        claveDeGrupo: String(fields.claveDeGrupo || ''), // Añadir clave de grupo
        descripcion: String(fields.descripcion || ''),
        precio: parseFloat(String(fields.precio || '0')) || 0,
        precioFlex: parseFloat(String(fields.precioFlex || '0')) || 0,
        precioDura: parseFloat(String(fields.precioDura || '0')) || 0,
        categoria: categoria,
        subCategoria: subCategoriaField ? [subCategoriaField] : [],
        tapa: String(fields.tapa || ''),
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
        imageUrl,
        images: imagesUrls,
        creadoEn: new Date(),
      }

      const client = await clientPromise
      const db = client.db('kamaluso')
      const result = await db.collection('products').insertOne(productoDoc)

      // Revalidar las páginas afectadas
      if (productoDoc.slug && productoDoc.categoria) {
        await revalidateProductPaths(productoDoc.categoria, productoDoc.slug);
      }

      res
        .status(201)
        .json({
          ok: true,
          mensaje: 'Producto creado correctamente',
          id: result.insertedId,
        })
    } catch (error) {
      console.error('CREATE PRODUCT ERROR:', error)
      res.status(500).json({ error: 'Error interno al guardar el producto' })
    }
  })
}

// Exportación corregida
export default withAuth(handler)