import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

declare global {
	// eslint-disable-next-line no-var
	var __friendsMem: { userId: string; friendId: string }[] | undefined;
}
const memFriends = () => global.__friendsMem || [];

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const limit = Math.min(20, Number(url.searchParams.get('limit') || 10));
	const cookieStore = cookies();
	const me = cookieStore.get('mem_user_id')?.value || '';
	// collect friend ids
	let friendIds: string[] = [];
	try {
		// @ts-ignore
		if (!(prisma as any).friend?.findMany) throw new Error('no_table');
		const rows = await (prisma as any).friend.findMany({ where: { userId: me } });
		friendIds = rows.map((r: any) => r.friendId);
	} catch {
		friendIds = memFriends().filter((f) => f.userId === me).map((f) => f.friendId);
	}
	// fetch leaderboard top
	const leaders = await prisma.leaderboard.findMany({
		orderBy: { influenceScore: 'desc' },
		include: { user: true },
		take: 100
	});
	const suggestions = leaders
		.filter((l) => l.userId !== me && !friendIds.includes(l.userId))
		.slice(0, limit)
		.map((l) => ({
			userId: l.userId,
			handle: l.user.primaryHandle,
			archetype: l.user.archetype,
			rank: l.rank ?? null
		}));
	return NextResponse.json({ suggestions });
}


