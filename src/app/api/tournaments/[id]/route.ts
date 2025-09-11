import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    
    // 토너먼트 상세 정보 조회
    const { data: tournament, error: tournamentError } = await supabase
      .from('Tournament')
      .select(`
        *,
        TournamentEntry (
          id,
          userId,
          buyinCount,
          rebuyCount,
          createdAt,
          User (
            id,
            name,
            email,
            image
          )
        )
      `)
      .eq('id', params.id)
      .single()

    if (tournamentError) {
      console.error('Tournament fetch error:', tournamentError)
      return NextResponse.json(
        { error: 'Failed to fetch tournament' },
        { status: 404 }
      )
    }

    // 현재 참가자 수 계산
    const currentPlayers = tournament.TournamentEntry?.length || 0

    // 상금 구조 파싱 - 기본값 사용 (DB에 필드가 없음)
    const prizeStructure = [
      { place: 1, percentage: 40 },
      { place: 2, percentage: 25 },
      { place: 3, percentage: 15 },
      { place: 4, percentage: 10 },
      { place: 5, percentage: 10 },
    ]

    // 대회 구조 - 기본값 사용 (DB에 필드가 없음)
    const structure = {
      startingStack: 30000,
      blindLevels: 20,
      lateRegistration: 4,
      reEntry: tournament.rebuyAllowed || true,
      maxReEntries: 2,
    }

    // 응답 데이터 구성
    const responseData = {
      id: tournament.id,
      name: tournament.name || tournament.title,
      description: tournament.description || tournament.title || '',
      longDescription: tournament.description || `${tournament.title}\n\n토너먼트에 참가하시려면 바인권이 필요합니다.`,
      startDate: tournament.startDate,
      endDate: tournament.endDate,
      location: tournament.location || '신림 잼스 홀덤펍',
      buyIn: tournament.buyinRequired === 1 ? 50000 : tournament.buyinRequired * 50000, // 바인권 1개 = 50000원 기준
      guaranteedPrize: 1000000, // 기본 보장 상금
      currentPlayers,
      maxPlayers: tournament.maxEntries || 50,
      status: tournament.status,
      type: tournament.type || 'REGULAR',
      structure,
      prizeStructure,
      registeredPlayers: tournament.TournamentEntry?.map((entry: any) => ({
        id: entry.User?.id,
        name: entry.User?.name || 'Unknown',
        email: entry.User?.email,
        image: entry.User?.image,
        status: 'CONFIRMED', // TournamentEntry에는 status가 없으므로 기본값
        registeredAt: entry.createdAt
      })) || []
    }

    return NextResponse.json(responseData)
  } catch (error) {
    console.error('Tournament API error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

// 토너먼트 참가 신청
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const supabase = createClient()
    const body = await request.json()
    const { voucherId } = body

    // 현재 사용자 확인
    const { data: { user }, error: userError } = await supabase.auth.getUser()
    
    if (userError || !user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // 바인권 확인 및 사용
    const { data: voucher, error: voucherError } = await supabase
      .from('Voucher')
      .select('*')
      .eq('id', voucherId)
      .eq('userId', user.id)
      .eq('status', 'ACTIVE')
      .single()

    if (voucherError || !voucher) {
      return NextResponse.json(
        { error: 'Invalid or expired voucher' },
        { status: 400 }
      )
    }

    // 중복 참가 확인
    const { data: existingEntry } = await supabase
      .from('TournamentEntry')
      .select('id')
      .eq('tournamentId', params.id)
      .eq('userId', user.id)
      .single()

    if (existingEntry) {
      return NextResponse.json(
        { error: 'Already registered for this tournament' },
        { status: 400 }
      )
    }

    // 토너먼트 참가 등록
    const { data: participant, error: participantError } = await supabase
      .from('TournamentEntry')
      .insert({
        id: crypto.randomUUID(),
        tournamentId: params.id,
        userId: user.id,
        buyinCount: 1,
        rebuyCount: 0,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })
      .select()
      .single()

    if (participantError) {
      console.error('Participant registration error:', participantError)
      return NextResponse.json(
        { error: 'Failed to register for tournament' },
        { status: 400 }
      )
    }

    // 바인권 사용 처리
    await supabase
      .from('Voucher')
      .update({ 
        status: 'USED',
        usedAt: new Date().toISOString(),
        tournamentId: params.id
      })
      .eq('id', voucherId)

    return NextResponse.json({
      success: true,
      participant
    })
  } catch (error) {
    console.error('Tournament registration error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}