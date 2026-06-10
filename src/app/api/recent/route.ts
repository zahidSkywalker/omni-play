// Omni Play — Recent Watch History API (GET/POST)

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getRecentCollection, sanitizeString } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limiter';

// GET — Return recent watch history for a device
export async function GET(request: NextRequest) {
  try {
    if (!checkRateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = sanitizeString(searchParams.get('deviceId') || '');

    if (!deviceId) {
      return NextResponse.json({ error: 'deviceId is required.' }, { status: 400 });
    }

    const db = await getDb();
    const collection = getRecentCollection(db);

    const recentItems = await collection
      .find({ deviceId })
      .sort({ watchedAt: -1 })
      .limit(50)
      .toArray();

    return NextResponse.json({ recent: recentItems });
  } catch (error) {
    console.error('[API/recent GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// POST — Add to recent watch history
export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const body = await request.json();
    const deviceId = sanitizeString(body.deviceId || '');
    const channelId = sanitizeString(body.channelId || '');
    const channelName = sanitizeString(body.channelName || 'Unknown');
    const logo = sanitizeString(body.logo || '');
    const category = sanitizeString(body.category || '');
    const country = sanitizeString(body.country || '');
    const url = sanitizeString(body.url || '');

    if (!deviceId || !channelId) {
      return NextResponse.json(
        { error: 'deviceId and channelId are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = getRecentCollection(db);

    // Upsert: update watchedAt if same channel, or insert new entry
    await collection.updateOne(
      { deviceId, channelId },
      {
        $set: {
          deviceId,
          channelId,
          channelName,
          logo,
          category,
          country,
          url,
          watchedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Added to recent.' });
  } catch (error) {
    console.error('[API/recent POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
