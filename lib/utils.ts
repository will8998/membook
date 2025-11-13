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

export function maskWalletAddress(addr: string, visible = 4) {
	const s = String(addr || '');
	const m = s.match(/^0x[a-fA-F0-9]{8,}$/);
	if (!m) return s;
	const prefix = '0x';
	const body = s.slice(2);
	const first = body.slice(0, visible);
	const last = body.slice(-visible);
	return `${prefix}${first}***${last}`;
}

export function formatHandleForDisplay(handle: string) {
	const h = String(handle || '');
	if (h.startsWith('wallet:')) {
		const addr = h.slice('wallet:'.length);
		return `wallet:${maskWalletAddress(addr)}`;
	}
	// If handle itself is a raw address, mask it too
	if (/^0x[a-fA-F0-9]{8,}$/.test(h)) return maskWalletAddress(h);
	return h;
}


