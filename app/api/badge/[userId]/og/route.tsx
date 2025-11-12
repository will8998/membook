/* eslint-disable @next/next/no-img-element */
import { ImageResponse } from '@vercel/og';
import { formatNumber } from '@/lib/utils';

export const runtime = 'edge';

export async function GET(req: Request, { params }: { params: { userId: string } }) {
	const { userId } = params;
	const url = new URL(req.url);
	const origin = `${url.protocol}//${url.host}`;
	const resp = await fetch(`${origin}/api/badge/${userId}/data`, { cache: 'no-store' });
	if (!resp.ok) return new Response('Not found', { status: 404 });
	const json = (await resp.json()) as any;
	const d = json.data;

	return new ImageResponse(
		(
			<div
				style={{
					width: '1200px',
					height: '630px',
					display: 'flex',
					background: '#0b0f12',
					color: '#E6F1F7',
					fontFamily: 'Inter, ui-sans-serif',
					padding: '40px'
				}}
			>
				<div
					style={{
						display: 'flex',
						flexDirection: 'column',
						justifyContent: 'space-between',
						width: '100%',
						height: '100%',
						border: '2px solid rgba(255,255,255,0.08)',
						borderRadius: 16,
						padding: 32
					}}
				>
					<div style={{ display: 'flex', gap: 24, alignItems: 'baseline' }}>
						<div style={{ fontSize: 46, fontWeight: 800 }}>Memory Badge</div>
						<div style={{ fontSize: 24, color: '#78E6D0' }}>{String(d.archetype)}</div>
					</div>
					<div style={{ display: 'flex', gap: 40 }}>
						<div
							style={{
								background: '#12181f',
								padding: 24,
								borderRadius: 12,
								border: '1px solid rgba(255,255,255,0.08)',
								minWidth: 320
							}}
						>
							<div style={{ fontSize: 18, opacity: 0.8 }}>Total Followers</div>
							<div style={{ fontSize: 56, fontWeight: 800 }}>{formatNumber(d.totalFollowers)}</div>
						</div>
						<div
							style={{
								background: '#12181f',
								padding: 24,
								borderRadius: 12,
								border: '1px solid rgba(255,255,255,0.08)',
								minWidth: 240
							}}
						>
							<div style={{ fontSize: 18, opacity: 0.8 }}>Rank</div>
							<div style={{ fontSize: 56, fontWeight: 800 }}>{d.rank ?? '-'}</div>
						</div>
					</div>
					<div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
						<div style={{ fontSize: 18, opacity: 0.9 }}>{String(d.handle)}</div>
						<div
							style={{
								background: '#78E6D0',
								color: '#0b0f12',
								padding: '12px 20px',
								borderRadius: 999
							}}
						>
							Get yours at {url.host}
						</div>
					</div>
				</div>
			</div>
		)
	);
}


