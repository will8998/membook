export function generateReferralCode(length = 6) {
	const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
	let out = '';
	for (let i = 0; i < length; i++) {
		out += alphabet[Math.floor(Math.random() * alphabet.length)];
	}
	return out;
}

export function hashIp(ip: string) {
	// Simple non-cryptographic hash to avoid storing raw IPs
	let hash = 0;
	for (let i = 0; i < ip.length; i++) {
		hash = (hash << 5) - hash + ip.charCodeAt(i);
		hash |= 0;
	}
	return `h${Math.abs(hash)}`;
}

export function normalizeHandle(type: 'wallet' | 'farcaster' | 'twitter', value: string) {
	if (type === 'wallet') return value.toLowerCase();
	return value.replace(/^@/, '').toLowerCase();
}

export function formatNumber(n: number) {
	return Intl.NumberFormat('en', { notation: 'compact' }).format(n);
}


