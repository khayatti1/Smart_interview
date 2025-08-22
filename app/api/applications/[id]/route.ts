import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      jobOffer: {
        include: {
          company: true,
        },
      },
      candidate: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  })

  if (!application) {
    return new NextResponse("Candidature non trouvée", { status: 404 })
  }

  // Vérifier les permissions
  if (session.user.role === "CANDIDATE" && application.candidateId !== session.user.id) {
    return new NextResponse("Accès refusé", { status: 403 })
  }

  // Correction: utiliser createdById au lieu de recruiterId
  if (session.user.role === "RECRUITER" && application.jobOffer.createdById !== session.user.id) {
    return new NextResponse("Accès refusé", { status: 403 })
  }

  return NextResponse.json(application)
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const session = await getServerSession(authOptions)
  const { status } = await request.json()

  if (!session?.user || session.user.role !== "RECRUITER") {
    return new NextResponse("Non autorisé", { status: 401 })
  }

  const application = await prisma.application.findUnique({
    where: { id },
    include: {
      jobOffer: true,
    },
  })

  // Correction: utiliser createdById au lieu de recruiterId
  if (!application || application.jobOffer.createdById !== session.user.id) {
    return new NextResponse("Candidature non trouvée ou accès refusé", { status: 404 })
  }

  const updatedApplication = await prisma.application.update({
    where: { id },
    data: { status },
  })

  return NextResponse.json(updatedApplication)
}
