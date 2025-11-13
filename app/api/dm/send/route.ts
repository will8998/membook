import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
	try {
		const me = cookies().get('mem_user_id')?.value || null;
		if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		const body = (await req.json()) as { peerId: string; content: string };
		const peerId = (body?.peerId || '').trim();
		const content = (body?.content || '').trim();
		if (!peerId) return NextResponse.json({ error: 'peerId required' }, { status: 400 });
		if (!content) return NextResponse.json({ error: 'Empty content' }, { status: 400 });
		if (content.length > 1000) return NextResponse.json({ error: 'Too long' }, { status: 400 });
		const { prisma } = await import('@/lib/db');
		const db: any = prisma as any;
		const msg = await db.dMMessage.create({
			data: {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				senderId: me,
				receiverId: peerId,
				content
			}
		});
		return NextResponse.json({ ok: true, message: msg });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to send' }, { status: 500 });
	}
}


