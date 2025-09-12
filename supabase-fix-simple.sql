-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. 먼저 User 테이블의 RLS 비활성화 (임시 해결책)
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;

-- 위 명령어만 실행하고 테스트해보세요.
-- 로그인이 되면 아래 명령어들로 RLS를 다시 활성화할 수 있습니다.

-- ===== 나중에 RLS 다시 활성화할 때 사용 =====
-- ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;
-- 
-- -- 인증된 사용자가 자신의 레코드 생성 가능
-- CREATE POLICY "Enable insert for authenticated users" ON public."User"
-- FOR INSERT 
-- TO authenticated
-- WITH CHECK (auth.uid()::text = id);
-- 
-- -- 인증된 사용자가 자신의 레코드 조회 가능
-- CREATE POLICY "Enable read access for users" ON public."User"
-- FOR SELECT
-- TO authenticated
-- USING (auth.uid()::text = id);
-- 
-- -- Service role은 모든 작업 가능
-- CREATE POLICY "Service role full access" ON public."User"
-- FOR ALL
-- TO service_role
-- USING (true)
-- WITH CHECK (true);