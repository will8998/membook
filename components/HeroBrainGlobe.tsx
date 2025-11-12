/* eslint-disable @next/next/no-img-element */
export default function HeroBrainGlobe() {
	return (
		<div className="w-full flex items-center justify-center" style={{ height: 400 }}>
			<svg
				width="100%"
				height="100%"
				viewBox="0 0 1200 400"
				xmlns="http://www.w3.org/2000/svg"
				role="img"
				aria-label="Animated brain over globe"
			>
				<defs>
					<radialGradient id="globeGrad" cx="50%" cy="50%" r="60%">
						<stop offset="0%" stopColor="#1b2730" />
						<stop offset="100%" stopColor="#0b0f12" />
					</radialGradient>
					<filter id="glow" x="-50%" y="-50%" width="200%" height="200%">
						<feGaussianBlur stdDeviation="6" result="blur" />
						<feMerge>
							<feMergeNode in="blur" />
							<feMergeNode in="SourceGraphic" />
						</feMerge>
					</filter>
				</defs>

				{/* Globe */}
				<g transform="translate(600,200)">
					<circle r="160" fill="url(#globeGrad)" stroke="rgba(120,230,208,0.25)" strokeWidth="1" />
					<g stroke="rgba(255,255,255,0.12)" strokeWidth="1" fill="none">
						{/* Latitudes */}
						{[-120, -90, -60, -30, 0, 30, 60, 90, 120].map((y, i) => (
							<ellipse key={`lat-${i}`} rx={160 * Math.cos((y * Math.PI) / 360)} ry={160 * Math.sin(Math.PI / 2 - Math.abs((y * Math.PI) / 360))} />
						))}
						{/* Longitudes */}
						{Array.from({ length: 12 }).map((_, i) => {
							const rot = (i * 180) / 12;
							return <ellipse key={`lon-${i}`} rx={160} ry={160 * 0.1} transform={`rotate(${rot})`} />;
						})}
					</g>
					<g filter="url(#glow)" opacity="0.35">
						<circle r="160" fill="none" stroke="#78E6D0" strokeWidth="2">
							<animate attributeName="stroke-opacity" values="0.1;0.4;0.1" dur="6s" repeatCount="indefinite" />
						</circle>
					</g>
					<g transform="rotate(0)">
						<animateTransform attributeName="transform" type="rotate" from="0" to="360" dur="20s" repeatCount="indefinite" />
						<g stroke="rgba(120,230,208,0.25)" strokeWidth="1" fill="none">
							{Array.from({ length: 24 }).map((_, i) => {
								const rot = (i * 360) / 24;
								return <ellipse key={`spin-${i}`} rx={160} ry={20} transform={`rotate(${rot})`} />;
							})}
						</g>
					</g>
				</g>
			</svg>
		</div>
	);
}


