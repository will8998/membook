import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

declare global {
	// eslint-disable-next-line no-var
	var __friendsMem: { userId: string; friendId: string }[] | undefined;
}
const memFriends = () => {
	if (!global.__friendsMem) global.__friendsMem = [];
	return global.__friendsMem;
};

export async function POST(req: NextRequest) {
	try {
		const { prisma } = await import('@/lib/db');
		const { friendId } = (await req.json()) as { friendId: string };
		if (!friendId) return NextResponse.json({ error: 'friendId required' }, { status: 400 });
		const cookieStore = cookies();
		const userId = cookieStore.get('mem_user_id')?.value;
		if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		if (userId === friendId) return NextResponse.json({ error: 'Cannot add self' }, { status: 400 });

		try {
			// @ts-ignore guard for migration absence
			if (!(prisma as any).friend?.upsert) throw new Error('no_table');
			await (prisma as any).friend.upsert({
				where: { userId_friendId: { userId, friendId } },
				update: {},
				create: { userId, friendId }
			});
			return NextResponse.json({ ok: true });
		} catch {
			const list = memFriends();
			if (!list.find((f) => f.userId === userId && f.friendId === friendId)) {
				list.push({ userId, friendId });
			}
			return NextResponse.json({ ok: true });
		}
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to add friend' }, { status: 500 });
	}
}


