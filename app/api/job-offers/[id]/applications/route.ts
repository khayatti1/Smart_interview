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

    // Récupérer les candidatures avec les informations CV et les tests
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
                id: true,
                fileName: true,
                filePath: true,
                analysis: true,
                score: true,
                createdAt: true,
              },
            },
          },
        },
        test: {
          select: {
            id: true,
            score: true,
            completedAt: true,
            testAnswers: true,
          },
        },
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
        createdAt: "desc",
      },
    })

    // Formater les données pour l'affichage
    const formattedApplications = applications.map((app) => {
      const latestCV = app.candidate.cvAnalyses[0]

      return {
        id: app.id,
        status: app.status,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        score: app.cvScore || latestCV?.score || null, // Use contextual score first, fallback to general CV score
        testScore: app.test?.score || null,
        cvPath: latestCV?.filePath || null,
        cvFileName: latestCV?.fileName || null,
        candidate: {
          id: app.candidate.id,
          name: app.candidate.name,
          email: app.candidate.email,
        },
        jobOffer: {
          title: app.jobOffer.title,
          company: {
            name: app.jobOffer.company.name,
          },
        },
        test: app.test
          ? {
              id: app.test.id,
              score: app.test.score,
              completedAt: app.test.completedAt,
            }
          : null,
      }
    })

    return NextResponse.json(formattedApplications)
  } catch (error) {
    console.error("Erreur lors de la récupération des candidatures:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
