'use client'

import { useSession } from 'next-auth/react'
import { Card } from '@/components/ui/card'

export function SessionDebug() {
  const { data: session } = useSession()

  if (!session) return null

  return (
    <Card className="p-4 m-4 bg-gray-100 dark:bg-gray-800">
      <h3 className="font-bold mb-2">세션 정보 (디버그용)</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(session, null, 2)}
      </pre>
    </Card>
  )
}
