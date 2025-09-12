-- Supabase SQL Editor에서 실행
-- 이 SQL은 auth.users와 public.User를 동기화합니다

-- 1. 먼저 기존 트리거와 함수 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- 2. RLS 비활성화 (이미 했다면 스킵)
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;

-- 3. 새로운 함수 생성 (더 안전한 버전)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public."User" (
    id,
    email,
    name,
    image,
    role,
    grade,
    status,
    points,
    "createdAt",
    "updatedAt"
  )
  VALUES (
    NEW.id::text,
    NEW.email,
    COALESCE(
      NEW.raw_user_meta_data->>'full_name',
      NEW.raw_user_meta_data->>'name',
      split_part(NEW.email, '@', 1)
    ),
    NEW.raw_user_meta_data->>'avatar_url',
    CASE 
      WHEN NEW.email = 'yangseonghwan119@gmail.com' THEN 'ADMIN'::"Role"
      ELSE 'USER'::"Role"
    END,
    CASE 
      WHEN NEW.email = 'yangseonghwan119@gmail.com' THEN 'ADMIN'::"MemberGrade"
      ELSE 'GUEST'::"MemberGrade"
    END,
    'ACTIVE'::"UserStatus",
    0,
    NOW(),
    NOW()
  )
  ON CONFLICT (id) DO UPDATE
  SET 
    "lastLoginAt" = NOW(),
    "updatedAt" = NOW();
  
  RETURN NEW;
END;
$$;

-- 4. 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. 기존 auth.users의 사용자들을 public.User에 동기화
INSERT INTO public."User" (
  id,
  email,
  name,
  role,
  grade,
  status,
  points,
  "createdAt",
  "updatedAt"
)
SELECT 
  id::text,
  email,
  COALESCE(
    raw_user_meta_data->>'full_name',
    raw_user_meta_data->>'name',
    split_part(email, '@', 1)
  ),
  CASE 
    WHEN email = 'yangseonghwan119@gmail.com' THEN 'ADMIN'::"Role"
    ELSE 'USER'::"Role"
  END,
  CASE 
    WHEN email = 'yangseonghwan119@gmail.com' THEN 'ADMIN'::"MemberGrade"
    ELSE 'GUEST'::"MemberGrade"
  END,
  'ACTIVE'::"UserStatus",
  0,
  created_at,
  NOW()
FROM auth.users
WHERE NOT EXISTS (
  SELECT 1 FROM public."User" WHERE "User".id = auth.users.id::text
);

-- 6. 확인
SELECT 
  au.email as auth_email,
  u.email as user_email,
  u.role,
  u.grade
FROM auth.users au
LEFT JOIN public."User" u ON au.id::text = u.id;