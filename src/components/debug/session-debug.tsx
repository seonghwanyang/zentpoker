'use client'

import { useEffect, useState } from 'react'
import { createClientComponentClient } from '@supabase/auth-helpers-nextjs'
import { Card } from '@/components/ui/card'

export function SessionDebug() {
  const [user, setUser] = useState<any>(null)
  const supabase = createClientComponentClient()

  useEffect(() => {
    const getUser = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        setUser(user)
      } catch (error) {
        console.error('Error getting user:', error)
      }
    }

    getUser()
  }, [supabase])

  if (!user) return null

  return (
    <Card className="p-4 m-4 bg-gray-100 dark:bg-gray-800">
      <h3 className="font-bold mb-2">사용자 정보 (디버그용)</h3>
      <pre className="text-xs overflow-auto">
        {JSON.stringify(user, null, 2)}
      </pre>
    </Card>
  )
}
