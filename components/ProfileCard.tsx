/* eslint-disable @next/next/no-img-element */
import { formatNumber } from '@/lib/utils';

export type Profile = {
	userId: string;
	archetype?: string | null;
	archetypeReason?: string | null;
	referralCode: string;
	identities: Array<{
		platform: string;
		handle: string;
		url?: string | null;
		avatarUrl?: string | null;
	}>;
	socialStats: Array<{
		platform: string;
		followers: number;
		following: number;
	}>;
	leaderboardRank?: number | null;
};

export function ProfileCard({ profile }: { profile: Profile }) {
	const avatar =
		profile.identities.find((i) => i.avatarUrl)?.avatarUrl ||
		'https://avatars.githubusercontent.com/u/9919?s=200&v=4';
	const totalFollowers = profile.socialStats.reduce((a, s) => a + s.followers, 0);
	return (
		<div className="card p-6 space-y-4">
			<div className="flex items-center gap-4">
				<img src={avatar} alt="" className="h-16 w-16 rounded-full border-2 border-[var(--mem-accent)]" />
				<div>
					<div className="text-lg font-semibold">Unified Profile</div>
					<div className="text-white/70 text-sm">{profile.archetype || 'Unknown archetype'}</div>
				</div>
			</div>
			<div className="grid grid-cols-2 gap-3">
				<div className="bg-white/5 rounded-md p-3">
					<div className="text-sm text-white/70">Total Followers</div>
					<div className="text-xl font-semibold">{formatNumber(totalFollowers)}</div>
				</div>
				<div className="bg-white/5 rounded-md p-3">
					<div className="text-sm text-white/70">Rank</div>
					<div className="text-xl font-semibold">{profile.leaderboardRank ?? '-'}</div>
				</div>
			</div>
			<div className="space-y-2">
				<div className="text-sm font-medium">Identities</div>
				<div className="flex flex-wrap gap-2">
					{profile.identities.map((i) => (
						<a
							key={`${i.platform}:${i.handle}`}
							href={i.url || '#'}
							className="px-2 py-1 rounded bg-white/10 text-sm"
							target="_blank"
							rel="noreferrer"
						>
							{i.platform}:{' '}{i.handle}
						</a>
					))}
				</div>
			</div>
			{profile.archetypeReason && (
				<p className="text-sm text-white/70">Why: {profile.archetypeReason}</p>
			)}
		</div>
	);
}


