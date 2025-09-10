-- Supabase Migration SQL
-- Based on Prisma Schema

-- Create ENUMs
CREATE TYPE "Role" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "MemberGrade" AS ENUM ('GUEST', 'REGULAR', 'ADMIN');
CREATE TYPE "TransactionType" AS ENUM ('CHARGE', 'VOUCHER_PURCHASE', 'ADMIN_ADJUSTMENT', 'REFUND');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'COMPLETED', 'CANCELLED', 'FAILED');
CREATE TYPE "VoucherType" AS ENUM ('BUYIN', 'REBUY');
CREATE TYPE "VoucherStatus" AS ENUM ('ACTIVE', 'USED', 'EXPIRED');
CREATE TYPE "UserStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'SUSPENDED');

-- Create User table
CREATE TABLE IF NOT EXISTS "User" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "email" TEXT UNIQUE,
    "emailVerified" TIMESTAMP(3),
    "name" TEXT,
    "image" TEXT,
    "phone" TEXT,
    "role" "Role" DEFAULT 'USER',
    "status" "UserStatus" DEFAULT 'ACTIVE',
    "points" INTEGER DEFAULT 0,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "grade" "MemberGrade" DEFAULT 'GUEST'
);

-- Create indexes for User
CREATE INDEX IF NOT EXISTS "User_email_idx" ON "User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON "User"("role");
CREATE INDEX IF NOT EXISTS "User_grade_idx" ON "User"("grade");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON "User"("status");

-- Create Account table (NextAuth)
CREATE TABLE IF NOT EXISTS "Account" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "providerAccountId" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,
    CONSTRAINT "Account_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create unique constraint and index for Account
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" ON "Account"("provider", "providerAccountId");
CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON "Account"("userId");

-- Create Session table (NextAuth)
CREATE TABLE IF NOT EXISTS "Session" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "sessionToken" TEXT UNIQUE NOT NULL,
    "userId" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,
    CONSTRAINT "Session_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE
);

-- Create index for Session
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON "Session"("userId");

-- Create VerificationToken table (NextAuth)
CREATE TABLE IF NOT EXISTS "VerificationToken" (
    "identifier" TEXT NOT NULL,
    "token" TEXT UNIQUE NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- Create unique constraint for VerificationToken
CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" ON "VerificationToken"("identifier", "token");

-- Create Transaction table
CREATE TABLE IF NOT EXISTS "Transaction" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "TransactionType" NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" "TransactionStatus" DEFAULT 'PENDING',
    "description" TEXT,
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Create indexes for Transaction
CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON "Transaction"("type");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON "Transaction"("status");
CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON "Transaction"("createdAt");

-- Create Tournament table
CREATE TABLE IF NOT EXISTS "Tournament" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "title" TEXT NOT NULL,
    "startDate" TIMESTAMP(3) NOT NULL,
    "endDate" TIMESTAMP(3),
    "maxEntries" INTEGER,
    "buyinRequired" INTEGER DEFAULT 1,
    "rebuyAllowed" BOOLEAN DEFAULT true,
    "status" TEXT DEFAULT 'UPCOMING',
    "location" TEXT DEFAULT '신림 잼스 홀덤펍',
    "createdBy" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "description" TEXT,
    "name" TEXT,
    "type" TEXT DEFAULT 'REGULAR'
);

-- Create indexes for Tournament
CREATE INDEX IF NOT EXISTS "Tournament_status_idx" ON "Tournament"("status");
CREATE INDEX IF NOT EXISTS "Tournament_startDate_idx" ON "Tournament"("startDate");

-- Create Voucher table
CREATE TABLE IF NOT EXISTS "Voucher" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "type" "VoucherType" NOT NULL,
    "status" "VoucherStatus" DEFAULT 'ACTIVE',
    "expiresAt" TIMESTAMP(3),
    "usedAt" TIMESTAMP(3),
    "tournamentId" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "Voucher_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
    CONSTRAINT "Voucher_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
);

-- Create indexes for Voucher
CREATE INDEX IF NOT EXISTS "Voucher_userId_idx" ON "Voucher"("userId");
CREATE INDEX IF NOT EXISTS "Voucher_status_idx" ON "Voucher"("status");

-- Create TournamentEntry table
CREATE TABLE IF NOT EXISTS "TournamentEntry" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "tournamentId" TEXT NOT NULL,
    "buyinCount" INTEGER DEFAULT 1,
    "rebuyCount" INTEGER DEFAULT 0,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "TournamentEntry_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id"),
    CONSTRAINT "TournamentEntry_tournamentId_fkey" FOREIGN KEY ("tournamentId") REFERENCES "Tournament"("id")
);

-- Create unique constraint and indexes for TournamentEntry
CREATE UNIQUE INDEX IF NOT EXISTS "TournamentEntry_userId_tournamentId_key" ON "TournamentEntry"("userId", "tournamentId");
CREATE INDEX IF NOT EXISTS "TournamentEntry_userId_idx" ON "TournamentEntry"("userId");
CREATE INDEX IF NOT EXISTS "TournamentEntry_tournamentId_idx" ON "TournamentEntry"("tournamentId");

-- Create PointLog table
CREATE TABLE IF NOT EXISTS "PointLog" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "userId" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "PointLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id")
);

-- Create index for PointLog
CREATE INDEX IF NOT EXISTS "PointLog_userId_idx" ON "PointLog"("userId");

-- Create VoucherPricing table
CREATE TABLE IF NOT EXISTS "VoucherPricing" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "type" "VoucherType" NOT NULL,
    "price" INTEGER NOT NULL,
    "memberGrade" "MemberGrade" NOT NULL,
    "isActive" BOOLEAN DEFAULT true,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Create unique constraint and indexes for VoucherPricing
CREATE UNIQUE INDEX IF NOT EXISTS "VoucherPricing_type_memberGrade_isActive_key" ON "VoucherPricing"("type", "memberGrade", "isActive");
CREATE INDEX IF NOT EXISTS "VoucherPricing_type_idx" ON "VoucherPricing"("type");
CREATE INDEX IF NOT EXISTS "VoucherPricing_memberGrade_idx" ON "VoucherPricing"("memberGrade");

-- Create SystemSetting table
CREATE TABLE IF NOT EXISTS "SystemSetting" (
    "id" TEXT PRIMARY KEY DEFAULT gen_random_uuid(),
    "key" TEXT UNIQUE NOT NULL,
    "value" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) DEFAULT CURRENT_TIMESTAMP
);

-- Enable Row Level Security (RLS) for all tables
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Tournament" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Voucher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "TournamentEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "PointLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "VoucherPricing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "SystemSetting" ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for service role (allows all operations from backend)
CREATE POLICY "Service role has full access" ON "User" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "Account" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "Session" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "VerificationToken" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "Transaction" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "Tournament" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "Voucher" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "TournamentEntry" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "PointLog" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "VoucherPricing" FOR ALL USING (true);
CREATE POLICY "Service role has full access" ON "SystemSetting" FOR ALL USING (true);

-- Insert default admin user (optional)
INSERT INTO "User" (id, email, name, role, grade, status, points)
VALUES (
    gen_random_uuid(),
    'yangseonghwan119@gmail.com',
    'Admin',
    'ADMIN',
    'ADMIN',
    'ACTIVE',
    0
) ON CONFLICT (email) DO NOTHING;

-- Insert default voucher pricing
INSERT INTO "VoucherPricing" (type, price, memberGrade, isActive) VALUES
    ('BUYIN', 50000, 'GUEST', true),
    ('BUYIN', 40000, 'REGULAR', true),
    ('REBUY', 50000, 'GUEST', true),
    ('REBUY', 40000, 'REGULAR', true);

-- Insert sample tournament (optional)
INSERT INTO "Tournament" (title, name, startDate, location, status, createdBy, type) VALUES
    ('Weekly Tournament', 'Weekly Tournament', CURRENT_TIMESTAMP + INTERVAL '7 days', '신림 잼스 홀덤펍', 'UPCOMING', 'system', 'REGULAR');