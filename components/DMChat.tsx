'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { formatHandleForDisplay } from '@/lib/utils';

type Peer = { userId: string; handle: string; archetype?: string | null };
type Message = { id: string; senderId: string; receiverId: string; content: string; createdAt: string };

export default function DMChat({ initialPeerId }: { initialPeerId?: string }) {
	const [peers, setPeers] = useState<Peer[]>([]);
	const [active, setActive] = useState<string | undefined>(initialPeerId);
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const bottomRef = useRef<HTMLDivElement | null>(null);

	const loadPeers = async () => {
		try {
			const r = await fetch('/api/dm/peers', { cache: 'no-store' });
			const j = await r.json();
			if (Array.isArray(j?.peers)) {
				setPeers(j.peers);
				if (!initialPeerId && j.peers.length > 0) {
					setActive(j.peers[0].userId);
				}
			}
		} catch {}
	};

	const loadMessages = async (peerId: string) => {
		try {
			const u = new URL('/api/dm/list', window.location.origin);
			u.searchParams.set('peerId', peerId);
			const r = await fetch(u.toString(), { cache: 'no-store' });
			const j = await r.json();
			if (Array.isArray(j?.messages)) setMessages(j.messages);
		} catch {}
	};

	useEffect(() => {
		loadPeers();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!active) return;
		loadMessages(active);
		// Poll lightly
		const id = setInterval(() => loadMessages(active), 3000);
		return () => clearInterval(id);
	}, [active]);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const activePeer = useMemo(() => peers.find((p) => p.userId === active), [peers, active]);

	const send = async () => {
		const text = input.trim();
		if (!text || !active) return;
		setLoading(true);
		try {
			const r = await fetch('/api/dm/send', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ peerId: active, content: text })
			});
			const j = await r.json();
			if (!r.ok) throw new Error(j?.error || 'Failed');
			setInput('');
			await loadMessages(active);
		} catch {
			// no-op
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="grid grid-cols-12 gap-4">
			<aside className="col-span-4 lg:col-span-3">
				<div className="card p-3 space-y-2">
					<div className="text-sm font-medium">Messages</div>
					<div className="divide-y divide-white/10">
						{peers.map((p) => (
							<button
								key={p.userId}
								className={`w-full text-left py-2 hover:bg-white/5 rounded ${
									active === p.userId ? 'bg-white/10' : ''
								}`}
								onClick={() => setActive(p.userId)}
							>
								<div className="font-medium">{formatHandleForDisplay(p.handle)}</div>
								<div className="text-xs text-white/60">{p.archetype || '—'}</div>
							</button>
						))}
						{peers.length === 0 && <div className="text-sm text-white/60 py-2">No conversations yet.</div>}
					</div>
				</div>
			</aside>
			<main className="col-span-8 lg:col-span-9">
				<div className="card h-[70vh] flex flex-col">
					<div className="px-3 py-2 border-b border-white/10 text-sm font-medium">
						{activePeer ? `Chat with ${formatHandleForDisplay(activePeer.handle)}` : 'Select a conversation'}
					</div>
					<div className="flex-1 overflow-auto p-3 space-y-2">
						{messages.map((m) => (
							<div key={m.id} className="whitespace-pre-wrap break-words">
								{m.content}
							</div>
						))}
						<div ref={bottomRef} />
					</div>
					<div className="p-3 border-t border-white/10">
						<div className="flex gap-2 items-center">
							<input
								className="flex-1 min-w-0 bg-black/30 rounded-md px-3 py-2 border border-white/10"
								placeholder="Write a message..."
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') send();
								}}
								disabled={!active}
							/>
							<button className="btn-secondary shrink-0 px-3" onClick={send} disabled={loading || !active}>
								Send
							</button>
						</div>
					</div>
				</div>
			</main>
		</div>
	);
}


