import { create } from 'zustand'

interface Tournament {
  id: string
  name: string
  type: 'REGULAR' | 'SPECIAL' | 'TURBO'
  startDate: string
  location: string
  buyIn: number
  guaranteedPrize: number
  maxPlayers: number
  currentPlayers: number
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED'
}

interface TournamentStore {
  tournaments: Tournament[]
  addTournament: (tournament: Tournament) => void
  updateTournament: (id: string, tournament: Partial<Tournament>) => void
  deleteTournament: (id: string) => void
  updateTournamentStatuses: () => void
}

// 토너먼트 상태를 시간에 따라 자동 업데이트하는 함수
const getTournamentStatus = (startDate: string): Tournament['status'] => {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000) // 4시간 후 종료 가정
  
  if (now < start) return 'UPCOMING'
  if (now >= start && now < end) return 'IN_PROGRESS'
  return 'COMPLETED'
}

// 초기 데이터
const initialTournaments: Tournament[] = [
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
    currentPlayers: 15,
    status: 'UPCOMING',
  },
  // 테스트용: 현재 진행 중인 토너먼트
  {
    id: 'test-ongoing',
    name: '테스트 진행중 토너먼트',
    type: 'TURBO',
    startDate: new Date(Date.now() - 60 * 60 * 1000).toISOString(), // 1시간 전 시작
    location: '강남 홀덤펍',
    buyIn: 30000,
    guaranteedPrize: 500000,
    maxPlayers: 30,
    currentPlayers: 28,
    status: 'IN_PROGRESS',
  },
  // 테스트용: 이미 완료된 토너먼트
  {
    id: 'test-completed',
    name: '테스트 완료 토너먼트',
    type: 'REGULAR',
    startDate: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6시간 전 시작
    location: '강남 홀덤펍',
    buyIn: 50000,
    guaranteedPrize: 1000000,
    maxPlayers: 40,
    currentPlayers: 40,
    status: 'COMPLETED',
  },
]

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: initialTournaments.map(t => ({
    ...t,
    status: getTournamentStatus(t.startDate)
  })),
  
  addTournament: (tournament) =>
    set((state) => ({
      tournaments: [...state.tournaments, {
        ...tournament,
        status: getTournamentStatus(tournament.startDate)
      }],
    })),
    
  updateTournament: (id, updatedTournament) =>
    set((state) => ({
      tournaments: state.tournaments.map((t) =>
        t.id === id ? { ...t, ...updatedTournament } : t
      ),
    })),
    
  deleteTournament: (id) =>
    set((state) => ({
      tournaments: state.tournaments.filter((t) => t.id !== id),
    })),
    
  // 모든 토너먼트의 상태를 현재 시간 기준으로 업데이트
  updateTournamentStatuses: () =>
    set((state) => ({
      tournaments: state.tournaments.map((t) => ({
        ...t,
        status: getTournamentStatus(t.startDate)
      })),
    })),
}))

// 1분마다 토너먼트 상태 자동 업데이트 (옵션)
if (typeof window !== 'undefined') {
  setInterval(() => {
    useTournamentStore.getState().updateTournamentStatuses()
  }, 60000) // 60초마다
}
