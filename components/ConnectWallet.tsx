'use client';

import { useRouter } from 'next/navigation';
import { useState } from 'react';

declare global {
	interface Window {
		ethereum?: any;
	}
}

export default function ConnectWallet() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	const connect = async () => {
		setError(null);
		try {
			if (!window.ethereum) {
				setError('No wallet found. Please install MetaMask or a compatible wallet.');
				return;
			}
			setLoading(true);
			const accounts = await window.ethereum.request({ method: 'eth_requestAccounts' });
			const address: string = (accounts?.[0] || '').toLowerCase();
			if (!address) {
				setError('No account returned from wallet.');
				return;
			}
			// Resolve identity via wallet and redirect to profile
			const res = await fetch('/api/identity', {
				method: 'POST',
				headers: { 'Content-Type': 'application/json' },
				body: JSON.stringify({ input: { type: 'wallet', value: address } })
			});
			if (!res.ok) {
				const t = await res.text();
				throw new Error(t || 'Failed to resolve wallet');
			}
			const data = await res.json();
			router.push(`/profile/${data.userId}`);
		} catch (e: any) {
			setError(e?.message || 'Failed to connect wallet');
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="flex flex-col gap-2">
			<button className="btn-primary" onClick={connect} disabled={loading}>
				{loading ? 'Connecting...' : 'Connect Wallet'}
			</button>
			{error && <div className="text-sm text-red-400">{error}</div>}
		</div>
	);
}


