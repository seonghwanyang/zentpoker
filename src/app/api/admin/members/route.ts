import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { Role } from '@prisma/client';

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 관리자 권한 확인
    const admin = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { role: true },
    });

    if (!admin || admin.role !== Role.ADMIN) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search');
    const grade = searchParams.get('grade');
    const status = searchParams.get('status');

    // 검색 조건 구성
    const where: any = {};
    
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } },
      ];
    }
    
    if (grade) where.grade = grade;
    if (status) where.status = status;

    // 전체 회원 수
    const total = await prisma.user.count({ where });

    // 회원 목록 조회
    const members = await prisma.user.findMany({
      where,
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        role: true,
        grade: true,
        status: true,
        points: true,
        createdAt: true,
        lastLoginAt: true,
        _count: {
          select: {
            transactions: true,
            vouchers: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    });

    // 통계 정보
    const stats = await prisma.user.groupBy({
      by: ['grade'],
      _count: true,
    });

    const gradeStats = {
      GUEST: 0,
      REGULAR: 0,
      ADMIN: 0,
    };

    stats.forEach((stat) => {
      gradeStats[stat.grade] = stat._count;
    });

    return NextResponse.json({
      members: members.map((member) => ({
        ...member,
        transactionCount: member._count.transactions,
        voucherCount: member._count.vouchers,
      })),
      pagination: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
      stats: gradeStats,
    });
  } catch (error) {
    console.error('Error fetching members:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
