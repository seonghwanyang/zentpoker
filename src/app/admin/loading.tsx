import { Card } from '@/components/ui/card'

export default function AdminLoading() {
  return (
    <div className="space-y-6">
      {/* 헤더 스켈레톤 */}
      <div className="flex items-center justify-between">
        <div className="space-y-2">
          <div className="h-8 w-48 bg-muted rounded animate-pulse" />
          <div className="h-4 w-72 bg-muted rounded animate-pulse" />
        </div>
        <div className="h-10 w-32 bg-muted rounded animate-pulse" />
      </div>

      {/* 통계 카드 스켈레톤 */}
      <div className="grid gap-4 md:grid-cols-3">
        {[1, 2, 3].map((i) => (
          <Card key={i} className="p-6">
            <div className="flex items-center justify-between">
              <div className="space-y-2">
                <div className="h-4 w-24 bg-muted rounded animate-pulse" />
                <div className="h-8 w-32 bg-muted rounded animate-pulse" />
              </div>
              <div className="h-10 w-10 bg-muted rounded-full animate-pulse" />
            </div>
          </Card>
        ))}
      </div>

      {/* 테이블 스켈레톤 */}
      <Card className="p-0">
        <div className="p-6 space-y-4">
          {/* 테이블 헤더 */}
          <div className="h-10 bg-muted rounded animate-pulse" />
          
          {/* 테이블 로우 */}
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="h-16 bg-muted rounded animate-pulse" />
            ))}
          </div>
        </div>
      </Card>
    </div>
  )
}
