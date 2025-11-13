'use client';

import { useEffect, useRef, useState } from 'react';

type Post = { id: string; userId?: string | null; handle: string; content: string; createdAt: string };

export default function FeedInfinite({ canPost }: { canPost: boolean }) {
	const [posts, setPosts] = useState<Post[]>([]);
	const [cursorId, setCursorId] = useState<string | null>(null);
	const [hasMore, setHasMore] = useState(true);
	const [loading, setLoading] = useState(false);
	const [content, setContent] = useState('');
	const sentinelRef = useRef<HTMLDivElement | null>(null);

	const load = async () => {
		if (loading || !hasMore) return;
		setLoading(true);
		try {
			const params = new URLSearchParams({ limit: '20' });
			if (cursorId) params.set('cursorId', cursorId);
			const r = await fetch(`/api/feed/list?${params.toString()}`, { cache: 'no-store' });
			const j = await r.json();
			const newPosts = Array.isArray(j?.posts) ? (j.posts as Post[]) : [];
			setPosts((prev) => [...prev, ...newPosts]);
			setCursorId(j?.nextCursorId || null);
			setHasMore(Boolean(j?.nextCursorId));
		} catch {
			// ignore
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		load();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if (!sentinelRef.current) return;
		const el = sentinelRef.current;
		const obs = new IntersectionObserver(
			(entries) => {
				if (entries[0].isIntersecting) {
					load();
				}
			},
			{ rootMargin: '200px' }
		);
		obs.observe(el);
		return () => obs.disconnect();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [sentinelRef.current, cursorId, hasMore, loading]);

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
			// Prepend new post to the list
			setPosts((prev) => [
				{ id: j.post.id, userId: j.post.userId, content: j.post.content, createdAt: j.post.createdAt, handle: 'you' },
				...prev
			]);
		} catch {
			// noop
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="space-y-4">
			{canPost && (
				<div className="card p-4 space-y-2">
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
					<div key={p.id} className="card p-3">
						<div className="text-sm text-white/60">{p.handle}</div>
						<div className="whitespace-pre-wrap break-words">{p.content}</div>
					</div>
				))}
				{!loading && posts.length === 0 && <div className="text-sm text-white/60">No posts yet.</div>}
				<div ref={sentinelRef} />
				{loading && <div className="text-sm text-white/60">Loading...</div>}
				{!hasMore && posts.length > 0 && <div className="text-sm text-white/40 text-center py-3">No more posts</div>}
			</div>
		</div>
	);
}


