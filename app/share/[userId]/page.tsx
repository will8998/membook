import type { Metadata } from 'next';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	const og = `${appUrl}/api/badge/${params.userId}/og`;
	return {
		title: 'Memory Badge',
		description: 'Get your Memory Badge',
		openGraph: {
			title: 'Memory Badge',
			description: 'Get your Memory Badge',
			images: [{ url: og, width: 1200, height: 630 }]
		},
		twitter: {
			card: 'summary_large_image',
			title: 'Memory Badge',
			description: 'Get your Memory Badge',
			images: [og]
		}
	};
}

export default function SharePage({ params }: { params: { userId: string } }) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<a className="btn-primary" href={`/profile/${params.userId}`}>
				View Profile
			</a>
			<script
				dangerouslySetInnerHTML={{
					__html: `setTimeout(function(){ location.href='${appUrl}/profile/${params.userId}'; }, 1500);`
				}}
			/>
		</div>
	);
}


