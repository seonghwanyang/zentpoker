-- Supabase SQL Editor에서 실행

-- 1. RLS 비활성화 (이미 했다면 스킵)
ALTER TABLE public."User" DISABLE ROW LEVEL SECURITY;

-- 2. auth.users와 public.User 연동 함수 생성
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- 이미 존재하는 사용자인지 확인
  IF NOT EXISTS (SELECT 1 FROM public."User" WHERE id = NEW.id::text) THEN
    INSERT INTO public."User" (
      id, 
      email, 
      name,
      image,
      role,
      grade,
      status,
      points,
      "lastLoginAt"
    )
    VALUES (
      NEW.id::text,
      NEW.email,
      COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
      NEW.raw_user_meta_data->>'avatar_url',
      CASE 
        WHEN NEW.email = 'yangseonghwan119@gmail.com' THEN 'ADMIN'
        ELSE 'USER'
      END,
      CASE 
        WHEN NEW.email = 'yangseonghwan119@gmail.com' THEN 'ADMIN'
        ELSE 'GUEST'
      END,
      'ACTIVE',
      0,
      NOW()
    );
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 기존 트리거 삭제 (있다면)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

-- 4. 새 트리거 생성
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();