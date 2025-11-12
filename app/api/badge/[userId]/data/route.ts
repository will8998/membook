import { prisma } from '@/lib/db';

export const runtime = 'nodejs';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
	const userId = params.userId;
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { identities: true, socialStats: true, leaderboard: true }
	});
	if (!user) return new Response('Not found', { status: 404 });
	const totalFollowers = user.socialStats.reduce((a, s) => a + s.followers, 0);
	const data = {
		userId,
		handle: user.primaryHandle,
		archetype: user.archetype || 'Explorer',
		rank: user.leaderboard?.rank ?? null,
		totalFollowers
	};
	return new Response(JSON.stringify({ data }), {
		headers: { 'Content-Type': 'application/json', 'Cache-Control': 'no-store' }
	});
}


