type Suggestion = { title: string; description: string; url: string };

export type SuggestionBundle = {
	quests: Suggestion[];
	protocols: Suggestion[];
	yields: Suggestion[];
};

export function getSuggestions(archetype?: string | null): SuggestionBundle {
	const a = (archetype || '').toLowerCase();

	const baseQuests: Suggestion[] = [
		{
			title: 'Verify identities on Memory',
			description: 'Link Farcaster/Twitter/GitHub to boost your influence score.',
			url: 'https://docs.memoryproto.co'
		},
		{
			title: 'Share your Memory Badge',
			description: 'Post your badge to grow referrals and climb the leaderboard.',
			url: '#share'
		}
	];
	const baseProtocols: Suggestion[] = [
		{
			title: 'Base Ecosystem',
			description: 'Explore top Base-native protocols and communities.',
			url: 'https://base.org'
		}
	];
	const baseYields: Suggestion[] = [
		{
			title: 'Learn DeFi Risk Basics',
			description: 'Before farming, review custody and smart-contract risk.',
			url: 'https://ethereum.org/en/defi/'
		}
	];

	if (a.includes('builder')) {
		return {
			quests: [
				...baseQuests,
				{
					title: 'Ship a small dapp',
					description: 'Build a minimal dapp and share a demo thread.',
					url: 'https://docs.base.org'
				},
				{
					title: 'Open-source a utility',
					description: 'Publish a small tool and tag relevant communities.',
					url: 'https://github.com/new'
				}
			],
			protocols: [
				...baseProtocols,
				{
					title: 'Developer Grants',
					description: 'Apply to ecosystem grants and hackathons.',
					url: 'https://github.com/ethereum-grants'
				}
			],
			yields: baseYields
		};
	}

	if (a.includes('collector')) {
		return {
			quests: [
				...baseQuests,
				{
					title: 'Curate a collection',
					description: 'Create a themed NFT list and share why it matters.',
					url: 'https://zora.co'
				}
			],
			protocols: [
				...baseProtocols,
				{
					title: 'NFT Marketplaces',
					description: 'Explore creator tooling and onchain art markets.',
					url: 'https://opensea.io'
				}
			],
			yields: baseYields
		};
	}

	if (a.includes('trader')) {
		return {
			quests: [
				...baseQuests,
				{
					title: 'Strategy Log',
					description: 'Journal your trades and share a weekly recap.',
					url: '#'
				}
			],
			protocols: [
				...baseProtocols,
				{
					title: 'DEX Aggregators',
					description: 'Compare routes and slippage on trades.',
					url: 'https://matcha.xyz'
				}
			],
			yields: [
				...baseYields,
				{
					title: 'LP Simulator',
					description: 'Model impermanent loss before adding liquidity.',
					url: 'https://blog.uniswap.org'
				}
			]
		};
	}

	// Influencer or default
	return {
		quests: [
			...baseQuests,
			{
				title: 'Weekly Highlights',
				description: 'Publish a weekly roundup of top threads and projects.',
				url: '#'
			}
		],
		protocols: [
			...baseProtocols,
			{
				title: 'Social Tools',
				description: 'Explore tools for analytics and audience growth.',
				url: 'https://warpcast.com'
			}
		],
		yields: baseYields
	};
}


