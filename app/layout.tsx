import './globals.css';
import type { ReactNode } from 'react';

export const metadata = {
	title: 'Memory Badge',
	description: 'Create your Memory Badge and chat with your unified identity'
};

export default function RootLayout({ children }: { children: ReactNode }) {
	return (
		<html lang="en">
			<body className="min-h-screen antialiased">
				<div className="mx-auto max-w-6xl px-4 py-6">{children}</div>
			</body>
		</html>
	);
}


