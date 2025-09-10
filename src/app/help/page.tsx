'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { 
  CreditCard, 
  Ticket, 
  Trophy, 
  Users, 
  Settings, 
  HelpCircle,
  ChevronDown
} from 'lucide-react'
import Link from 'next/link'

// 도움말 항목 컴포넌트
function HelpItem({ title, content }: { title: string; content: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <div className="border-b last:border-b-0">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-4 py-3 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium">{title}</span>
        <ChevronDown
          className={`h-4 w-4 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-4 pb-4 text-sm text-muted-foreground">
          <p>{content}</p>
        </div>
      )}
    </div>
  )
}

const helpCategories = [
  {
    icon: CreditCard,
    title: '포인트 충전',
    description: '카카오페이 및 계좌이체를 통한 포인트 충전 방법을 안내합니다.',
    topics: [
      {
        title: '카카오페이로 충전하기',
        content: '1. 포인트 충전 메뉴를 클릭합니다.\n2. 충전할 금액을 입력합니다.\n3. 카카오페이 버튼을 클릭하면 송금 링크가 표시됩니다.\n4. 링크를 클릭하여 카카오페이 앱에서 송금을 완료합니다.\n5. 관리자가 입금을 확인하면 포인트가 자동으로 충전됩니다.'
      },
      {
        title: '계좌이체로 충전하기',
        content: '1. 포인트 충전 메뉴에서 계좌이체를 선택합니다.\n2. 표시된 계좌번호로 원하는 금액을 입금합니다.\n3. 입금자명에 회원님의 이름을 정확히 입력해주세요.\n4. 관리자가 확인 후 포인트가 충전됩니다.'
      },
      {
        title: '충전 내역 확인하기',
        content: '포인트 메뉴의 거래 내역에서 모든 충전 기록을 확인할 수 있습니다. 날짜, 금액, 상태 등의 정보가 표시됩니다.'
      },
      {
        title: '충전 취소 및 환불',
        content: '충전 후 사용하지 않은 포인트는 고객센터를 통해 환불 신청이 가능합니다. 환불은 영업일 기준 3-5일 소요됩니다.'
      }
    ]
  },
  {
    icon: Ticket,
    title: '바인권 구매 및 사용',
    description: '바인권 구매부터 사용까지 전 과정을 설명합니다.',
    topics: [
      {
        title: 'Buy-in 바인권 구매하기',
        content: 'Buy-in은 토너먼트 최초 참가 시 필요한 바인권입니다. 바인권 구매 메뉴에서 Buy-in을 선택하고 구매 버튼을 클릭하면 포인트가 차감되며 즉시 발급됩니다.'
      },
      {
        title: 'Re-buy 바인권 구매하기',
        content: 'Re-buy는 토너먼트 진행 중 칩을 모두 잃었을 때 재참가를 위한 바인권입니다. 토너먼트 규정에 따라 Re-buy 가능 횟수가 제한될 수 있습니다.'
      },
      {
        title: '회원 등급별 가격 차이',
        content: '정회원은 정규 가격으로 바인권을 구매할 수 있으며, 게스트는 약 20% 할증된 가격이 적용됩니다. 정회원 승급을 원하시면 관리자에게 문의해주세요.'
      },
      {
        title: '바인권 사용 방법',
        content: '토너먼트 참가 신청 시 보유한 바인권이 자동으로 사용됩니다. 바인권은 구매일로부터 90일간 유효하며, 만료 전에 사용해주세요.'
      }
    ]
  },
  {
    icon: Trophy,
    title: '토너먼트 참가',
    description: '토너먼트 참가 신청 방법과 규칙을 안내합니다.',
    topics: [
      {
        title: '토너먼트 일정 확인',
        content: '토너먼트 메뉴에서 예정된 토너먼트 일정을 확인할 수 있습니다. 날짜, 시간, 참가비, 상금 구조 등의 정보가 표시됩니다.'
      },
      {
        title: '참가 신청하기',
        content: '원하는 토너먼트를 선택하고 참가 신청 버튼을 클릭합니다. 필요한 바인권을 보유하고 있어야 하며, 신청 완료 시 바인권이 자동으로 차감됩니다.'
      },
      {
        title: '토너먼트 규칙',
        content: '각 토너먼트마다 고유한 규칙이 있습니다. 블라인드 구조, Re-buy 가능 여부, 상금 분배 방식 등은 토너먼트 상세 페이지에서 확인하세요.'
      },
      {
        title: '결과 확인하기',
        content: '토너먼트 종료 후 결과는 토너먼트 페이지에서 확인할 수 있습니다. 순위, 상금, 참가자 명단 등이 공개됩니다.'
      }
    ]
  },
  {
    icon: Users,
    title: '회원 등급',
    description: '게스트와 정회원의 차이점과 혜택을 설명합니다.',
    topics: [
      {
        title: '회원 등급 시스템',
        content: '회원 등급은 게스트와 정회원으로 구분됩니다. 신규 가입 시 게스트로 시작하며, 관리자의 승인을 받으면 정회원이 됩니다.'
      },
      {
        title: '정회원 승급 방법',
        content: '일정 기간 동호회 활동에 참여하고 신뢰를 쌓으면 정회원으로 승급할 수 있습니다. 구체적인 승급 기준은 관리자에게 문의해주세요.'
      },
      {
        title: '등급별 혜택',
        content: '정회원은 바인권을 정규 가격으로 구매할 수 있으며, 특별 토너먼트 참가 자격 등의 혜택이 있습니다. 게스트는 일부 기능이 제한될 수 있습니다.'
      },
      {
        title: '등급 변경 신청',
        content: '정회원 승급을 원하시면 관리자에게 직접 문의하시거나, 고객센터를 통해 신청해주세요. 활동 내역을 검토 후 승인 여부가 결정됩니다.'
      }
    ]
  },
  {
    icon: Settings,
    title: '계정 관리',
    description: '프로필 수정, 보안 설정 등 계정 관리 방법을 안내합니다.',
    topics: [
      {
        title: '프로필 정보 수정',
        content: '마이페이지에서 이름, 연락처 등의 정보를 수정할 수 있습니다. 이메일은 Google 계정과 연동되어 있어 변경이 불가합니다.'
      },
      {
        title: '비밀번호 변경',
        content: 'Google OAuth를 사용하므로 별도의 비밀번호 변경은 필요하지 않습니다. Google 계정의 보안 설정에서 비밀번호를 관리하세요.'
      },
      {
        title: '알림 설정',
        content: '프로필 설정에서 이메일 알림, 푸시 알림 등을 설정할 수 있습니다. 중요한 공지사항과 토너먼트 알림을 받으실 수 있습니다.'
      },
      {
        title: '계정 탈퇴',
        content: '계정 설정에서 탈퇴를 신청할 수 있습니다. 탈퇴 시 보유 중인 포인트와 바인권은 모두 소멸되며 복구가 불가능합니다.'
      }
    ]
  },
  {
    icon: HelpCircle,
    title: '기타 문의',
    description: '자주 묻는 질문과 추가 도움이 필요한 경우를 안내합니다.',
    topics: [
      {
        title: '자주 묻는 질문',
        content: 'FAQ 페이지에서 자주 묻는 질문과 답변을 확인할 수 있습니다. 대부분의 궁금증은 FAQ에서 해결하실 수 있습니다.'
      },
      {
        title: '1:1 문의하기',
        content: '문의하기 페이지에서 직접 문의를 남기실 수 있습니다. 영업일 기준 1-2일 내에 답변 드립니다.'
      },
      {
        title: '오류 신고',
        content: '서비스 이용 중 오류를 발견하시면 문의하기를 통해 신고해주세요. 스크린샷과 함께 상세한 상황을 설명해주시면 빠른 해결에 도움이 됩니다.'
      },
      {
        title: '개선 제안',
        content: '더 나은 서비스를 위한 아이디어나 개선 사항이 있으시면 언제든지 제안해주세요. 사용자 의견을 적극 반영하겠습니다.'
      }
    ]
  }
]

export default function HelpPage() {
  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* 헤더 */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-4">도움말 센터</h1>
        <p className="text-lg text-muted-foreground">
          ZentPoker 이용에 필요한 모든 정보를 찾아보세요.
        </p>
      </div>

      {/* 검색 바 */}
      <Card className="p-6 mb-8">
        <div className="flex gap-4">
          <input
            type="text"
            placeholder="궁금한 내용을 검색해보세요..."
            className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
          <Button className="bg-purple-600 hover:bg-purple-700">
            검색
          </Button>
        </div>
      </Card>

      {/* 도움말 카테고리 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {helpCategories.map((category, index) => {
          const Icon = category.icon
          return (
            <Card key={index} className="p-6 hover:shadow-lg transition-shadow">
              <div className="flex items-start gap-4 mb-4">
                <div className="p-3 bg-purple-100 rounded-lg">
                  <Icon className="h-6 w-6 text-purple-600" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-semibold mb-2">{category.title}</h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    {category.description}
                  </p>
                </div>
              </div>
              
              <div className="space-y-1 border rounded-lg overflow-hidden">
                {category.topics.map((topic, topicIndex) => (
                  <HelpItem
                    key={topicIndex}
                    title={topic.title}
                    content={topic.content}
                  />
                ))}
              </div>
            </Card>
          )
        })}
      </div>

      {/* 추가 도움 섹션 */}
      <Card className="mt-8 p-6 bg-purple-50">
        <h3 className="text-lg font-semibold mb-2">원하는 답변을 찾지 못하셨나요?</h3>
        <p className="text-muted-foreground mb-4">
          추가 도움이 필요하시면 언제든지 문의해주세요.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Button asChild>
            <Link href="/faq">자주 묻는 질문 보기</Link>
          </Button>
          <Button asChild variant="outline">
            <Link href="/contact">1:1 문의하기</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
