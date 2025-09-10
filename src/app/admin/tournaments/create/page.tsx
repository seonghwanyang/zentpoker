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
import { useTournamentStore } from '@/stores/tournament-store'
import { CalendarIcon, Save, Trophy } from 'lucide-react'

// 폼 스키마
const tournamentSchema = z.object({
  name: z.string().min(2, '토너먼트 이름은 2자 이상이어야 합니다'),
  longDescription: z.string().optional(),
  startDate: z.string().min(1, '시작 날짜를 선택해주세요'),
  startTime: z.string().min(1, '시작 시간을 선택해주세요'),
  lateRegistration: z.string().transform((val) => parseInt(val)),
  reEntry: z.boolean(),
  maxReEntries: z.string().transform((val) => parseInt(val)).optional(),
})

type TournamentFormData = z.infer<typeof tournamentSchema>

export default function CreateTournamentPage() {
  const router = useRouter()
  const addTournament = useTournamentStore((state) => state.addTournament)
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
      lateRegistration: '4',
      reEntry: false,
      maxReEntries: '2',
    },
  })

  const onSubmit = async (data: TournamentFormData) => {
    setIsSubmitting(true)

    try {
      // 토너먼트 데이터 생성
      const newTournament = {
        id: Date.now().toString(),
        name: data.name,
        type: 'REGULAR',
        startDate: `${data.startDate}T${data.startTime}:00`,
        location: '온라인',
        buyIn: 50000,
        guaranteedPrize: 0,
        maxPlayers: 50,
        currentPlayers: 0,
        status: 'UPCOMING' as const,
      }

      // 스토어에 추가
      addTournament(newTournament)

      // API 호출 시뮬레이션
      await new Promise(resolve => setTimeout(resolve, 500))

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

        {/* 일정 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">일정</h2>
          
          <div className="grid gap-4">
            <div className="grid grid-cols-2 gap-4">
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
            </div>
          </div>
        </Card>



        {/* 게임 구조 */}
        <Card className="p-6">
          <h2 className="text-xl font-semibold mb-4">게임 구조</h2>
          
          <div className="grid gap-4">
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
