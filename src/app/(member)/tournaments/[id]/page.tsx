'use client'

import { useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
<<<<<<< HEAD
import { VoucherCard } from '@/components/vouchers/voucher-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
=======
import { VoucherCard } from '@/components/voucher-card'
import { ConfirmDialog } from '@/components/confirm-dialog'
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
import { toast } from '@/components/ui/use-toast'
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock,
  DollarSign,
  Info,
  AlertCircle,
  CheckCircle,
  MapPin,
  Zap
} from 'lucide-react'

// Mock 토너먼트 상세 데이터
const mockTournament = {
  id: '1',
  name: '주말 홀덤 토너먼트',
  description: '매주 토요일 저녁 정기 토너먼트',
  longDescription: `매주 토요일 저녁에 진행되는 정기 홀덤 토너먼트입니다.
  
  초보자부터 고수까지 모두 환영하며, 공정한 게임 진행을 위해 전문 딜러가 배치됩니다.
  
  상금은 참가자 수에 따라 증가하며, 상위 10%의 플레이어에게 지급됩니다.`,
  startDate: '2024-12-28T19:00:00',
  location: '강남 홀덤 라운지',
  buyIn: 50000,
  guaranteedPrize: 1000000,
  currentPlayers: 23,
  maxPlayers: 50,
  status: 'REGISTRATION',
  type: 'REGULAR',
  structure: {
    startingStack: 30000,
    blindLevels: 20, // minutes
    lateRegistration: 4, // levels
    reEntry: true,
    maxReEntries: 2,
  },
  prizeStructure: [
    { place: 1, percentage: 40 },
    { place: 2, percentage: 25 },
    { place: 3, percentage: 15 },
    { place: 4, percentage: 10 },
    { place: 5, percentage: 10 },
  ],
  registeredPlayers: [
    { name: '김철수', status: 'CONFIRMED' },
    { name: '이영희', status: 'CONFIRMED' },
    { name: '박민수', status: 'CONFIRMED' },
    // ... more players
  ],
}

// Mock 사용 가능한 바인권
const mockAvailableVouchers = [
  {
    id: '1',
    type: 'BUY_IN' as const,
    status: 'ACTIVE' as const,
    purchasedAt: '2024-12-20T10:30:00',
    expiresAt: '2025-01-20T23:59:59',
    price: 50000,
  },
  {
    id: '2',
    type: 'RE_BUY' as const,
    status: 'ACTIVE' as const,
    purchasedAt: '2024-12-19T15:45:00',
    expiresAt: '2025-01-19T23:59:59',
    price: 30000,
  },
]

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)

  // 참가 신청 처리
  const handleRegistration = async () => {
    if (!selectedVoucher) {
      toast({
        title: '바인권을 선택해주세요',
        description: '토너먼트 참가를 위해 바인권이 필요합니다.',
        variant: 'destructive',
      })
      return
    }

    setIsRegistering(true)
    
    // API 호출 시뮬레이션
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    toast({
      title: '참가 신청 완료',
      description: '토너먼트 참가 신청이 완료되었습니다.',
    })
    
    setIsRegistering(false)
    setShowConfirm(false)
    router.push('/tournaments')
  }

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 상금 계산
  const calculatePrize = (percentage: number) => {
    const totalPrize = Math.max(
      mockTournament.guaranteedPrize,
      mockTournament.currentPlayers * mockTournament.buyIn
    )
    return Math.floor(totalPrize * (percentage / 100))
  }

  return (
    <div className="space-y-6">
      {/* 헤더 */}
      <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{mockTournament.name}</h1>
            {mockTournament.type === 'SPECIAL' && (
              <Badge variant="gradient" className="text-base">
                <Zap className="h-4 w-4 mr-1" />
                Special
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {mockTournament.description}
          </p>
        </div>
        
        <Badge 
          variant={mockTournament.status === 'REGISTRATION' ? 'success' : 'secondary'}
          className="text-base px-4 py-2"
        >
          {mockTournament.status === 'REGISTRATION' ? '참가 신청 가능' : '신청 마감'}
        </Badge>
      </div>

      {/* 주요 정보 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">시작 일시</p>
              <p className="font-medium">{formatDate(mockTournament.startDate)}</p>
              <p className="font-medium">{formatTime(mockTournament.startDate)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">장소</p>
              <p className="font-medium">{mockTournament.location}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">바이인</p>
              <p className="font-medium text-lg">{mockTournament.buyIn.toLocaleString()}원</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">참가자</p>
              <p className="font-medium text-lg">
                {mockTournament.currentPlayers}/{mockTournament.maxPlayers}명
              </p>
            </div>
          </div>
        </Card>
      </div>

      <Tabs defaultValue="info" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="info">대회 정보</TabsTrigger>
          <TabsTrigger value="structure">대회 구조</TabsTrigger>
          <TabsTrigger value="prize">상금 구조</TabsTrigger>
          <TabsTrigger value="players">참가자</TabsTrigger>
        </TabsList>

        {/* 대회 정보 */}
        <TabsContent value="info" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Info className="h-5 w-5" />
              대회 소개
            </h3>
            <div className="prose prose-sm max-w-none">
              <p className="whitespace-pre-line text-muted-foreground">
                {mockTournament.longDescription}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-semibold mb-4">참가 신청</h3>
            
            {mockAvailableVouchers.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  사용 가능한 바인권을 선택하여 토너먼트에 참가하세요.
                </p>
                
                <div className="grid gap-3">
                  {mockAvailableVouchers.map((voucher) => (
                    <div
                      key={voucher.id}
                      className={`relative cursor-pointer transition-all ${
                        selectedVoucher === voucher.id ? 'scale-105' : ''
                      }`}
                      onClick={() => setSelectedVoucher(voucher.id)}
                    >
<<<<<<< HEAD
                      <VoucherCard 
                        type={voucher.type === 'BUY_IN' ? 'BUYIN' : 'REBUY'}
                        status={voucher.status}
                        purchasePrice={voucher.price}
                        expiresAt={new Date(voucher.expiresAt)}
                      />
=======
                      <VoucherCard voucher={voucher} />
>>>>>>> c33190324b65e7aec4664e939445b400404c1b3f
                      {selectedVoucher === voucher.id && (
                        <div className="absolute top-2 right-2">
                          <CheckCircle className="h-6 w-6 text-green-500" />
                        </div>
                      )}
                    </div>
                  ))}
                </div>
                
                <Button 
                  className="w-full" 
                  size="lg"
                  disabled={!selectedVoucher}
                  onClick={() => setShowConfirm(true)}
                >
                  토너먼트 참가 신청
                </Button>
              </div>
            ) : (
              <div className="text-center py-8">
                <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground mb-4">
                  사용 가능한 바인권이 없습니다.
                </p>
                <Button asChild>
                  <a href="/vouchers/purchase">바인권 구매하기</a>
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        {/* 대회 구조 */}
        <TabsContent value="structure" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">토너먼트 구조</h3>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">시작 스택</p>
                  <p className="text-xl font-semibold">
                    {mockTournament.structure.startingStack.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">블라인드 레벨</p>
                  <p className="text-xl font-semibold">
                    {mockTournament.structure.blindLevels}분
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">레이트 등록</p>
                  <p className="text-xl font-semibold">
                    {mockTournament.structure.lateRegistration} 레벨
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">리엔트리</p>
                  <p className="text-xl font-semibold">
                    {mockTournament.structure.reEntry ? 
                      `가능 (최대 ${mockTournament.structure.maxReEntries}회)` : 
                      '불가'}
                  </p>
                </div>
              </div>
            </div>
          </Card>
        </TabsContent>

        {/* 상금 구조 */}
        <TabsContent value="prize" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              상금 분배
            </h3>
            
            <div className="space-y-3">
              {mockTournament.prizeStructure.map((prize, index) => (
                <div
                  key={prize.place}
                  className={`flex items-center justify-between p-4 rounded-lg ${
                    index === 0 ? 'bg-yellow-50 border border-yellow-200' :
                    index === 1 ? 'bg-gray-50 border border-gray-200' :
                    index === 2 ? 'bg-orange-50 border border-orange-200' :
                    'bg-muted/50'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    {index === 0 && <Trophy className="h-6 w-6 text-yellow-500" />}
                    {index === 1 && <Trophy className="h-5 w-5 text-gray-400" />}
                    {index === 2 && <Trophy className="h-5 w-5 text-orange-400" />}
                    <span className="font-semibold">{prize.place}위</span>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-lg">
                      {calculatePrize(prize.percentage).toLocaleString()}원
                    </p>
                    <p className="text-sm text-muted-foreground">{prize.percentage}%</p>
                  </div>
                </div>
              ))}
            </div>
            
            <div className="mt-6 p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-muted-foreground">예상 총 상금</p>
              <p className="text-2xl font-bold text-purple-600">
                {Math.max(
                  mockTournament.guaranteedPrize,
                  mockTournament.currentPlayers * mockTournament.buyIn
                ).toLocaleString()}원
              </p>
            </div>
          </Card>
        </TabsContent>

        {/* 참가자 목록 */}
        <TabsContent value="players" className="space-y-4">
          <Card className="p-6">
            <h3 className="text-lg font-semibold mb-4">등록된 참가자</h3>
            
            <div className="space-y-2">
              {mockTournament.registeredPlayers.map((player, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between p-3 rounded-lg hover:bg-muted/50"
                >
                  <span>{player.name}</span>
                  <Badge variant="success" className="text-xs">
                    확정
                  </Badge>
                </div>
              ))}
            </div>
            
            <p className="text-sm text-muted-foreground mt-4 text-center">
              총 {mockTournament.currentPlayers}명 참가 중
            </p>
          </Card>
        </TabsContent>
      </Tabs>

      {/* 참가 확인 다이얼로그 */}
      <ConfirmDialog
        open={showConfirm}
        onOpenChange={setShowConfirm}
        title="토너먼트 참가 확인"
        description="선택한 바인권을 사용하여 토너먼트에 참가하시겠습니까?"
        confirmText="참가 신청"
        onConfirm={handleRegistration}
        isLoading={isRegistering}
      />
    </div>
  )
}
