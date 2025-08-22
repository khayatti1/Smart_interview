import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les candidatures du candidat
    const applications = await prisma.application.findMany({
      where: {
        candidateId: session.user.id,
      },
      include: {
        jobOffer: {
          select: {
            id: true,
            title: true,
            description: true,
            skills: true,
            deadline: true,
            company: {
              select: {
                name: true,
                location: true,
              },
            },
          },
        },
        test: {
          select: {
            id: true,
            status: true,
            score: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    // Récupérer les offres disponibles
    const availableJobs = await prisma.jobOffer.findMany({
      where: {
        isActive: true,
        OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
      },
      include: {
        company: {
          select: {
            name: true,
            location: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    })

    // Récupérer le CV le plus récent
    const cv = await prisma.cVAnalysis.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        score: true,
        analysis: true,
        createdAt: true,
      },
    })

    // Calculer les statistiques
    const total = applications.length
    const pending = applications.filter((app) => app.status === "PENDING").length
    const accepted = applications.filter((app) => app.status === "ACCEPTED").length
    const rejected = applications.filter((app) => app.status === "REJECTED").length

    const applicationsWithTestScore = applications.filter((app) => app.test && app.test.score !== null)
    const testsCompleted = applicationsWithTestScore.length

    const totalTestScore = applicationsWithTestScore.reduce((sum, app) => sum + (app.test?.score || 0), 0)
    const averageTestScore = testsCompleted > 0 ? Math.round(totalTestScore / testsCompleted) : 0

    const successRate = total > 0 ? Math.round((accepted / total) * 100) : 0

    // Calculer les statistiques avec les scores contextuels
    const applicationsWithCvScore = applications.filter((app) => app.cvScore !== null)
    const totalCvScore = applicationsWithCvScore.reduce((sum, app) => sum + (app.cvScore || 0), 0)
    const averageCvScore =
      applicationsWithCvScore.length > 0 ? Math.round(totalCvScore / applicationsWithCvScore.length) : 0

    const stats = {
      totalApplications: total,
      pendingApplications: pending,
      acceptedApplications: accepted,
      rejectedApplications: rejected,
      testsCompleted,
      successRate,
      averageTestScore,
      averageCvScore, // Use average of contextual CV scores instead of general CV score
    }

    // Formater les données des candidatures
    const formattedApplications = applications.map((app) => ({
      id: app.id,
      status: app.status,
      cvScore: app.cvScore || 0, // Use contextual CV score from application instead of general CV score
      testScore: app.test?.score || null,
      createdAt: app.createdAt.toISOString(),
      jobOffer: {
        id: app.jobOffer.id,
        title: app.jobOffer.title,
        description: app.jobOffer.description,
        skills: Array.isArray(app.jobOffer.skills) ? app.jobOffer.skills : [],
        deadline: app.jobOffer.deadline?.toISOString() || null,
        company: {
          name: app.jobOffer.company.name,
          location: app.jobOffer.company.location,
        },
      },
      test: app.test
        ? {
            id: app.test.id,
            status: app.test.status,
            score: app.test.score,
          }
        : null,
    }))

    // Formater les données des offres disponibles
    const formattedJobs = availableJobs.map((job) => ({
      id: job.id,
      title: job.title,
      description: job.description,
      skills: Array.isArray(job.skills) ? job.skills : [],
      salary: job.salary,
      location: job.location,
      deadline: job.deadline?.toISOString() || null,
      createdAt: job.createdAt.toISOString(),
      company: {
        name: job.company.name,
        location: job.company.location,
      },
      _count: {
        applications: job._count.applications,
      },
    }))

    return NextResponse.json({
      stats,
      applications: formattedApplications,
      availableJobs: formattedJobs,
      cv,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des stats candidat:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
