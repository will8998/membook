/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react';
import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import HeroBrainGlobe from '@/components/HeroBrainGlobe';
import HomeClient from '@/components/HomeClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
	const userId = cookies().get('mem_user_id')?.value || null;
	if (userId) {
		// Server redirect to profile if already connected
		redirect(`/profile/${userId}`);
	}
	return (
		<div className="space-y-8">
			<HeroBrainGlobe />
			<Suspense fallback={null}>
				<HomeClient />
			</Suspense>
		</div>
	);
}

