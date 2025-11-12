type MemoryResponse<T = any> = {
	data?: T;
	status?: string;
	next_cursor?: string | null;
	[key: string]: any;
};

const BASE =
	process.env.MEMORY_API_BASE?.replace(/\/+$/, '') || 'https://api.memoryproto.co';
const API_KEY = process.env.MEMORY_API_KEY;

if (!API_KEY) {
	// Intentionally not throwing at import time in case of build-time env absence;
	// individual requests will fail with 401 and clear error.
}

async function memFetch<T>(path: string, init?: RequestInit): Promise<MemoryResponse<T>> {
	const url = `${BASE}${path.startsWith('/') ? '' : '/'}${path}`;
	const res = await fetch(url, {
		...init,
		headers: {
			'Content-Type': 'application/json',
			Authorization: `Bearer ${API_KEY}`,
			...(init?.headers || {})
		},
		cache: 'no-store'
	});
	if (!res.ok) {
		const text = await res.text();
		throw new Error(`Memory API ${res.status}: ${text}`);
	}
	return (await res.json()) as MemoryResponse<T>;
}

async function pollUntilReady<T>(
	path: string,
	{
		maxAttempts = 8,
		initialDelayMs = 500,
		factor = 1.6
	}: { maxAttempts?: number; initialDelayMs?: number; factor?: number } = {}
): Promise<MemoryResponse<T>> {
	let attempt = 0;
	let delay = initialDelayMs;
	// eslint-disable-next-line no-constant-condition
	while (true) {
		const resp = await memFetch<T>(path);
		if (resp.status !== 'in_progress') return resp;
		attempt += 1;
		if (attempt >= maxAttempts) return resp;
		await new Promise((r) => setTimeout(r, delay));
		delay = Math.round(delay * factor);
	}
}

export const MemoryAPI = {
	getIdentityByWallet(address: string) {
		return memFetch(`/identities/wallet/${encodeURIComponent(address)}`);
	},
	getIdentityByFarcaster(username: string) {
		return memFetch(`/identities/farcaster/username/${encodeURIComponent(username)}`);
	},
	getIdentityByTwitter(username: string) {
		return memFetch(`/identities/twitter/username/${encodeURIComponent(username)}`);
	},
	getFollowers(platform: 'twitter' | 'farcaster', handle: string, cursor?: string) {
		const search = new URLSearchParams();
		if (cursor) search.set('cursor', cursor);
		return pollUntilReady(`/social/${platform}/username/${encodeURIComponent(handle)}/followers?${search.toString()}`);
	},
	getFollowing(platform: 'twitter' | 'farcaster', handle: string, cursor?: string) {
		const search = new URLSearchParams();
		if (cursor) search.set('cursor', cursor);
		return pollUntilReady(`/social/${platform}/username/${encodeURIComponent(handle)}/following?${search.toString()}`);
	},
	getPosts(platform: 'twitter' | 'farcaster', handle: string, cursor?: string) {
		const search = new URLSearchParams();
		if (cursor) search.set('cursor', cursor);
		return pollUntilReady(`/social/${platform}/username/${encodeURIComponent(handle)}/posts?${search.toString()}`);
	}
};


