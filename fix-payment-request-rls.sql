-- PaymentRequest 테이블 RLS 정책 수정 (긴급)
-- 문제: RLS 정책이 활성화되어 있어서 입금 요청 생성과 조회가 차단됨

-- 1. 기존 RLS 정책 모두 삭제
DROP POLICY IF EXISTS "Users can view own payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Users can create own payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Admins can update all payment requests" ON public."PaymentRequest";

-- 2. RLS 비활성화 (서버사이드 API에서만 접근하므로)
ALTER TABLE public."PaymentRequest" DISABLE ROW LEVEL SECURITY;

-- 3. 상태 확인
SELECT 
    'RLS 비활성화 완료' as status,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_requests
FROM public."PaymentRequest";