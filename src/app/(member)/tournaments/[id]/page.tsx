'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { LayoutWrapper } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { VoucherCard } from '@/components/vouchers/voucher-card'
import { ConfirmDialog } from '@/components/shared/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { Loader2 } from 'lucide-react'
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

interface Tournament {
  id: string
  name: string
  description: string
  longDescription: string
  startDate: string
  location: string
  buyIn: number
  guaranteedPrize: number
  currentPlayers: number
  maxPlayers: number
  status: string
  type: string
  structure: {
    startingStack: number
    blindLevels: number
    lateRegistration: number
    reEntry: boolean
    maxReEntries: number
  }
  prizeStructure: Array<{
    place: number
    percentage: number
  }>
  registeredPlayers: Array<{
    id: string
    name: string
    status: string
    registeredAt: string
  }>
}

interface Voucher {
  id: string
  type: 'BUY_IN' | 'RE_BUY'
  status: string
  purchasedAt: string
  expiresAt: string
  price: number
}

export default function TournamentDetailPage() {
  const params = useParams()
  const router = useRouter()
  const [isRegistering, setIsRegistering] = useState(false)
  const [selectedVoucher, setSelectedVoucher] = useState<string | null>(null)
  const [showConfirm, setShowConfirm] = useState(false)
  const [tournament, setTournament] = useState<Tournament | null>(null)
  const [availableVouchers, setAvailableVouchers] = useState<Voucher[]>([])
  const [loading, setLoading] = useState(true)
  const [vouchersLoading, setVouchersLoading] = useState(true)

  // 토너먼트 데이터 불러오기
  useEffect(() => {
    const fetchTournament = async () => {
      try {
        const response = await fetch(`/api/tournaments/${params.id}`)
        if (!response.ok) {
          throw new Error('Failed to fetch tournament')
        }
        const data = await response.json()
        setTournament(data)
      } catch (error) {
        console.error('Error fetching tournament:', error)
        toast({
          title: '오류',
          description: '토너먼트 정보를 불러올 수 없습니다.',
          variant: 'destructive',
        })
      } finally {
        setLoading(false)
      }
    }

    fetchTournament()
  }, [params.id])

  // 사용 가능한 바인권 불러오기
  useEffect(() => {
    const fetchVouchers = async () => {
      try {
        const response = await fetch('/api/vouchers/available')
        if (!response.ok) {
          // 401 에러는 로그인하지 않은 경우이므로 무시
          if (response.status === 401) {
            setAvailableVouchers([])
            return
          }
          throw new Error('Failed to fetch vouchers')
        }
        const data = await response.json()
        setAvailableVouchers(data)
      } catch (error) {
        console.error('Error fetching vouchers:', error)
      } finally {
        setVouchersLoading(false)
      }
    }

    fetchVouchers()
  }, [])

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
    
    try {
      const response = await fetch(`/api/tournaments/${params.id}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          voucherId: selectedVoucher
        })
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || 'Failed to register')
      }

      toast({
        title: '참가 신청 완료',
        description: '토너먼트 참가 신청이 완료되었습니다.',
      })
      
      setShowConfirm(false)
      router.push('/tournaments')
    } catch (error) {
      console.error('Registration error:', error)
      toast({
        title: '참가 신청 실패',
        description: error instanceof Error ? error.message : '참가 신청 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsRegistering(false)
    }
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
    if (!tournament) return 0
    const totalPrize = Math.max(
      tournament.guaranteedPrize,
      tournament.currentPlayers * tournament.buyIn
    )
    return Math.floor(totalPrize * (percentage / 100))
  }

  // 로딩 상태
  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center min-h-[60vh]">
          <Loader2 className="h-8 w-8 animate-spin text-purple-600" />
        </div>
      </LayoutWrapper>
    )
  }

  // 토너먼트를 찾을 수 없는 경우
  if (!tournament) {
    return (
      <LayoutWrapper>
        <div className="text-center py-12">
          <AlertCircle className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h2 className="text-xl font-semibold mb-2">토너먼트를 찾을 수 없습니다</h2>
          <p className="text-muted-foreground mb-4">요청하신 토너먼트가 존재하지 않거나 삭제되었습니다.</p>
          <Button asChild>
            <a href="/tournaments">토너먼트 목록으로</a>
          </Button>
        </div>
      </LayoutWrapper>
    )
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        {/* 헤더 */}
        <div className="flex items-start justify-between">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-3xl font-bold">{tournament.name}</h1>
            {tournament.type === 'SPECIAL' && (
              <Badge variant="gradient" className="text-base">
                <Zap className="h-4 w-4 mr-1" />
                Special
              </Badge>
            )}
          </div>
          <p className="text-muted-foreground mt-2">
            {tournament.description}
          </p>
        </div>
        
        <Badge 
          variant={tournament.status === 'REGISTRATION' ? 'success' : 'secondary'}
          className="text-base px-4 py-2"
        >
          {tournament.status === 'REGISTRATION' ? '참가 신청 가능' : '신청 마감'}
        </Badge>
      </div>

      {/* 주요 정보 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Calendar className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">시작 일시</p>
              <p className="font-medium">{formatDate(tournament.startDate)}</p>
              <p className="font-medium">{formatTime(tournament.startDate)}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <MapPin className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">장소</p>
              <p className="font-medium">{tournament.location}</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <DollarSign className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">바이인</p>
              <p className="font-medium text-lg">{tournament.buyIn.toLocaleString()}원</p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center gap-3">
            <Users className="h-5 w-5 text-purple-600" />
            <div>
              <p className="text-sm text-muted-foreground">참가자</p>
              <p className="font-medium text-lg">
                {tournament.currentPlayers}/{tournament.maxPlayers}명
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
                {tournament.longDescription}
              </p>
            </div>
          </Card>

          <Card className="p-6 bg-purple-50 border-purple-200">
            <h3 className="text-lg font-semibold mb-4">참가 신청</h3>
            
            {vouchersLoading ? (
              <div className="text-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-purple-600 mx-auto" />
                <p className="text-muted-foreground mt-2">바인권을 확인하는 중...</p>
              </div>
            ) : availableVouchers.length > 0 ? (
              <div className="space-y-4">
                <p className="text-sm text-muted-foreground">
                  사용 가능한 바인권을 선택하여 토너먼트에 참가하세요.
                </p>
                
                <div className="grid gap-3">
                  {availableVouchers.map((voucher: Voucher) => (
                    <div
                      key={voucher.id}
                      className={`relative cursor-pointer transition-all ${
                        selectedVoucher === voucher.id ? 'scale-105' : ''
                      }`}
                      onClick={() => setSelectedVoucher(voucher.id)}
                    >
                      <VoucherCard 
                        type={voucher.type === 'BUY_IN' ? 'BUYIN' : 'REBUY'}
                        status={voucher.status as 'ACTIVE' | 'USED' | 'EXPIRED'}
                        purchasePrice={voucher.price}
                        expiresAt={new Date(voucher.expiresAt)}
                      />
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
                    {tournament.structure.startingStack.toLocaleString()}
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">블라인드 레벨</p>
                  <p className="text-xl font-semibold">
                    {tournament.structure.blindLevels}분
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">레이트 등록</p>
                  <p className="text-xl font-semibold">
                    {tournament.structure.lateRegistration} 레벨
                  </p>
                </div>
                <div className="p-4 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground mb-1">리엔트리</p>
                  <p className="text-xl font-semibold">
                    {tournament.structure.reEntry ? 
                      `가능 (최대 ${tournament.structure.maxReEntries}회)` : 
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
              {tournament.prizeStructure.map((prize: { place: number; percentage: number }, index: number) => (
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
                  tournament.guaranteedPrize,
                  tournament.currentPlayers * tournament.buyIn
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
              {tournament.registeredPlayers.map((player: { id: string; name: string; status: string; registeredAt: string }, index: number) => (
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
              총 {tournament.currentPlayers}명 참가 중
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
        loading={isRegistering}
      />
    </div>
  </LayoutWrapper>
  )
}
