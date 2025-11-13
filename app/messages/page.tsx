import BackButton from '@/components/ui/BackButton';
import DMChat from '@/components/DMChat';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const revalidate = 0;

export default function MessagesPage({ searchParams }: { searchParams?: { to?: string } }) {
	const initialPeerId = searchParams?.to;
	return (
		<div className="space-y-6">
			<div className="flex items-center justify-between">
				<BackButton />
				<h1 className="text-2xl font-semibold">Messages</h1>
				<div />
			</div>
			<DMChat initialPeerId={initialPeerId} />
		</div>
	);
}


