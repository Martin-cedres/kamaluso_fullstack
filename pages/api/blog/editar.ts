import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import os from 'os'
import mongoose from 'mongoose'
import { withAuth } from '../../../lib/auth'
import { uploadFileToS3 } from '../../../lib/s3-upload'
import Post from '../../../models/Post'
import connectDB from '../../../lib/mongoose'

export const config = { api: { bodyParser: false } }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'PUT') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  return new Promise<void>((resolve, reject) => {
    const form = formidable({ multiples: false, uploadDir: os.tmpdir() })

    form.parse(req, async (err, fields, files) => {
      console.log('Formidable Error:', err);
      console.log('Formidable Fields:', fields);
      console.log('Formidable Files:', files);
      if (err) {
        res
          .status(400)
          .json({ error: 'Error processing form', details: String(err) })
        return resolve()
      }

      await connectDB()

      try {
        const { _id, title, slug, content, excerpt, subtitle, tags } = fields

        if (!_id) {
          res.status(400).json({ error: 'Post ID is required' })
          return resolve()
        }

        if (!mongoose.Types.ObjectId.isValid(String(_id))) {
          res.status(400).json({ error: 'Invalid Post ID' })
          return resolve()
        }

        const updateDoc: any = {}
        if (title) updateDoc.title = String(title)
        if (slug) updateDoc.slug = String(slug)
        if (content) updateDoc.content = String(content)
        if (excerpt) updateDoc.excerpt = String(excerpt)
        if (subtitle) updateDoc.subtitle = String(subtitle)
        if (tags) {
          if (Array.isArray(tags)) {
            updateDoc.tags = tags
              .map((tag) => String(tag).trim())
              .filter((tag) => tag.length > 0)
          } else if (typeof tags === 'string') {
            updateDoc.tags = tags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          } else {
            updateDoc.tags = []
          }
        }

        let coverImageFile: formidable.File | undefined
      if (files.coverImage && Array.isArray(files.coverImage)) {
        coverImageFile = files.coverImage[0] as formidable.File
      } else if (files.coverImage) {
        coverImageFile = files.coverImage as formidable.File
      }
        if (coverImageFile) {
          console.log('Cover Image Filepath:', coverImageFile.filepath);
          console.log('Cover Image Mimetype (raw):', coverImageFile.mimetype);
          const mimeTypeString = String(coverImageFile.mimetype);
          console.log('Cover Image Mimetype (string):', mimeTypeString);
          console.log('Mimetype starts with image/:', mimeTypeString.startsWith('image/'));

          if (!mimeTypeString || !mimeTypeString.startsWith('image/')) {
            res
              .status(400)
              .json({ error: 'El archivo de portada debe ser una imagen.' })
            return resolve()
          }
          try {
            const coverImageUrl = await uploadFileToS3(coverImageFile)
            updateDoc.coverImage = coverImageUrl
          } catch (uploadError: any) {
            console.error('S3 UPLOAD ERROR:', uploadError);
            res.status(500).json({ error: `Error al subir la imagen: ${uploadError.message}` });
            return resolve();
          }
        }

              if (Object.keys(updateDoc).length === 0 && !coverImageFile) {
                res.status(400).json({ error: 'No fields to update' })
                return resolve()
              }
        
              console.log('Update Document:', updateDoc);
        
              const updatedPost = await Post.findByIdAndUpdate(
                String(_id),
                updateDoc,
                {
                  new: true,
                },
              )
        
              if (!updatedPost) {
                res.status(404).json({ error: 'Post not found' })
                return resolve()
              }
        
              res.status(200).json({ ok: true, message: 'Post updated successfully' })
              resolve()
            } catch (error: any) {
              console.error('EDIT POST ERROR:', error)
              console.error('Full Error Object:', JSON.stringify(error, null, 2));
              if (error.code === 11000) {
                res.status(409).json({ error: 'Slug already exists.' })
              } else {
                res.status(500).json({ error: error.message || 'Internal Server Error' })
              }
              resolve()
            }    })
  })
}

export default withAuth(handler)