-- Direct Messages table

CREATE TABLE IF NOT EXISTS "DMMessage" (
  id TEXT PRIMARY KEY,
  "senderId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  "receiverId" TEXT REFERENCES "User"(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS "idx_dm_createdAt" ON "DMMessage"("createdAt" DESC);
CREATE INDEX IF NOT EXISTS "idx_dm_pair" ON "DMMessage"("senderId", "receiverId");


