'use client';

import { useState } from 'react';

export default function AddFriendButton({ friendId }: { friendId: string }) {
	const [status, setStatus] = useState<'idle' | 'ok' | 'err' | 'loading'>('idle');
	const [msg, setMsg] = useState<string | null>(null);

	const add = async () => {
		setStatus('loading');
		setMsg(null);
		try {
			const res = await fetch('/api/friends/add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ friendId })
			});
			const ct = res.headers.get('content-type') || '';
			let data: any = null;
			let text = '';
			try {
				if (ct.includes('application/json')) data = await res.json();
				else text = await res.text();
			} catch {}
			if (!res.ok) throw new Error(data?.error || text || 'Failed to add');
			setStatus('ok');
		} catch (e: any) {
			setStatus('err');
			setMsg(e?.message || 'Failed');
		}
	};

	if (status === 'ok') {
		return <span className="text-xs text-[var(--mem-accent)]">Added</span>;
	}
	return (
		<div className="flex items-center gap-2">
			<button className="btn-secondary px-2 py-1 text-xs" onClick={add} disabled={status === 'loading'}>
				{status === 'loading' ? 'Adding...' : 'Add Friend'}
			</button>
			{status === 'err' && <span className="text-xs text-red-400">{msg}</span>}
		</div>
	);
}


