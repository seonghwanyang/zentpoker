import { create } from 'zustand'

interface Tournament {
  id: string
  title?: string
  name?: string  
  type?: 'REGULAR' | 'SPECIAL' | 'TURBO'
  startDate: string
  endDate?: string | null
  location: string
  buyinRequired?: number
  buyIn?: number
  guaranteedPrize?: number
  maxEntries?: number | null
  maxPlayers?: number
  currentPlayers?: number
  participantCount?: number
  status: 'UPCOMING' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED' | 'ACTIVE'
  description?: string
  rebuyAllowed?: boolean
}

interface TournamentStore {
  tournaments: Tournament[]
  isLoading: boolean
  fetchTournaments: () => Promise<void>
  addTournament: (tournament: Tournament) => void
  updateTournament: (id: string, tournament: Partial<Tournament>) => void
  deleteTournament: (id: string) => void
  updateTournamentStatuses: () => void
}

// 토너먼트 상태를 시간에 따라 자동 업데이트하는 함수
// currentTime을 파라미터로 받아서 서버/클라이언트 일관성 보장
const getTournamentStatus = (status: string, startDate: string, currentTime?: number): Tournament['status'] => {
  // API에서 받은 상태를 우선적으로 사용
  if (status === 'ACTIVE') return 'IN_PROGRESS'
  if (status === 'CANCELLED') return 'CANCELLED'
  
  // 시간 기반 상태 체크 (fallback)
  // currentTime이 없으면 서버에서 실행중이므로 현재 시간 사용
  const now = currentTime ? new Date(currentTime) : new Date()
  const start = new Date(startDate)
  const end = new Date(start.getTime() + 4 * 60 * 60 * 1000) // 4시간 후 종료 가정
  
  if (now < start) return 'UPCOMING'
  if (now >= start && now < end) return 'IN_PROGRESS'
  return 'COMPLETED'
}

// 초기 데이터는 이제 API에서 가져옴
const initialTournaments: Tournament[] = []

export const useTournamentStore = create<TournamentStore>((set, get) => ({
  tournaments: initialTournaments,
  isLoading: false,
  
  // API에서 토너먼트 목록 가져오기
  fetchTournaments: async () => {
    set({ isLoading: true });
    try {
      const response = await fetch('/api/tournaments/list');
      if (!response.ok) {
        throw new Error('Failed to fetch tournaments');
      }
      
      const data = await response.json();
      const tournamentsWithStatus = data.tournaments.map((t: any) => ({
        ...t,
        // API 데이터 필드 매핑
        name: t.title || t.name || 'Unnamed Tournament',
        currentPlayers: t.participantCount || 0,
        maxPlayers: t.maxEntries || 100,
        buyIn: t.buyinRequired || 1,
        status: getTournamentStatus(t.status, t.startDate, typeof window !== 'undefined' ? Date.now() : undefined)
      }));
      set({ tournaments: tournamentsWithStatus || [] });
    } catch (error) {
      console.error('Error fetching tournaments:', error);
      // 에러 발생 시 빈 배열로 설정
      set({ tournaments: [] });
    } finally {
      set({ isLoading: false });
    }
  },
  
  addTournament: (tournament) =>
    set((state) => ({
      tournaments: [...state.tournaments, {
        ...tournament,
        status: getTournamentStatus(tournament.status, tournament.startDate, typeof window !== 'undefined' ? Date.now() : undefined)
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
        status: getTournamentStatus(t.status, t.startDate, typeof window !== 'undefined' ? Date.now() : undefined)
      })),
    })),
}))

// Interval은 컴포넌트에서 useEffect로 설정해야 함
// 모듈 레벨에서 side effect를 일으키면 hydration 문제 발생
// 사용 예시:
// useEffect(() => {
//   const interval = setInterval(() => {
//     useTournamentStore.getState().updateTournamentStatuses()
//   }, 60000)
//   return () => clearInterval(interval)
// }, [])
