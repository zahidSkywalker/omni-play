import { NextRequest, NextResponse } from 'next/server';

export async function GET() {
  try {
    const { db } = await import('@/lib/db');
    const conversations = await db.conversation.findMany({
      orderBy: { createdAt: 'desc' },
      include: {
        messages: {
          orderBy: { createdAt: 'asc' },
          take: 1,
        },
      },
    });
    return NextResponse.json(conversations);
  } catch (error) {
    console.error('GET conversations error:', error);
    return NextResponse.json([]);
  }
}

export async function POST(req: NextRequest) {
  try {
    const { title, mode, message } = await req.json();

    try {
      const { db } = await import('@/lib/db');
      const conversation = await db.conversation.create({
        data: {
          title: title || 'New Conversation',
          mode: mode || 'chat',
          messages: message ? {
            create: {
              role: 'user',
              content: message,
            },
          } : undefined,
        },
        include: { messages: true },
      });
      return NextResponse.json(conversation);
    } catch {
      // Fallback for serverless
      return NextResponse.json({
        id: crypto.randomUUID ? crypto.randomUUID() : `conv_${Date.now()}`,
        title: title || 'New Conversation',
        mode: mode || 'chat',
        createdAt: new Date().toISOString(),
        messages: message ? [{
          id: `msg_${Date.now()}`,
          role: 'user',
          content: message,
          createdAt: new Date().toISOString(),
        }] : [],
      });
    }
  } catch (error) {
    console.error('POST conversation error:', error);
    return NextResponse.json({ error: 'Failed to create conversation' }, { status: 500 });
  }
}
