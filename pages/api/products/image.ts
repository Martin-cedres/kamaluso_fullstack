// pages/api/products/image.ts
import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import fs from 'fs'
import { v4 as uuidv4 } from 'uuid'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

export const config = {
  api: {
    bodyParser: false,
  },
}

// Inicializar S3
const s3Client = new S3Client({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse,
) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Método no permitido' })
  }

  const form = formidable({ multiples: true, uploadDir: '/tmp' })

  form.parse(req, async (err, fields, files: any) => {
    if (err) return res.status(500).json({ error: 'Error parseando archivos' })

    try {
      const uploadedUrls: string[] = []

      // Convertir archivos en array
      const fileArray = Array.isArray(files.images)
        ? files.images
        : files.images
          ? [files.images]
          : []
      if (files.image) fileArray.unshift(files.image) // imagen principal primero

      for (const file of fileArray) {
        const fileContent = fs.readFileSync(file.filepath)
        const fileExt = file.originalFilename.split('.').pop()
        const key = `products/${uuidv4()}.${fileExt}`

        const command = new PutObjectCommand({
          Bucket: process.env.AWS_BUCKET_NAME!,
          Key: key,
          Body: fileContent,
          ACL: 'public-read',
        })

        await s3Client.send(command)

        uploadedUrls.push(
          `https://${process.env.AWS_BUCKET_NAME}.s3.${process.env.AWS_REGION}.amazonaws.com/${key}`,
        )
      }

      res.status(200).json({ urls: uploadedUrls })
    } catch (err) {
      console.error(err)
      res.status(500).json({ error: 'Error subiendo archivos a S3' })
    }
  })
}
