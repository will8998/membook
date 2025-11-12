import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { hashIp } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const { refCode } = (await req.json()) as { refCode: string };
		if (!refCode) return NextResponse.json({ error: 'refCode required' }, { status: 400 });
		const ip =
			req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
			req.headers.get('x-real-ip') ||
			'0.0.0.0';
		const ipHash = hashIp(ip);
		await prisma.referralHit.create({ data: { refCode, ipHash } });
		const res = NextResponse.json({ ok: true });
		// Set cookie so signup can attribute to this ref
		try {
			res.cookies.set('mem_ref', refCode, {
				httpOnly: true,
				secure: true,
				sameSite: 'lax',
				maxAge: 60 * 60 * 24 * 30,
				path: '/'
			});
		} catch {}
		return res;
	} catch (err: any) {
		return new NextResponse(err?.message || 'Referral record failed', { status: 500 });
	}
}


