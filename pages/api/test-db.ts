import type { NextApiRequest, NextApiResponse } from 'next'
import clientPromise from '../../lib/mongodb'

type ResponseData = {
  status: 'success' | 'error'
  message: string
  error?: any
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<ResponseData>,
) {
  try {
    console.log('Attempting to connect to database...')
    const client = await clientPromise
    console.log('MongoClient promise resolved.')

    // Ping the database to confirm a successful connection
    await client.db('admin').command({ ping: 1 })
    console.log('Database ping successful.')

    res
      .status(200)
      .json({ status: 'success', message: 'Database connection successful!' })
  } catch (e: any) {
    console.error('Database connection failed:', e)
    res.status(500).json({
      status: 'error',
      message: 'Database connection failed. Check the server logs for details.',
      error: {
        name: e.name,
        message: e.message,
        stack: e.stack,
      },
    })
  }
}
