import { formatNumber } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

function escapeXml(unsafe: string) {
	return unsafe
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#039;');
}

export async function GET(_: Request, { params }: { params: { userId: string } }) {
	const { prisma } = await import('@/lib/db');
	const userId = params.userId;
	const user = await prisma.user.findUnique({
		where: { id: userId },
		include: { socialStats: true, leaderboard: true, identities: true }
	});
	if (!user) return new Response('Not found', { status: 404 });

	const totalFollowers = user.socialStats.reduce((a, s) => a + s.followers, 0);
	const rank = user.leaderboard?.rank ?? null;
	const archetype = user.archetype || 'Explorer';

	const handle = user.primaryHandle;
	const host = (process.env.NEXT_PUBLIC_APP_URL || '').replace(/^https?:\/\//, '') || 'your-app';
	const width = 1200;
	const height = 630;

	const svg = `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" x2="1" y1="0" y2="1">
      <stop offset="0%" stop-color="#0b0f12"/>
      <stop offset="100%" stop-color="#091219"/>
    </linearGradient>
  </defs>
  <rect width="100%" height="100%" fill="url(#bg)" rx="16" />
  <rect x="20" y="20" width="${width - 40}" height="${height - 40}" rx="16" fill="#12181f" stroke="rgba(255,255,255,0.08)"/>

  <text x="60" y="110" fill="#E6F1F7" font-family="Inter, ui-sans-serif" font-weight="700" font-size="56">Memory Badge</text>
  <text x="60" y="150" fill="#78E6D0" font-family="Inter, ui-sans-serif" font-size="28">${escapeXml(archetype)}</text>
  <text x="60" y="190" fill="#9FB3C8" font-family="Inter, ui-sans-serif" font-size="20">${escapeXml(handle)}</text>

  <g>
    <rect x="60" y="240" width="360" height="160" rx="12" fill="#0f141a" stroke="rgba(255,255,255,0.08)" />
    <text x="90" y="300" fill="#9FB3C8" font-family="Inter, ui-sans-serif" font-size="22">Total Followers</text>
    <text x="90" y="360" fill="#E6F1F7" font-family="Inter, ui-sans-serif" font-weight="800" font-size="56">${formatNumber(totalFollowers)}</text>
  </g>

  <g>
    <rect x="460" y="240" width="240" height="160" rx="12" fill="#0f141a" stroke="rgba(255,255,255,0.08)" />
    <text x="490" y="300" fill="#9FB3C8" font-family="Inter, ui-sans-serif" font-size="22">Rank</text>
    <text x="490" y="360" fill="#E6F1F7" font-family="Inter, ui-sans-serif" font-weight="800" font-size="56">${rank ?? '-'}</text>
  </g>

  <g>
    <rect x="740" y="240" width="380" height="160" rx="12" fill="#78E6D0"/>
    <text x="770" y="335" fill="#0b0f12" font-family="Inter, ui-sans-serif" font-weight="700" font-size="36">Get yours at ${host}</text>
  </g>
</svg>
`.trim();

	return new Response(svg, {
		headers: {
			'Content-Type': 'image/svg+xml; charset=utf-8',
			'Cache-Control': 'no-store'
		}
	});
}


