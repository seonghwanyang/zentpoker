-- Supabase Dashboard의 SQL Editor에서 실행하세요

-- 1. RLS 정책 확인
SELECT * FROM pg_policies WHERE tablename = 'User';

-- 2. User 테이블에 INSERT 권한 추가 (임시)
ALTER TABLE public."User" ENABLE ROW LEVEL SECURITY;

-- 3. 모든 사용자가 자신의 레코드를 생성할 수 있도록 정책 추가
CREATE POLICY "Users can insert their own record" ON public."User"
FOR INSERT WITH CHECK (auth.uid()::text = id);

-- 4. 모든 사용자가 자신의 레코드를 읽을 수 있도록 정책 추가
CREATE POLICY "Users can read their own record" ON public."User"
FOR SELECT USING (auth.uid()::text = id);

-- 5. Service role은 모든 작업 가능 (이미 있을 수 있음)
CREATE POLICY "Service role can do everything" ON public."User"
FOR ALL USING (auth.role() = 'service_role');

-- 6. Auth Hook 확인 (있다면)
SELECT * FROM supabase_functions.hooks WHERE hook_name LIKE '%user%';