import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

export async function GET(req: NextRequest) {
	const cookieStore = cookies();
	const userId = cookieStore.get('mem_user_id')?.value;
	if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
	const user = await prisma.user.findUnique({ where: { id: userId } });
	if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
	const refCode = user.referralCode;

	const hits = await prisma.referralHit.findMany({ where: { refCode } });
	const clicks = hits.length;
	const signupsIds = hits.filter((h) => h.referredUserId).map((h) => h.referredUserId as string);
	const referredUsers = await prisma.user.findMany({
		where: { id: { in: signupsIds } },
		include: { leaderboard: true }
	});
	return NextResponse.json({
		refCode,
		clicks,
		signups: referredUsers.length,
		referred: referredUsers.map((u) => ({
			userId: u.id,
			handle: u.primaryHandle,
			archetype: u.archetype,
			rank: u.leaderboard?.rank ?? null
		}))
	});
}


