import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function scoreFromFollowers(totalFollowers: number) {
	// Simple log-based scoring
	return Math.log10(1 + Math.max(0, totalFollowers));
}

export async function GET(req: NextRequest) {
	const search = new URL(req.url).searchParams;
	const limit = Math.min(100, Number(search.get('limit') || 20));
	const rows = await prisma.leaderboard.findMany({
		orderBy: { influenceScore: 'desc' },
		include: { user: true },
		take: limit
	});
	return NextResponse.json({
		leaders: rows.map((r) => ({
			userId: r.userId,
			primaryHandle: r.user.primaryHandle,
			influenceScore: r.influenceScore,
			rank: r.rank ?? null
		}))
	});
}

export async function POST(req: NextRequest) {
	try {
		const { userId } = (await req.json()) as { userId: string };
		if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: { socialStats: true }
		});
		if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });
		const totalFollowers = user.socialStats.reduce((a, s) => a + s.followers, 0);
		const influenceScore = scoreFromFollowers(totalFollowers);

		await prisma.leaderboard.upsert({
			where: { userId: user.id },
			update: { influenceScore },
			create: { userId: user.id, influenceScore }
		});

		// Recompute ranks (simple sort)
		const all = await prisma.leaderboard.findMany({
			orderBy: { influenceScore: 'desc' }
		});
		for (let i = 0; i < all.length; i++) {
			await prisma.leaderboard.update({
				where: { userId: all[i].userId },
				data: { rank: i + 1 }
			});
		}

		const me = await prisma.leaderboard.findUnique({ where: { userId: user.id } });
		return NextResponse.json({ influenceScore, rank: me?.rank ?? null });
	} catch (err: any) {
		return new NextResponse(err?.message || 'Leaderboard update failed', { status: 500 });
	}
}


