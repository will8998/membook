import { NextRequest, NextResponse } from 'next/server';
import { computeArchetypeForUser } from '@/lib/archetype';

type Archetype = 'Builder' | 'Collector' | 'Influencer' | 'Trader';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
	try {
		const { userId } = (await req.json()) as { userId: string };
		if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

		const { type, explanation } = await computeArchetypeForUser(userId);

		const { prisma } = await import('@/lib/db');
		await prisma.user.update({
			where: { id: userId },
			data: { archetype: type, archetypeReason: explanation }
		});

		return NextResponse.json({ type, explanation });
	} catch (err: any) {
		return new NextResponse(err?.message || 'Failed archetype', { status: 500 });
	}
}


