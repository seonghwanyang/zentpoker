-- ================================================
-- Final Fix with Proper Type Casting
-- ================================================

-- Step 1: Ensure admin user has correct role
UPDATE public."User" 
SET role = 'ADMIN'::"Role", grade = 'ADMIN'::"MemberGrade"
WHERE email = 'yangseonghwan119@gmail.com';

-- Step 2: Ensure all non-admin users have USER role
UPDATE public."User" 
SET role = 'USER'::"Role"
WHERE role IS NULL AND email != 'yangseonghwan119@gmail.com';

-- Step 3: Clean up duplicate users by email (keep the most recent one)
DELETE FROM public."User" a
USING public."User" b
WHERE a.email = b.email 
AND a."createdAt" < b."createdAt";

-- Step 4: Drop NextAuth tables if they exist (no longer needed)
DROP TABLE IF EXISTS public."Account" CASCADE;
DROP TABLE IF EXISTS public."Session" CASCADE;
DROP TABLE IF EXISTS public."VerificationToken" CASCADE;

-- Step 5: Add index for better performance
CREATE INDEX IF NOT EXISTS idx_user_email ON public."User"(email);

-- Step 6: Create or replace function to handle new Supabase auth users
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  -- Insert new user or update existing
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
    NEW.id::text,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.email),
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
  ON CONFLICT (email) 
  DO UPDATE SET
    "lastLoginAt" = NOW(),
    "updatedAt" = NOW();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Step 7: Create trigger for auto-sync (drop if exists first)
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Step 8: Sync existing Supabase auth users with User table
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
  COALESCE(raw_user_meta_data->>'full_name', email),
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
  NOW(),
  NOW()
FROM auth.users
WHERE email IS NOT NULL
ON CONFLICT (email) 
DO UPDATE SET
  "updatedAt" = NOW();

-- Step 9: Fix any orphaned records by deleting them
DELETE FROM public."PointLog" WHERE "userId" NOT IN (SELECT id FROM public."User");
DELETE FROM public."TournamentEntry" WHERE "userId" NOT IN (SELECT id FROM public."User");
DELETE FROM public."Transaction" WHERE "userId" NOT IN (SELECT id FROM public."User");
DELETE FROM public."Voucher" WHERE "userId" NOT IN (SELECT id FROM public."User");

-- Step 10: Verify the fix
SELECT 
  'Total Users' as metric, 
  COUNT(*) as count 
FROM public."User"
UNION ALL
SELECT 
  'Admin Users', 
  COUNT(*) 
FROM public."User" 
WHERE role = 'ADMIN'::"Role"
UNION ALL
SELECT 
  'Regular Users (USER role)', 
  COUNT(*) 
FROM public."User" 
WHERE role = 'USER'::"Role"
UNION ALL
SELECT 
  'Users with null role (should be 0)', 
  COUNT(*) 
FROM public."User" 
WHERE role IS NULL;

-- ================================================
-- Done! Run this SQL in Supabase Dashboard
-- ================================================