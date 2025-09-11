import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'

export async function GET() {
  try {
    const supabase = createClient()
    
    // 활성화된 가격 정책 조회
    const { data: pricing, error } = await supabase
      .from('VoucherPricing')
      .select('*')
      .eq('isActive', true)
      .order('type', { ascending: true })
      .order('memberGrade', { ascending: true })

    if (error) {
      console.error('Error fetching pricing:', error)
      throw error
    }

    // 등급별로 정리
    const priceByGrade = {
      GUEST: {
        BUYIN: 0,
        REBUY: 0,
      },
      REGULAR: {
        BUYIN: 0,
        REBUY: 0,
      },
    }

    if (pricing) {
      pricing.forEach((price) => {
        if (price.memberGrade === 'GUEST' || price.memberGrade === 'REGULAR') {
          priceByGrade[price.memberGrade][price.type] = price.price
        }
      })
    }

    return NextResponse.json({
      pricing: priceByGrade,
      lastUpdated: pricing?.[0]?.updatedAt || new Date(),
    })
  } catch (error) {
    console.error('Error fetching public pricing:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}