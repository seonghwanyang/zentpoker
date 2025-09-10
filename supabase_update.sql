-- Supabase DB 업데이트 SQL
-- 누락된 컬럼들 추가 및 성능 최적화

-- Tournament 테이블에 location과 type 컬럼 추가
ALTER TABLE public."Tournament" 
ADD COLUMN IF NOT EXISTS "location" text DEFAULT '신림 잼스 홀덤펍',
ADD COLUMN IF NOT EXISTS "type" text DEFAULT 'REGULAR';

-- 인덱스 추가 (성능 최적화)
CREATE INDEX IF NOT EXISTS "User_email_idx" ON public."User"("email");
CREATE INDEX IF NOT EXISTS "User_role_idx" ON public."User"("role");
CREATE INDEX IF NOT EXISTS "User_grade_idx" ON public."User"("grade");
CREATE INDEX IF NOT EXISTS "User_status_idx" ON public."User"("status");

CREATE INDEX IF NOT EXISTS "Transaction_userId_idx" ON public."Transaction"("userId");
CREATE INDEX IF NOT EXISTS "Transaction_type_idx" ON public."Transaction"("type");
CREATE INDEX IF NOT EXISTS "Transaction_status_idx" ON public."Transaction"("status");
CREATE INDEX IF NOT EXISTS "Transaction_createdAt_idx" ON public."Transaction"("createdAt");

CREATE INDEX IF NOT EXISTS "Tournament_status_idx" ON public."Tournament"("status");
CREATE INDEX IF NOT EXISTS "Tournament_startDate_idx" ON public."Tournament"("startDate");

CREATE INDEX IF NOT EXISTS "Voucher_userId_idx" ON public."Voucher"("userId");
CREATE INDEX IF NOT EXISTS "Voucher_status_idx" ON public."Voucher"("status");

CREATE INDEX IF NOT EXISTS "TournamentEntry_userId_idx" ON public."TournamentEntry"("userId");
CREATE INDEX IF NOT EXISTS "TournamentEntry_tournamentId_idx" ON public."TournamentEntry"("tournamentId");

CREATE INDEX IF NOT EXISTS "PointLog_userId_idx" ON public."PointLog"("userId");

CREATE INDEX IF NOT EXISTS "VoucherPricing_type_idx" ON public."VoucherPricing"("type");
CREATE INDEX IF NOT EXISTS "VoucherPricing_memberGrade_idx" ON public."VoucherPricing"("memberGrade");

CREATE INDEX IF NOT EXISTS "Account_userId_idx" ON public."Account"("userId");
CREATE INDEX IF NOT EXISTS "Session_userId_idx" ON public."Session"("userId");

-- Unique constraints
CREATE UNIQUE INDEX IF NOT EXISTS "Account_provider_providerAccountId_key" 
ON public."Account"("provider", "providerAccountId");

CREATE UNIQUE INDEX IF NOT EXISTS "TournamentEntry_userId_tournamentId_key" 
ON public."TournamentEntry"("userId", "tournamentId");

CREATE UNIQUE INDEX IF NOT EXISTS "VoucherPricing_type_memberGrade_isActive_key" 
ON public."VoucherPricing"("type", "memberGrade", "isActive");

CREATE UNIQUE INDEX IF NOT EXISTS "VerificationToken_identifier_token_key" 
ON public."VerificationToken"("identifier", "token");

-- RLS policies for service role (백엔드에서 모든 작업 가능)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Account" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Session" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VerificationToken" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Transaction" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Tournament" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."Voucher" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."TournamentEntry" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."PointLog" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."VoucherPricing" ENABLE ROW LEVEL SECURITY;
ALTER TABLE public."SystemSetting" ENABLE ROW LEVEL SECURITY;

-- Service role policies (이미 있으면 무시됨)
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'User' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public."User" FOR ALL USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Tournament' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public."Tournament" FOR ALL USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Transaction' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public."Transaction" FOR ALL USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'Voucher' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public."Voucher" FOR ALL USING (true);
    END IF;
END $$;

DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies 
        WHERE tablename = 'TournamentEntry' AND policyname = 'Service role access'
    ) THEN
        CREATE POLICY "Service role access" ON public."TournamentEntry" FOR ALL USING (true);
    END IF;
END $$;

-- 샘플 데이터 추가 (선택사항)
-- Admin 유저들
INSERT INTO public."User" (id, email, name, role, grade, status, points)
VALUES 
    (gen_random_uuid(), 'yangseonghwan119@gmail.com', 'Admin', 'ADMIN', 'ADMIN', 'ACTIVE', 0),
    (gen_random_uuid(), 'longlight93@gmail.com', 'Admin', 'ADMIN', 'ADMIN', 'ACTIVE', 0)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    grade = 'ADMIN',
    status = 'ACTIVE';

-- 바인권 가격 설정
INSERT INTO public."VoucherPricing" (id, type, price, "memberGrade", "isActive") VALUES
    (gen_random_uuid(), 'BUYIN', 50000, 'GUEST', true),
    (gen_random_uuid(), 'BUYIN', 40000, 'REGULAR', true),
    (gen_random_uuid(), 'REBUY', 50000, 'GUEST', true),
    (gen_random_uuid(), 'REBUY', 40000, 'REGULAR', true)
ON CONFLICT DO NOTHING;

-- 샘플 토너먼트
INSERT INTO public."Tournament" (id, title, name, "startDate", location, status, "createdBy", type) VALUES
    (gen_random_uuid(), 'Weekly Tournament #1', 'Weekly Tournament #1', NOW() + INTERVAL '7 days', '신림 잼스 홀덤펍', 'UPCOMING', 'system', 'REGULAR'),
    (gen_random_uuid(), 'Special Event', 'Special Event', NOW() + INTERVAL '14 days', '신림 잼스 홀덤펍', 'UPCOMING', 'system', 'SPECIAL')
ON CONFLICT DO NOTHING;