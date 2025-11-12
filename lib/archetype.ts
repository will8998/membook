export type ArchetypeType = 'Builder' | 'Collector' | 'Influencer' | 'Trader';

export async function computeArchetypeForUser(userId: string): Promise<{ type: ArchetypeType; explanation: string }> {
	const { prisma } = await import('@/lib/db');
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { identities: true, socialStats: true }
	});
	if (!user) {
		return { type: 'Collector', explanation: 'User not found; using default.' };
	}
	const totalFollowers = user.socialStats.reduce((a, s) => a + (s.followers || 0), 0);
	const hasGithub = user.identities.some((i) => i.platform === 'github');
	const hasFarcasterPop = user.socialStats.some((s) => s.platform === 'farcaster' && s.followers > 1000);
	const hasTwitterPop = user.socialStats.some((s) => s.platform === 'twitter' && s.followers > 3000);

	const scores: Record<ArchetypeType, number> = {
		Influencer: 0,
		Builder: 0,
		Collector: 0,
		Trader: 0
	};

	if (hasGithub) scores.Builder += 3;
	if (hasFarcasterPop) scores.Influencer += 2;
	if (hasTwitterPop) scores.Influencer += 3;
	if (totalFollowers > 10000) scores.Influencer += 4;

	if (scores.Builder === 0 && hasGithub) scores.Builder += 1;
	if (scores.Influencer === 0 && totalFollowers > 1000) scores.Influencer += 1;

	const best = (Object.keys(scores) as ArchetypeType[]).reduce((m, k) => (scores[k] > scores[m] ? k : m), 'Collector');

	let explanation = '';
	if (best === 'Influencer') explanation = `High total followers (${totalFollowers}).`;
	else if (best === 'Builder') explanation = 'Detected GitHub identity indicating builder activity.';
	else if (best === 'Trader') explanation = 'Market interest inferred from network signals.';
	else explanation = 'Defaulted based on limited signals.';

	return { type: best, explanation };
}


