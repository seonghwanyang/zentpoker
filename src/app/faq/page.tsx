'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Search, MessageCircle, ChevronDown } from 'lucide-react'
import Link from 'next/link'

const faqCategories = {
  general: {
    title: '일반',
    items: [
      {
        question: 'ZentPoker는 어떤 서비스인가요?',
        answer: 'ZentPoker는 홀덤 동호회를 위한 포인트 및 바인권 관리 시스템입니다. 회원들은 포인트를 충전하여 바인권을 구매하고, 토너먼트에 참가할 수 있습니다.'
      },
      {
        question: '회원 가입은 어떻게 하나요?',
        answer: 'Google 계정을 통해 간편하게 가입할 수 있습니다. 가입 후 관리자의 승인을 받으면 모든 서비스를 이용할 수 있습니다.'
      },
      {
        question: '현금으로 환전이 가능한가요?',
        answer: '아니요, ZentPoker는 게임머니 시스템으로 운영되며 현금 환전을 지원하지 않습니다. 모든 포인트와 바인권은 동호회 내에서만 사용 가능합니다.'
      }
    ]
  },
  points: {
    title: '포인트',
    items: [
      {
        question: '포인트는 어떻게 충전하나요?',
        answer: '포인트 충전은 카카오페이 송금 또는 계좌이체를 통해 가능합니다. 충전 신청 후 입금하시면 관리자가 확인 후 포인트를 지급합니다.'
      },
      {
        question: '포인트 충전 확인은 얼마나 걸리나요?',
        answer: '일반적으로 입금 후 24시간 이내에 확인 및 지급이 완료됩니다. 주말이나 공휴일의 경우 다소 지연될 수 있습니다.'
      },
      {
        question: '포인트 충전 최소/최대 금액이 있나요?',
        answer: '최소 충전 금액은 10,000원이며, 최대 충전 금액은 1,000,000원입니다. 더 큰 금액을 충전하시려면 관리자에게 문의해주세요.'
      },
      {
        question: '포인트 환불이 가능한가요?',
        answer: '사용하지 않은 포인트에 한해 환불이 가능합니다. 환불 신청은 고객센터를 통해 접수해주세요.'
      }
    ]
  },
  vouchers: {
    title: '바인권',
    items: [
      {
        question: 'Buy-in과 Re-buy의 차이는 무엇인가요?',
        answer: 'Buy-in은 토너먼트 최초 참가 시 사용하는 바인권이며, Re-buy는 칩을 모두 잃었을 때 재참가를 위해 사용하는 바인권입니다.'
      },
      {
        question: '게스트와 정회원의 바인권 가격이 왜 다른가요?',
        answer: '정회원은 동호회의 정식 멤버로서 할인된 가격으로 바인권을 구매할 수 있습니다. 게스트는 약 20% 할증된 가격이 적용됩니다.'
      },
      {
        question: '바인권에 유효기간이 있나요?',
        answer: '네, 바인권은 구매일로부터 90일간 유효합니다. 만료 7일 전에 알림을 받으실 수 있습니다.'
      },
      {
        question: '사용하지 않은 바인권은 환불이 되나요?',
        answer: '유효기간이 남아있는 미사용 바인권은 포인트로 환불이 가능합니다. 관리자에게 문의해주세요.'
      }
    ]
  },
  tournaments: {
    title: '토너먼트',
    items: [
      {
        question: '토너먼트는 언제 열리나요?',
        answer: '정기 토너먼트는 매주 토요일 저녁 7시에 열립니다. 특별 토너먼트는 별도 공지를 통해 안내됩니다.'
      },
      {
        question: '토너먼트 참가 신청은 어떻게 하나요?',
        answer: '토너먼트 목록에서 참가를 원하는 토너먼트를 선택하고, 바인권을 사용하여 신청할 수 있습니다.'
      },
      {
        question: '토너먼트 취소는 가능한가요?',
        answer: '토너먼트 시작 24시간 전까지는 취소가 가능하며, 사용한 바인권은 자동으로 복구됩니다.'
      },
      {
        question: '토너먼트 결과는 어디서 확인하나요?',
        answer: '토너먼트 종료 후 결과는 토너먼트 상세 페이지에서 확인할 수 있으며, 참가자들에게는 알림이 발송됩니다.'
      }
    ]
  },
  account: {
    title: '계정',
    items: [
      {
        question: '정회원이 되려면 어떻게 해야 하나요?',
        answer: '게스트로 가입 후 일정 기간 활동하시면 관리자가 정회원으로 승급시켜드립니다. 자세한 승급 기준은 관리자에게 문의해주세요.'
      },
      {
        question: '프로필 정보를 변경하고 싶어요.',
        answer: '마이페이지에서 이름, 연락처 등의 정보를 변경할 수 있습니다. 이메일은 Google 계정과 연동되어 변경이 불가합니다.'
      },
      {
        question: '계정을 탈퇴하고 싶어요.',
        answer: '계정 설정에서 탈퇴 신청을 할 수 있습니다. 단, 보유 중인 포인트와 바인권은 모두 소멸되므로 주의해주세요.'
      },
      {
        question: '로그인이 안 돼요.',
        answer: 'Google 계정에 문제가 있을 수 있습니다. 브라우저 캐시를 삭제하고 다시 시도해보세요. 문제가 지속되면 고객센터로 문의해주세요.'
      }
    ]
  }
}

// FAQ 항목 컴포넌트
function FAQItem({ question, answer }: { question: string; answer: string }) {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Card className="overflow-hidden">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-6 py-4 text-left flex items-center justify-between hover:bg-gray-50 transition-colors"
      >
        <span className="font-medium">{question}</span>
        <ChevronDown
          className={`h-5 w-5 text-gray-500 transition-transform ${
            isOpen ? 'rotate-180' : ''
          }`}
        />
      </button>
      {isOpen && (
        <div className="px-6 pb-4 text-muted-foreground border-t">
          <p className="pt-4">{answer}</p>
        </div>
      )}
    </Card>
  )
}

export default function FAQPage() {
  const [searchQuery, setSearchQuery] = useState('')
  const [activeTab, setActiveTab] = useState('general')

  const filteredFAQs = searchQuery
    ? Object.entries(faqCategories).reduce((acc, [key, category]) => {
        const filteredItems = category.items.filter(
          item =>
            item.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.answer.toLowerCase().includes(searchQuery.toLowerCase())
        )
        if (filteredItems.length > 0) {
          acc[key] = { ...category, items: filteredItems }
        }
        return acc
      }, {} as typeof faqCategories)
    : faqCategories

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">자주 묻는 질문</h1>
        <p className="text-lg text-muted-foreground">
          궁금하신 내용을 빠르게 찾아보세요.
        </p>
      </div>

      {/* 검색 바 */}
      <Card className="p-4 mb-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input
            type="text"
            placeholder="질문을 검색해보세요..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </Card>

      {/* FAQ 콘텐츠 */}
      {searchQuery ? (
        // 검색 결과
        <div className="space-y-6">
          {Object.entries(filteredFAQs).map(([key, category]) => (
            <div key={key}>
              <h2 className="text-xl font-semibold mb-4">{category.title}</h2>
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <FAQItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </div>
          ))}
          {Object.keys(filteredFAQs).length === 0 && (
            <Card className="p-8 text-center">
              <p className="text-muted-foreground mb-4">
                검색 결과가 없습니다.
              </p>
              <Button asChild variant="outline">
                <Link href="/contact">1:1 문의하기</Link>
              </Button>
            </Card>
          )}
        </div>
      ) : (
        // 카테고리별 탭
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="grid grid-cols-5 w-full mb-6">
            {Object.entries(faqCategories).map(([key, category]) => (
              <TabsTrigger key={key} value={key}>
                {category.title}
              </TabsTrigger>
            ))}
          </TabsList>
          
          {Object.entries(faqCategories).map(([key, category]) => (
            <TabsContent key={key} value={key}>
              <div className="space-y-2">
                {category.items.map((item, index) => (
                  <FAQItem key={index} question={item.question} answer={item.answer} />
                ))}
              </div>
            </TabsContent>
          ))}
        </Tabs>
      )}

      {/* 추가 도움 섹션 */}
      <Card className="mt-8 p-6 bg-purple-50">
        <div className="flex items-center gap-4">
          <MessageCircle className="h-8 w-8 text-purple-600" />
          <div className="flex-1">
            <h3 className="text-lg font-semibold mb-1">
              원하는 답변을 찾지 못하셨나요?
            </h3>
            <p className="text-sm text-muted-foreground">
              1:1 문의를 통해 더 자세한 답변을 받아보세요.
            </p>
          </div>
          <Button asChild>
            <Link href="/contact">문의하기</Link>
          </Button>
        </div>
      </Card>
    </div>
  )
}
