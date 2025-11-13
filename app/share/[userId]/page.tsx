import { headers } from 'next/headers';
import type { Metadata } from 'next';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function generateMetadata({ params }: { params: { userId: string } }): Promise<Metadata> {
	const host = headers().get('host') || 'localhost:3000';
	const protocol = process.env.VERCEL ? 'https' : 'http';
	const origin = `${protocol}://${host}`;
	const og = `${origin}/api/badge/${params.userId}/og`;
	return {
		title: 'Memory Badge',
		description: 'Get your Memory Badge',
		metadataBase: new URL(origin),
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
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
	return (
		<div className="min-h-[60vh] flex items-center justify-center">
			<a className="btn-primary" href={`/profile/${params.userId}`}>
				View Profile
			</a>
			<script
				dangerouslySetInnerHTML={{
					__html: `
						(function () {
							try {
								var params = new URLSearchParams(location.search);
								var ref = params.get('ref');
								if (ref) {
									fetch('/api/referral', {
										method: 'POST',
										headers: { 'Content-Type': 'application/json' },
										body: JSON.stringify({ refCode: ref })
									}).catch(function(){});
								}
							} catch(e) {}
							setTimeout(function(){ location.href='${appUrl}/profile/${params.userId}'; }, 800);
						})();`
				}}
			/>
		</div>
	);
}


