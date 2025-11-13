/* eslint-disable @next/next/no-img-element */
import { ProfileCard } from '@/components/ProfileCard';
import { BadgePreview } from '@/components/BadgePreview';
import { Chat } from '@/components/Chat';
import { ShareButtons } from '@/components/ShareButtons';
import AddIdentityForm from '@/components/AddIdentityForm';
import { computeArchetypeForUser } from '@/lib/archetype';
import { getSuggestions } from '@/lib/recommendations';
import { Suggestions } from '@/components/Suggestions';
import RightSidebarChat from '@/components/RightSidebarChat';
import LeftSidebarFriends from '@/components/LeftSidebarFriends';
import AddFriendButton from '@/components/AddFriendButton';
import { cookies } from 'next/headers';
import Feed from '@/components/Feed';
import TopTabs from '@/components/TopTabs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default async function ProfilePage({ params }: { params: { userId: string } }) {
	const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const { prisma } = await import('@/lib/db');
	const cookieStore = cookies();
	const currentUserId = cookieStore.get('mem_user_id')?.value || null;

	// Kick off server-side refresh so first load shows data
	try {
		await Promise.all([
			fetch(`${baseUrl}/api/social`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: params.userId }),
				cache: 'no-store'
			}),
			fetch(`${baseUrl}/api/archetype`, {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId: params.userId }),
				cache: 'no-store'
			})
		]);
		await fetch(`${baseUrl}/api/leaderboard`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId: params.userId }),
			cache: 'no-store'
		});
	} catch {
		// best-effort refresh; ignore failures for first paint
	}

	const user = await prisma.user.findUnique({
		where: { id: params.userId },
		include: { identities: true, socialStats: true, leaderboard: true }
	});
	if (!user) {
		return <div className="text-white/70">User not found</div>;
	}
	// Ensure archetype exists (self-heal)
	if (!user.archetype) {
		const { type, explanation } = await computeArchetypeForUser(user.id);
		await prisma.user.update({
			where: { id: user.id },
			data: { archetype: type, archetypeReason: explanation }
		});
		// re-read user after update
		const updated = await prisma.user.findUnique({
			where: { id: params.userId },
			include: { identities: true, socialStats: true, leaderboard: true }
		});
		if (updated) Object.assign(user, updated);
	}
	const userId = user.id;
	const walletAddress = user.identities.find((i) => i.platform === 'wallet')?.handle || null;
	const preferredHandle =
		user.identities.find((i) => i.platform === 'farcaster')?.handle ||
		user.identities.find((i) => i.platform === 'twitter')?.handle ||
		walletAddress ||
		user.primaryHandle;
	const suggestions = getSuggestions(user.archetype);
	const profile = {
		userId: userId,
		primaryHandle: user.primaryHandle,
		archetype: user.archetype,
		archetypeReason: user.archetypeReason,
		referralCode: user.referralCode,
		walletAddress,
		identities: user.identities.map((i) => ({
			platform: i.platform,
			handle: i.handle,
			url: i.url,
			avatarUrl: i.avatarUrl
		})),
		socialStats: user.socialStats.map((s) => ({
			platform: s.platform,
			followers: s.followers,
			following: s.following
		})),
		leaderboardRank: user.leaderboard?.rank ?? null
	};

	async function refreshAll() {
		'use server';
		const base = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
		await fetch(`${base}/api/social`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
		});
		await fetch(`${base}/api/archetype`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
		});
		await fetch(`${base}/api/leaderboard`, {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ userId })
		});
	}

	return (
		<div className="lg:grid lg:grid-cols-12 lg:gap-6">
			<div className="hidden lg:block lg:col-span-3">
				<LeftSidebarFriends />
			</div>
			<div className="lg:col-span-6 space-y-6">
				{currentUserId === userId && <TopTabs currentUserId={currentUserId} />}
				<ProfileCard profile={profile} currentUserId={currentUserId} />
				<div className="grid gap-4">
					<BadgePreview userId={userId} />
					<div className="space-y-4">
						<ShareButtons userId={userId} referralCode={user.referralCode} />
						<form action={refreshAll}>
							<button className="btn-secondary mt-2" type="submit">Refresh Data</button>
						</form>
						<AddIdentityForm userId={userId} />
						<div className="text-sm text-white/60">
							Tip: Share your badge link to climb the leaderboard.
						</div>
					</div>
				</div>
				{/* Feed moved to /feed */}
				<Suggestions quests={suggestions.quests} protocols={suggestions.protocols} yields={suggestions.yields} />
			</div>
			<div className="hidden lg:block lg:col-span-3">
				<RightSidebarChat />
			</div>
		</div>
	);
}


