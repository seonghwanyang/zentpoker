export function Footer() {
  return (
    <footer className="mt-auto glass border-t border-purple-200/20 lg:ml-64">
      <div className="px-4 py-6">
        <div className="container mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Brand */}
            <div className="space-y-3">
              <h3 className="text-base font-bold gradient-text">ZentPoker</h3>
              <p className="text-sm text-gray-600">
                안전하고 투명한 포커 동호회 운영을 위한 최고의 솔루션
              </p>
            </div>

            {/* Quick Links */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">빠른 링크</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/points/charge" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    포인트 충전
                  </a>
                </li>
                <li>
                  <a href="/vouchers/purchase" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    바인권 구매
                  </a>
                </li>
                <li>
                  <a href="/tournaments" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    토너먼트
                  </a>
                </li>
              </ul>
            </div>

            {/* Support */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">고객 지원</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/help" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    도움말
                  </a>
                </li>
                <li>
                  <a href="/faq" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    자주 묻는 질문
                  </a>
                </li>
                <li>
                  <a href="/contact" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    문의하기
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div className="space-y-3">
              <h4 className="text-sm font-semibold text-gray-900">법적 고지</h4>
              <ul className="space-y-2">
                <li>
                  <a href="/terms" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="/privacy" className="text-sm text-gray-600 hover:text-purple-600 transition-colors">
                    개인정보처리방침
                  </a>
                </li>
              </ul>
            </div>
          </div>

          <div className="mt-6 pt-6 border-t border-purple-200/20">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <p className="text-sm text-gray-600">
                © 2024 ZentPoker. All rights reserved.
              </p>
              <p className="text-xs text-gray-500">
                본 서비스는 현금 환전을 지원하지 않으며, 게임머니로만 운영됩니다.
              </p>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
