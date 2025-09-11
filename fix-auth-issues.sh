#!/bin/bash

echo "🔧 Supabase 인증 문제 해결 스크립트 시작..."

# 1. 모든 createClientComponentClient 사용 제거
echo "📝 createClientComponentClient 사용 제거 중..."

files=(
  "src/app/(member)/vouchers/payment/page.tsx"
  "src/app/(member)/points/charge/page.tsx"
  "src/app/(member)/vouchers/purchase/page.tsx"
  "src/app/(member)/profile/page.tsx"
)

for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    echo "  - $file 수정 중..."
    # createClientComponentClient import를 useAuth로 변경
    sed -i "s/import { createClientComponentClient } from '@supabase\/auth-helpers-nextjs';/import { useAuth } from '@\/lib\/auth\/supabase-auth';/g" "$file"
    # const supabase = createClientComponentClient(); 제거
    sed -i "/const supabase = createClientComponentClient();/d" "$file"
    # supabase.auth.getUser() 호출을 useAuth hook으로 변경
    sed -i "s/await supabase.auth.getUser()/{ user: authUser }/g" "$file"
  fi
done

echo "✅ 파일 수정 완료!"
echo ""
echo "📌 다음 단계:"
echo "1. 각 파일에서 useAuth hook 사용하도록 수동 수정 필요"
echo "2. 미들웨어 쿠키 처리 개선"
echo "3. AuthProvider 리다이렉트 로직 수정"