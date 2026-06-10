// Omni Play — Favorites API (GET/POST/DELETE)

import { NextRequest, NextResponse } from 'next/server';
import { getDb, getFavoritesCollection, sanitizeString } from '@/lib/mongodb';
import { checkRateLimit } from '@/lib/rate-limiter';

// GET — Return favorites for a device
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
    const collection = getFavoritesCollection(db);

    const favorites = await collection
      .find({ deviceId })
      .sort({ addedAt: -1 })
      .toArray();

    return NextResponse.json({ favorites });
  } catch (error) {
    console.error('[API/favorites GET] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// POST — Add channel to favorites
export async function POST(request: NextRequest) {
  try {
    if (!checkRateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const body = await request.json();
    const deviceId = sanitizeString(body.deviceId || '');
    const channelId = sanitizeString(body.channelId || '');
    const channelName = sanitizeString(body.channelName || 'Unknown');

    if (!deviceId || !channelId) {
      return NextResponse.json(
        { error: 'deviceId and channelId are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = getFavoritesCollection(db);

    // Upsert (add or update timestamp)
    await collection.updateOne(
      { deviceId, channelId },
      {
        $set: {
          deviceId,
          channelId,
          channelName,
          addedAt: new Date().toISOString(),
        },
      },
      { upsert: true }
    );

    return NextResponse.json({ success: true, message: 'Added to favorites.' });
  } catch (error) {
    console.error('[API/favorites POST] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}

// DELETE — Remove from favorites
export async function DELETE(request: NextRequest) {
  try {
    if (!checkRateLimit(request)) {
      return NextResponse.json({ error: 'Rate limit exceeded.' }, { status: 429 });
    }

    const { searchParams } = new URL(request.url);
    const deviceId = sanitizeString(searchParams.get('deviceId') || '');
    const channelId = sanitizeString(searchParams.get('channelId') || '');

    if (!deviceId || !channelId) {
      return NextResponse.json(
        { error: 'deviceId and channelId are required.' },
        { status: 400 }
      );
    }

    const db = await getDb();
    const collection = getFavoritesCollection(db);

    const result = await collection.deleteOne({ deviceId, channelId });

    if (result.deletedCount === 0) {
      return NextResponse.json({ error: 'Favorite not found.' }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: 'Removed from favorites.' });
  } catch (error) {
    console.error('[API/favorites DELETE] Error:', error);
    return NextResponse.json({ error: 'Internal server error.' }, { status: 500 });
  }
}
