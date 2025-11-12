## Memory Badge + Chat (Next.js)

Setup:

1) Install dependencies
   - npm install
2) Create .env file with:
   - MEMORY_API_KEY=mem_xxx
   - OPENAI_API_KEY=sk-xxx
   - NEXT_PUBLIC_APP_URL=http://localhost:3000
   - MEMORY_API_BASE=https://api.memoryproto.co
3) Prisma
   - npx prisma generate
   - npx prisma migrate dev --name init
4) Dev
   - npm run dev

Notes:
- The `.env.example` file could not be added in this environment due to ignore rules; the required keys are listed above.
- Badge image is served from `/api/badge/[userId]/image` (Edge runtime).
- Only Memory API and OpenAI are used; no other external data sources.


