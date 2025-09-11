-- 토너먼트 디버깅 쿼리

-- 1. 모든 토너먼트 조회 (가장 중요!)
SELECT * FROM public."Tournament";

-- 2. 토너먼트 개수
SELECT COUNT(*) as total FROM public."Tournament";

-- 3. RLS 정책 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity,
    rowsecurity::text as rls_status
FROM 
    pg_tables
WHERE 
    tablename = 'Tournament';

-- 4. RLS 정책 상세 확인
SELECT 
    policyname,
    permissive,
    roles,
    cmd,
    qual,
    with_check
FROM 
    pg_policies
WHERE 
    tablename = 'Tournament';

-- 5. 만약 토너먼트가 없다면, 테스트 데이터 삽입
-- (주석 해제하고 실행)
/*
INSERT INTO public."Tournament" (
    id,
    title,
    name,
    "startDate",
    "endDate",
    "maxEntries",
    "buyinRequired",
    "rebuyAllowed",
    status,
    "createdBy",
    description,
    location,
    type
) VALUES (
    gen_random_uuid()::text,
    'Test Tournament',
    'Test Tournament',
    NOW() + INTERVAL '7 days',
    NOW() + INTERVAL '7 days' + INTERVAL '4 hours',
    100,
    1,
    true,
    'UPCOMING',
    'admin',
    'This is a test tournament',
    '신림 잼스 홀덤펍',
    'REGULAR'
);
*/

-- 6. RLS 비활성화 (필요한 경우)
-- ALTER TABLE public."Tournament" DISABLE ROW LEVEL SECURITY;