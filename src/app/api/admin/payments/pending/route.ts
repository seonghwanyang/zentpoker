import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function GET(request: NextRequest) {
  try {
    const user = await getApiUser()
    
    if (!user?.email) {
      return unauthorizedResponse()
    }

    // Check admin role
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('role')
      .eq('email', user.email)
      .single()

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    // Fetch pending payment confirmations
    const pendingPayments = await prisma.transaction.findMany({
      where: {
        type: TransactionType.CHARGE,
        status: TransactionStatus.PENDING
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            email: true
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      }
    })

    // Format the response
    const formattedPayments = pendingPayments.map(payment => {
      const metadata = payment.metadata as any || {}
      return {
        id: payment.id,
        userId: payment.userId,
        userName: payment.user.name || 'Unknown',
        userEmail: payment.user.email,
        amount: payment.amount,
        referenceCode: metadata.referenceCode || `ZP-${payment.id}`,
        paymentMethod: metadata.paymentMethod || 'BANK',
        requestedAt: payment.createdAt.toISOString(),
        status: payment.status,
        memo: payment.description || ''
      }
    })

    // Calculate statistics
    const stats = {
      totalCount: formattedPayments.length,
      totalAmount: formattedPayments.reduce((sum, p) => sum + p.amount, 0),
      averageWaitTime: calculateAverageWaitTime(pendingPayments)
    }

    return NextResponse.json({
      payments: formattedPayments,
      stats
    })
  } catch (error) {
    console.error('Error fetching pending payments:', error)
    return NextResponse.json(
      { error: 'Failed to fetch pending payments' },
      { status: 500 }
    )
  }
}

function calculateAverageWaitTime(payments: any[]): number {
  if (payments.length === 0) return 0
  
  const now = new Date()
  const totalMinutes = payments.reduce((sum, payment) => {
    const diff = now.getTime() - payment.createdAt.getTime()
    return sum + Math.floor(diff / 60000)
  }, 0)
  
  return Math.floor(totalMinutes / payments.length)
}