'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemberBadge } from '@/components/members/member-badge'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { toast } from '@/components/ui/use-toast'
import { Search, Filter, UserCog, Eye, Shield, Loader2, RefreshCw, AlertCircle } from 'lucide-react'

interface Member {
  id: string
  name: string | null
  email: string | null
  phone: string | null
  grade: 'GUEST' | 'REGULAR' | 'ADMIN'
  role: 'USER' | 'ADMIN'
  status: 'ACTIVE' | 'INACTIVE'
  points: number
  createdAt: string
  lastLoginAt: string | null
  transactionCount?: number
  voucherCount?: number
}

interface PaginationInfo {
  total: number
  page: number
  limit: number
  totalPages: number
}

export default function AdminMembersPage() {
  const [members, setMembers] = useState<Member[]>([])
  const [pagination, setPagination] = useState<PaginationInfo>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 0
  })
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedMember, setSelectedMember] = useState<Member | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // 회원 목록 조회
  const fetchMembers = async () => {
    setIsLoading(true)
    try {
      const params = new URLSearchParams({
        page: pagination.page.toString(),
        limit: pagination.limit.toString(),
      })
      
      if (searchTerm) params.append('search', searchTerm)
      if (filterGrade !== 'ALL') params.append('grade', filterGrade)
      if (filterStatus !== 'ALL') params.append('status', filterStatus)

      const response = await fetch(`/api/admin/members?${params}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch members')
      }

      const data = await response.json()
      setMembers(data.members)
      setPagination(data.pagination)
    } catch (error) {
      console.error('Error fetching members:', error)
      toast({
        title: '오류',
        description: '회원 목록을 불러오는데 실패했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsLoading(false)
    }
  }

  // 페이지 변경 핸들러
  const handlePageChange = (newPage: number) => {
    setPagination(prev => ({ ...prev, page: newPage }))
  }

  // 검색 및 필터 변경 시 페이지를 1로 리셋
  useEffect(() => {
    setPagination(prev => ({ ...prev, page: 1 }))
  }, [searchTerm, filterGrade, filterStatus])

  // 회원 목록 조회 실행
  useEffect(() => {
    fetchMembers()
  }, [pagination.page, searchTerm, filterGrade, filterStatus])

  // 등급 변경 핸들러
  const handleGradeChange = async (memberId: string, newGrade: string) => {
    if (newGrade === 'ADMIN') {
      const confirmed = window.confirm('정말로 관리자 권한을 부여하시겠습니까?')
      if (!confirmed) return
    }

    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ grade: newGrade }),
      })

      if (!response.ok) {
        throw new Error('Failed to update member grade')
      }

      toast({
        title: '등급 변경 완료',
        description: '회원 등급이 성공적으로 변경되었습니다.',
      })

      fetchMembers() // 목록 새로고침
    } catch (error) {
      console.error('Error updating member grade:', error)
      toast({
        title: '오류',
        description: '등급 변경에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 상태 변경 핸들러
  const handleStatusToggle = async (memberId: string, currentStatus: string) => {
    const newStatus = currentStatus === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE'
    
    try {
      const response = await fetch(`/api/admin/members/${memberId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      })

      if (!response.ok) {
        throw new Error('Failed to update member status')
      }

      toast({
        title: '상태 변경 완료',
        description: '회원 상태가 성공적으로 변경되었습니다.',
      })

      fetchMembers() // 목록 새로고침
    } catch (error) {
      console.error('Error updating member status:', error)
      toast({
        title: '오류',
        description: '상태 변경에 실패했습니다.',
        variant: 'destructive',
      })
    }
  }

  // 상세 정보 보기
  const handleViewDetail = (member: Member) => {
    setSelectedMember(member)
    setIsDetailOpen(true)
  }

  // 날짜 포맷
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  const formatDateTime = (dateString: string | null) => {
    if (!dateString) return '-'
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  return (
    <div className="container mx-auto max-w-7xl">
      <div className="space-y-6">
        {/* 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">회원 관리</h1>
          <p className="text-muted-foreground mt-2">
            전체 회원 정보를 조회하고 관리할 수 있습니다.
          </p>
        </div>

        {/* 검색 및 필터 */}
        <Card className="p-4">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="이름, 이메일, 전화번호 검색..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
            <div className="flex gap-2">
              <Select value={filterGrade} onValueChange={setFilterGrade}>
                <SelectTrigger className="w-[140px]">
                  <Filter className="h-4 w-4 mr-2" />
                  <SelectValue placeholder="전체 등급" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 등급</SelectItem>
                  <SelectItem value="GUEST">게스트</SelectItem>
                  <SelectItem value="REGULAR">정회원</SelectItem>
                  <SelectItem value="ADMIN">관리자</SelectItem>
                </SelectContent>
              </Select>
              <Select value={filterStatus} onValueChange={setFilterStatus}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="전체 상태" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="ALL">전체 상태</SelectItem>
                  <SelectItem value="ACTIVE">활성</SelectItem>
                  <SelectItem value="INACTIVE">비활성</SelectItem>
                </SelectContent>
              </Select>
              <Button 
                variant="outline" 
                size="icon"
                onClick={fetchMembers}
                disabled={isLoading}
              >
                <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
              </Button>
            </div>
          </div>
        </Card>

        {/* 회원 목록 테이블 */}
        <Card>
          <div className="overflow-x-auto">
            {isLoading ? (
              <div className="flex items-center justify-center py-20">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            ) : members.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-20 text-muted-foreground">
                <AlertCircle className="h-12 w-12 mb-4" />
                <p>회원이 없습니다.</p>
              </div>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>이름</TableHead>
                    <TableHead>이메일</TableHead>
                    <TableHead>등급</TableHead>
                    <TableHead>상태</TableHead>
                    <TableHead className="text-right">포인트</TableHead>
                    <TableHead>가입일</TableHead>
                    <TableHead>마지막 로그인</TableHead>
                    <TableHead className="text-center">작업</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {members.map((member) => (
                    <TableRow key={member.id}>
                      <TableCell className="font-medium">
                        {member.name || '미설정'}
                      </TableCell>
                      <TableCell>{member.email || '-'}</TableCell>
                      <TableCell>
                        <MemberBadge grade={member.grade} />
                      </TableCell>
                      <TableCell>
                        <Badge 
                          variant={member.status === 'ACTIVE' ? 'default' : 'secondary'}
                        >
                          {member.status === 'ACTIVE' ? '활성' : '비활성'}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        {member.points.toLocaleString()}P
                      </TableCell>
                      <TableCell>{formatDate(member.createdAt)}</TableCell>
                      <TableCell>{formatDateTime(member.lastLoginAt)}</TableCell>
                      <TableCell>
                        <div className="flex items-center justify-center gap-2">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => handleViewDetail(member)}
                          >
                            <Eye className="h-4 w-4" />
                          </Button>
                          <Select
                            value={member.grade}
                            onValueChange={(value) => handleGradeChange(member.id, value)}
                            disabled={member.role === 'ADMIN'}
                          >
                            <SelectTrigger className="w-[100px] h-8">
                              <UserCog className="h-4 w-4 mr-1" />
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="GUEST">게스트</SelectItem>
                              <SelectItem value="REGULAR">정회원</SelectItem>
                              <SelectItem value="ADMIN">관리자</SelectItem>
                            </SelectContent>
                          </Select>
                          <Button
                            variant={member.status === 'ACTIVE' ? 'outline' : 'default'}
                            size="sm"
                            onClick={() => handleStatusToggle(member.id, member.status)}
                            disabled={member.role === 'ADMIN'}
                          >
                            {member.status === 'ACTIVE' ? '비활성화' : '활성화'}
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
          
          {/* 페이지네이션 */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-2 border-t">
              <div className="text-sm text-muted-foreground">
                전체 {pagination.total}건 중 {((pagination.page - 1) * pagination.limit) + 1}-
                {Math.min(pagination.page * pagination.limit, pagination.total)}건 표시
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={pagination.page <= 1 || isLoading}
                >
                  이전
                </Button>
                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
                    const page = i + Math.max(1, pagination.page - 2);
                    if (page > pagination.totalPages) return null;
                    return (
                      <Button
                        key={page}
                        variant={page === pagination.page ? 'default' : 'outline'}
                        size="sm"
                        onClick={() => handlePageChange(page)}
                        disabled={isLoading}
                        className="w-8 h-8 p-0"
                      >
                        {page}
                      </Button>
                    );
                  })}
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages || isLoading}
                >
                  다음
                </Button>
              </div>
            </div>
          )}
        </Card>
      </div>

      {/* 회원 상세 정보 다이얼로그 */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>회원 상세 정보</DialogTitle>
            <DialogDescription>
              회원의 상세 정보와 활동 내역을 확인할 수 있습니다.
            </DialogDescription>
          </DialogHeader>
          {selectedMember && (
            <div className="grid gap-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>이름</Label>
                  <p className="text-sm font-medium">
                    {selectedMember.name || '미설정'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>이메일</Label>
                  <p className="text-sm font-medium">
                    {selectedMember.email || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>전화번호</Label>
                  <p className="text-sm font-medium">
                    {selectedMember.phone || '-'}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>등급</Label>
                  <MemberBadge grade={selectedMember.grade} />
                </div>
                <div className="space-y-2">
                  <Label>상태</Label>
                  <Badge 
                    variant={selectedMember.status === 'ACTIVE' ? 'default' : 'secondary'}
                  >
                    {selectedMember.status === 'ACTIVE' ? '활성' : '비활성'}
                  </Badge>
                </div>
                <div className="space-y-2">
                  <Label>보유 포인트</Label>
                  <p className="text-sm font-medium">
                    {selectedMember.points.toLocaleString()}P
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>가입일</Label>
                  <p className="text-sm font-medium">
                    {formatDateTime(selectedMember.createdAt)}
                  </p>
                </div>
                <div className="space-y-2">
                  <Label>마지막 로그인</Label>
                  <p className="text-sm font-medium">
                    {formatDateTime(selectedMember.lastLoginAt)}
                  </p>
                </div>
              </div>
              {(selectedMember.transactionCount !== undefined || selectedMember.voucherCount !== undefined) && (
                <div className="grid grid-cols-2 gap-4 pt-4 border-t">
                  <div className="space-y-2">
                    <Label>총 거래 횟수</Label>
                    <p className="text-sm font-medium">
                      {selectedMember.transactionCount || 0}회
                    </p>
                  </div>
                  <div className="space-y-2">
                    <Label>보유 바우처</Label>
                    <p className="text-sm font-medium">
                      {selectedMember.voucherCount || 0}개
                    </p>
                  </div>
                </div>
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}