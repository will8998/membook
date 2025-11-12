type Suggestion = { title: string; description: string; url: string };

export function Suggestions({
	quests,
	protocols,
	yields
}: {
	quests: Suggestion[];
	protocols: Suggestion[];
	yields: Suggestion[];
}) {
	return (
		<div className="grid gap-4 md:grid-cols-3">
			<div className="card p-4 space-y-3">
				<div className="text-sm font-medium">Suggested quests that fit your interest</div>
				<ul className="space-y-2 text-sm">
					{quests.map((q) => (
						<li key={q.title}>
							<a className="text-[var(--mem-accent)] hover:underline" href={q.url} target="_blank" rel="noreferrer">
								{q.title}
							</a>
							<div className="text-white/70">{q.description}</div>
						</li>
					))}
				</ul>
			</div>
			<div className="card p-4 space-y-3">
				<div className="text-sm font-medium">Suggested protocols that fit your interest</div>
				<ul className="space-y-2 text-sm">
					{protocols.map((p) => (
						<li key={p.title}>
							<a className="text-[var(--mem-accent)] hover:underline" href={p.url} target="_blank" rel="noreferrer">
								{p.title}
							</a>
							<div className="text-white/70">{p.description}</div>
						</li>
					))}
				</ul>
			</div>
			<div className="card p-4 space-y-3">
				<div className="text-sm font-medium">Suggested DeFi yields that fit your risk profile</div>
				<ul className="space-y-2 text-sm">
					{yields.map((y) => (
						<li key={y.title}>
							<a className="text-[var(--mem-accent)] hover:underline" href={y.url} target="_blank" rel="noreferrer">
								{y.title}
							</a>
							<div className="text-white/70">{y.description}</div>
						</li>
					))}
				</ul>
			</div>
		</div>
	);
}


