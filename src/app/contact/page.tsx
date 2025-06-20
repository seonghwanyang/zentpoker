'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { toast } from '@/components/ui/use-toast'
import { 
  Mail, 
  Phone, 
  MessageSquare, 
  Clock,
  Send,
  CheckCircle
} from 'lucide-react'

const inquiryTypes = [
  { value: 'points', label: '포인트 충전 관련' },
  { value: 'vouchers', label: '바인권 관련' },
  { value: 'tournaments', label: '토너먼트 관련' },
  { value: 'account', label: '계정 관련' },
  { value: 'bug', label: '오류 신고' },
  { value: 'suggestion', label: '개선 제안' },
  { value: 'other', label: '기타 문의' },
]

export default function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    type: '',
    subject: '',
    message: '',
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 2000))

    toast({
      title: '문의가 접수되었습니다',
      description: '빠른 시일 내에 답변 드리겠습니다.',
    })

    setIsSubmitted(true)
    setIsSubmitting(false)
  }

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }))
  }

  if (isSubmitted) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-green-100 rounded-full">
              <CheckCircle className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold mb-4">문의가 접수되었습니다!</h2>
          <p className="text-muted-foreground mb-6">
            입력하신 이메일로 접수 확인 메일을 발송했습니다.<br />
            영업일 기준 1-2일 이내에 답변 드리겠습니다.
          </p>
          <div className="flex gap-4 justify-center">
            <Button onClick={() => setIsSubmitted(false)}>
              새 문의하기
            </Button>
            <Button variant="outline" onClick={() => window.history.back()}>
              이전 페이지로
            </Button>
          </div>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {/* 헤더 */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-4">문의하기</h1>
        <p className="text-lg text-muted-foreground">
          궁금한 점이나 개선사항을 알려주세요.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* 연락처 정보 */}
        <div className="lg:col-span-1 space-y-6">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">연락처 정보</h3>
            <div className="space-y-4">
              <div className="flex items-start gap-3">
                <Mail className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">이메일</p>
                  <p className="text-sm text-muted-foreground">
                    추후 업데이트 예정
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <Phone className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">전화</p>
                  <p className="text-sm text-muted-foreground">
                    추후 업데이트 예정
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <MessageSquare className="h-5 w-5 text-purple-600 mt-0.5" />
                <div>
                  <p className="font-medium">카카오톡</p>
                  <p className="text-sm text-muted-foreground">
                    추후 업데이트 예정
                  </p>
                </div>
              </div>
            </div>
          </Card>

          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">운영 시간</h3>
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-purple-600 mt-0.5" />
              <div>
                <p className="font-medium">평일</p>
                <p className="text-sm text-muted-foreground">
                  10:00 - 22:00
                </p>
                <p className="font-medium mt-2">주말 및 공휴일</p>
                <p className="text-sm text-muted-foreground">
                  14:00 - 20:00
                </p>
              </div>
            </div>
          </Card>
        </div>

        {/* 문의 폼 */}
        <Card className="lg:col-span-2 p-6">
          <h3 className="text-lg font-semibold mb-6">문의 내용</h3>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">이름 *</Label>
                <Input
                  id="name"
                  required
                  value={formData.name}
                  onChange={(e) => handleChange('name', e.target.value)}
                  placeholder="홍길동"
                />
              </div>
              <div>
                <Label htmlFor="email">이메일 *</Label>
                <Input
                  id="email"
                  type="email"
                  required
                  value={formData.email}
                  onChange={(e) => handleChange('email', e.target.value)}
                  placeholder="email@example.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="phone">연락처</Label>
                <Input
                  id="phone"
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => handleChange('phone', e.target.value)}
                  placeholder="010-1234-5678"
                />
              </div>
              <div>
                <Label htmlFor="type">문의 유형 *</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) => handleChange('type', value)}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="문의 유형을 선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    {inquiryTypes.map((type) => (
                      <SelectItem key={type.value} value={type.value}>
                        {type.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="subject">제목 *</Label>
              <Input
                id="subject"
                required
                value={formData.subject}
                onChange={(e) => handleChange('subject', e.target.value)}
                placeholder="문의 제목을 입력하세요"
              />
            </div>

            <div>
              <Label htmlFor="message">문의 내용 *</Label>
              <Textarea
                id="message"
                required
                rows={6}
                value={formData.message}
                onChange={(e) => handleChange('message', e.target.value)}
                placeholder="문의하실 내용을 자세히 작성해주세요"
                className="resize-none"
              />
            </div>

            <div className="flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                * 표시는 필수 입력 항목입니다.
              </p>
              <Button 
                type="submit" 
                disabled={isSubmitting}
                className="min-w-[120px]"
              >
                {isSubmitting ? (
                  '전송 중...'
                ) : (
                  <>
                    <Send className="h-4 w-4 mr-2" />
                    문의하기
                  </>
                )}
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  )
}
