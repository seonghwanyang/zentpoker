'use client';

import { useState } from 'react';
import { useSession } from 'next-auth/react';
import { redirect } from 'next/navigation';

/**
 * 프로필 페이지
 * - 회원 정보 표시 및 수정
 * - 활동 통계 표시 (총 게임 수, 승률, 상금 등)
 * - 업적/뱃지 시스템
 */
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { MemberBadge } from '@/components/members/member-badge';
import { toast } from '@/lib/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Calendar,
  Shield,
  Save,
  Camera,
  AlertCircle,
  Trophy,
  Activity,
} from 'lucide-react';

// 임시 통계 데이터 (실제로는 API에서 가져옴)
const mockStats = {
  totalGames: 45,
  winRate: 42.5,
  totalWinnings: 2500000,
  averageRank: 3.2,
  joinDate: new Date('2024-01-15'),
  lastActive: new Date('2024-12-20T14:30:00'),
};

export default function ProfilePage() {
  const { data: session, status } = useSession();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  if (status === 'loading') {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  if (!session) {
    redirect('/login');
  }

  // 폼 데이터 초기화 - 세션 정보로 채우기
  if (!formData.name && session.user) {
    setFormData({
      name: session.user.name || '',
      email: session.user.email || '',
      phone: '', // 실제로는 DB에서 가져옴
    });
  }

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // 프로필 업데이트 처리
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // TODO: 실제 API 호출로 변경 필요
    toast({
      title: '프로필 업데이트 완료',
      description: '프로필 정보가 성공적으로 업데이트되었습니다.',
    });
    
    setIsEditing(false);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  // 마지막 활동 시간 포맷팅 - 상대적 시간 표시
  const formatLastActive = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const hours = Math.floor(diff / (1000 * 60 * 60));
    
    if (hours < 1) return '방금 전';
    if (hours < 24) return `${hours}시간 전`;
    if (hours < 48) return '어제';
    return formatDate(date);
  };

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">프로필</h1>
          <p className="text-gray-500 mt-1">회원 정보와 활동 내역을 확인하세요</p>
        </div>

        {/* 프로필 카드 */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>기본 정보</CardTitle>
              {!isEditing ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setIsEditing(true)}
                >
                  수정
                </Button>
              ) : (
                <div className="space-x-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setIsEditing(false);
                      setFormData({
                        name: session.user.name || '',
                        email: session.user.email || '',
                        phone: '',
                      });
                    }}
                  >
                    취소
                  </Button>
                  <Button
                    size="sm"
                    onClick={handleSubmit}
                  >
                    <Save className="mr-2 h-4 w-4" />
                    저장
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* 아바타 섹션 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={session.user.image || undefined} alt={session.user.name || ''} />
                    <AvatarFallback className="text-2xl">
                      {session.user.name?.[0] || 'U'}
                    </AvatarFallback>
                  </Avatar>
                  {isEditing && (
                    <Button
                      size="icon"
                      variant="secondary"
                      className="absolute bottom-0 right-0 h-8 w-8 rounded-full shadow-lg"
                    >
                      <Camera className="h-4 w-4" />
                    </Button>
                  )}
                </div>
                <div className="text-center">
                  <MemberBadge grade={session.user.memberGrade} />
                  <p className="text-xs text-gray-500 mt-1">
                    가입일: {formatDate(mockStats.joinDate)}
                  </p>
                </div>
              </div>

              {/* 정보 입력 폼 */}
              <div className="flex-1 space-y-4">
                {isEditing ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">이름</Label>
                      <Input
                        id="name"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="이름을 입력하세요"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="email">이메일</Label>
                      <Input
                        id="email"
                        name="email"
                        type="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        disabled
                        className="bg-gray-50"
                      />
                      <p className="text-xs text-gray-500">이메일은 변경할 수 없습니다</p>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">연락처</Label>
                      <Input
                        id="phone"
                        name="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={handleInputChange}
                        placeholder="010-0000-0000"
                      />
                      <p className="text-xs text-gray-500">입금 확인 시 필요합니다</p>
                    </div>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center gap-3">
                      <User className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">이름</p>
                        <p className="font-medium">{session.user.name || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Mail className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">이메일</p>
                        <p className="font-medium">{session.user.email || '-'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Phone className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">연락처</p>
                        <p className="font-medium">{formData.phone || '미등록'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <Shield className="h-5 w-5 text-gray-400" />
                      <div>
                        <p className="text-sm text-gray-500">권한</p>
                        <p className="font-medium">
                          {session.user.role === 'ADMIN' ? '관리자' : '일반 회원'}
                        </p>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* 회원 등급 안내 */}
            {session.user.memberGrade === 'GUEST' && (
              <div className="mt-6 rounded-lg bg-yellow-50 p-4">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 text-yellow-600 flex-shrink-0 mt-0.5" />
                  <div className="space-y-1 text-sm text-yellow-800">
                    <p className="font-medium">정회원 승급 안내</p>
                    <p>• 프로필 정보를 모두 입력해주세요</p>
                    <p>• 관리자 승인 후 정회원으로 승급됩니다</p>
                    <p>• 정회원은 바인권 할인 혜택을 받을 수 있습니다</p>
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* 활동 통계 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              활동 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
              <div>
                <p className="text-sm text-gray-500">총 게임 수</p>
                <p className="text-2xl font-bold">{mockStats.totalGames}회</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">승률</p>
                <p className="text-2xl font-bold">{mockStats.winRate}%</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">총 상금</p>
                <p className="text-2xl font-bold">
                  {new Intl.NumberFormat('ko-KR').format(mockStats.totalWinnings)}원
                </p>
              </div>
              <div>
                <p className="text-sm text-gray-500">평균 순위</p>
                <p className="text-2xl font-bold">{mockStats.averageRank.toFixed(1)}위</p>
              </div>
            </div>
            
            <Separator className="my-6" />
            
            <div className="flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 text-gray-500">
                <Calendar className="h-4 w-4" />
                <span>마지막 활동</span>
              </div>
              <span className="font-medium">{formatLastActive(mockStats.lastActive)}</span>
            </div>
          </CardContent>
        </Card>

        {/* 업적/뱃지 섹션 (선택적) */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5" />
              업적
            </CardTitle>
            <CardDescription>
              게임 플레이를 통해 획득한 업적입니다
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center p-4 rounded-lg bg-purple-50">
                <Trophy className="h-8 w-8 text-purple-600 mx-auto mb-2" />
                <p className="text-sm font-medium">첫 승리</p>
                <p className="text-xs text-gray-500">2024.01.20</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-yellow-50">
                <Trophy className="h-8 w-8 text-yellow-600 mx-auto mb-2" />
                <p className="text-sm font-medium">10회 우승</p>
                <p className="text-xs text-gray-500">2024.06.15</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-100">
                <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">???</p>
                <p className="text-xs text-gray-400">미획득</p>
              </div>
              <div className="text-center p-4 rounded-lg bg-gray-100">
                <Trophy className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-400">???</p>
                <p className="text-xs text-gray-400">미획득</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}
