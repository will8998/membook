'use client';

export default function SignOutButton() {
	const signOut = async () => {
		try {
			await fetch('/api/auth/signout', { method: 'POST' });
		} catch {}
		window.location.href = '/';
	};
	return (
		<button className="btn-secondary" onClick={signOut}>
			Sign out
		</button>
	);
}


