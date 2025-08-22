import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import prisma from '@/lib/prisma';

// Route pour un candidat pour récupérer ses propres candidatures
export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== 'CANDIDATE') {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const applications = await prisma.application.findMany({
      where: {
        candidateId: session.user.id,
      },
      include: {
        jobOffer: {
          select: {
            title: true,
            company: {
              select: {
                name: true,
              },
            },
          },
        },
      },
      orderBy: {
        id: 'desc',
      },
    });
    return NextResponse.json(applications);
  } catch (error) {
    console.error("GET_APPLICATIONS_ERROR", error);
    return new NextResponse('Internal Server Error', { status: 500 });
  }
}
