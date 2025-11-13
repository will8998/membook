import type { Post, User } from '@prisma/client';
import { NextRequest, NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export async function GET(req: NextRequest) {
	try {
		const { prisma } = await import('@/lib/db');
		const db: any = prisma as any;
		const url = new URL(req.url);
		const userId = url.searchParams.get('userId') || undefined;
		const limit = Math.min(100, Number(url.searchParams.get('limit') || 50));
		const cursorId = url.searchParams.get('cursorId') || undefined;
		const posts = (await db.post.findMany({
			where: userId ? { userId } : {},
			orderBy: [{ createdAt: 'desc' }, { id: 'desc' }],
			cursor: cursorId ? { id: cursorId } : undefined,
			skip: cursorId ? 1 : 0,
			include: { },
			take: limit
		})) as Post[];
		// Enrich with handle
		const userIds = Array.from(new Set(posts.map((p: Post) => p.userId).filter(Boolean) as string[]));
		const users = (await prisma.user.findMany({
			where: { id: { in: userIds } }
		})) as User[];
		const idToHandle = new Map(users.map((u: User) => [u.id, u.primaryHandle]));
		const responsePosts = posts.map((p: Post) => ({
				id: p.id,
				userId: p.userId,
				handle: idToHandle.get(p.userId || '') || 'anon',
				content: p.content,
				createdAt: p.createdAt
			}));
		const nextCursorId = posts.length === limit ? posts[posts.length - 1]?.id : null;
		return NextResponse.json({ posts: responsePosts, nextCursorId });
	} catch (err: any) {
		return NextResponse.json({ error: err?.message || 'Failed to load feed' }, { status: 500 });
	}
}


