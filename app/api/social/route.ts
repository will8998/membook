import { NextRequest, NextResponse } from 'next/server';
import { MemoryAPI } from '@/lib/memoryClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

type Platform = 'twitter' | 'farcaster';

async function updatePlatform(prisma: any, userId: string, platform: Platform, handle: string) {
	// Prefer profile endpoints that include counts
	let profile: any | null = null;
	try {
		if (platform === 'twitter') {
			const res = await MemoryAPI.getTwitterProfile(handle);
			profile = (res as any)?.data?.profile || null;
		} else {
			const res = await MemoryAPI.getFarcasterProfile(handle);
			profile = (res as any)?.data?.profile || null;
		}
	} catch {
		// ignore per-platform failures
	}
	const followers = Number(profile?.followersCount || 0);
	const following = Number(profile?.followingCount || 0);
	const postsCount = Number(profile?.postsCount || 0);
	// Upsert stats
	await prisma.socialStats.upsert({
		where: { id: `${userId}-${platform}` },
		update: { followers, following, postsCount },
		create: { id: `${userId}-${platform}`, userId, platform, followers, following, postsCount }
	});
	// Backfill avatar/url on Identity if available
	if (profile?.avatarUrl) {
		try {
			await prisma.identity.updateMany({
				where: { userId, platform },
				data: { avatarUrl: profile.avatarUrl, url: profile?.externalUrl || undefined }
			});
		} catch {
			// ignore
		}
	}
}

export async function POST(req: NextRequest) {
	try {
		const { prisma } = await import('@/lib/db');
		const body = (await req.json()) as { userId: string };
		const userId = body?.userId;
		if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });
		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: { identities: true }
		});
		if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
		const twitter = user.identities.find((i: any) => i.platform === 'twitter')?.handle || null;
		const farcaster = user.identities.find((i: any) => i.platform === 'farcaster')?.handle || null;
		const tasks: Promise<any>[] = [];
		if (twitter) tasks.push(updatePlatform(prisma, userId, 'twitter', twitter));
		if (farcaster) tasks.push(updatePlatform(prisma, userId, 'farcaster', farcaster));
		await Promise.all(tasks);
		return NextResponse.json({ ok: true });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to refresh social' }, { status: 500 });
	}
}


