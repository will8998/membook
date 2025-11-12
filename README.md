## Membook — Own your unified digital identity

Membook turns your scattered onchain and social presence into a simple, shareable identity you control. Create a beautiful Memory Badge, see your cross‑platform reach, chat with an AI grounded strictly in your own data, and climb the community leaderboard.

### What you can do
- **Generate your Memory Badge**: A branded, shareable image with your avatar, archetype, total followers and rank. Perfect for Twitter and Farcaster.
- **Chat with My Data**: Ask “How many followers do I have across platforms?” or “What’s my archetype and why?” Answers are grounded in your Memory data—no hallucinations.
- **Leaderboard + Referrals**: Track influence, share your badge, invite friends, and watch your rank move in real time.
- **Friends & Discovery**: Add friends from the leaderboard, see suggested connections by archetype and rank.
- **Global Chat**: A lightweight public chat on the dashboard to meet people right inside the app.

### Why it matters
- **Unified identity**: Bring wallet, Farcaster, Twitter (+ more as Memory expands) into one canonical profile.
- **Portable social graph**: All data comes from Memory Protocol. No screen scraping, no shadow APIs.
- **Privacy by design**: We only show summarized fields in the UI; raw API responses and keys never leave the server.

### How it works
1. Enter a wallet, Farcaster, or Twitter handle—or connect your wallet.
2. We call Memory Protocol to fetch your identity graph and social stats.
3. We compute a simple archetype (Builder / Collector / Trader / Influencer) and an influence rank.
4. Your Memory Badge is generated and ready to share. Sharing auto‑embeds on Twitter/Farcaster and includes your referral link.

### Product highlights
- **One‑click badge share**: OG image for Twitter; direct image embed for Farcaster.
- **Grounded AI**: The chat prompt is seeded only with your Memory‑derived summary. If the LLM quota is hit, we reply with a friendly placeholder, not an error.
- **In‑app growth**: Referrals are first‑class. We track clicks and sign‑ups to reward the most viral badges.

### Screens (at a glance)
- Landing: Connect wallet or search handle → instantly see your unified profile.
- Profile: Badge, archetype explainer, chat, share buttons, friend suggestions.
- Leaderboard: Search, add friend, share rank.
- Referrals: Your link, clicks, sign‑ups, referred users with archetype/rank.

---

## Quick start (for users)
1. Open the app and connect your wallet (recommended) or search your handle.
2. Generate your badge and share it on Twitter/Farcaster.
3. Visit “Referrals” to copy your link and track sign‑ups.

## Quick start (for developers)
1) Install
   - npm install
2) Env
   - MEMORY_API_KEY=mem_xxx  
   - OPENAI_API_KEY=sk_xxx  
   - NEXT_PUBLIC_APP_URL=http://localhost:3000  
   - MEMORY_API_BASE=https://api.memoryproto.co
3) DB
   - npx prisma generate  
   - npx prisma migrate dev --name init
4) Run
   - npm run dev

### Architecture
- Frontend: Next.js (App Router, TS), Tailwind.
- Server: Next.js API routes.
- Data: Memory Protocol for identities + social graphs; SQLite via Prisma for cache, leaderboard, referrals, friends, chat.
- Image: Badge SVG (`/api/badge/[userId]/image`) and OG PNG for sharing (`/api/badge/[userId]/og`).

### Trust & compliance
- Keys live server‑side. We respect Memory’s rate limits and pagination (`in_progress` polling).
- No external scraping; all data is Memory‑sourced or locally derived.

### Roadmap
- Advanced ML archetypes and topic modeling, long‑term memory, and richer discovery.
- More identity types (Lens, Zora, email, Solana) as Memory expands.

Build with us. Grow with your graph. Own your identity. 🚀