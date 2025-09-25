// Forzando recarga del servidor
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import path from 'path'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'
import { ObjectId } from 'mongodb'
import clientPromise from '../../../lib/mongodb'
import { withAuth } from '../../../lib/auth' // Importación corregida

export const config = { api: { bodyParser: false } }

const s3 = new S3Client({
  region: process.env.AWS_REGION!,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const uploadFileToS3 = async (file: formidable.File) => {
  if (!file || !file.filepath) throw new Error('Archivo inválido para S3')
  const buffer = fs.readFileSync(file.filepath)
  const ext = path.extname(file.originalFilename || '') || '.webp'
  const key = `productos/${uuidv4()}${ext}`
  await s3.send(
    new PutObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
      Body: buffer,
      ContentType: file.mimetype || 'application/octet-stream',
      ACL: 'public-read',
    }),
  )
  try {
    fs.unlinkSync(file.filepath)
  } catch (e) {}
  return `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`
}

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT')
    return res.status(405).json({ error: 'Método no permitido' })

  const form = formidable({ multiples: true, uploadDir: '/tmp' })

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
      const db = client.db('kamaluso')

      // --- Construcción explícita del documento a actualizar ---
      const updateDoc: any = {}

      // Campos de texto directos
      if (fields.nombre) updateDoc.nombre = fields.nombre
      if (fields.slug) updateDoc.slug = fields.slug
      if (fields.descripcion) updateDoc.descripcion = fields.descripcion
      if (fields.seoTitle) updateDoc.seoTitle = fields.seoTitle
      if (fields.seoDescription)
        updateDoc.seoDescription = fields.seoDescription
      if (fields.alt) updateDoc.alt = fields.alt
      if (fields.notes) updateDoc.notes = fields.notes
      if (fields.status) updateDoc.status = fields.status
      if (fields.categoria) updateDoc.categoria = fields.categoria
      if (fields.tapa) updateDoc.tapa = fields.tapa

      // Campo de precio (numérico)
      if (fields.precio) {
        updateDoc.precio = parseFloat(String(fields.precio)) || 0
      }
      // Campos de precio adicionales (numéricos)
      if (fields.precioFlex) {
        // Add this block
        updateDoc.precioFlex = parseFloat(String(fields.precioFlex)) || 0
      }
      if (fields.precioDura) {
        // Add this block
        updateDoc.precioDura = parseFloat(String(fields.precioDura)) || 0
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

      // Campo de subcategoría (array de strings)
      const subCategoriaField = (fields.subCategoria as string) || ''
      updateDoc.subCategoria = subCategoriaField ? [subCategoriaField] : []

      // Lógica para imágenes (igual que antes)
      const filePrincipal = (files.image || files.imagen) as any
      if (filePrincipal) {
        const fp = Array.isArray(filePrincipal)
          ? filePrincipal[0]
          : filePrincipal
        updateDoc.imageUrl = await uploadFileToS3(fp as formidable.File)
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
            const url = await uploadFileToS3(f as formidable.File)
            newImagesUrls.push(url)
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