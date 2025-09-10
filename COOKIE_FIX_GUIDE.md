# 🍪 Supabase 쿠키 에러 해결 가이드

## 문제 증상
```
Failed to parse cookie string: SyntaxError: Unexpected token 'b', "base64-eyJ"... is not valid JSON
```

## 해결 방법

### 방법 1: clear-cookies.html 사용 (권장)
1. 브라우저에서 `http://localhost:3001/clear-cookies.html` 접속
2. "쿠키 정리하기" 버튼 클릭
3. 페이지 새로고침 (F5 또는 Ctrl+R)
4. 다시 로그인

### 방법 2: 브라우저 개발자 도구 사용
1. F12 키를 눌러 개발자 도구 열기
2. Application 탭 선택
3. 왼쪽 메뉴에서 Storage → Cookies → http://localhost:3001 선택
4. 다음 쿠키들을 삭제:
   - `sb-*` 로 시작하는 모든 쿠키
   - `supabase-*` 로 시작하는 모든 쿠키
5. 페이지 새로고침

### 방법 3: Chrome 브라우저 설정
1. Chrome 주소창에 `chrome://settings/cookies` 입력
2. "모든 쿠키 및 사이트 데이터 보기" 클릭
3. localhost 검색
4. localhost:3001 항목 삭제
5. 브라우저 재시작

### 방법 4: 명령줄 (PowerShell)
```powershell
# Chrome 완전 종료 후 실행
Remove-Item "$env:LOCALAPPDATA\Google\Chrome\User Data\Default\Cookies" -Force
```

## 예방 방법
- 로그아웃 시 정상적으로 로그아웃 버튼 사용
- 브라우저 비정상 종료 피하기
- 개발 중 서버 재시작 시 페이지 새로고침

## 추가 문제 해결
문제가 지속되면:
1. 브라우저 시크릿/프라이빗 모드로 테스트
2. 다른 브라우저로 테스트
3. localStorage 정리:
   ```javascript
   // 브라우저 콘솔에서 실행
   Object.keys(localStorage).forEach(key => {
     if (key.includes('supabase') || key.includes('sb-')) {
       localStorage.removeItem(key);
     }
   });
   ```