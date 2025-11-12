/* eslint-disable @next/next/no-img-element */
import { Suspense } from 'react';
import HeroBrainGlobe from '@/components/HeroBrainGlobe';
import HomeClient from '@/components/HomeClient';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function HomePage() {
	return (
		<div className="space-y-8">
			<HeroBrainGlobe />
			<Suspense fallback={null}>
				<HomeClient />
			</Suspense>
		</div>
	);
}

