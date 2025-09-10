import { Card } from '@/components/ui/card'

export default function TermsPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Card className="p-8">
        <h1 className="text-3xl font-bold mb-6">이용약관</h1>
        <p className="text-sm text-muted-foreground mb-8">
          시행일: 2024년 1월 1일
        </p>

        <div className="space-y-8 prose prose-gray max-w-none">
          <section>
            <h2 className="text-xl font-semibold mb-4">제1조 (목적)</h2>
            <p className="text-gray-600 leading-relaxed">
              이 약관은 ZentPoker(이하 "회사")가 제공하는 홀덤 동호회 포인트 및 바인권 관리 서비스(이하 "서비스")의 이용과 관련하여 회사와 이용자의 권리, 의무 및 책임사항, 기타 필요한 사항을 규정함을 목적으로 합니다.
            </p>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제2조 (정의)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① "서비스"란 회사가 제공하는 포인트 충전, 바인권 구매 및 사용, 토너먼트 참가 등 홀덤 동호회 운영에 필요한 제반 서비스를 의미합니다.</p>
              <p>② "회원"이란 회사의 서비스에 접속하여 이 약관에 따라 회사와 이용계약을 체결하고 회사가 제공하는 서비스를 이용하는 고객을 말합니다.</p>
              <p>③ "포인트"란 서비스 내에서 바인권을 구매하거나 기타 서비스를 이용하기 위해 사용되는 가상의 화폐를 말합니다.</p>
              <p>④ "바인권"이란 토너먼트 참가를 위해 필요한 권리를 말하며, Buy-in과 Re-buy로 구분됩니다.</p>
              <p>⑤ "게스트"란 회원가입 후 정회원 승인을 받지 않은 회원을 말합니다.</p>
              <p>⑥ "정회원"이란 관리자의 승인을 받아 정규 회원으로 등록된 회원을 말합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제3조 (약관의 게시와 개정)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회사는 이 약관의 내용을 회원이 쉽게 알 수 있도록 서비스 초기 화면에 게시합니다.</p>
              <p>② 회사는 필요한 경우 관련 법령을 위배하지 않는 범위에서 이 약관을 개정할 수 있습니다.</p>
              <p>③ 회사가 약관을 개정할 경우에는 적용일자 및 개정사유를 명시하여 현행약관과 함께 서비스 초기화면에 그 적용일자 7일 이전부터 적용일자 전일까지 공지합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제4조 (이용계약의 체결)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 이용계약은 회원이 되고자 하는 자(이하 "가입신청자")가 약관의 내용에 대하여 동의를 한 다음 회원가입신청을 하고 회사가 이러한 신청에 대하여 승낙함으로써 체결됩니다.</p>
              <p>② 회사는 가입신청자의 신청에 대하여 서비스 이용을 승낙함을 원칙으로 합니다. 다만, 회사는 다음 각호에 해당하는 신청에 대하여는 승낙을 하지 않거나 사후에 이용계약을 해지할 수 있습니다.</p>
              <div className="ml-4 space-y-2">
                <p>1. 가입신청자가 이 약관에 의하여 이전에 회원자격을 상실한 적이 있는 경우</p>
                <p>2. 실명이 아니거나 타인의 명의를 이용한 경우</p>
                <p>3. 허위의 정보를 기재하거나, 회사가 제시하는 내용을 기재하지 않은 경우</p>
                <p>4. 기타 회원으로 등록하는 것이 회사의 기술상 현저히 지장이 있다고 판단되는 경우</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제5조 (포인트의 충전 및 사용)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회원은 회사가 정한 방법에 따라 포인트를 충전할 수 있습니다.</p>
              <p>② 포인트는 현금으로 환급되지 않으며, 서비스 내에서만 사용 가능합니다.</p>
              <p>③ 포인트의 유효기간은 마지막 이용일로부터 5년입니다.</p>
              <p>④ 회원이 부정한 방법으로 포인트를 취득한 경우, 회사는 해당 포인트를 회수할 수 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제6조 (바인권의 구매 및 사용)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회원은 보유한 포인트를 사용하여 바인권을 구매할 수 있습니다.</p>
              <p>② 바인권의 가격은 회원 등급에 따라 차등 적용됩니다.</p>
              <p>③ 구매한 바인권은 구매일로부터 90일간 유효하며, 유효기간이 지난 바인권은 자동 소멸됩니다.</p>
              <p>④ 사용하지 않은 바인권은 회사의 환불 정책에 따라 포인트로 환불될 수 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제7조 (회원의 의무)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회원은 다음 행위를 하여서는 안 됩니다.</p>
              <div className="ml-4 space-y-2">
                <p>1. 신청 또는 변경 시 허위 내용의 등록</p>
                <p>2. 타인의 정보 도용</p>
                <p>3. 회사가 게시한 정보의 변경</p>
                <p>4. 회사가 금지한 정보의 송신 또는 게시</p>
                <p>5. 회사와 기타 제3자의 저작권 등 지적재산권에 대한 침해</p>
                <p>6. 회사 및 기타 제3자의 명예를 손상시키거나 업무를 방해하는 행위</p>
                <p>7. 외설 또는 폭력적인 메시지, 화상, 음성, 기타 공서양속에 반하는 정보를 서비스에 공개 또는 게시하는 행위</p>
                <p>8. 회사의 동의 없이 영리를 목적으로 서비스를 사용하는 행위</p>
                <p>9. 기타 불법적이거나 부당한 행위</p>
              </div>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제8조 (서비스의 중단)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회사는 다음 각호에 해당하는 경우 서비스의 전부 또는 일부를 제한하거나 중단할 수 있습니다.</p>
              <div className="ml-4 space-y-2">
                <p>1. 서비스용 설비의 보수 등 공사로 인한 부득이한 경우</p>
                <p>2. 전기통신사업법에 규정된 기간통신사업자가 전기통신서비스를 중지했을 경우</p>
                <p>3. 국가비상사태, 정전, 서비스 설비의 장애 또는 서비스 이용의 폭주 등으로 정상적인 서비스 제공에 지장이 있는 경우</p>
              </div>
              <p>② 회사는 제1항의 사유로 서비스의 제공이 일시적으로 중단됨으로 인하여 이용자 또는 제3자가 입은 손해에 대하여 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제9조 (개인정보보호)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회사는 회원의 개인정보를 보호하기 위하여 개인정보보호정책을 수립하고 이를 준수합니다.</p>
              <p>② 회사의 개인정보보호정책은 이 약관과는 별도로 정하여 서비스 초기 화면에 게시합니다.</p>
              <p>③ 회사는 관련 법령이 정하는 바에 따라 회원의 개인정보를 보호하기 위해 노력합니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제10조 (면책조항)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회사는 천재지변 또는 이에 준하는 불가항력으로 인하여 서비스를 제공할 수 없는 경우에는 서비스 제공에 관한 책임이 면제됩니다.</p>
              <p>② 회사는 회원의 귀책사유로 인한 서비스 이용의 장애에 대하여는 책임을 지지 않습니다.</p>
              <p>③ 회사는 회원이 서비스와 관련하여 게재한 정보, 자료, 사실의 신뢰도, 정확성 등의 내용에 관하여는 책임을 지지 않습니다.</p>
              <p>④ 회사는 서비스를 매개로 한 회원 간의 거래 또는 회원과 제3자 간의 거래에서 발생한 손해에 대하여 책임을 지지 않습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제11조 (분쟁해결)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회사는 회원이 제기하는 정당한 의견이나 불만을 반영하고 그 피해를 보상처리하기 위하여 고객센터를 설치·운영합니다.</p>
              <p>② 회사는 회원으로부터 제출되는 불만사항 및 의견은 우선적으로 그 사항을 처리합니다.</p>
              <p>③ 회사와 회원 간에 발생한 분쟁은 전자거래기본법 제28조 및 동 시행령 제15조에 의하여 설치된 전자거래분쟁조정위원회의 조정에 따를 수 있습니다.</p>
            </div>
          </section>

          <section>
            <h2 className="text-xl font-semibold mb-4">제12조 (재판권 및 준거법)</h2>
            <div className="space-y-3 text-gray-600">
              <p>① 회사와 회원 간에 발생한 분쟁에 관한 소송은 제소 당시 회원의 주소에 의하고, 주소가 없는 경우에는 거소를 관할하는 지방법원의 전속관할로 합니다.</p>
              <p>② 회사와 회원 간에 제기된 소송에는 대한민국 법을 적용합니다.</p>
            </div>
          </section>

          <section className="border-t pt-8">
            <h2 className="text-xl font-semibold mb-4">부칙</h2>
            <p className="text-gray-600">
              이 약관은 2024년 1월 1일부터 시행됩니다.
            </p>
          </section>
        </div>
      </Card>
    </div>
  )
}
