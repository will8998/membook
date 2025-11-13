import { cookies } from 'next/headers';
import FeedInfinite from '@/components/FeedInfinite';
import TopTabs from '@/components/TopTabs';
import LeftSidebarFriends from '@/components/LeftSidebarFriends';
import RightSidebarChat from '@/components/RightSidebarChat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function FeedPage() {
	const canPost = !!cookies().get('mem_user_id')?.value;
	const currentUserId = cookies().get('mem_user_id')?.value || null;
	return (
		<div className="lg:grid lg:grid-cols-12 lg:gap-6">
			<div className="hidden lg:block lg:col-span-3">
				<LeftSidebarFriends />
			</div>
			<div className="lg:col-span-6 space-y-6">
				<TopTabs currentUserId={currentUserId} />
				<FeedInfinite canPost={canPost} />
			</div>
			<div className="hidden lg:block lg:col-span-3">
				<RightSidebarChat />
			</div>
		</div>
	);
}


