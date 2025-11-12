export function ShareButtons({ userId, referralCode }: { userId: string; referralCode: string }) {
	const appUrl = process.env.NEXT_PUBLIC_APP_URL || '';
	const profileUrl = `${appUrl}/profile/${userId}?ref=${referralCode}`;
	const shareUrl = `${appUrl}/share/${userId}?ref=${referralCode}`;
	const ogUrl = `${appUrl}/api/badge/${userId}/og`;
	const text = encodeURIComponent('Get your Memory Badge');
	// Twitter will pick up the OG image from the share page
	const twitter = `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(shareUrl)}`;
	// Warpcast supports direct image embeds (png/jpg); use OG PNG route
	const warpcast = `https://warpcast.com/~/compose?text=${text}&embeds[]=${encodeURIComponent(ogUrl)}&embeds[]=${encodeURIComponent(profileUrl)}`;
	return (
		<div className="flex gap-2">
			<a className="btn-secondary" href={twitter} target="_blank" rel="noreferrer">
				Share on Twitter
			</a>
			<a className="btn-secondary" href={warpcast} target="_blank" rel="noreferrer">
				Share on Farcaster
			</a>
		</div>
	);
}


