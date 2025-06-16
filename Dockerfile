# 베이스 이미지
FROM node:18-alpine AS base

# 의존성 설치를 위한 스테이지
FROM base AS deps
RUN apk add --no-cache libc6-compat
WORKDIR /app

# 의존성 파일 복사
COPY package.json package-lock.json* ./
RUN \
  if [ -f package-lock.json ]; then npm ci --only=production; \
  else echo "Lockfile not found." && exit 1; \
  fi

# 빌드를 위한 스테이지
FROM base AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# 환경 변수 설정
ENV NEXT_TELEMETRY_DISABLED 1

# Prisma 생성
RUN npx prisma generate

# Next.js 빌드
RUN npm run build

# 프로덕션 이미지
FROM base AS runner
WORKDIR /app

ENV NODE_ENV production
ENV NEXT_TELEMETRY_DISABLED 1

# 사용자 생성
RUN addgroup --system --gid 1001 nodejs
RUN adduser --system --uid 1001 nextjs

# 필요한 파일들 복사
COPY --from=builder /app/public ./public

# Next.js 정적 파일 복사
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Prisma 파일 복사
COPY --from=builder --chown=nextjs:nodejs /app/prisma ./prisma
COPY --from=builder --chown=nextjs:nodejs /app/node_modules/.prisma ./node_modules/.prisma

# 사용자 전환
USER nextjs

# 포트 노출
EXPOSE 3000

ENV PORT 3000
ENV HOSTNAME "0.0.0.0"

# 애플리케이션 시작
CMD ["node", "server.js"]