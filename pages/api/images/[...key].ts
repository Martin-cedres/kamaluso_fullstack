// pages/api/images/[...key].ts
import type { NextApiRequest, NextApiResponse } from 'next'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'
import { Readable } from 'stream'

const s3 = new S3Client({
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
  try {
    // key comes as array in catch-all route
    const keyParts = req.query.key as string[] | undefined
    if (!keyParts || !keyParts.length)
      return res.status(400).json({ error: 'Falta la key' })

    const key = keyParts.join('/')

    const command = new GetObjectCommand({
      Bucket: process.env.AWS_BUCKET_NAME!,
      Key: key,
    })

    const data = await s3.send(command)

    res.setHeader('Content-Type', (data.ContentType as string) || 'image/webp')

    if (!data.Body)
      return res.status(404).json({ error: 'Imagen no encontrada' })

    if (data.Body instanceof Readable) {
      data.Body.pipe(res)
    } else {
      const chunks: any[] = []
      for await (const chunk of data.Body as any) chunks.push(chunk)
      res.end(Buffer.concat(chunks))
    }
  } catch (err: any) {
    console.error('S3 GET ERROR:', err)
    res
      .status(404)
      .json({
        error: 'Imagen no encontrada',
        detalles: String(err.message || err),
      })
  }
}
