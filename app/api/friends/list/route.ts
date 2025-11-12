import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

declare global {
	// eslint-disable-next-line no-var
	var __friendsMem: { userId: string; friendId: string }[] | undefined;
}
const memFriends = () => global.__friendsMem || [];

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const cookieStore = cookies();
	const current = cookieStore.get('mem_user_id')?.value;
	const userId = url.searchParams.get('userId') || current;
	if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
	try {
		// @ts-ignore runtime guard
		if (!(prisma as any).friend?.findMany) throw new Error('no_table');
		const edges = await (prisma as any).friend.findMany({
			where: { userId }
		});
		const ids = edges.map((e: any) => e.friendId);
		const users = await prisma.user.findMany({
			where: { id: { in: ids } },
			include: { leaderboard: true }
		});
		return NextResponse.json({
			friends: users.map((u) => ({
				userId: u.id,
				handle: u.primaryHandle,
				archetype: u.archetype,
				rank: u.leaderboard?.rank ?? null
			}))
		});
	} catch {
		const edges = memFriends().filter((f) => f.userId === userId);
		const ids = edges.map((e) => e.friendId);
		const users = await prisma.user.findMany({
			where: { id: { in: ids } },
			include: { leaderboard: true }
		});
		return NextResponse.json({
			friends: users.map((u) => ({
				userId: u.id,
				handle: u.primaryHandle,
				archetype: u.archetype,
				rank: u.leaderboard?.rank ?? null
			}))
		});
	}
}


