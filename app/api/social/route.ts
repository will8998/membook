import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MemoryAPI } from '@/lib/memoryClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as { userId: string };
		if (!body?.userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
		const user = await prisma.user.findUnique({
			where: { id: body.userId },
			include: { identities: true }
		});
		if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		let totalFollowers = 0;

		// Fetch follower/following counts from Memory for supported platforms
		for (const ident of user.identities) {
			if (ident.platform !== 'twitter' && ident.platform !== 'farcaster') continue;
			const platform = ident.platform;
			const handle = ident.handle;

			// We fetch followers list first page to extract count if present;
			// Memory may supply counts in wrapper fields, adjust as available.
			const followers = await MemoryAPI.getFollowers(platform, handle);
			const following = await MemoryAPI.getFollowing(platform, handle);

			const followersCount =
				(typeof followers?.total === 'number' && followers.total) ||
				(typeof followers?.count === 'number' && followers.count) ||
				(Array.isArray(followers?.data) ? followers.data.length : 0);
			const followingCount =
				(typeof following?.total === 'number' && following.total) ||
				(typeof following?.count === 'number' && following.count) ||
				(Array.isArray(following?.data) ? following.data.length : 0);

			totalFollowers += followersCount;

			await prisma.socialStats.upsert({
				where: { id: `${user.id}-${platform}` },
				update: {
					followers: followersCount,
					following: followingCount
				},
				create: {
					id: `${user.id}-${platform}`,
					userId: user.id,
					platform: platform as any,
					followers: followersCount,
					following: followingCount,
					postsCount: 0
				}
			});
		}

		return NextResponse.json({ ok: true, totalFollowers });
	} catch (err: any) {
		return new NextResponse(err?.message || 'Failed social fetch', { status: 500 });
	}
}


