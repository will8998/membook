'use client';

import { useEffect, useState } from 'react';

export function Chat({ userId, initialTo }: { userId: string; initialTo?: string }) {
	const [sessionId, setSessionId] = useState<string | null>(null);
	const [input, setInput] = useState('');
	const [messages, setMessages] = useState<{ role: 'user' | 'assistant'; content: string }[]>([]);
	const [loading, setLoading] = useState(false);

	useEffect(() => {
		if (initialTo && !input) {
			setInput(`${initialTo} `);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [initialTo]);

	const send = async () => {
		if (!input.trim()) return;
		const m = input.trim();
		setInput('');
		setMessages((prev) => [...prev, { role: 'user', content: m }]);
		setLoading(true);
		try {
			const res = await fetch('/api/chat', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, message: m, sessionId: sessionId || undefined })
			});
			const ct = res.headers.get('content-type') || '';
			let data: any = null;
			let text = '';
			try {
				if (ct.includes('application/json')) data = await res.json();
				else text = await res.text();
			} catch {}
			if (!res.ok) {
				throw new Error(data?.error || text || 'Chat failed');
			}
			setSessionId(data?.sessionId || sessionId);
			setMessages((prev) => [...prev, { role: 'assistant', content: data?.answer || '' }]);
		} catch (err: any) {
			setMessages((prev) => [...prev, { role: 'assistant', content: err?.message || 'Error' }]);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card p-4 space-y-3">
			<div className="text-sm font-medium">Chat with My Data</div>
			<div className="space-y-2 max-h-72 overflow-auto bg-white/5 p-3 rounded">
				{messages.length === 0 && (
					<div className="text-sm text-white/60">Ask: How many followers do I have across platforms?</div>
				)}
				{messages.map((m, i) => (
					<div key={i} className={m.role === 'user' ? 'text-white' : 'text-white/80'}>
						<span className="font-semibold">{m.role === 'user' ? 'You' : 'Assistant'}:</span>{' '}
						<span>{m.content}</span>
					</div>
				))}
			</div>
			<div className="flex gap-2">
				<input
					className="flex-1 bg-black/30 rounded-md px-3 py-2 border border-white/10"
					value={input}
					onChange={(e) => setInput(e.target.value)}
					placeholder="Type your question..."
				/>
				<button className="btn-primary" onClick={send} disabled={loading}>
					{loading ? '...' : 'Send'}
				</button>
			</div>
		</div>
	);
}


