import type { DMMessage } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
	try {
		const me = cookies().get('mem_user_id')?.value || null;
		if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		const url = new URL(req.url);
		const peerId = url.searchParams.get('peerId');
		if (!peerId) return NextResponse.json({ error: 'peerId required' }, { status: 400 });
		const { prisma } = await import('@/lib/db');
		const db: any = prisma as any;
		const msgs = await db.dMMessage.findMany({
			where: {
				OR: [
					{ senderId: me, receiverId: peerId },
					{ senderId: peerId, receiverId: me }
				]
			},
			orderBy: { createdAt: 'asc' },
			take: 500
		});
		return NextResponse.json({
			messages: msgs.map((m: DMMessage) => ({
				id: m.id,
				senderId: m.senderId,
				receiverId: m.receiverId,
				content: m.content,
				createdAt: m.createdAt
			}))
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to load' }, { status: 500 });
	}
}


