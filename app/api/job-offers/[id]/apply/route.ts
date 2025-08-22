import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { analyzeCVWithOpenAI, generateTechnicalTestWithOpenAI } from "@/lib/openai-service"

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { id } = await params

    // Récupérer l'offre d'emploi
    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        company: true,
      },
    })

    if (!jobOffer) {
      return NextResponse.json({ error: "Offre non trouvée" }, { status: 404 })
    }

    if (!jobOffer.isActive) {
      return NextResponse.json({ error: "Cette offre n'est plus active" }, { status: 400 })
    }

    // Vérifier la date limite
    if (jobOffer.deadline && new Date(jobOffer.deadline) < new Date()) {
      return NextResponse.json({ error: "La date limite de candidature est dépassée" }, { status: 400 })
    }

    // Vérifier si le candidat a déjà postulé
    const existingApplication = await prisma.application.findUnique({
      where: {
        candidateId_jobOfferId: {
          candidateId: session.user.id,
          jobOfferId: id,
        },
      },
    })

    if (existingApplication) {
      return NextResponse.json({ error: "Vous avez déjà postulé à cette offre" }, { status: 400 })
    }

    // Récupérer le CV le plus récent du candidat
    const latestCV = await prisma.cVAnalysis.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
    })

    if (!latestCV) {
      return NextResponse.json({ error: "Aucun CV trouvé. Veuillez d'abord téléverser votre CV." }, { status: 400 })
    }

    console.log(`📋 Candidature de ${session.user.name} pour ${jobOffer.title}`)

    // Préparer le texte du CV pour l'analyse IA
    const cvText = `
CV de ${session.user.name}
Email: ${session.user.email}
Fichier: ${latestCV.fileName}
Analyse précédente: ${latestCV.analysis ? JSON.stringify(latestCV.analysis) : "Première analyse"}
    `.trim()

    // Analyser le CV avec OpenAI selon l'offre spécifique
    const cvAnalysis = await analyzeCVWithOpenAI(cvText, jobOffer.title, jobOffer.description, jobOffer.skills)

    console.log(`📊 Analyse CV terminée - Score: ${cvAnalysis.score}% pour ${jobOffer.title}`)

    // Logique métier: Score ≥ 75% → PENDING + Test, < 75% → REJECTED
    let applicationStatus: "PENDING" | "REJECTED" = "REJECTED"
    let testQuestions = null

    if (cvAnalysis.score >= 75) {
      // Score suffisant: candidature en attente + génération du test QCM
      applicationStatus = "PENDING"

      // Déterminer le niveau du candidat selon le score
      const candidateLevel = cvAnalysis.score >= 90 ? "Senior" : cvAnalysis.score >= 80 ? "Mid-level" : "Junior"

      // Générer le test technique avec OpenAI
      testQuestions = await generateTechnicalTestWithOpenAI(
        jobOffer.title,
        jobOffer.description,
        jobOffer.skills,
        candidateLevel,
      )

      console.log(`🧠 Test QCM généré: ${testQuestions.length} questions (niveau ${candidateLevel})`)
    } else {
      // Score insuffisant: rejet direct
      console.log(`❌ Score insuffisant (${cvAnalysis.score}% < 75%) - Candidature rejetée automatiquement`)
    }

    // Créer la candidature
    const application = await prisma.application.create({
      data: {
        candidateId: session.user.id,
        jobOfferId: id,
        status: applicationStatus,
        cvScore: cvAnalysis.score, // Store contextual CV score for this specific application
      },
    })

    // Créer le test QCM si nécessaire
    if (testQuestions && applicationStatus === "PENDING") {
      await prisma.test.create({
        data: {
          applicationId: application.id,
          questions: testQuestions as any, // Cast pour Prisma JSON
          status: "PENDING",
          timeLimit: 30, // 30 minutes
        },
      })
      console.log(`✅ Test QCM créé pour la candidature ${application.id}`)
    }

    // Mettre à jour l'analyse CV avec les résultats spécifiques à cette offre
    await prisma.cVAnalysis.update({
      where: { id: latestCV.id },
      data: {
        score: cvAnalysis.score,
        analysis: {
          ...cvAnalysis,
          jobTitle: jobOffer.title,
          jobId: jobOffer.id,
          analyzedAt: new Date().toISOString(),
          applicationId: application.id,
        },
      },
    })

    // Message de réponse selon le résultat
    const responseMessage =
      applicationStatus === "PENDING"
        ? `🎉 Félicitations! Votre CV a obtenu ${cvAnalysis.score}% pour ce poste. Un test technique de 10 questions vous attend (30 minutes).`
        : `📋 Votre CV a obtenu ${cvAnalysis.score}% pour ce poste. Le score minimum requis est de 75%. Nous vous encourageons à améliorer votre profil et à postuler à nouveau.`

    console.log(`✅ Candidature créée - ID: ${application.id}, Statut: ${applicationStatus}`)

    return NextResponse.json({
      message: responseMessage,
      applicationId: application.id,
      status: applicationStatus,
      cvScore: cvAnalysis.score,
      hasTest: testQuestions !== null,
      analysis: {
        matchingSkills: cvAnalysis.matchingSkills,
        missingSkills: cvAnalysis.missingSkills,
        recommendations: cvAnalysis.recommendations,
        experienceLevel: cvAnalysis.experienceLevel,
      },
    })
  } catch (error) {
    console.error("Erreur lors de la candidature:", error)
    return NextResponse.json({ error: "Erreur lors de la candidature" }, { status: 500 })
  }
}
