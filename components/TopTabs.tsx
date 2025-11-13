'use client';

import { usePathname } from 'next/navigation';

export default function TopTabs({ currentUserId }: { currentUserId?: string | null }) {
	const pathname = usePathname();
	const isFeed = pathname.startsWith('/feed');
	const isProfile = pathname.startsWith('/profile');
	const profileHref = currentUserId ? `/profile/${currentUserId}` : '/';
	const profileDisabled = !currentUserId;
	return (
		<div className="grid grid-cols-2 gap-3">
			<a href="/feed" className={`${isFeed ? 'btn-primary' : 'btn-secondary'} w-full`}>Feed</a>
			<a
				href={profileHref}
				className={`${isProfile ? 'btn-primary' : 'btn-secondary'} w-full ${profileDisabled ? 'opacity-50 pointer-events-none' : ''}`}
			>
				My Profile
			</a>
		</div>
	);
}


