import { PrismaClient } from '@prisma/client';
import fs from 'fs';

declare global {
	// eslint-disable-next-line no-var
	var prisma: PrismaClient | undefined;
	// eslint-disable-next-line no-var
	var __prismaInited: boolean | undefined;
}

function ensureSqliteOnVercel() {
	if (!process.env.DATABASE_URL || process.env.DATABASE_URL.startsWith('file:')) {
		const isProd = process.env.NODE_ENV === 'production' || !!process.env.VERCEL;
		if (isProd) {
			const dbPath = '/tmp/dev.db';
			process.env.DATABASE_URL = `file:${dbPath}`;
			try {
				if (!fs.existsSync(dbPath)) fs.writeFileSync(dbPath, '');
			} catch {
				// ignore
			}
		}
	}
}

async function ensureSchema(client: PrismaClient) {
	if (global.__prismaInited) return;
	global.__prismaInited = true;
	const stmts = [
		`CREATE TABLE IF NOT EXISTS User (id TEXT PRIMARY KEY, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, updatedAt DATETIME, primaryHandle TEXT UNIQUE, referralCode TEXT UNIQUE, archetype TEXT, archetypeReason TEXT);`,
		`CREATE TABLE IF NOT EXISTS Identity (id TEXT PRIMARY KEY, userId TEXT, platform TEXT, handle TEXT, externalId TEXT, avatarUrl TEXT, url TEXT);`,
		`CREATE INDEX IF NOT EXISTS idx_identity_user_platform ON Identity(userId, platform);`,
		`CREATE TABLE IF NOT EXISTS SocialStats (id TEXT PRIMARY KEY, userId TEXT, platform TEXT, followers INTEGER DEFAULT 0, following INTEGER DEFAULT 0, postsCount INTEGER DEFAULT 0, updatedAt DATETIME);`,
		`CREATE INDEX IF NOT EXISTS idx_social_user_platform ON SocialStats(userId, platform);`,
		`CREATE TABLE IF NOT EXISTS ReferralHit (id TEXT PRIMARY KEY, refCode TEXT, referredUserId TEXT, ipHash TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`,
		`CREATE TABLE IF NOT EXISTS Leaderboard (userId TEXT PRIMARY KEY, influenceScore REAL, rank INTEGER, updatedAt DATETIME);`,
		`CREATE TABLE IF NOT EXISTS ChatSession (id TEXT PRIMARY KEY, userId TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`,
		`CREATE TABLE IF NOT EXISTS ChatMessage (id TEXT PRIMARY KEY, sessionId TEXT, role TEXT, content TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`,
		`CREATE TABLE IF NOT EXISTS PublicMessage (id TEXT PRIMARY KEY, userId TEXT, handle TEXT, content TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP);`,
		`CREATE TABLE IF NOT EXISTS Friend (id TEXT PRIMARY KEY, userId TEXT, friendId TEXT, createdAt DATETIME DEFAULT CURRENT_TIMESTAMP, UNIQUE(userId, friendId));`
	];
	try {
		for (const s of stmts) {
			// eslint-disable-next-line no-await-in-loop
			await client.$executeRawUnsafe(s);
		}
	} catch {
		// ignore
	}
}

ensureSqliteOnVercel();

export const prisma = global.prisma || new PrismaClient();
if (process.env.NODE_ENV !== 'production') global.prisma = prisma;

// Fire-and-forget schema setup for SQLite
// eslint-disable-next-line @typescript-eslint/no-floating-promises
ensureSchema(prisma);

