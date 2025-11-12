import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { cookies } from 'next/headers';

declare global {
	// eslint-disable-next-line no-var
	var __publicChatMem: { id: string; userId?: string | null; handle: string; content: string; createdAt: Date }[] | undefined;
}
const memStore = () => {
	if (!global.__publicChatMem) global.__publicChatMem = [];
	return global.__publicChatMem;
};

export async function GET(req: NextRequest) {
	const url = new URL(req.url);
	const limit = Math.min(100, Number(url.searchParams.get('limit') || 50));
	const since = url.searchParams.get('since');
	const where = since ? { createdAt: { gt: new Date(since) } } : {};
	try {
		// @ts-ignore runtime presence depends on migration
		if (!(prisma as any).publicMessage?.findMany) throw new Error('no_table');
		const rows = await (prisma as any).publicMessage.findMany({
			where,
			orderBy: { createdAt: 'asc' },
			take: limit
		});
		return NextResponse.json({ messages: rows });
	} catch {
		const all = memStore().filter((m) => (!since ? true : m.createdAt > new Date(since)));
		return NextResponse.json({ messages: all.slice(-limit) });
	}
}

export async function POST(req: NextRequest) {
	try {
		const body = (await req.json()) as { content: string; userId?: string };
		const content = (body?.content || '').toString().trim();
		if (!content) return NextResponse.json({ error: 'Empty message' }, { status: 400 });
		const cookieStore = cookies();
		const cookieUser = cookieStore.get('mem_user_id')?.value;
		const userId = body?.userId || cookieUser || null;
		let handle = 'anon';
		if (userId) {
			const user = await prisma.user.findUnique({ where: { id: userId } });
			if (user) handle = user.primaryHandle;
		}
		try {
			// @ts-ignore guarded for runtime absence
			if (!(prisma as any).publicMessage?.create) throw new Error('no_table');
			const msg = await (prisma as any).publicMessage.create({
				data: { userId: userId || undefined, handle, content }
			});
			return NextResponse.json({ ok: true, message: msg });
		} catch {
			const m = {
				id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
				userId,
				handle,
				content,
				createdAt: new Date()
			};
			memStore().push(m);
			return NextResponse.json({ ok: true, message: m });
		}
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to send' }, { status: 500 });
	}
}


