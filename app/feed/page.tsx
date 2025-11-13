import { cookies } from 'next/headers';
import FeedInfinite from '@/components/FeedInfinite';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function FeedPage() {
	const canPost = !!cookies().get('mem_user_id')?.value;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<h1 className="text-2xl font-semibold">Feed</h1>
				<div />
			</div>
			<FeedInfinite canPost={canPost} />
		</div>
	);
}


