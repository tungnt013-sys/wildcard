import mongoose from 'mongoose'

const MONGODB_DB = process.env.MONGODB_DB || 'wildcard'

interface MongooseCache {
  conn: typeof mongoose | null
  promise: Promise<typeof mongoose> | null
}

declare global {
  // eslint-disable-next-line no-var
  var _mongooseCache: MongooseCache | undefined
}

const cached: MongooseCache = global._mongooseCache ?? { conn: null, promise: null }
global._mongooseCache = cached

export async function connectDB(): Promise<typeof mongoose> {
  // Guard deferred to call time so the module loads cleanly during `next build`
  const uri = process.env.MONGODB_URI
  if (!uri) throw new Error('Please define the MONGODB_URI environment variable')

  if (cached.conn) return cached.conn

  if (!cached.promise) {
    cached.promise = mongoose.connect(uri, {
      dbName: MONGODB_DB,
      bufferCommands: false,
    })
  }

  cached.conn = await cached.promise
  return cached.conn
}
