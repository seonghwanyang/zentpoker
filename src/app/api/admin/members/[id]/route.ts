import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/auth-options';
import { prisma } from '@/lib/prisma';
import { Role, MemberGrade, UserStatus } from '@prisma/client';

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const member = await prisma.user.findUnique({
      where: { id: params.id },
      include: {
        transactions: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        vouchers: {
          orderBy: { createdAt: 'desc' },
          take: 10,
        },
        _count: {
          select: {
            transactions: true,
            vouchers: true,
          },
        },
      },
    });

    if (!member) {
      return NextResponse.json({ error: 'Member not found' }, { status: 404 });
    }

    return NextResponse.json(member);
  } catch (error) {
    console.error('Error fetching member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
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

    const body = await request.json();
    const { name, phone, grade, status, role } = body;

    // 입력값 검증
    if (grade && !Object.values(MemberGrade).includes(grade)) {
      return NextResponse.json({ error: 'Invalid grade' }, { status: 400 });
    }

    if (status && !Object.values(UserStatus).includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    if (role && !Object.values(Role).includes(role)) {
      return NextResponse.json({ error: 'Invalid role' }, { status: 400 });
    }

    const updatedMember = await prisma.user.update({
      where: { id: params.id },
      data: {
        ...(name && { name }),
        ...(phone && { phone }),
        ...(grade && { grade }),
        ...(status && { status }),
        ...(role && { role }),
      },
    });

    return NextResponse.json(updatedMember);
  } catch (error) {
    console.error('Error updating member:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
