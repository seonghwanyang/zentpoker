-- VoucherPricing 테이블의 유니크 제약 조건 문제 해결

-- 1. 기존 제약 조건 확인
SELECT conname, contype, conkey
FROM pg_constraint
WHERE conrelid = 'public."VoucherPricing"'::regclass;

-- 2. 문제가 되는 유니크 제약 조건 삭제
ALTER TABLE public."VoucherPricing" 
DROP CONSTRAINT IF EXISTS "VoucherPricing_type_memberGrade_isActive_key";

-- 3. 새로운 유니크 제약 조건 추가 (isActive가 true일 때만)
CREATE UNIQUE INDEX IF NOT EXISTS "VoucherPricing_type_memberGrade_active_unique" 
ON public."VoucherPricing" (type, "memberGrade") 
WHERE "isActive" = true;

-- 4. 기존 비활성 데이터 정리 (중복 제거)
DELETE FROM public."VoucherPricing" a
USING public."VoucherPricing" b
WHERE a.id > b.id 
  AND a.type = b.type 
  AND a."memberGrade" = b."memberGrade"
  AND a."isActive" = false
  AND b."isActive" = false;

-- 5. 현재 데이터 확인
SELECT type, "memberGrade", "isActive", COUNT(*) as count
FROM public."VoucherPricing"
GROUP BY type, "memberGrade", "isActive"
ORDER BY type, "memberGrade", "isActive";