import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { MemoryAPI } from '@/lib/memoryClient';
import { normalizeHandle } from '@/lib/utils';

type AddType = 'twitter' | 'farcaster';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const { userId, type, value } = (await req.json()) as {
			userId: string;
			type: AddType;
			value: string;
		};
		if (!userId || !type || !value) {
			return NextResponse.json({ error: 'Missing fields' }, { status: 400 });
		}
		const user = await prisma.user.findUnique({ where: { id: userId } });
		if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

		const handle = normalizeHandle(type === 'farcaster' ? 'farcaster' : 'twitter', value);
		// Confirm existence + enrich via Memory
		let mem;
		if (type === 'farcaster') mem = await MemoryAPI.getIdentityByFarcaster(handle);
		else mem = await MemoryAPI.getIdentityByTwitter(handle);

		const data: any = (mem as any)?.data;
		const nodes: any[] = Array.isArray(data) ? data : data?.nodes || [];
		const node = nodes.find((n) => String(n?.platform).toLowerCase() === type);
		const avatarUrl = node?.avatar || node?.avatar_url || null;
		const url = node?.url || null;
		const externalId = node?.id || null;

		await prisma.identity.upsert({
			where: { id: `${userId}-${type}-${handle}` },
			update: { avatarUrl: avatarUrl || undefined, url: url || undefined, externalId: externalId || undefined },
			create: {
				id: `${userId}-${type}-${handle}`,
				userId,
				platform: type,
				handle,
				avatarUrl: avatarUrl || undefined,
				url: url || undefined,
				externalId: externalId || undefined
			}
		});

		return NextResponse.json({ ok: true });
	} catch (err: any) {
		const message = err?.message || 'Failed to add identity';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


