-- 기존 사용자를 ADMIN으로 업데이트
UPDATE public."User" 
SET 
  role = 'ADMIN'::"Role",
  grade = 'ADMIN'::"MemberGrade",
  "updatedAt" = NOW()
WHERE email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com');

-- 확인
SELECT email, role, grade FROM public."User" 
WHERE email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com');