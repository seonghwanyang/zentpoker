-- 입금 확인 요청 테이블
CREATE TABLE IF NOT EXISTS public.PaymentRequest (
  id text NOT NULL DEFAULT gen_random_uuid()::text,
  userId text NOT NULL,
  voucherType text NOT NULL, -- 'BUYIN' or 'REBUY'
  amount integer NOT NULL,
  depositorName text NOT NULL, -- 입금자명
  bankName text, -- 입금 은행
  requestDate timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  status text NOT NULL DEFAULT 'PENDING', -- 'PENDING', 'CONFIRMED', 'REJECTED'
  confirmedBy text, -- 확인한 관리자 ID
  confirmedAt timestamp without time zone,
  voucherId text, -- 발급된 바인권 ID
  memo text, -- 메모 또는 거절 사유
  createdAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updatedAt timestamp without time zone NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT PaymentRequest_pkey PRIMARY KEY (id),
  CONSTRAINT PaymentRequest_userId_fkey FOREIGN KEY (userId) REFERENCES public.User(id),
  CONSTRAINT PaymentRequest_confirmedBy_fkey FOREIGN KEY (confirmedBy) REFERENCES public.User(id),
  CONSTRAINT PaymentRequest_voucherId_fkey FOREIGN KEY (voucherId) REFERENCES public.Voucher(id)
);

-- 인덱스 추가
CREATE INDEX IF NOT EXISTS PaymentRequest_userId_idx ON public.PaymentRequest(userId);
CREATE INDEX IF NOT EXISTS PaymentRequest_status_idx ON public.PaymentRequest(status);
CREATE INDEX IF NOT EXISTS PaymentRequest_requestDate_idx ON public.PaymentRequest(requestDate DESC);