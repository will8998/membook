import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST() {
	const res = NextResponse.json({ ok: true });
	try {
		res.cookies.set('mem_user_id', '', { maxAge: 0, path: '/' });
		res.cookies.set('mem_ref', '', { maxAge: 0, path: '/' });
	} catch {}
	return res;
}


