-- 모든 테이블의 RLS 비활성화 (서버 사이드 API 전용)

-- PaymentRequest 테이블
ALTER TABLE public."PaymentRequest" DISABLE ROW LEVEL SECURITY;

-- VoucherPricing 테이블  
ALTER TABLE public."VoucherPricing" DISABLE ROW LEVEL SECURITY;

-- Voucher 테이블
ALTER TABLE public."Voucher" DISABLE ROW LEVEL SECURITY;

-- User 테이블
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;

-- Tournament 테이블
ALTER TABLE public."Tournament" DISABLE ROW LEVEL SECURITY;

-- TournamentEntry 테이블
ALTER TABLE public."TournamentEntry" DISABLE ROW LEVEL SECURITY;

-- PointLog 테이블
ALTER TABLE public."PointLog" DISABLE ROW LEVEL SECURITY;

-- 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    schemaname = 'public'
ORDER BY 
    tablename;