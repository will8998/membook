import type { DMMessage } from '@prisma/client';
import { NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET() {
	try {
		const me = cookies().get('mem_user_id')?.value || null;
		if (!me) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		const { prisma } = await import('@/lib/db');
		const db: any = prisma as any;

		// Friends
		const friends = await prisma.friend.findMany({
			where: { userId: me },
			include: { friend: true },
			take: 100
		});
		const friendUsers = friends.map((f) => f.friend);

		// Recent DM partners
		const recent = await db.dMMessage.findMany({
			where: { OR: [{ senderId: me }, { receiverId: me }] },
			orderBy: { createdAt: 'desc' },
			take: 200
		});
		const partnerIds = Array.from(
			new Set(
				recent
					.map((m: DMMessage) => (m.senderId === me ? m.receiverId : m.senderId))
					.filter(Boolean) as string[]
			)
		);
		const recentUsers =
			partnerIds.length > 0
				? await prisma.user.findMany({ where: { id: { in: partnerIds } } })
				: [];

		// Merge and unique by id
		const combinedMap = new Map<string, any>();
		for (const u of [...friendUsers, ...recentUsers]) {
			combinedMap.set(u.id, u);
		}
		const users = Array.from(combinedMap.values()).slice(0, 100);

		return NextResponse.json({
			peers: users.map((u) => ({
				userId: u.id,
				handle: u.primaryHandle,
				archetype: u.archetype || null
			}))
		});
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed peers' }, { status: 500 });
	}
}


