import { NextRequest, NextResponse } from 'next/server'
import { saveMessage } from '@/lib/supabase-server'

// POST - save a message to a conversation
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const { role, content } = await request.json()
    if (!role || !content) {
      return NextResponse.json({ error: 'Role and content are required' }, { status: 400 })
    }
    await saveMessage(id, role, content)
    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Message POST error:', error)
    return NextResponse.json({ error: 'Failed to save message' }, { status: 500 })
  }
}
