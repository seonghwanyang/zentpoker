-- PaymentRequest 테이블 상태 확인 및 업데이트 스크립트

-- 1. 테이블 존재 여부 확인
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentRequest'
    ) THEN
        -- 테이블이 없으면 생성
        CREATE TABLE public."PaymentRequest" (
            id text NOT NULL DEFAULT gen_random_uuid()::text,
            "userId" text NOT NULL,
            "voucherType" text NOT NULL,
            amount integer NOT NULL,
            "depositorName" text NOT NULL,
            "bankName" text,
            "requestDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            status text NOT NULL DEFAULT 'PENDING',
            "confirmedBy" text,
            "confirmedAt" timestamp without time zone,
            "voucherId" text,
            memo text,
            "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
            CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY (id),
            CONSTRAINT "PaymentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id),
            CONSTRAINT "PaymentRequest_confirmedBy_fkey" FOREIGN KEY ("confirmedBy") REFERENCES public."User"(id),
            CONSTRAINT "PaymentRequest_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Voucher"(id)
        );
        RAISE NOTICE 'PaymentRequest 테이블이 생성되었습니다.';
    ELSE
        RAISE NOTICE 'PaymentRequest 테이블이 이미 존재합니다.';
    END IF;
END $$;

-- 2. 필요한 컬럼이 없으면 추가
DO $$
BEGIN
    -- depositorName 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentRequest' 
        AND column_name = 'depositorName'
    ) THEN
        ALTER TABLE public."PaymentRequest" 
        ADD COLUMN "depositorName" text NOT NULL DEFAULT '미입력';
        RAISE NOTICE 'depositorName 컬럼이 추가되었습니다.';
    END IF;
    
    -- bankName 컬럼 확인 및 추가
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_schema = 'public' 
        AND table_name = 'PaymentRequest' 
        AND column_name = 'bankName'
    ) THEN
        ALTER TABLE public."PaymentRequest" 
        ADD COLUMN "bankName" text;
        RAISE NOTICE 'bankName 컬럼이 추가되었습니다.';
    END IF;
END $$;

-- 3. 인덱스 생성 (이미 존재하면 무시)
CREATE INDEX IF NOT EXISTS "PaymentRequest_userId_idx" ON public."PaymentRequest"("userId");
CREATE INDEX IF NOT EXISTS "PaymentRequest_status_idx" ON public."PaymentRequest"(status);
CREATE INDEX IF NOT EXISTS "PaymentRequest_requestDate_idx" ON public."PaymentRequest"("requestDate" DESC);

-- 4. RLS 정책 재설정 (기존 정책 삭제 후 재생성)
-- 기존 정책 삭제
DROP POLICY IF EXISTS "Users can view own payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Users can create own payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Admins can view all payment requests" ON public."PaymentRequest";
DROP POLICY IF EXISTS "Admins can update all payment requests" ON public."PaymentRequest";

-- RLS 비활성화 (서버 사이드에서만 접근)
ALTER TABLE public."PaymentRequest" DISABLE ROW LEVEL SECURITY;

-- 5. 테이블 상태 확인
SELECT 
    'PaymentRequest 테이블 업데이트 완료' as message,
    COUNT(*) as total_records,
    COUNT(CASE WHEN status = 'PENDING' THEN 1 END) as pending_count,
    COUNT(CASE WHEN status = 'CONFIRMED' THEN 1 END) as confirmed_count,
    COUNT(CASE WHEN status = 'REJECTED' THEN 1 END) as rejected_count
FROM public."PaymentRequest";