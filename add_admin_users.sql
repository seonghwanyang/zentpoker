-- Admin 유저 추가/업데이트 SQL
-- 이미 존재하는 유저는 ADMIN 권한으로 업데이트됩니다

-- yangseonghwan119@gmail.com - 기존 Admin
INSERT INTO public."User" (id, email, name, role, grade, status, points, "createdAt")
VALUES (gen_random_uuid(), 'yangseonghwan119@gmail.com', 'Admin 1', 'ADMIN', 'ADMIN', 'ACTIVE', 0, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    grade = 'ADMIN',
    status = 'ACTIVE',
    "updatedAt" = CURRENT_TIMESTAMP;

-- longlight93@gmail.com - 새로운 Admin
INSERT INTO public."User" (id, email, name, role, grade, status, points, "createdAt")
VALUES (gen_random_uuid(), 'longlight93@gmail.com', 'Admin 2', 'ADMIN', 'ADMIN', 'ACTIVE', 0, CURRENT_TIMESTAMP)
ON CONFLICT (email) DO UPDATE SET
    role = 'ADMIN',
    grade = 'ADMIN',
    status = 'ACTIVE',
    "updatedAt" = CURRENT_TIMESTAMP;

-- 확인 쿼리
SELECT id, email, name, role, grade, status 
FROM public."User" 
WHERE email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com');