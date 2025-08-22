import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await params

    // Vérifier que l'utilisateur a accès à cette offre
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        company: {
          include: {
            managers: {
              where: {
                userId: session.user.id,
              },
            },
          },
        },
        createdBy: {
          select: {
            id: true,
          },
        },
      },
    })

    if (!jobOffer) {
      return NextResponse.json({ error: "Offre d'emploi non trouvée" }, { status: 404 })
    }

    // Vérifier les permissions
    const hasAccess =
      (session.user.role === "CEO" && jobOffer.company.managers.length > 0) ||
      (session.user.role === "RECRUITER" && jobOffer.createdBy.id === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Récupérer les candidatures avec les CV
    const applications = await prisma.application.findMany({
      where: { jobOfferId: id },
      include: {
        candidate: {
          select: {
            id: true,
            name: true,
            email: true,
            cvAnalyses: {
              orderBy: {
                createdAt: "desc",
              },
              take: 1,
              select: {
                score: true,
              },
            },
          },
        },
      },
    })

    // Calculer les statistiques
    const totalApplications = applications.length
    const acceptedApplications = applications.filter((app) => app.status === "ACCEPTED").length
    const rejectedApplications = applications.filter((app) => app.status === "REJECTED").length
    const pendingApplications = applications.filter((app) => app.status === "PENDING").length

    // Calculer les moyennes des scores CV
    const applicationsWithCV = applications.filter((app) => app.candidate.cvAnalyses.length > 0)
    const avgCVScore =
      applicationsWithCV.length > 0
        ? Math.round(
            applicationsWithCV.reduce((sum, app) => sum + (app.candidate.cvAnalyses[0]?.score || 0), 0) /
              applicationsWithCV.length,
          )
        : 0

    // Pas de tests dans ce schéma, donc score de test à 0
    const avgTestScore = 0

    // Taux de réussite
    const successRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0

    // Top candidats par score CV
    const topCandidates = applications
      .filter((app) => app.candidate.cvAnalyses.length > 0)
      .map((app) => ({
        id: app.id,
        score: app.candidate.cvAnalyses[0]?.score || 0,
        testScore: null,
        cvPath: null,
        candidate: app.candidate,
      }))
      .sort((a, b) => b.score - a.score)
      .slice(0, 5)

    const stats = {
      totalApplications,
      acceptedApplications,
      rejectedApplications,
      pendingApplications,
      avgCVScore,
      avgTestScore,
      successRate,
      topCandidates,
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
