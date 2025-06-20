'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { useTournamentStore } from '@/stores/tournament-store'
import { Plus, Trophy, Calendar, Users, Edit, Trash } from 'lucide-react'

// Mock 데이터
const mockTournaments = [
  {
    id: '1',
    name: '주간 토너먼트 #46',
    type: 'REGULAR',
    startDate: '2024-12-25T19:00:00',
    location: '강남 홀덤펍',
    buyIn: 50000,
    guaranteedPrize: 1000000,
    maxPlayers: 50,
    currentPlayers: 24,
    status: 'UPCOMING',
  },
  {
    id: '2',
    name: '월간 챔피언십',
    type: 'SPECIAL',
    startDate: '2024-12-30T18:00:00',
    location: '강남 홀덤펍',
    buyIn: 100000,
    guaranteedPrize: 5000000,
    maxPlayers: 100,
    currentPlayers: 45,
    status: 'UPCOMING',
  },
  {
    id: '3',
    name: '주간 토너먼트 #45',
    type: 'REGULAR',
    startDate: '2024-12-18T19:00:00',
    location: '강남 홀덤펍',
    buyIn: 50000,
    guaranteedPrize: 1000000,
    maxPlayers: 50,
    currentPlayers: 48,
    status: 'COMPLETED',
  },
]

export default function AdminTournamentsPage() {
  const tournaments = useTournamentStore((state) => state.tournaments)
  const deleteTournament = useTournamentStore((state) => state.deleteTournament)

  // 토너먼트를 시작 날짜 기준 내림차순으로 정렬
  const sortedTournaments = [...tournaments].sort((a, b) => {
    const dateA = new Date(a.startDate).getTime()
    const dateB = new Date(b.startDate).getTime()
    return dateB - dateA // 내림차순 (최신 날짜가 먼저)
  })

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR', {
      year: 'numeric',
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

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'UPCOMING':
        return <Badge variant="default">예정</Badge>
      case 'IN_PROGRESS':
        return <Badge variant="success">진행중</Badge>
      case 'COMPLETED':
        return <Badge variant="secondary">완료</Badge>
      case 'CANCELLED':
        return <Badge variant="destructive">취소</Badge>
      default:
        return <Badge>{status}</Badge>
    }
  }

  const getTypeBadge = (type: string) => {
    switch (type) {
      case 'REGULAR':
        return <Badge variant="outline">일반</Badge>
      case 'SPECIAL':
        return <Badge variant="gradient">스페셜</Badge>
      case 'TURBO':
        return <Badge variant="destructive">터보</Badge>
      default:
        return <Badge variant="outline">{type}</Badge>
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">토너먼트 관리</h1>
          <p className="text-muted-foreground mt-2">
            토너먼트를 생성하고 관리합니다.
          </p>
        </div>
        
        <Link href="/admin/tournaments/create">
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            토너먼트 생성
          </Button>
        </Link>
      </div>

      {/* 통계 카드 */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">예정된 토너먼트</p>
              <p className="text-2xl font-bold">2개</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">이번 달 개최</p>
              <p className="text-2xl font-bold">12개</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 참가자</p>
              <p className="text-2xl font-bold">456명</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">평균 참가율</p>
              <p className="text-2xl font-bold">85%</p>
            </div>
            <Trophy className="h-8 w-8 text-orange-500" />
          </div>
        </Card>
      </div>

      {/* 토너먼트 목록 */}
      <Card>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>토너먼트명</TableHead>
                <TableHead>유형</TableHead>
                <TableHead>일시</TableHead>
                <TableHead>장소</TableHead>
                <TableHead className="text-center">참가자</TableHead>
                <TableHead>상태</TableHead>
                <TableHead className="text-center">작업</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedTournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">{tournament.name}</TableCell>
                  <TableCell>{getTypeBadge(tournament.type)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{formatDate(tournament.startDate)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(tournament.startDate)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{tournament.location}</TableCell>
                  <TableCell className="text-center">
                    <div className="flex items-center justify-center gap-1">
                      <Users className="h-4 w-4" />
                      {tournament.currentPlayers}/{tournament.maxPlayers}
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                      <div
                        className="bg-purple-600 h-2 rounded-full"
                        style={{ width: `${(tournament.currentPlayers / tournament.maxPlayers) * 100}%` }}
                      />
                    </div>
                  </TableCell>
                  <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button variant="ghost" size="icon">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="text-destructive">
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}}
            </TableBody>
          </Table>
        </div>
      </Card>
    </div>
  )
}
