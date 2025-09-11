-- 토너먼트 테이블 확인

-- 1. 모든 토너먼트 조회
SELECT * FROM public."Tournament"
ORDER BY "createdAt" DESC;

-- 2. 토너먼트 개수 확인
SELECT COUNT(*) as total_tournaments FROM public."Tournament";

-- 3. 최근 생성된 토너먼트 (최근 24시간)
SELECT * FROM public."Tournament"
WHERE "createdAt" > NOW() - INTERVAL '24 hours'
ORDER BY "createdAt" DESC;

-- 4. RLS 상태 확인
SELECT 
    schemaname,
    tablename,
    rowsecurity
FROM 
    pg_tables
WHERE 
    tablename = 'Tournament';

-- 5. Tournament 테이블의 컬럼 구조 확인
SELECT 
    column_name,
    data_type,
    is_nullable,
    column_default
FROM 
    information_schema.columns
WHERE 
    table_name = 'Tournament'
ORDER BY 
    ordinal_position;