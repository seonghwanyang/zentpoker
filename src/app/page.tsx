import Link from 'next/link'

// 홈페이지(랜딩 페이지) 컴포넌트
// 방문자가 처음 접속했을 때 보는 페이지로, 서비스 소개와 주요 기능을 보여줍니다
export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-900 via-purple-800 to-purple-900">
      {/* 상단 네비게이션 바 */}
      <nav className="flex items-center justify-between p-6 lg:px-8">
        <div className="flex lg:flex-1">
          <Link href="/" className="-m-1.5 p-1.5">
            <span className="text-3xl font-bold text-white">Zentpoker</span>
          </Link>
        </div>
        <div className="flex gap-x-4">
          <Link
            href="/login"
            className="rounded-md bg-white/10 backdrop-blur-sm border border-white/20 px-6 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-white/20 transition-all duration-200"
          >
            로그인
          </Link>
          <Link
            href="/register"
            className="rounded-md bg-white px-6 py-2.5 text-sm font-semibold text-purple-900 shadow-sm hover:bg-purple-50 transition-all duration-200 hover:scale-105"
          >
            시작하기
          </Link>
        </div>
      </nav>

      {/* 히어로 섹션 - 메인 타이틀과 CTA(행동 유도) 버튼 */}
      <div className="relative isolate px-6 pt-14 lg:px-8">
        <div className="mx-auto max-w-2xl py-32 sm:py-48 lg:py-56">
          <div className="text-center">
            <h1 className="text-4xl font-bold tracking-tight text-white sm:text-6xl">
              홀덤 동호회를 위한
              <br />
              <span className="gradient-text">스마트한 포인트 관리</span>
            </h1>
            <p className="mt-6 text-lg leading-8 text-purple-100">
              복잡한 포인트 관리는 이제 그만! 
              카카오페이 연동으로 간편하게 충전하고,
              투명하게 관리하세요.
            </p>
            <div className="mt-10 flex items-center justify-center gap-x-6">
              <Link
                href="/register"
                className="rounded-md bg-white px-6 py-3 text-lg font-semibold text-purple-900 shadow-sm hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 hover:scale-105"
              >
                무료로 시작하기
              </Link>
              <Link
                href="#features"
                className="text-sm font-semibold leading-6 text-white hover:text-purple-200"
              >
                더 알아보기 <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
        </div>

        {/* 배경 장식 요소 - 그라디언트 효과를 위한 블러 처리된 도형 */}
        <div className="absolute inset-x-0 top-[calc(100%-13rem)] -z-10 transform-gpu overflow-hidden blur-3xl sm:top-[calc(100%-30rem)]">
          <div
            className="relative left-[calc(50%+3rem)] aspect-[1155/678] w-[36.125rem] -translate-x-1/2 bg-gradient-to-tr from-purple-400 to-pink-400 opacity-30 sm:left-[calc(50%+36rem)] sm:w-[72.1875rem]"
            style={{
              clipPath:
                'polygon(74.1% 44.1%, 100% 61.6%, 97.5% 26.9%, 85.5% 0.1%, 80.7% 2%, 72.5% 32.5%, 60.2% 62.4%, 52.4% 68.1%, 47.5% 58.3%, 45.2% 34.5%, 27.5% 76.7%, 0.1% 64.9%, 17.9% 100%, 27.6% 76.8%, 76.1% 97.7%, 74.1% 44.1%)',
            }}
          />
        </div>
      </div>

      {/* 기능 소개 섹션 - 주요 기능 3가지를 카드 형태로 표시 */}
      <div id="features" className="py-24 sm:py-32">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-bold tracking-tight text-white sm:text-4xl">
              필요한 모든 기능을 한곳에
            </h2>
            <p className="mt-6 text-lg leading-8 text-purple-100">
              동호회 운영에 필요한 모든 기능을 제공합니다
            </p>
          </div>
          <div className="mx-auto mt-16 max-w-2xl sm:mt-20 lg:mt-24 lg:max-w-none">
            <dl className="grid max-w-xl grid-cols-1 gap-x-8 gap-y-16 lg:max-w-none lg:grid-cols-3">
              <div className="flex flex-col glass rounded-2xl p-8">
                <dt className="text-xl font-semibold leading-7 text-white">
                  간편한 포인트 충전
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-purple-100">
                  <p className="flex-auto">
                    카카오페이 송금 링크로 즉시 충전 가능. 
                    복잡한 절차 없이 관리자 확인만으로 완료됩니다.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col glass rounded-2xl p-8">
                <dt className="text-xl font-semibold leading-7 text-white">
                  투명한 거래 내역
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-purple-100">
                  <p className="flex-auto">
                    모든 포인트 거래는 실시간으로 기록되며,
                    언제든지 내역을 확인할 수 있습니다.
                  </p>
                </dd>
              </div>
              <div className="flex flex-col glass rounded-2xl p-8">
                <dt className="text-xl font-semibold leading-7 text-white">
                  스마트한 바인권 관리
                </dt>
                <dd className="mt-4 flex flex-auto flex-col text-base leading-7 text-purple-100">
                  <p className="flex-auto">
                    회원 등급별 차등 가격 적용.
                    바인권과 리바인권을 효율적으로 관리하세요.
                  </p>
                </dd>
              </div>
            </dl>
          </div>
        </div>
      </div>

      {/* CTA(행동 유도) 섹션 - 회원가입 유도를 위한 마지막 섹션 */}
      <div className="py-16 sm:py-24">
        <div className="mx-auto max-w-7xl sm:px-6 lg:px-8">
          <div className="relative isolate overflow-hidden bg-white/10 backdrop-blur-md px-6 py-24 shadow-2xl sm:rounded-3xl sm:px-24 xl:py-32">
            <h2 className="mx-auto max-w-2xl text-center text-3xl font-bold tracking-tight text-white sm:text-4xl">
              지금 바로 시작하세요
            </h2>
            <p className="mx-auto mt-2 max-w-xl text-center text-lg leading-8 text-purple-100">
              복잡한 설정 없이 5분 만에 시작할 수 있습니다
            </p>
            <div className="mt-10 flex justify-center">
              <Link
                href="/register"
                className="rounded-md bg-white px-8 py-3.5 text-lg font-semibold text-purple-900 shadow-sm hover:bg-purple-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white transition-all duration-200 hover:scale-105"
              >
                무료로 시작하기
              </Link>
            </div>
          </div>
        </div>
      </div>

      {/* 푸터 - 저작권 표시 */}
      <footer className="bg-purple-950/50 backdrop-blur-md">
        <div className="mx-auto max-w-7xl px-6 py-12 lg:px-8">
          <div className="text-center">
            <p className="text-sm leading-5 text-purple-200">
              &copy; 2024 Zentpoker. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
