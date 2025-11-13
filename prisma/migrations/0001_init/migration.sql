-- Create tables for Postgres

CREATE TABLE IF NOT EXISTS "User" (
  id TEXT PRIMARY KEY,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  "updatedAt" TIMESTAMPTZ,
  "primaryHandle" TEXT UNIQUE NOT NULL,
  "referralCode" TEXT UNIQUE NOT NULL,
  archetype TEXT,
  "archetypeReason" TEXT
);

CREATE TABLE IF NOT EXISTS "Identity" (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"(id),
  platform TEXT NOT NULL,
  handle TEXT NOT NULL,
  "externalId" TEXT,
  "avatarUrl" TEXT,
  url TEXT
);
CREATE INDEX IF NOT EXISTS "idx_identity_user_platform" ON "Identity"("userId", platform);

CREATE TABLE IF NOT EXISTS "SocialStats" (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"(id),
  platform TEXT NOT NULL,
  followers INTEGER DEFAULT 0 NOT NULL,
  following INTEGER DEFAULT 0 NOT NULL,
  "postsCount" INTEGER DEFAULT 0 NOT NULL,
  "updatedAt" TIMESTAMPTZ
);
CREATE INDEX IF NOT EXISTS "idx_social_user_platform" ON "SocialStats"("userId", platform);

CREATE TABLE IF NOT EXISTS "ReferralHit" (
  id TEXT PRIMARY KEY,
  "refCode" TEXT NOT NULL,
  "referredUserId" TEXT,
  "ipHash" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Leaderboard" (
  "userId" TEXT PRIMARY KEY REFERENCES "User"(id),
  "influenceScore" DOUBLE PRECISION NOT NULL,
  rank INTEGER,
  "updatedAt" TIMESTAMPTZ
);

CREATE TABLE IF NOT EXISTS "ChatSession" (
  id TEXT PRIMARY KEY,
  "userId" TEXT REFERENCES "User"(id),
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "ChatMessage" (
  id TEXT PRIMARY KEY,
  "sessionId" TEXT REFERENCES "ChatSession"(id),
  role TEXT,
  content TEXT,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "PublicMessage" (
  id TEXT PRIMARY KEY,
  "userId" TEXT,
  handle TEXT NOT NULL,
  content TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "Friend" (
  id TEXT PRIMARY KEY,
  "userId" TEXT NOT NULL,
  "friendId" TEXT NOT NULL,
  "createdAt" TIMESTAMPTZ DEFAULT NOW(),
  CONSTRAINT unique_friend UNIQUE ("userId","friendId")
);


