'use client';

import { useEffect, useRef, useState } from 'react';

type Message = { id: string; handle: string; content: string; createdAt: string };

export default function RightSidebarChat() {
	const [messages, setMessages] = useState<Message[]>([]);
	const [input, setInput] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const bottomRef = useRef<HTMLDivElement | null>(null);
	const sinceRef = useRef<string | null>(null);
	const seenRef = useRef<Set<string>>(new Set());

	const fetchMessages = async () => {
		try {
			const url = new URL('/api/public-chat', window.location.origin);
			const currSince = sinceRef.current;
			if (currSince) url.searchParams.set('since', currSince);
			const res = await fetch(url.toString(), { cache: 'no-store' });
			const data = await res.json();
			if (Array.isArray(data?.messages)) {
				// de-duplicate by id
				const newOnes = (data.messages as Message[]).filter((m) => {
					if (seenRef.current.has(m.id)) return false;
					seenRef.current.add(m.id);
					return true;
				});
				if (newOnes.length > 0) setMessages((prev) => [...prev, ...newOnes]);
				if (data.messages.length > 0)
					sinceRef.current = data.messages[data.messages.length - 1].createdAt;
			}
		} catch {}
	};

	useEffect(() => {
		fetchMessages();
		const id = setInterval(() => {
			fetchMessages();
		}, 3000);
		return () => clearInterval(id);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
	}, [messages]);

	const send = async () => {
		const text = input.trim();
		if (!text) return;
		setLoading(true);
		setError(null);
		try {
			const res = await fetch('/api/public-chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: text })
			});
			const ct = res.headers.get('content-type') || '';
			let data: any = null;
			let bodyText = '';
			try {
				if (ct.includes('application/json')) data = await res.json();
				else bodyText = await res.text();
			} catch {}
			if (!res.ok) throw new Error(data?.error || bodyText || 'Failed to send');
			setInput('');
			// append the sent message for immediate feedback
			if (data?.message) {
				// Mark as seen so upcoming poll doesn't re-add it
				try {
					if (data.message?.id) {
						seenRef.current.add(data.message.id);
					}
				} catch {}
				setMessages((prev) => [...prev, data.message]);
				// Advance since cursor to the latest createdAt
				try {
					const createdAt: string | undefined = data.message?.createdAt;
					if (createdAt) {
						const curr = sinceRef.current ? new Date(sinceRef.current).getTime() : 0;
						const next = new Date(createdAt).getTime();
						if (next >= curr) sinceRef.current = createdAt;
					}
				} catch {}
			}
		} catch (e: any) {
			setError(e?.message || 'Error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<aside className="hidden lg:block sticky top-4 self-start w-full">
			<div className="w-full">
				<div className="card flex flex-col max-h-[80vh] w-full">
					<div className="px-3 py-2 border-b border-white/10 text-sm font-medium">Global Chat</div>
					<div className="flex-1 overflow-auto p-3 space-y-2">
						{messages.map((m) => (
							<div key={m.id} className="break-words whitespace-pre-wrap max-w-full">
								<span className="text-[var(--mem-accent)]">{m.handle}:</span>{' '}
								<span className="text-white/90">{m.content}</span>
							</div>
						))}
						<div ref={bottomRef} />
					</div>
					<div className="p-3 border-t border-white/10">
						{error && <div className="text-red-400 text-xs mb-1">{error}</div>}
						<div className="flex gap-2 items-center">
							<input
								className="flex-1 min-w-0 bg-black/30 rounded-md px-3 py-2 border border-white/10"
								placeholder="Say something..."
								value={input}
								onChange={(e) => setInput(e.target.value)}
								onKeyDown={(e) => {
									if (e.key === 'Enter') send();
								}}
							/>
							<button className="btn-secondary shrink-0 px-3" onClick={send} disabled={loading}>
								Send
							</button>
						</div>
					</div>
				</div>
			</div>
		</aside>
	);
}


