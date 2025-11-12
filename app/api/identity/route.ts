import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MemoryAPI } from '@/lib/memoryClient';
import { generateReferralCode, normalizeHandle } from '@/lib/utils';

type InputType = 'wallet' | 'farcaster' | 'twitter';

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as {
			input: { type: InputType; value: string };
		};
		const { type, value } = body?.input || {};
		if (!type || !value) {
			return NextResponse.json({ error: 'Invalid input' }, { status: 400 });
		}
		const normalized = normalizeHandle(type, value);

		let mem;
		if (type === 'wallet') mem = await MemoryAPI.getIdentityByWallet(normalized);
		else if (type === 'farcaster') mem = await MemoryAPI.getIdentityByFarcaster(normalized);
		else mem = await MemoryAPI.getIdentityByTwitter(normalized);

		// Minimal normalization from Memory result
		const identities: Array<{
			platform: 'farcaster' | 'twitter' | 'wallet' | 'github' | 'ens' | 'basename';
			handle: string;
			externalId?: string;
			avatarUrl?: string;
			url?: string;
		}> = [];

		const data: any = (mem as any)?.data;
		const nodes: any[] = Array.isArray(data) ? data : data?.nodes || [];
		for (const n of nodes) {
			const p = String(n?.platform || '').toLowerCase();
			if (!['farcaster', 'twitter', 'wallet', 'github', 'ens', 'basename'].includes(p)) continue;
			identities.push({
				platform: p as any,
				handle: String(n?.handle || n?.address || n?.username || ''),
				externalId: n?.id || undefined,
				avatarUrl: n?.avatar || n?.avatar_url || undefined,
				url: n?.url || undefined
			});
		}

		const primaryHandle = `${type}:${normalized}`;
		// Upsert user
		let user = await prisma.user.findUnique({ where: { primaryHandle } });
		if (!user) {
			user = await prisma.user.create({
				data: {
					primaryHandle,
					referralCode: generateReferralCode()
				}
			});
		}

		// Upsert identities
		for (const ident of identities) {
			await prisma.identity.upsert({
				where: {
					id: `${user.id}-${ident.platform}-${ident.handle}`
				},
				update: {
					externalId: ident.externalId,
					avatarUrl: ident.avatarUrl,
					url: ident.url
				},
				create: {
					id: `${user.id}-${ident.platform}-${ident.handle}`,
					userId: user.id,
					platform: ident.platform,
					handle: ident.handle,
					externalId: ident.externalId,
					avatarUrl: ident.avatarUrl,
					url: ident.url
				}
			});
		}

		// Attribute referral if cookie is present
		try {
			// Cookies are readable in route handlers via headers in Next.js 14
			// but to avoid importing cookies(), we read header directly.
			const refCookie = req.headers.get('cookie') || '';
			const m = refCookie.match(/(?:^|;\s*)mem_ref=([^;]+)/);
			if (m) {
				const refCode = decodeURIComponent(m[1]);
				await prisma.referralHit.create({
					data: { refCode, referredUserId: user.id, ipHash: 'signed' }
				});
			}
		} catch {}

		const res = NextResponse.json({ userId: user.id });
		try {
			res.cookies.set('mem_user_id', user.id, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 180,
				path: '/'
			});
		} catch {}
		return res;
	} catch (err: any) {
		return new NextResponse(err?.message || 'Failed to resolve identity', { status: 500 });
	}
}


