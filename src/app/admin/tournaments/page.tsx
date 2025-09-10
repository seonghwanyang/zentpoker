'use client'

import { useState, useEffect } from 'react'
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
import { Plus, Trophy, Calendar, Users, Edit, Trash, Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface Tournament {
  id: number
  title: string
  type: string
  startDate: string
  endDate: string | null
  location: string
  maxEntries: number | null
  buyinRequired: boolean
  rebuyAllowed: boolean
  status: string
  participantCount: number
}

interface TournamentStatistics {
  upcoming: number
  monthlyCount: number
  totalParticipants: number
  averageParticipationRate: number
}

export default function AdminTournamentsPage() {
  const [tournaments, setTournaments] = useState<Tournament[]>([])
  const [statistics, setStatistics] = useState<TournamentStatistics>({
    upcoming: 0,
    monthlyCount: 0,
    totalParticipants: 0,
    averageParticipationRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)

  const fetchTournaments = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/admin/tournaments?page=${page}&limit=10`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch tournaments')
      }

      const data = await response.json()
      setTournaments(data.tournaments)
      setStatistics(data.statistics)
      setTotalPages(data.pagination.totalPages)
    } catch (error) {
      console.error('Error fetching tournaments:', error)
      toast.error('토너먼트 목록을 불러오는데 실패했습니다.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchTournaments()
  }, [page])

  const handleDelete = async (id: number) => {
    if (!confirm('정말로 이 토너먼트를 삭제하시겠습니까?')) {
      return
    }

    try {
      const response = await fetch(`/api/admin/tournaments?id=${id}`, {
        method: 'DELETE',
      })

      if (!response.ok) {
        throw new Error('Failed to delete tournament')
      }

      toast.success('토너먼트가 삭제되었습니다.')
      fetchTournaments() // Refresh the list
    } catch (error) {
      console.error('Error deleting tournament:', error)
      toast.error('토너먼트 삭제에 실패했습니다.')
    }
  }

  const handleStatusUpdate = async (id: number, status: string) => {
    try {
      const response = await fetch('/api/admin/tournaments', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ id, status }),
      })

      if (!response.ok) {
        throw new Error('Failed to update tournament status')
      }

      toast.success('토너먼트 상태가 업데이트되었습니다.')
      fetchTournaments() // Refresh the list
    } catch (error) {
      console.error('Error updating tournament:', error)
      toast.error('토너먼트 상태 업데이트에 실패했습니다.')
    }
  }

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
    if (type === 'Buy-in') {
      return <Badge variant="gradient">바이인</Badge>
    } else if (type === 'Freeroll') {
      return <Badge variant="outline">프리롤</Badge>
    }
    return <Badge variant="outline">{type}</Badge>
  }

  if (loading && tournaments.length === 0) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
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
              <p className="text-2xl font-bold">{statistics.upcoming}개</p>
            </div>
            <Trophy className="h-8 w-8 text-purple-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">이번 달 개최</p>
              <p className="text-2xl font-bold">{statistics.monthlyCount}개</p>
            </div>
            <Calendar className="h-8 w-8 text-blue-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">총 참가자</p>
              <p className="text-2xl font-bold">{statistics.totalParticipants}명</p>
            </div>
            <Users className="h-8 w-8 text-green-500" />
          </div>
        </Card>
        
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-muted-foreground">평균 참가율</p>
              <p className="text-2xl font-bold">{statistics.averageParticipationRate}%</p>
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
              {tournaments.map((tournament) => (
                <TableRow key={tournament.id}>
                  <TableCell className="font-medium">{tournament.title}</TableCell>
                  <TableCell>{getTypeBadge(tournament.type)}</TableCell>
                  <TableCell>
                    <div>
                      <p className="text-sm">{formatDate(tournament.startDate)}</p>
                      <p className="text-xs text-muted-foreground">{formatTime(tournament.startDate)}</p>
                    </div>
                  </TableCell>
                  <TableCell>{tournament.location}</TableCell>
                  <TableCell className="text-center">
                    {tournament.maxEntries ? (
                      <>
                        <div className="flex items-center justify-center gap-1">
                          <Users className="h-4 w-4" />
                          {tournament.participantCount}/{tournament.maxEntries}
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
                          <div
                            className="bg-purple-600 h-2 rounded-full"
                            style={{ width: `${(tournament.participantCount / tournament.maxEntries) * 100}%` }}
                          />
                        </div>
                      </>
                    ) : (
                      <div className="flex items-center justify-center gap-1">
                        <Users className="h-4 w-4" />
                        {tournament.participantCount}
                      </div>
                    )}
                  </TableCell>
                  <TableCell>{getStatusBadge(tournament.status)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Link href={`/admin/tournaments/${tournament.id}/edit`}>
                        <Button variant="ghost" size="icon">
                          <Edit className="h-4 w-4" />
                        </Button>
                      </Link>
                      <Button 
                        variant="ghost" 
                        size="icon" 
                        className="text-destructive"
                        onClick={() => handleDelete(tournament.id)}
                      >
                        <Trash className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-center gap-2 p-4 border-t">
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page - 1)}
              disabled={page === 1}
            >
              이전
            </Button>
            <span className="text-sm text-muted-foreground">
              {page} / {totalPages}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setPage(page + 1)}
              disabled={page === totalPages}
            >
              다음
            </Button>
          </div>
        )}
      </Card>
    </div>
  )
}