import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/db';
import { askLLM, type ChatTurn } from '@/lib/llm';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
	try {
		const { userId, message, sessionId } = (await req.json()) as {
			userId: string;
			message: string;
			sessionId?: string;
		};
		if (!userId || !message) return NextResponse.json({ error: 'Missing fields' }, { status: 400 });

		const user = await prisma.user.findUnique({
			where: { id: userId },
			include: { socialStats: true, identities: true, leaderboard: true }
		});
		if (!user) return NextResponse.json({ error: 'Not found' }, { status: 404 });

		const summary = {
			userId: user.id,
			primaryHandle: user.primaryHandle,
			archetype: user.archetype,
			archetypeReason: user.archetypeReason,
			leaderboardRank: user.leaderboard?.rank ?? null,
			identities: user.identities.map((i) => ({
				platform: i.platform,
				handle: i.handle,
				url: i.url
			})),
			socialStats: user.socialStats.map((s) => ({
				platform: s.platform,
				followers: s.followers,
				following: s.following,
				postsCount: s.postsCount
			}))
		};

		let session = sessionId
			? await prisma.chatSession.findUnique({ where: { id: sessionId } })
			: null;
		if (!session) {
			session = await prisma.chatSession.create({ data: { userId: user.id } });
		}
		await prisma.chatMessage.create({
			data: { sessionId: session.id, role: 'user', content: message }
		});

		const system: ChatTurn = {
			role: 'system',
			content:
				'You are an assistant that answers questions about a user’s digital identity. ' +
				`Here is the user’s data (strictly use only this data, do not invent facts): ${JSON.stringify(summary)}`
		};

		const answer = await askLLM([system, { role: 'user', content: message }]);

		await prisma.chatMessage.create({
			data: { sessionId: session.id, role: 'assistant', content: answer }
		});

		return NextResponse.json({ sessionId: session.id, answer });
	} catch (err: any) {
		const message = err?.message || 'Chat failed';
		return NextResponse.json({ error: message }, { status: 500 });
	}
}


