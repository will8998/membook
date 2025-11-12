import { cookies } from 'next/headers';

export default async function ReferralsPage() {
	const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const statsRes = await fetch(`${base}/api/referral/stats`, { cache: 'no-store' });
	if (!statsRes.ok) {
		return <div className="text-white/70">Please connect or create a profile to view your referral stats.</div>;
	}
	const stats = await statsRes.json();
	const link = `${base}/?ref=${stats.refCode}`;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<a href="/" className="btn-secondary">← Back</a>
				<h1 className="text-2xl font-semibold">Referrals</h1>
				<div />
			</div>
			<div className="card p-4 space-y-3">
				<div className="text-sm text-white/70">Your referral link</div>
				<div className="flex flex-col sm:flex-row gap-2">
					<input className="flex-1 bg-black/30 rounded-md px-3 py-2 border border-white/10" readOnly value={link} />
					<a className="btn-secondary" href={`https://twitter.com/intent/tweet?text=${encodeURIComponent('Get your Memory Badge')}&url=${encodeURIComponent(link)}`} target="_blank" rel="noreferrer">Share on Twitter</a>
				</div>
				<div className="grid grid-cols-2 gap-3">
					<div className="bg-white/5 rounded-md p-3">
						<div className="text-sm text-white/70">Clicks</div>
						<div className="text-xl font-semibold">{stats.clicks}</div>
					</div>
					<div className="bg-white/5 rounded-md p-3">
						<div className="text-sm text-white/70">Signups</div>
						<div className="text-xl font-semibold">{stats.signups}</div>
					</div>
				</div>
			</div>
			<div className="card p-4">
				<div className="text-sm font-medium mb-2">Referred Users</div>
				<table className="w-full text-left">
					<thead className="text-white/70">
						<tr>
							<th className="py-2">Handle</th>
							<th>Archetype</th>
							<th>Rank</th>
						</tr>
					</thead>
					<tbody>
						{stats.referred?.map((r: any) => (
							<tr key={r.userId} className="border-t border-white/10">
								<td className="py-3"><a href={`/profile/${r.userId}`} className="hover:underline">{r.handle}</a></td>
								<td>{r.archetype || '-'}</td>
								<td>#{r.rank ?? '-'}</td>
							</tr>
						))}
						{(!stats.referred || stats.referred.length === 0) && (
							<tr className="border-t border-white/10">
								<td className="py-3 text-white/60" colSpan={3}>No signups yet.</td>
							</tr>
						)}
					</tbody>
				</table>
			</div>
		</div>
	);
}


