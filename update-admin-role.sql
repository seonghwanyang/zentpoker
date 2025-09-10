-- yangseonghwan119@gmail.com 계정을 ADMIN으로 업데이트
UPDATE "User" 
SET role = 'ADMIN', 
    grade = 'ADMIN'
WHERE email = 'yangseonghwan119@gmail.com';

-- 확인
SELECT id, email, role, grade 
FROM "User" 
WHERE email = 'yangseonghwan119@gmail.com';