'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import * as z from 'zod'
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
import { CalendarIcon, Save, Trophy } from 'lucide-react'
import { TournamentType } from '@/types/prisma'

// 폼 스키마
const tournamentSchema = z.object({
  name: z.string().min(2, '토너먼트 이름은 2자 이상이어야 합니다'),
  description: z.string().min(10, '설명은 10자 이상이어야 합니다'),
  longDescription: z.string().optional(),
  type: z.enum(['REGULAR', 'SPECIAL', 'TURBO']),
  startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
  startTime: z.string().min(1, '시작 시간을 선택해주세요'),
  location: z.string().min(2, '장소를 입력해주세요'),
  buyIn: z.string().transform((val) => parseInt(val)).refine((val) => val >= 10000, {
    message: '바이인은 10,000원 이상이어야 합니다',
  }),
  guaranteedPrize: z.string().transform((val) => parseInt(val)).optional(),
  maxPlayers: z.string().transform((val) => parseInt(val)).refine((val) => val >= 2, {
    message: '최대 참가자는 2명 이상이어야 합니다',
  }),
  startingStack: z.string().transform((val) => parseInt(val)).refine((val) => val >= 1000, {
    message: '시작 스택은 1,000 이상이어야 합니다',
  }),
  blindLevels: z.string().transform((val) => parseInt(val)).refine((val) => val >= 5, {
    message: '블라인드 레벨은 5분 이상이어야 합니다',
  }),
  lateRegistration: z.string().transform((val) => parseInt(val)),
  reEntry: z.boolean(),
  maxReEntries: z.string().transform((val) => parseInt(val)).optional(),
})

type TournamentFormData = z.infer<typeof tournamentSchema>

export default function CreateTournamentPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [allowReEntry, setAllowReEntry] = useState(false)

  const {
    register,
    handleSubmit,
    formState: { errors },
    setValue,
    watch,
  } = useForm<TournamentFormData>({
    resolver: zodResolver(tournamentSchema),
    defaultValues: {
      type: 'REGULAR',
      buyIn: '50000',
      maxPlayers: '50',
      startingStack: '30000',
      blindLevels: '20',
      lateRegistration: '4',
      reEntry: false,
      maxReEntries: '2',
    },
  })

  const onSubmit = async (data: TournamentFormData) => {
    setIsSubmitting(true)

    try {
      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 1000))

      toast({
        title: '토너먼트 생성 완료',
        description: '새로운 토너먼트가 성공적으로 생성되었습니다.',
      })

      router.push('/admin/tournaments')
    } catch (error) {
      toast({
        title: '오류 발생',
        description: '토너먼트 생성 중 오류가 발생했습니다.',
        variant: 'destructive',
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // 오늘 날짜 가져오기 (최소 날짜 설정용)
  const today = new Date().toISOString().split('T')[0]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">토너먼트 생성</h1>
        <p className="text-muted-foreground mt-2">
          새로운 토너먼트를 생성하고 설정을 구성하세요.
        </p>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
        {/* 기본 정보 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">기본 정보</h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="name">토너먼트 이름 *</Label>
                <Input
                  id="name"
                  {...register('name')}
                  placeholder="예: 주말 홀덤 토너먼트"
                />
                {errors.name && (
                  <p className="text-sm text-destructive mt-1">{errors.name.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="type">토너먼트 유형 *</Label>
                <Select
                  defaultValue="REGULAR"
                  onValueChange={(value) => setValue('type', value as TournamentType)}
                >
                  <SelectTrigger id="type">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="REGULAR">일반</SelectItem>
                    <SelectItem value="SPECIAL">스페셜</SelectItem>
                    <SelectItem value="TURBO">터보</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label htmlFor="description">간단한 설명 *</Label>
              <Input
                id="description"
                {...register('description')}
                placeholder="토너먼트에 대한 간단한 설명"
              />
              {errors.description && (
                <p className="text-sm text-destructive mt-1">{errors.description.message}</p>
              )}
            </div>

            <div>
              <Label htmlFor="longDescription">상세 설명</Label>
              <Textarea
                id="longDescription"
                {...register('longDescription')}
                placeholder="토너먼트에 대한 상세한 설명 (선택사항)"
                rows={4}
              />
            </div>
          </div>
        </Card>

        {/* 일정 및 장소 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">일정 및 장소</h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="startDate">시작 날짜 *</Label>
                <Input
                  id="startDate"
                  type="date"
                  {...register('startDate')}
                  min={today}
                />
                {errors.startDate && (
                  <p className="text-sm text-destructive mt-1">{errors.startDate.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="startTime">시작 시간 *</Label>
                <Input
                  id="startTime"
                  type="time"
                  {...register('startTime')}
                />
                {errors.startTime && (
                  <p className="text-sm text-destructive mt-1">{errors.startTime.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="location">장소 *</Label>
                <Input
                  id="location"
                  {...register('location')}
                  placeholder="예: 강남 홀덤 라운지"
                />
                {errors.location && (
                  <p className="text-sm text-destructive mt-1">{errors.location.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 참가 설정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">참가 설정</h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-3 gap-4">
              <div>
                <Label htmlFor="buyIn">바이인 (원) *</Label>
                <Input
                  id="buyIn"
                  type="number"
                  {...register('buyIn')}
                  placeholder="50000"
                  step="1000"
                />
                {errors.buyIn && (
                  <p className="text-sm text-destructive mt-1">{errors.buyIn.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="guaranteedPrize">보장 상금 (원)</Label>
                <Input
                  id="guaranteedPrize"
                  type="number"
                  {...register('guaranteedPrize')}
                  placeholder="1000000"
                  step="10000"
                />
              </div>
              
              <div>
                <Label htmlFor="maxPlayers">최대 참가자 수 *</Label>
                <Input
                  id="maxPlayers"
                  type="number"
                  {...register('maxPlayers')}
                  placeholder="50"
                />
                {errors.maxPlayers && (
                  <p className="text-sm text-destructive mt-1">{errors.maxPlayers.message}</p>
                )}
              </div>
            </div>
          </div>
        </Card>

        {/* 게임 구조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">게임 구조</h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="startingStack">시작 스택 *</Label>
                <Input
                  id="startingStack"
                  type="number"
                  {...register('startingStack')}
                  placeholder="30000"
                  step="1000"
                />
                {errors.startingStack && (
                  <p className="text-sm text-destructive mt-1">{errors.startingStack.message}</p>
                )}
              </div>
              
              <div>
                <Label htmlFor="blindLevels">블라인드 레벨 (분) *</Label>
                <Input
                  id="blindLevels"
                  type="number"
                  {...register('blindLevels')}
                  placeholder="20"
                />
                {errors.blindLevels && (
                  <p className="text-sm text-destructive mt-1">{errors.blindLevels.message}</p>
                )}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="lateRegistration">레이트 등록 (레벨)</Label>
                <Input
                  id="lateRegistration"
                  type="number"
                  {...register('lateRegistration')}
                  placeholder="4"
                />
              </div>
              
              <div>
                <Label>리엔트리 허용</Label>
                <Select
                  onValueChange={(value) => {
                    const allowed = value === 'true'
                    setAllowReEntry(allowed)
                    setValue('reEntry', allowed)
                  }}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="선택하세요" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="false">불가</SelectItem>
                    <SelectItem value="true">가능</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {allowReEntry && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="maxReEntries">최대 리엔트리 횟수</Label>
                  <Input
                    id="maxReEntries"
                    type="number"
                    {...register('maxReEntries')}
                    placeholder="2"
                  />
                </div>
              </div>
            )}
          </div>
        </Card>

        {/* 액션 버튼 */}
        <div className="flex justify-end gap-4">
          <Button
            type="button"
            variant="outline"
            onClick={() => router.back()}
            disabled={isSubmitting}
          >
            취소
          </Button>
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? (
              '생성 중...'
            ) : (
              <>
                <Trophy className="h-4 w-4 mr-2" />
                토너먼트 생성
              </>
            )}
          </Button>
        </div>
      </form>
    </div>
  )
}
