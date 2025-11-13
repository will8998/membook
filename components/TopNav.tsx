import Link from 'next/link';
import { cookies } from 'next/headers';
import ConnectWallet from './ConnectWallet';
import SignOutButton from './SignOutButton';

export default function TopNav() {
	const userId = cookies().get('mem_user_id')?.value || null;
	return (
		<nav className="flex items-center justify-between py-2 gap-3">
			<div className="flex items-center gap-2">
				<Link href="/" className="text-lg font-semibold">
					MemBook
				</Link>
			</div>
			<div className="flex items-center gap-2">
				{userId ? (
					<>
						<Link href={`/profile/${userId}`} className="btn-secondary">
							Dashboard
						</Link>
						<Link href="/referrals" className="btn-secondary">
							Referrals
						</Link>
						<Link href="/leaderboard" className="btn-secondary">
							Leaderboard
						</Link>
						<SignOutButton />
					</>
				) : (
					<ConnectWallet />
				)}
			</div>
		</nav>
	);
}


