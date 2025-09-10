export default function Loading() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center space-y-4">
        {/* 로딩 애니메이션 */}
        <div className="relative">
          <div className="w-20 h-20 rounded-full border-4 border-purple-200 animate-pulse" />
          <div className="absolute inset-0 w-20 h-20 rounded-full border-4 border-purple-600 border-t-transparent animate-spin" />
        </div>
        
        {/* 로딩 텍스트 */}
        <p className="text-lg font-medium text-muted-foreground animate-pulse">
          로딩 중...
        </p>
      </div>
    </div>
  )
}
