export function BadgePreview({ userId }: { userId: string }) {
	const url = `/api/badge/${userId}/image`;
	return (
		<div className="card p-4">
			<div className="text-sm mb-2 text-white/70">Memory Badge</div>
			<div className="relative w-full aspect-[1200/630] overflow-hidden rounded bg-black/30">
				<img src={url} alt="Memory Badge" className="absolute inset-0 h-full w-full object-cover" />
			</div>
		</div>
	);
}


