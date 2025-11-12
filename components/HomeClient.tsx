'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import ConnectWallet from '@/components/ConnectWallet';

type InputType = 'wallet' | 'farcaster' | 'twitter';

export default function HomeClient() {
	const router = useRouter();
	const searchParams = useSearchParams();
	const [type, setType] = useState<InputType>('farcaster');
	const [value, setValue] = useState('');
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [showHandle, setShowHandle] = useState(false);

	useEffect(() => {
		// Record referral hit if present
		const ref = searchParams.get('ref');
		if (ref) {
			fetch('/api/referral', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ refCode: ref })
			}).catch(() => {});
		}
	}, [searchParams]);

	const onSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setError(null);
		setLoading(true);
		try {
			const res = await fetch('/api/identity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: { type, value } })
			});
			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || 'Failed to resolve identity');
			}
			const data = await res.json();
			router.push(`/profile/${data.userId}`);
		} catch (err: any) {
			setError(err?.message || 'Unexpected error');
		} finally {
			setLoading(false);
		}
	};

	return (
		<>
			<header className="flex items-center justify-between">
				<h1 className="text-3xl font-semibold">Memory Badge</h1>
				<div className="flex items-center gap-2">
					<a className="btn-secondary" href="/leaderboard">
						Leaderboard
					</a>
					<a className="btn-secondary" href="/referrals">
						Referrals
					</a>
				</div>
			</header>
			<section className="card p-6">
				<h2 className="text-xl font-medium mb-4">Get your unified profile</h2>
				<div className="mb-4">
					<ConnectWallet />
				</div>
				<button
					className="text-sm text-white/60 underline underline-offset-4"
					onClick={() => setShowHandle((s) => !s)}
				>
					{showHandle ? 'Hide handle search' : 'Use handle instead'}
				</button>
				{showHandle && (
					<form className="mt-3 flex flex-col gap-3 sm:flex-row" onSubmit={onSubmit}>
						<select
							className="bg-black/30 rounded-md px-3 py-2 border border-white/10"
							value={type}
							onChange={(e) => setType(e.target.value as InputType)}
						>
							<option value="farcaster">Farcaster username</option>
							<option value="twitter">Twitter handle</option>
							<option value="wallet">Wallet address</option>
						</select>
						<input
							className="flex-1 bg-black/30 rounded-md px-3 py-2 border border-white/10"
							placeholder={
								type === 'wallet' ? '0x...' : type === 'farcaster' ? 'dwr' : 'jack'
							}
							value={value}
							onChange={(e) => setValue(e.target.value)}
							required
						/>
						<button className="btn-primary" type="submit" disabled={loading}>
							{loading ? 'Loading...' : 'View Profile'}
						</button>
					</form>
				)}
				{error && <p className="text-red-400 mt-3">{error}</p>}
			</section>
			<section className="grid gap-4 sm:grid-cols-3">
				<div className="card p-5">
					<h3 className="font-semibold mb-2">Memory Badge</h3>
					<p className="text-sm text-white/70">
						Share a unified identity image with archetype, followers and rank.
					</p>
				</div>
				<div className="card p-5">
					<h3 className="font-semibold mb-2">Chat with My Data</h3>
					<p className="text-sm text-white/70">
						Ask questions grounded strictly in your Memory profile data.
					</p>
				</div>
				<div className="card p-5">
					<h3 className="font-semibold mb-2">Grow your rank</h3>
					<p className="text-sm text-white/70">
						Invite friends via your badge link to climb the leaderboard.
					</p>
				</div>
			</section>
		</>
	);
}


