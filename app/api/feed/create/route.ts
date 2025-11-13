import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as { content: string };
		const content = (body?.content || '').toString().trim();
		if (!content) return NextResponse.json({ error: 'Empty content' }, { status: 400 });
		if (content.length > 500) return NextResponse.json({ error: 'Content too long' }, { status: 400 });
		const userId = cookies().get('mem_user_id')?.value || null;
		if (!userId) return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
		const { prisma } = await import('@/lib/db');
		const post = await prisma.post.create({
			data: { id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`, userId, content }
		});
		return NextResponse.json({ ok: true, post });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to post' }, { status: 500 });
	}
}


