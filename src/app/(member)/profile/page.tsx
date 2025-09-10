'use client';

import { useState, useEffect } from 'react';
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs';
import { redirect } from 'next/navigation';
import { LayoutWrapper } from '@/components/layout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Separator } from '@/components/ui/separator';
import { toast } from '@/lib/hooks/use-toast';
import {
  User,
  Mail,
  Phone,
  Shield,
  Calendar,
  Edit2,
  Save,
  X,
  Camera,
  AlertCircle,
  Trophy,
  Activity,
} from 'lucide-react';

// 프로필 통계 타입
type UserStats = {
  totalGames: number;
  winRate: number;
  totalWinnings: number;
  averageRank: number;
  lastActive: Date | null;
};

// 업적 타입
type Achievement = {
  id: string;
  name: string;
  description: string;
  unlockedAt: Date | null;
  icon: string;
  color: string;
};

const supabase = createClientComponentClient();

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<UserStats>({
    totalGames: 0,
    winRate: 0,
    totalWinnings: 0,
    averageRank: 0,
    lastActive: null,
  });
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
  });

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        setUser(user);
      } catch (error) {
        console.error('Error fetching user:', error);
      } finally {
        setLoading(false);
      }
    };

    getUser();
  }, [supabase.auth]);

  useEffect(() => {
    const fetchUserData = async () => {
      if (!user) return;

      try {
        // 사용자 통계 가져오기
        const statsRes = await fetch('/api/users/statistics');
        if (statsRes.ok) {
          const statsData = await statsRes.json();
          setStats({
            totalGames: statsData.totalGames || 0,
            winRate: statsData.winRate || 0,
            totalWinnings: 0, // API에서 추가 필요
            averageRank: 0, // API에서 추가 필요
            lastActive: statsData.lastActive ? new Date(statsData.lastActive) : null,
          });
        }

        // 사용자 정보 초기화
        if (user) {
          setFormData({
            name: user.user_metadata?.name || user.email || '',
            email: user.email || '',
            phone: user.user_metadata?.phone || '', // 추후 DB에서 가져올 수 있도록 API 확장 필요
          });
        }

        // 업적 데이터 (현재는 하드코딩, 추후 API 연동)
        setAchievements([
          {
            id: '1',
            name: '첫 승리',
            description: '첫 토너먼트 우승',
            unlockedAt: new Date('2024-01-20'),
            icon: 'trophy',
            color: 'purple',
          },
          {
            id: '2',
            name: '10회 우승',
            description: '토너먼트 10회 우승',
            unlockedAt: new Date('2024-06-15'),
            icon: 'trophy',
            color: 'yellow',
          },
          {
            id: '3',
            name: '???',
            description: '미획득',
            unlockedAt: null,
            icon: 'trophy',
            color: 'gray',
          },
          {
            id: '4',
            name: '???',
            description: '미획득',
            unlockedAt: null,
            icon: 'trophy',
            color: 'gray',
          },
        ]);
      } catch (error) {
        console.error('Failed to fetch user data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (user) {
      fetchUserData();
    }
  }, [user]);

  if (loading) {
    return (
      <LayoutWrapper>
        <div className="flex items-center justify-center h-96">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600"></div>
        </div>
      </LayoutWrapper>
    );
  }

  // 미들웨어에서 인증 처리하므로 여기서는 리다이렉트 제거
  // if (!user) {
  //   redirect('/login');
  // }

  // 입력 필드 변경 처리
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  // 프로필 저장
  const handleSave = async () => {
    try {
      const response = await fetch('/api/members/profile', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });

      if (response.ok) {
        toast({
          title: '프로필 업데이트 성공',
          description: '프로필 정보가 업데이트되었습니다.',
        });
        setIsEditing(false);
      } else {
        throw new Error('Failed to update profile');
      }
    } catch (error) {
      toast({
        title: '업데이트 실패',
        description: '프로필 업데이트에 실패했습니다.',
        variant: 'destructive',
      });
    }
  };

  // 취소
  const handleCancel = () => {
    setFormData({
      name: user?.user_metadata?.name || user?.email || '',
      email: user?.email || '',
      phone: user?.user_metadata?.phone || '',
    });
    setIsEditing(false);
  };

  // 회원 등급별 뱃지 색상
  const getMemberGradeBadge = (grade: string) => {
    switch (grade) {
      case 'ADMIN':
        return (
          <Badge className="bg-gradient-to-r from-purple-600 to-pink-600 text-white border-transparent inline-flex items-center gap-1">
            <Shield className="h-4 w-4" />
            관리자
          </Badge>
        );
      case 'REGULAR':
        return (
          <Badge variant="secondary">
            정회원
          </Badge>
        );
      default:
        return (
          <Badge variant="outline">
            게스트
          </Badge>
        );
    }
  };

  const formatDate = (date: Date | null) => {
    if (!date) return '없음';
    return new Intl.DateTimeFormat('ko-KR', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    }).format(date);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('ko-KR').format(amount);
  };

  return (
    <LayoutWrapper>
      <div className="max-w-4xl mx-auto space-y-6">
        {/* 페이지 헤더 */}
        <div>
          <h1 className="text-3xl font-bold">프로필</h1>
          <p className="text-gray-500 mt-1">회원 정보와 활동 내역을 확인하세요</p>
        </div>

        {/* 기본 정보 카드 */}
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
                  <Edit2 className="h-4 w-4 mr-2" />
                  수정
                </Button>
              ) : (
                <div className="flex gap-2">
                  <Button
                    variant="default"
                    size="sm"
                    onClick={handleSave}
                  >
                    <Save className="h-4 w-4 mr-2" />
                    저장
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handleCancel}
                  >
                    <X className="h-4 w-4 mr-2" />
                    취소
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex flex-col md:flex-row gap-6">
              {/* 프로필 이미지 */}
              <div className="flex flex-col items-center space-y-4">
                <div className="relative">
                  <Avatar className="h-24 w-24">
                    <AvatarImage src={user?.user_metadata?.avatar_url || ''} alt={user?.user_metadata?.name || ''} />
                    <AvatarFallback>{user?.user_metadata?.name?.[0] || user?.email?.[0] || 'U'}</AvatarFallback>
                  </Avatar>
                </div>
                <div className="text-center">
                  {getMemberGradeBadge(user?.user_metadata?.memberGrade || 'GUEST')}
                  <p className="text-xs text-gray-500 mt-1">
                    회원 등급
                  </p>
                </div>
              </div>

              {/* 정보 필드들 */}
              <div className="flex-1 space-y-4">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <User className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label htmlFor="name" className="text-sm text-gray-500">이름</Label>
                      {isEditing ? (
                        <Input
                          id="name"
                          name="name"
                          value={formData.name}
                          onChange={handleInputChange}
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium">{formData.name || '미등록'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Mail className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label htmlFor="email" className="text-sm text-gray-500">이메일</Label>
                      {isEditing ? (
                        <Input
                          id="email"
                          name="email"
                          type="email"
                          value={formData.email}
                          onChange={handleInputChange}
                          className="mt-1"
                          disabled
                        />
                      ) : (
                        <p className="font-medium">{formData.email}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Phone className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <Label htmlFor="phone" className="text-sm text-gray-500">연락처</Label>
                      {isEditing ? (
                        <Input
                          id="phone"
                          name="phone"
                          type="tel"
                          value={formData.phone}
                          onChange={handleInputChange}
                          placeholder="010-0000-0000"
                          className="mt-1"
                        />
                      ) : (
                        <p className="font-medium">{formData.phone || '미등록'}</p>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <Shield className="h-5 w-5 text-gray-400" />
                    <div className="flex-1">
                      <p className="text-sm text-gray-500">권한</p>
                      <p className="font-medium">
                        {user?.user_metadata?.memberGrade === 'ADMIN' ? '관리자' : 
                         user?.user_metadata?.memberGrade === 'REGULAR' ? '정회원' : '게스트'}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* 활동 통계 카드 */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="h-5 w-5" />
              활동 통계
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="text-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-purple-600 mx-auto mb-4"></div>
                <p className="text-gray-500">로딩 중...</p>
              </div>
            ) : (
              <>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
                  <div>
                    <p className="text-sm text-gray-500">총 게임 수</p>
                    <p className="text-2xl font-bold">{stats.totalGames}회</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">승률</p>
                    <p className="text-2xl font-bold">{stats.winRate}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">총 상금</p>
                    <p className="text-2xl font-bold">{formatCurrency(stats.totalWinnings)}원</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500">평균 순위</p>
                    <p className="text-2xl font-bold">{stats.averageRank || '-'}위</p>
                  </div>
                </div>

                <Separator className="my-6" />

                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-2 text-gray-500">
                    <Calendar className="h-4 w-4" />
                    <span>마지막 활동</span>
                  </div>
                  <span className="font-medium">
                    {formatDate(stats.lastActive)}
                  </span>
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* 업적 카드 */}
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
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  className={`text-center p-4 rounded-lg ${
                    achievement.unlockedAt 
                      ? achievement.color === 'purple' ? 'bg-purple-50' 
                      : achievement.color === 'yellow' ? 'bg-yellow-50'
                      : 'bg-gray-100'
                      : 'bg-gray-100'
                  }`}
                >
                  <Trophy className={`h-8 w-8 mx-auto mb-2 ${
                    achievement.unlockedAt
                      ? achievement.color === 'purple' ? 'text-purple-600'
                      : achievement.color === 'yellow' ? 'text-yellow-600'
                      : 'text-gray-400'
                      : 'text-gray-400'
                  }`} />
                  <p className={`text-sm font-medium ${
                    !achievement.unlockedAt ? 'text-gray-400' : ''
                  }`}>
                    {achievement.name}
                  </p>
                  <p className={`text-xs ${
                    achievement.unlockedAt ? 'text-gray-500' : 'text-gray-400'
                  }`}>
                    {achievement.unlockedAt 
                      ? formatDate(achievement.unlockedAt).replace('년 ', '.').replace('월 ', '.').replace('일', '')
                      : achievement.description}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </LayoutWrapper>
  );
}