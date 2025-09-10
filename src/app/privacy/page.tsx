import { Card } from '@/components/ui/card'

export default function PrivacyPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">개인정보처리방침</h1>
        <p className="text-sm text-muted-foreground mb-8">
          시행일: 2024년 1월 1일
        </p>

        <div className="space-y-8 prose prose-gray max-w-none">
          <section>
            <p className="text-gray-600 leading-relaxed mb-6">
              ZentPoker(이하 "회사")는 개인정보보호법에 따라 이용자의 개인정보 보호 및 권익을 보호하고 개인정보와 관련한 이용자의 고충을 원활하게 처리할 수 있도록 다음과 같은 처리방침을 두고 있습니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">1. 개인정보의 수집 및 이용 목적</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 다음의 목적을 위하여 개인정보를 처리합니다. 처리하고 있는 개인정보는 다음의 목적 이외의 용도로는 이용되지 않으며, 이용 목적이 변경되는 경우에는 별도의 동의를 받는 등 필요한 조치를 이행할 예정입니다.</p>
              
              <div className="ml-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-700">① 회원 가입 및 관리</p>
                  <p className="ml-4">회원 가입의사 확인, 회원제 서비스 제공에 따른 본인 식별·인증, 회원자격 유지·관리, 서비스 부정이용 방지, 각종 고지·통지 등을 목적으로 개인정보를 처리합니다.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">② 서비스 제공</p>
                  <p className="ml-4">포인트 충전, 바인권 구매 및 사용, 토너먼트 참가 등 서비스 제공, 콘텐츠 제공, 맞춤서비스 제공, 본인인증 등을 목적으로 개인정보를 처리합니다.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">③ 고충처리</p>
                  <p className="ml-4">민원인의 신원 확인, 민원사항 확인, 사실조사를 위한 연락·통지, 처리결과 통보 등의 목적으로 개인정보를 처리합니다.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">2. 수집하는 개인정보의 항목</h2>
            <div className="space-y-4 text-gray-600">
              <div>
                <p className="font-medium text-gray-700">① 회원가입 시</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>필수항목: 이메일, 이름, Google 계정 정보</li>
                  <li>선택항목: 연락처</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-gray-700">② 서비스 이용 시</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>포인트 충전: 입금자명, 거래일시, 거래금액</li>
                  <li>바인권 구매: 구매일시, 구매내역</li>
                  <li>토너먼트 참가: 참가일시, 결과</li>
                </ul>
              </div>
              
              <div>
                <p className="font-medium text-gray-700">③ 자동 수집 정보</p>
                <ul className="ml-4 list-disc space-y-1">
                  <li>IP 주소, 쿠키, 서비스 이용 기록, 방문 기록</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">3. 개인정보의 보유 및 이용기간</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 법령에 따른 개인정보 보유·이용기간 또는 정보주체로부터 개인정보를 수집 시에 동의받은 개인정보 보유·이용기간 내에서 개인정보를 처리·보유합니다.</p>
              
              <div className="ml-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-700">① 회원 정보</p>
                  <p className="ml-4">회원 탈퇴 시까지 (단, 관계 법령에 따라 보존할 필요가 있는 경우 해당 법령에서 정한 기간 동안 보유)</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">② 전자금융거래 기록</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>전자금융거래법에 따라 5년간 보관</li>
                  </ul>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">③ 소비자 불만 또는 분쟁처리 기록</p>
                  <ul className="ml-4 list-disc space-y-1">
                    <li>전자상거래 등에서의 소비자보호에 관한 법률에 따라 3년간 보관</li>
                  </ul>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">4. 개인정보의 제3자 제공</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 원칙적으로 이용자의 개인정보를 제1조에서 명시한 목적 범위 내에서 처리하며, 이용자의 사전 동의 없이는 본래의 범위를 초과하여 처리하거나 제3자에게 제공하지 않습니다. 다만, 다음의 경우에는 개인정보를 제공할 수 있습니다.</p>
              
              <ul className="ml-4 list-disc space-y-2">
                <li>이용자가 사전에 동의한 경우</li>
                <li>법령의 규정에 의거하거나, 수사 목적으로 법령에 정해진 절차와 방법에 따라 수사기관의 요구가 있는 경우</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">5. 개인정보의 파기</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 개인정보 보유기간의 경과, 처리목적 달성 등 개인정보가 불필요하게 되었을 때에는 지체없이 해당 개인정보를 파기합니다.</p>
              
              <div className="ml-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-700">① 파기절차</p>
                  <p className="ml-4">이용자가 입력한 정보는 목적 달성 후 별도의 DB에 옮겨져 내부 방침 및 기타 관련 법령에 따라 일정기간 저장된 후 혹은 즉시 파기됩니다.</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">② 파기방법</p>
                  <p className="ml-4">전자적 파일 형태의 정보는 기록을 재생할 수 없는 기술적 방법을 사용하여 삭제합니다.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">6. 정보주체의 권리·의무 및 행사방법</h2>
            <div className="space-y-4 text-gray-600">
              <p>이용자는 개인정보주체로서 다음과 같은 권리를 행사할 수 있습니다.</p>
              
              <ul className="ml-4 list-disc space-y-2">
                <li>개인정보 열람요구</li>
                <li>오류 등이 있을 경우 정정 요구</li>
                <li>삭제요구</li>
                <li>처리정지 요구</li>
              </ul>
              
              <p className="mt-4">권리 행사는 회사에 대해 개인정보 보호법 시행령 제41조제1항에 따라 서면, 전자우편, 모사전송(FAX) 등을 통하여 하실 수 있으며 회사는 이에 대해 지체 없이 조치하겠습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">7. 개인정보의 안전성 확보조치</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 개인정보의 안전성 확보를 위해 다음과 같은 조치를 취하고 있습니다.</p>
              
              <ul className="ml-4 list-disc space-y-2">
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>내부관리계획의 수립 및 시행</li>
                <li>해킹 등에 대비한 기술적 대책</li>
                <li>개인정보의 암호화</li>
                <li>접속기록의 보관 및 위변조 방지</li>
                <li>개인정보에 대한 접근 제한</li>
              </ul>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">8. 개인정보 자동 수집 장치의 설치·운영 및 거부에 관한 사항</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 이용자에게 개별적인 맞춤서비스를 제공하기 위해 이용정보를 저장하고 수시로 불러오는 '쿠키(cookie)'를 사용합니다.</p>
              
              <div className="ml-4 space-y-3">
                <div>
                  <p className="font-medium text-gray-700">① 쿠키의 사용 목적</p>
                  <p className="ml-4">회원과 비회원의 접속 빈도나 방문 시간 등을 분석, 이용자의 취향과 관심분야를 파악 및 자취 추적, 각종 이벤트 참여 정도 및 방문 회수 파악 등을 통한 타겟 마케팅 및 개인 맞춤 서비스 제공</p>
                </div>
                
                <div>
                  <p className="font-medium text-gray-700">② 쿠키의 설치·운영 및 거부</p>
                  <p className="ml-4">웹브라우저 상단의 도구>인터넷 옵션>개인정보 메뉴의 옵션 설정을 통해 쿠키 저장을 거부할 수 있습니다. 단, 쿠키 저장을 거부할 경우 맞춤형 서비스 이용에 어려움이 발생할 수 있습니다.</p>
                </div>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">9. 개인정보 보호책임자</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 개인정보 처리에 관한 업무를 총괄해서 책임지고, 개인정보 처리와 관련한 정보주체의 불만처리 및 피해구제 등을 위하여 아래와 같이 개인정보 보호책임자를 지정하고 있습니다.</p>
              
              <div className="ml-4 bg-gray-50 p-4 rounded-lg">
                <p className="font-medium text-gray-700">개인정보 보호책임자</p>
                <ul className="mt-2 space-y-1">
                  <li>성명: 홍길동</li>
                  <li>직책: 개인정보보호 담당자</li>
                  <li>연락처: 010-1234-5678</li>
                  <li>이메일: privacy@zentpoker.com</li>
                </ul>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">10. 개인정보 처리방침 변경</h2>
            <div className="space-y-4 text-gray-600">
              <p>이 개인정보처리방침은 2024년 1월 1일부터 적용되며, 법령 및 방침에 따른 변경내용의 추가, 삭제 및 정정이 있는 경우에는 변경사항의 시행 7일 전부터 공지사항을 통하여 고지할 것입니다.</p>
            </div>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">11. 개인정보의 안전성 확보 조치</h2>
            <div className="space-y-4 text-gray-600">
              <p>회사는 개인정보보호법 제29조에 따라 다음과 같이 안전성 확보에 필요한 기술적/관리적 및 물리적 조치를 하고 있습니다.</p>
              
              <ul className="ml-4 list-disc space-y-2">
                <li>개인정보 취급 직원의 최소화 및 교육</li>
                <li>정기적인 자체 감사 실시</li>
                <li>내부관리계획의 수립 및 시행</li>
                <li>개인정보의 암호화</li>
                <li>해킹 등에 대비한 기술적 대책</li>
                <li>개인정보에 대한 접근 제한</li>
                <li>접속기록의 보관 및 위변조 방지</li>
                <li>문서보안을 위한 잠금장치 사용</li>
                <li>비인가자에 대한 출입 통제</li>
              </ul>
            </div>
          </section>
        </div>
      </Card>
    </div>
  )
}
