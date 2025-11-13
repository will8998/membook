import { cookies } from 'next/headers';
import FeedInfinite from '@/components/FeedInfinite';
import TopTabs from '@/components/TopTabs';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function FeedPage() {
	const canPost = !!cookies().get('mem_user_id')?.value;
	const currentUserId = cookies().get('mem_user_id')?.value || null;
	return (
		<div className="space-y-6">
			<TopTabs currentUserId={currentUserId} />
			<FeedInfinite canPost={canPost} />
		</div>
	);
}


