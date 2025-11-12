import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

// Simple in-process rate limit per IP for API routes
const WINDOW_MS = 5 * 60 * 1000;
const MAX_REQUESTS = 120;
const buckets = new Map<string, { count: number; windowStart: number }>();

export function middleware(req: NextRequest) {
	const { pathname } = new URL(req.url);
	if (!pathname.startsWith('/api/')) return NextResponse.next();

	const ip =
		req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
		req.headers.get('x-real-ip') ||
		'0.0.0.0';
	const now = Date.now();
	const bucket = buckets.get(ip);
	if (!bucket || now - bucket.windowStart > WINDOW_MS) {
		buckets.set(ip, { count: 1, windowStart: now });
		return NextResponse.next();
	}
	bucket.count += 1;
	if (bucket.count > MAX_REQUESTS) {
		return new NextResponse('Rate limit exceeded', { status: 429 });
	}
	return NextResponse.next();
}

export const config = {
	matcher: ['/api/:path*']
};


