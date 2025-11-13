'use client';

import { useEffect, useState } from 'react';
import { formatHandleForDisplay } from '@/lib/utils';

type Post = { id: string; userId?: string | null; handle: string; content: string; createdAt: string };

export default function Feed({ canPost }: { canPost: boolean }) {
	const [posts, setPosts] = useState<Post[]>([]);
	const [content, setContent] = useState('');
	const [loading, setLoading] = useState(false);

	const load = async () => {
		try {
			const r = await fetch('/api/feed/list?limit=50', { cache: 'no-store' });
			const j = await r.json();
			if (Array.isArray(j?.posts)) setPosts(j.posts);
		} catch {}
	};

	useEffect(() => {
		load();
	}, []);

	const submit = async () => {
		const text = content.trim();
		if (!text) return;
		setLoading(true);
		try {
			const r = await fetch('/api/feed/create', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ content: text })
			});
			const j = await r.json();
			if (!r.ok) throw new Error(j?.error || 'Failed');
			setContent('');
			await load();
		} catch (e) {
			// noop
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="card p-4 space-y-3">
			<div className="flex items-center justify-between">
				<div className="text-sm font-medium">Feed</div>
			</div>
			{canPost && (
				<div className="space-y-2">
					<textarea
						className="w-full bg-black/30 rounded-md px-3 py-2 border border-white/10 min-h-[80px]"
						placeholder="What's happening?"
						value={content}
						onChange={(e) => setContent(e.target.value)}
						maxLength={500}
					/>
					<div className="flex justify-end">
						<button className="btn-secondary" onClick={submit} disabled={loading}>
							{loading ? 'Posting...' : 'Post'}
						</button>
					</div>
				</div>
			)}
			<div className="space-y-3">
				{posts.map((p) => (
					<div key={p.id} className="bg-white/5 rounded-md p-3">
						<div className="text-sm text-white/60">{formatHandleForDisplay(p.handle)}</div>
						<div className="whitespace-pre-wrap break-words">{p.content}</div>
					</div>
				))}
				{posts.length === 0 && <div className="text-sm text-white/60">No posts yet.</div>}
			</div>
		</div>
	);
}


