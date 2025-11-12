import { formatNumber } from '@/lib/utils';
import AddFriendButton from '@/components/AddFriendButton';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function LeaderboardPage({ searchParams }: { searchParams?: { q?: string } }) {
	const { prisma } = await import('@/lib/db');
	const q = (searchParams?.q || '').toLowerCase();
	const leadersInitial = await prisma.leaderboard.findMany({
		orderBy: { influenceScore: 'desc' },
		include: { user: true },
		take: 50
	});
	let leaders = leadersInitial;
	if (q) {
		leaders = leaders.filter((l) => l.user.primaryHandle.toLowerCase().includes(q));
	}

	// Self-heal: if empty, compute leaderboard from current users' social stats
	if (leaders.length === 0) {
		const users = await prisma.user.findMany({ include: { socialStats: true } });
		const scored = users.map((u) => {
			const totalFollowers = u.socialStats.reduce((a, s) => a + s.followers, 0);
			const influenceScore = Math.log10(1 + Math.max(0, totalFollowers));
			return { userId: u.id, influenceScore };
		});
		for (const row of scored) {
			await prisma.leaderboard.upsert({
				where: { userId: row.userId },
				update: { influenceScore: row.influenceScore },
				create: { userId: row.userId, influenceScore: row.influenceScore }
			});
		}
		// assign ranks
		const all = await prisma.leaderboard.findMany({ orderBy: { influenceScore: 'desc' } });
		for (let i = 0; i < all.length; i++) {
			await prisma.leaderboard.update({ where: { userId: all[i].userId }, data: { rank: i + 1 } });
		}
		leaders = await prisma.leaderboard.findMany({
			orderBy: { influenceScore: 'desc' },
			include: { user: true },
			take: 50
		});
	}

	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<a href="/" className="btn-secondary">← Back</a>
				<h1 className="text-2xl font-semibold">Leaderboard</h1>
				<form className="flex items-center gap-2" action="/leaderboard" method="GET">
					<input
						className="bg-black/30 rounded-md px-3 py-2 border border-white/10"
						name="q"
						placeholder="Search handle..."
						defaultValue={q}
					/>
					<button className="btn-secondary" type="submit">Search</button>
				</form>
			</div>
			<div className="card p-4">
				<table className="w-full text-left">
					<thead className="text-white/70">
						<tr>
							<th className="py-2">Rank</th>
							<th>Primary Handle</th>
							<th>Influence</th>
							<th>Share</th>
							<th>Add</th>
						</tr>
					</thead>
					<tbody>
						{leaders.map((row) => (
							<tr key={row.userId} className="border-t border-white/10">
								<td className="py-3">{row.rank ?? '-'}</td>
								<td>
									<a href={`/profile/${row.userId}`} className="hover:underline">
										{row.user.primaryHandle}
									</a>
								</td>
								<td>{formatNumber(row.influenceScore)}</td>
								<td>
									<a
										className="text-[var(--mem-accent)]"
										href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(
											`I'm ranked #${row.rank ?? '-'} on Memory!`
										)}&url=${encodeURIComponent(
											`${process.env.NEXT_PUBLIC_APP_URL || ''}/profile/${row.userId}`
										)}`}
										target="_blank"
										rel="noreferrer"
									>
										Tweet
									</a>
								</td>
								<td><AddFriendButton friendId={row.userId} /></td>
							</tr>
						))}
						{leaders.length === 0 && (
							<tr className="border-t border-white/10">
								<td className="py-4 text-white/60" colSpan={5}>
									No entries yet. Visit a profile and click Refresh Data to populate stats.
								</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


