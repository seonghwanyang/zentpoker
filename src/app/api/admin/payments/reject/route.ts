import { NextRequest, NextResponse } from 'next/server'
import { getApiUser, unauthorizedResponse, forbiddenResponse } from '@/lib/auth/api-auth'
import { supabaseAdmin } from '@/lib/supabase'

export async function POST(request: NextRequest) {
  try {
    const user = await getApiUser()
    
    if (!user?.email) {
      return unauthorizedResponse()
    }

    // Check admin role
    const { data: admin, error: adminError } = await supabaseAdmin
      .from('User')
      .select('id, role, name')
      .eq('email', user.email)
      .single()

    if (adminError || !admin || admin.role !== 'ADMIN') {
      return forbiddenResponse()
    }

    const body = await request.json()
    const { transactionId, reason } = body

    if (!transactionId || !reason) {
      return NextResponse.json(
        { error: 'Transaction ID and reason are required' },
        { status: 400 }
      )
    }

    // Start a transaction to ensure data consistency
    const result = await prisma.$transaction(async (tx) => {
      // Find the transaction
      const transaction = await tx.transaction.findUnique({
        where: { id: transactionId },
        include: { user: true },
      })

      if (!transaction) {
        throw new Error('Transaction not found')
      }

      if (transaction.type !== TransactionType.CHARGE || 
          transaction.status !== TransactionStatus.PENDING) {
        throw new Error('Invalid transaction status')
      }

      // Update transaction status to CANCELLED
      await tx.transaction.update({
        where: { id: transactionId },
        data: {
          status: TransactionStatus.CANCELLED,
          metadata: {
            ...(transaction.metadata as any),
            rejectedBy: admin.name,
            rejectedAt: new Date().toISOString(),
            rejectReason: reason,
          },
        },
      })

      return transaction
    })

    return NextResponse.json({
      success: true,
      transaction: result
    })
  } catch (error) {
    console.error('Error rejecting payment:', error)
    return NextResponse.json(
      { error: 'Failed to reject payment' },
      { status: 500 }
    )
  }
}