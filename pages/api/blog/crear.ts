import type { NextApiRequest, NextApiResponse } from 'next'
import formidable from 'formidable'
import os from 'os'
import { withAuth } from '../../../lib/auth'
import { uploadFileToS3 } from '../../../lib/s3-upload'
import Post from '../../../models/Post'

export const config = { api: { bodyParser: false } }

const handler = async (req: NextApiRequest, res: NextApiResponse) => {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' })
  }

  const form = formidable({ multiples: false, uploadDir: os.tmpdir() })

  form.parse(req, async (err, fields, files) => {
    if (err) {
      return res
        .status(400)
        .json({ error: 'Error processing form', details: String(err) })
    }

    try {
      const { title, slug, content, excerpt, subtitle, tags, seoTitle, seoDescription } = fields

      if (!title || !slug || !content) {
        return res
          .status(400)
          .json({ error: 'Title, slug, and content are required' })
      }

      let coverImageUrl: string | undefined = undefined
      // formidable can return an array of files, even for a single upload. Handle this case.
      const coverImageFileArray = files.coverImage as formidable.File[];
      const coverImageFile = coverImageFileArray && coverImageFileArray.length > 0 ? coverImageFileArray[0] : null;

      if (coverImageFile) {
        coverImageUrl = await uploadFileToS3(coverImageFile)
      }

      const postDoc = {
        title: String(title),
        slug: String(slug),
        content: String(content),
        excerpt: String(excerpt || ''),
        subtitle: String(subtitle || ''),
        tags: Array.isArray(tags) ? tags : String(tags || '').split(',').map(tag => tag.trim()),
        coverImage: coverImageUrl,
        seoTitle: String(seoTitle || ''),
        seoDescription: String(seoDescription || ''),
      }

      const newPost = await Post.create(postDoc)

      res.status(201).json({
        ok: true,
        message: 'Post created successfully',
        id: newPost._id,
      })
    } catch (error: any) {
      console.error('CREATE POST ERROR:', error)
      if (error.code === 11000) {
        return res.status(409).json({ error: 'Slug already exists.' })
      }
      res.status(500).json({ error: 'Internal Server Error' })
    }
  })
}

export default withAuth(handler)