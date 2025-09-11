-- PaymentRequest 테이블 생성
CREATE TABLE IF NOT EXISTS public."PaymentRequest" (
  id text NOT NULL DEFAULT gen_random_uuid()::text,
  "userId" text NOT NULL,
  "voucherType" text NOT NULL, -- 'BUYIN' or 'REBUY'
  amount integer NOT NULL,
  "depositorName" text NOT NULL, -- 입금자명
  "bankName" text, -- 입금 은행
  "requestDate" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'REJECTED'
  "confirmedBy" text, -- 확인한 관리자 ID
  "confirmedAt" timestamp without time zone,
  "voucherId" text, -- 발급된 바인권 ID
  memo text, -- 메모 또는 거절 사유
  "createdAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "PaymentRequest_pkey" PRIMARY KEY (id),
  CONSTRAINT "PaymentRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES public."User"(id),
  CONSTRAINT "PaymentRequest_confirmedBy_fkey" FOREIGN KEY ("confirmedBy") REFERENCES public."User"(id),
  CONSTRAINT "PaymentRequest_voucherId_fkey" FOREIGN KEY ("voucherId") REFERENCES public."Voucher"(id)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS "PaymentRequest_userId_idx" ON public."PaymentRequest"("userId");
CREATE INDEX IF NOT EXISTS "PaymentRequest_status_idx" ON public."PaymentRequest"(status);
CREATE INDEX IF NOT EXISTS "PaymentRequest_requestDate_idx" ON public."PaymentRequest"("requestDate" DESC);

-- RLS (Row Level Security) 활성화
ALTER TABLE public."PaymentRequest" ENABLE ROW LEVEL SECURITY;

-- 사용자는 자신의 요청만 볼 수 있음
CREATE POLICY "Users can view own payment requests" ON public."PaymentRequest"
  FOR SELECT
  USING (auth.uid()::text = "userId");

-- 사용자는 자신의 요청만 생성할 수 있음
CREATE POLICY "Users can create own payment requests" ON public."PaymentRequest"
  FOR INSERT
  WITH CHECK (auth.uid()::text = "userId");

-- 관리자는 모든 요청을 볼 수 있음
CREATE POLICY "Admins can view all payment requests" ON public."PaymentRequest"
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public."User"
      WHERE id = auth.uid()::text
      AND role = 'ADMIN'
    )
  );

-- 관리자는 모든 요청을 수정할 수 있음
CREATE POLICY "Admins can update all payment requests" ON public."PaymentRequest"
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public."User"
      WHERE id = auth.uid()::text
      AND role = 'ADMIN'
    )
  );