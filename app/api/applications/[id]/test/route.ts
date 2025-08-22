import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id: applicationId } = params
    const { answers } = await request.json()

    // 1. Récupérer la candidature et le test associé
    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        test: true,
        jobOffer: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: true,
          },
        },
        candidate: {
          include: {
            cvAnalyses: {
              orderBy: { createdAt: "desc" },
              take: 1,
            },
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 })
    }
    if (application.candidateId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    if (!application.test) {
      return NextResponse.json({ error: "Aucun test associé à cette candidature" }, { status: 400 })
    }
    if (application.test.status === "COMPLETED") {
      return NextResponse.json({ error: "Test déjà complété - une seule tentative autorisée" }, { status: 400 })
    }

    // 2. Valider les réponses et calculer le score
    const generatedQuestions = application.test.questions as any[] // Cast to any[] because it's JSONB
    let correctAnswersCount = 0
    const detailedResults = generatedQuestions.map((q, index) => {
      const userAnswer = answers[index]
      const isCorrect = userAnswer === q.correctAnswer
      if (isCorrect) {
        correctAnswersCount++
      }
      return {
        question: q.question,
        userAnswer: userAnswer,
        correctAnswer: q.correctAnswer,
        isCorrect: isCorrect,
        explanation: q.explanation,
      }
    })

    const totalQuestions = generatedQuestions.length
    const testScore = totalQuestions > 0 ? (correctAnswersCount / totalQuestions) * 100 : 0

    // 3. Mettre à jour le statut du test et le score
    await prisma.test.update({
      where: { id: application.test.id },
      data: {
        status: "COMPLETED",
        score: testScore,
        completedAt: new Date(),
        testAnswers: detailedResults,
      },
    })

    // 4. Mettre à jour le statut de la candidature en fonction du score du test
    let newApplicationStatus: "PENDING" | "ACCEPTED" | "REJECTED" = "PENDING"
    if (testScore >= 60) {
      newApplicationStatus = "ACCEPTED"
    } else {
      newApplicationStatus = "REJECTED"
    }

    const updatedApplication = await prisma.application.update({
      where: { id: applicationId },
      data: {
        status: newApplicationStatus,
        updatedAt: new Date(),
      },
      include: {
        test: true,
        jobOffer: true,
        candidate: true,
      },
    })

    console.log(`✅ Test pour candidature ${applicationId} complété. Score: ${testScore.toFixed(2)}%`)
    console.log(`✅ Statut candidature mis à jour: ${newApplicationStatus}`)

    return NextResponse.json({
      message: "Test complété avec succès",
      score: Math.round(testScore), // Round to integer for display
      status: newApplicationStatus,
      correctAnswers: correctAnswersCount,
      totalQuestions: totalQuestions,
      detailedResults: detailedResults,
      application: updatedApplication,
    })
  } catch (error) {
    console.error("Erreur lors de la soumission du test:", error)
    return NextResponse.json({ error: "Erreur serveur lors de la soumission du test" }, { status: 500 })
  }
}

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id: applicationId } = params

    const application = await prisma.application.findUnique({
      where: { id: applicationId },
      include: {
        test: true,
        jobOffer: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: true,
          },
        },
      },
    })

    if (!application) {
      return NextResponse.json({ error: "Candidature non trouvée" }, { status: 404 })
    }
    if (application.candidateId !== session.user.id) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }
    if (!application.test) {
      return NextResponse.json({ error: "Aucun test associé à cette candidature" }, { status: 404 })
    }

    return NextResponse.json(application.test)
  } catch (error) {
    console.error("Erreur lors de la récupération du test:", error)
    return NextResponse.json({ error: "Erreur serveur lors de la récupération du test" }, { status: 500 })
  }
}
