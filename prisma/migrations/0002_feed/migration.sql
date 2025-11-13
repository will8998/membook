-- Feed posts table (PostgreSQL)

CREATE TABLE IF NOT EXISTS "Post" (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"(id),
  content TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_post_createdAt" ON "Post"("createdAt" DESC);


