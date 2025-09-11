-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Users can create own payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Admins can update all payment requests" ON public."PaymentRequest";

-- RLS 비활성화 (서버 사이드에서만 접근하도록)
ALTER TABLE public."PaymentRequest" DISABLE ROW LEVEL SECURITY;

-- 또는 RLS를 유지하려면 아래 정책 사용 (email 기반)
-- ALTER TABLE public."PaymentRequest" ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 볼 수 있음 (email 기반)
-- CREATE POLICY "Users can view own payment requests" ON public."PaymentRequest"
--   FOR SELECT
--   USING (
--     "userId" IN (
--       SELECT id FROM public."User"
--       WHERE email = auth.jwt() ->> 'email'
--     )
--   );

-- 사용자는 자신의 요청만 생성할 수 있음 (email 기반)
-- CREATE POLICY "Users can create own payment requests" ON public."PaymentRequest"
--   FOR INSERT
--   WITH CHECK (
--     "userId" IN (
--       SELECT id FROM public."User"
--       WHERE email = auth.jwt() ->> 'email'
--     )
--   );

-- 관리자는 모든 요청을 볼 수 있음
-- CREATE POLICY "Admins can view all payment requests" ON public."PaymentRequest"
--   FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM public."User"
--       WHERE email = auth.jwt() ->> 'email'
--       AND role = 'ADMIN'
--     )
--   );

-- 관리자는 모든 요청을 수정할 수 있음
-- CREATE POLICY "Admins can update all payment requests" ON public."PaymentRequest"
--   FOR UPDATE
--   USING (
--     EXISTS (
--       SELECT 1 FROM public."User"
--       WHERE email = auth.jwt() ->> 'email'
--       AND role = 'ADMIN'
--     )
--   );