'use client';

import { useState } from 'react';

export default function AddIdentityForm({ userId }: { userId: string }) {
	const [farcaster, setFarcaster] = useState('');
	const [twitter, setTwitter] = useState('');
	const [status, setStatus] = useState<string | null>(null);
	const [loading, setLoading] = useState(false);

	const add = async (type: 'farcaster' | 'twitter', value: string) => {
		if (!value.trim()) return;
		setStatus(null);
		setLoading(true);
		try {
			const res = await fetch('/api/identity/add', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ userId, type, value })
			});
			const ct = res.headers.get('content-type') || '';
			let data: any = null;
			let text = '';
			try {
				if (ct.includes('application/json')) data = await res.json();
				else text = await res.text();
			} catch {}
			if (!res.ok) throw new Error(data?.error || text || 'Failed');
			setStatus(`${type} linked`);
			setFarcaster('');
			setTwitter('');
			// trigger soft refresh of the page data
			if (typeof window !== 'undefined') window.location.reload();
		} catch (e: any) {
			setStatus(e?.message || 'Error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card p-4 space-y-3">
			<div className="text-sm font-medium">Link identities</div>
			<div className="flex gap-2">
				<input
					className="flex-1 bg-black/30 rounded-md px-3 py-2 border border-white/10"
					placeholder="Farcaster username"
					value={farcaster}
					onChange={(e) => setFarcaster(e.target.value)}
				/>
				<button className="btn-secondary" onClick={() => add('farcaster', farcaster)} disabled={loading}>
					Add Farcaster
				</button>
			</div>
			<div className="flex gap-2">
				<input
					className="flex-1 bg-black/30 rounded-md px-3 py-2 border border-white/10"
					placeholder="Twitter handle"
					value={twitter}
					onChange={(e) => setTwitter(e.target.value)}
				/>
				<button className="btn-secondary" onClick={() => add('twitter', twitter)} disabled={loading}>
					Add Twitter
				</button>
			</div>
			{status && <div className="text-sm text-white/70">{status}</div>}
		</div>
	);
}


