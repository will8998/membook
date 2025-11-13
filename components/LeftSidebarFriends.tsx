'use client';

import { useEffect, useState } from 'react';
import { formatHandleForDisplay } from '@/lib/utils';
import AddFriendButton from './AddFriendButton';

type Row = { userId: string; handle: string; archetype?: string | null; rank?: number | null };

export default function LeftSidebarFriends() {
	const [friends, setFriends] = useState<Row[]>([]);
	const [suggested, setSuggested] = useState<Row[]>([]);

	useEffect(() => {
		const fetchAll = async () => {
			try {
				const [f, s] = await Promise.all([
					fetch('/api/friends/list', { cache: 'no-store' }).then((r) => r.json()),
					fetch('/api/friends/suggest', { cache: 'no-store' }).then((r) => r.json())
				]);
				if (Array.isArray(f?.friends)) setFriends(f.friends);
				if (Array.isArray(s?.suggestions)) setSuggested(s.suggestions);
			} catch {}
		};
		fetchAll();
	}, []);

	return (
		<aside className="hidden lg:block sticky top-4 self-start">
			<div className="flex flex-col gap-4">
				<div className="card h-1/2 flex flex-col">
					<div className="px-3 py-2 border-b border-white/10 text-sm font-medium">My Friends</div>
					<div className="flex-1 overflow-auto p-3 space-y-2">
						{friends.length === 0 && <div className="text-sm text-white/60">No friends yet.</div>}
						{friends.map((f) => (
							<div key={f.userId} className="flex items-center justify-between gap-2">
								<a className="hover:underline" href={`/profile/${f.userId}`}>{formatHandleForDisplay(f.handle)}</a>
								<div className="text-xs text-white/60">
									{f.archetype || '—'} · #{f.rank ?? '-'}
								</div>
							</div>
						))}
					</div>
				</div>
				<div className="card h-1/2 flex flex-col">
					<div className="px-3 py-2 border-b border-white/10 text-sm font-medium">Suggested Friends</div>
					<div className="flex-1 overflow-auto p-3 space-y-2">
						{suggested.length === 0 && <div className="text-sm text-white/60">No suggestions.</div>}
						{suggested.map((s) => (
							<div key={s.userId} className="flex items-center justify-between gap-2">
								<a className="hover:underline" href={`/profile/${s.userId}`}>{formatHandleForDisplay(s.handle)}</a>
								<div className="flex items-center gap-2">
									<div className="text-xs text-white/60">{s.archetype || '—'} · #{s.rank ?? '-'}</div>
									<AddFriendButton friendId={s.userId} />
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</aside>
	);
}


