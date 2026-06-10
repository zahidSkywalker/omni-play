// Omni Play — MongoDB connection (lazy, optional)
// Works without mongodb package — features that need DB will gracefully degrade

export const hasMongoDB = !!process.env.MONGODB_URI;

// Lazy mongodb import — only loaded when actually needed at runtime
let _mongoClient: any = null;
let _mongoDb: any = null;

export async function connectDB() {
  if (_mongoDb) return _mongoDb;
  try {
    const { MongoClient } = await import('mongodb');
    const uri = process.env.MONGODB_URI;
    if (!uri) throw new Error('MONGODB_URI not set');
    _mongoClient = new MongoClient(uri);
    await _mongoClient.connect();
    _mongoDb = _mongoClient.db('diana_iptv');
    return _mongoDb;
  } catch (err) {
    console.error('[MongoDB] Connection failed:', err);
    throw err;
  }
}

export async function getDb() {
  return connectDB();
}

export interface CachedChannel {
  id: string;
  name: string;
  url: string;
  logo: string;
  category: string;
  country: string;
  tvgId?: string;
  tvgName?: string;
  sourceTag?: string;
  quality?: string;
}

export interface CachedFavorite {
  deviceId: string;
  channelId: string;
  channelName: string;
  addedAt: string;
}

export interface CachedRecent {
  deviceId: string;
  channelId: string;
  channelName: string;
  watchedAt: string;
  logo?: string;
  category?: string;
  country?: string;
  url?: string;
}

export interface ChannelCache {
  _id: string;
  channels: CachedChannel[];
  total: number;
  countries: string[];
  categories: string[];
  updatedAt: string;
}

export function getChannelCacheCollection(db: any) {
  return db.collection('channel_cache');
}

export function getFavoritesCollection(db: any) {
  return db.collection('favorites');
}

export function getRecentCollection(db: any) {
  return db.collection('recent');
}

export function sanitizeString(input: unknown, maxLength = 100): string {
  if (typeof input !== 'string') return '';
  let cleaned = input
    .replace(/[\x00-\x1F\x7F]/g, '')
    .replace(/[<>{}$]/g, '')
    .trim();
  return cleaned.slice(0, maxLength);
}

// JSON-based fallback for exam/quiz data (used when no MongoDB)
// Proxy so any method call returns empty/null gracefully
export const jsonDB = new Proxy({} as any, {
  get(_, prop) {
    return (...args: any[]) => {
      const name = typeof prop === 'string' ? prop : String(prop);
      if (name.startsWith('get') || name.startsWith('find') || name.startsWith('search')) return Promise.resolve([]);
      return Promise.resolve(null);
    };
  }
});
