-- Supabase SQL Editor에서 실행 (기존 계정 삭제 없이)

-- 1. 먼저 기존 트리거와 함수 삭제
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user() CASCADE;

-- 2. RLS 비활성화
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;

-- 3. 더 안전한 함수 생성 (에러 처리 포함)
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
DECLARE
  user_exists boolean;
BEGIN
  -- 이미 존재하는지 확인
  SELECT EXISTS(SELECT 1 FROM public."User" WHERE email = NEW.email) INTO user_exists;
  
  IF user_exists THEN
    -- 이미 존재하면 lastLoginAt만 업데이트
    UPDATE public."User" 
    SET 
      "lastLoginAt" = NOW(),
      "updatedAt" = NOW()
    WHERE email = NEW.email;
  ELSE
    -- 새 사용자 생성
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
        "updatedAt",
        "lastLoginAt"
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
          WHEN NEW.email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com') THEN 'ADMIN'::"Role"
          ELSE 'USER'::"Role"
        END,
        CASE 
          WHEN NEW.email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com') THEN 'ADMIN'::"MemberGrade"
          ELSE 'GUEST'::"MemberGrade"
        END,
        'ACTIVE'::"UserStatus",
        0,
        NOW(),
        NOW(),
        NOW()
      );
    EXCEPTION WHEN unique_violation THEN
      -- ID는 다르지만 email이 같은 경우 (NextAuth 마이그레이션)
      UPDATE public."User" 
      SET 
        id = NEW.id::text,  -- 새 Supabase Auth ID로 업데이트
        "lastLoginAt" = NOW(),
        "updatedAt" = NOW()
      WHERE email = NEW.email;
    END;
  END IF;
  
  RETURN NEW;
EXCEPTION WHEN OTHERS THEN
  -- 모든 에러를 로그하고 계속 진행
  RAISE LOG 'Error in handle_new_user: %', SQLERRM;
  RETURN NEW;
END;
$$;

-- 4. 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- 5. 기존 auth.users 동기화 (안전하게)
DO $$
DECLARE
  auth_user RECORD;
BEGIN
  FOR auth_user IN SELECT * FROM auth.users LOOP
    BEGIN
      -- 먼저 email로 찾기
      IF NOT EXISTS (SELECT 1 FROM public."User" WHERE email = auth_user.email) THEN
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
        VALUES (
          auth_user.id::text,
          auth_user.email,
          COALESCE(
            auth_user.raw_user_meta_data->>'full_name',
            auth_user.raw_user_meta_data->>'name',
            split_part(auth_user.email, '@', 1)
          ),
          CASE 
            WHEN auth_user.email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com') THEN 'ADMIN'::"Role"
            ELSE 'USER'::"Role"
          END,
          CASE 
            WHEN auth_user.email IN ('yangseonghwan119@gmail.com', 'longlight93@gmail.com') THEN 'ADMIN'::"MemberGrade"
            ELSE 'GUEST'::"MemberGrade"
          END,
          'ACTIVE'::"UserStatus",
          0,
          auth_user.created_at,
          NOW()
        );
      END IF;
    EXCEPTION WHEN OTHERS THEN
      RAISE LOG 'Error syncing user %: %', auth_user.email, SQLERRM;
    END;
  END LOOP;
END $$;

-- 6. 결과 확인
SELECT 
  'Auth Users:' as table_name,
  COUNT(*) as count
FROM auth.users
UNION ALL
SELECT 
  'Public Users:' as table_name,
  COUNT(*) as count
FROM public."User";

-- 7. 매핑 확인
SELECT 
  au.email as auth_email,
  u.email as user_email,
  u.id as user_id,
  u.role,
  u.grade
FROM auth.users au
LEFT JOIN public."User" u ON au.email = u.email
ORDER BY au.created_at DESC;