'use client'

import { useState } from 'react'
import { LayoutWrapper } from '@/components/layout'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useTournamentStore } from '@/stores/tournament-store'
import { 
  Calendar, 
  Users, 
  Trophy, 
  Clock,
  Ticket,
  ChevronRight,
  Zap
} from 'lucide-react'
import Link from 'next/link'

export default function TournamentsPage() {
  const [activeTab, setActiveTab] = useState('upcoming')
  const tournaments = useTournamentStore((state) => state.tournaments)
  
  // 토너먼트를 상태별로 분류
  const upcomingTournaments = tournaments.filter(t => t.status === 'UPCOMING')
  const ongoingTournaments = tournaments.filter(t => t.status === 'IN_PROGRESS')
  const completedTournaments = tournaments.filter(t => t.status === 'COMPLETED')

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      month: 'long',
      day: 'numeric',
      weekday: 'short',
    })
  }

  const formatTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleTimeString('ko-KR', {
      hour: '2-digit',
      minute: '2-digit',
    })
  }

  // 남은 시간 계산
  const getTimeRemaining = (dateString: string) => {
    const now = new Date()
    const target = new Date(dateString)
    const diff = target.getTime() - now.getTime()
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    
    if (days > 0) return `${days}일 ${hours}시간 후`
    if (hours > 0) return `${hours}시간 후`
    return '곧 시작'
  }

  return (
    <LayoutWrapper>
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold">토너먼트</h1>
          <p className="text-muted-foreground mt-2">
            다양한 토너먼트에 참가하고 실력을 겨뤄보세요.
          </p>
        </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="upcoming">예정된 토너먼트</TabsTrigger>
          <TabsTrigger value="ongoing">진행 중</TabsTrigger>
          <TabsTrigger value="completed">완료된 토너먼트</TabsTrigger>
        </TabsList>

        {/* 예정된 토너먼트 */}
        <TabsContent value="upcoming" className="space-y-4">
          {upcomingTournaments.map((tournament) => (
            <Card key={tournament.id} className="p-6 card-hover">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h3 className="text-xl font-semibold">{tournament.name}</h3>
                    {tournament.type === 'SPECIAL' && (
                      <Badge variant="gradient">
                        <Zap className="h-3 w-3 mr-1" />
                        Special
                      </Badge>
                    )}
                    {tournament.type === 'TURBO' && (
                      <Badge variant="destructive">
                        <Zap className="h-3 w-3 mr-1" />
                        Turbo
                      </Badge>
                    )}
                  </div>
                  <p className="text-muted-foreground mb-4">
                    {tournament.location}에서 진행되는 토너먼트
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">시작 시간</p>
                        <p className="font-medium">
                          {formatDate(tournament.startDate)} {formatTime(tournament.startDate)}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Ticket className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">바이인</p>
                        <p className="font-medium">티켓 1매</p>
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-muted-foreground" />
                      <div>
                        <p className="text-sm text-muted-foreground">참가자</p>
                        <p className="font-medium">
                          {tournament.currentPlayers}/{tournament.maxPlayers}명
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <Badge variant="secondary" className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {getTimeRemaining(tournament.startDate)}
                    </Badge>
                    
                    <Button asChild>
                      <Link href={`/tournaments/${tournament.id}`}>
                        참가 신청
                        <ChevronRight className="h-4 w-4 ml-1" />
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
            </Card>
          ))}
          
          {upcomingTournaments.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">예정된 토너먼트가 없습니다.</p>
            </Card>
          )}
        </TabsContent>

        {/* 진행 중인 토너먼트 */}
        <TabsContent value="ongoing" className="space-y-4">
          {ongoingTournaments.map((tournament) => (
            <Card key={tournament.id} className="p-6 border-green-500/20 bg-green-50/5">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold">{tournament.name}</h3>
                <Badge variant="success" className="animate-pulse">
                  진행 중
                </Badge>
              </div>
              
              <p className="text-muted-foreground mb-4">{tournament.location}</p>
              
              <div className="grid grid-cols-3 gap-4 mb-4">
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">참가 플레이어</p>
                  <p className="text-2xl font-bold">{tournament.currentPlayers}명</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">바이인</p>
                  <p className="text-2xl font-bold">티켓 1매</p>
                </div>
                <div className="text-center p-3 bg-muted/50 rounded-lg">
                  <p className="text-sm text-muted-foreground">시작 시간</p>
                  <p className="text-lg font-medium">{formatTime(tournament.startDate)}</p>
                </div>
              </div>
              
              <Button asChild variant="outline" className="w-full">
                <Link href={`/tournaments/${tournament.id}/live`}>
                  실시간 보기
                  <ChevronRight className="h-4 w-4 ml-1" />
                </Link>
              </Button>
            </Card>
          ))}
          
          {ongoingTournaments.length === 0 && (
            <Card className="p-12 text-center">
              <Clock className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">진행 중인 토너먼트가 없습니다.</p>
            </Card>
          )}
        </TabsContent>

        {/* 완료된 토너먼트 */}
        <TabsContent value="completed" className="space-y-4">
          {completedTournaments.map((tournament) => (
            <Card key={tournament.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold mb-2">{tournament.name}</h3>
                  <p className="text-muted-foreground mb-4">{tournament.location}</p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-muted-foreground">참가자 수</p>
                      <p className="font-medium">{tournament.currentPlayers}명</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">바이인</p>
                      <p className="font-medium">티켓 1매</p>
                    </div>
                    <div>
                      <p className="text-sm text-muted-foreground">종료일</p>
                      <p className="font-medium">{formatDate(tournament.startDate)}</p>
                    </div>
                  </div>
                </div>
                
                <Button asChild variant="ghost" size="sm">
                  <Link href={`/tournaments/${tournament.id}/results`}>
                    결과 보기
                    <ChevronRight className="h-4 w-4 ml-1" />
                  </Link>
                </Button>
              </div>
            </Card>
          ))}
          
          {completedTournaments.length === 0 && (
            <Card className="p-12 text-center">
              <Trophy className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground">완료된 토너먼트가 없습니다.</p>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  </LayoutWrapper>
  )
}
