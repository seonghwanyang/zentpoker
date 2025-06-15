'use client'

import { useState } from 'react'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { MemberBadge } from '@/components/member-badge'
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
  DialogTrigger,
} from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { ConfirmDialog } from '@/components/confirm-dialog'
import { toast } from '@/components/ui/use-toast'
import { Search, Filter, UserCog, Eye, Shield } from 'lucide-react'

// Mock 데이터
const mockMembers = [
  {
    id: '1',
    name: '김철수',
    email: 'kim@example.com',
    phone: '010-1234-5678',
    grade: 'REGULAR' as const,
    status: 'ACTIVE' as const,
    points: 150000,
    joinedAt: '2024-01-15',
    lastLogin: '2024-12-20T10:30:00',
    totalDeposit: 500000,
    totalUsed: 350000,
  },
  {
    id: '2',
    name: '이영희',
    email: 'lee@example.com',
    phone: '010-2345-6789',
    grade: 'GUEST' as const,
    status: 'ACTIVE' as const,
    points: 50000,
    joinedAt: '2024-03-20',
    lastLogin: '2024-12-19T15:45:00',
    totalDeposit: 100000,
    totalUsed: 50000,
  },
  {
    id: '3',
    name: '박민수',
    email: 'park@example.com',
    phone: '010-3456-7890',
    grade: 'REGULAR' as const,
    status: 'INACTIVE' as const,
    points: 0,
    joinedAt: '2024-02-10',
    lastLogin: '2024-11-30T20:00:00',
    totalDeposit: 300000,
    totalUsed: 300000,
  },
  {
    id: '4',
    name: '최지원',
    email: 'choi@example.com',
    phone: '010-4567-8901',
    grade: 'GUEST' as const,
    status: 'ACTIVE' as const,
    points: 200000,
    joinedAt: '2024-12-01',
    lastLogin: '2024-12-20T08:00:00',
    totalDeposit: 200000,
    totalUsed: 0,
  },
  {
    id: '5',
    name: '정현우',
    email: 'jung@example.com',
    phone: '010-5678-9012',
    grade: 'ADMIN' as const,
    status: 'ACTIVE' as const,
    points: 1000000,
    joinedAt: '2023-12-01',
    lastLogin: '2024-12-20T11:00:00',
    totalDeposit: 2000000,
    totalUsed: 1000000,
  },
]

export default function AdminMembersPage() {
  const [members, setMembers] = useState(mockMembers)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterGrade, setFilterGrade] = useState<string>('ALL')
  const [filterStatus, setFilterStatus] = useState<string>('ALL')
  const [selectedMember, setSelectedMember] = useState<typeof mockMembers[0] | null>(null)
  const [isDetailOpen, setIsDetailOpen] = useState(false)

  // 필터링된 회원 목록
  const filteredMembers = members.filter(member => {
    const matchesSearch = 
      member.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      member.phone.includes(searchTerm)
    
    const matchesGrade = filterGrade === 'ALL' || member.grade === filterGrade
    const matchesStatus = filterStatus === 'ALL' || member.status === filterStatus

    return matchesSearch && matchesGrade && matchesStatus
  })

  // 등급 변경 핸들러
  const handleGradeChange = async (memberId: string, newGrade: string) => {
    if (newGrade === 'ADMIN') {
      // 관리자 권한 부여는 별도 확인
      const confirmed = await new Promise((resolve) => {
        // 실제로는 ConfirmDialog를 사용
        resolve(window.confirm('정말로 관리자 권한을 부여하시겠습니까?'))
      })
      
      if (!confirmed) return
    }

    setMembers(prev => prev.map(member => 
      member.id === memberId ? { ...member, grade: newGrade as any } : member
    ))

    toast({
      title: '등급 변경 완료',
      description: '회원 등급이 성공적으로 변경되었습니다.',
    })
  }

  // 상태 변경 핸들러
  const handleStatusToggle = (memberId: string) => {
    setMembers(prev => prev.map(member => 
      member.id === memberId 
        ? { ...member, status: member.status === 'ACTIVE' ? 'INACTIVE' : 'ACTIVE' } 
        : member
    ))

    toast({
      title: '상태 변경 완료',
      description: '회원 상태가 성공적으로 변경되었습니다.',
    })
  }

  // 상세 정보 보기
  const handleViewDetail = (member: typeof mockMembers[0]) => {
    setSelectedMember(member)
    setIsDetailOpen(true)
  }

  // 날짜 포맷
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('ko-KR')
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('ko-KR')
  }

  return (
    <div className="space-y-6">
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
                <SelectValue placeholder="등급 필터" />
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
                <SelectValue placeholder="상태 필터" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">전체 상태</SelectItem>
                <SelectItem value="ACTIVE">활성</SelectItem>
                <SelectItem value="INACTIVE">비활성</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </Card>

      {/* 회원 목록 테이블 */}
      <Card>
        <div className="overflow-x-auto">
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
              {filteredMembers.map((member) => (
                <TableRow key={member.id}>
                  <TableCell className="font-medium">{member.name}</TableCell>
                  <TableCell>{member.email}</TableCell>
                  <TableCell>
                    <MemberBadge grade={member.grade} />
                  </TableCell>
                  <TableCell>
                    <Badge variant={member.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {member.status === 'ACTIVE' ? '활성' : '비활성'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-medium">
                    {member.points.toLocaleString()}P
                  </TableCell>
                  <TableCell>{formatDate(member.joinedAt)}</TableCell>
                  <TableCell>{formatDateTime(member.lastLogin)}</TableCell>
                  <TableCell>
                    <div className="flex items-center justify-center gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleViewDetail(member)}
                      >
                        <Eye className="h-4 w-4" />
                      </Button>
                      
                      {member.grade !== 'ADMIN' && (
                        <Select
                          value={member.grade}
                          onValueChange={(value) => handleGradeChange(member.id, value)}
                        >
                          <SelectTrigger className="w-[100px] h-8">
                            <UserCog className="h-4 w-4 mr-1" />
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="GUEST">게스트</SelectItem>
                            <SelectItem value="REGULAR">정회원</SelectItem>
                            <SelectItem value="ADMIN">
                              <span className="flex items-center">
                                <Shield className="h-3 w-3 mr-1" />
                                관리자
                              </span>
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      )}

                      <Button
                        variant={member.status === 'ACTIVE' ? 'outline' : 'default'}
                        size="sm"
                        onClick={() => handleStatusToggle(member.id)}
                        disabled={member.grade === 'ADMIN'}
                      >
                        {member.status === 'ACTIVE' ? '비활성화' : '활성화'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </Card>

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
            <div className="space-y-6">
              {/* 기본 정보 */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-muted-foreground">이름</Label>
                  <p className="font-medium">{selectedMember.name}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">이메일</Label>
                  <p className="font-medium">{selectedMember.email}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">전화번호</Label>
                  <p className="font-medium">{selectedMember.phone}</p>
                </div>
                <div>
                  <Label className="text-muted-foreground">회원 등급</Label>
                  <div className="mt-1">
                    <MemberBadge grade={selectedMember.grade} />
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">계정 상태</Label>
                  <div className="mt-1">
                    <Badge variant={selectedMember.status === 'ACTIVE' ? 'success' : 'secondary'}>
                      {selectedMember.status === 'ACTIVE' ? '활성' : '비활성'}
                    </Badge>
                  </div>
                </div>
                <div>
                  <Label className="text-muted-foreground">현재 포인트</Label>
                  <p className="font-medium text-lg">{selectedMember.points.toLocaleString()}P</p>
                </div>
              </div>

              {/* 활동 정보 */}
              <div className="space-y-4 border-t pt-4">
                <h4 className="font-semibold">활동 정보</h4>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label className="text-muted-foreground">가입일</Label>
                    <p className="font-medium">{formatDate(selectedMember.joinedAt)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">마지막 로그인</Label>
                    <p className="font-medium">{formatDateTime(selectedMember.lastLogin)}</p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">총 충전 금액</Label>
                    <p className="font-medium text-green-600">
                      {selectedMember.totalDeposit.toLocaleString()}원
                    </p>
                  </div>
                  <div>
                    <Label className="text-muted-foreground">총 사용 금액</Label>
                    <p className="font-medium text-red-600">
                      {selectedMember.totalUsed.toLocaleString()}원
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
