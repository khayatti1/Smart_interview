import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les entreprises gérées par le CEO
    const companies = await prisma.company.findMany({
      where: {
        managers: {
          some: {
            userId: session.user.id,
            role: "CEO",
          },
        },
      },
      select: { id: true },
    })

    const companyIds = companies.map((c) => c.id)

    // Statistiques principales
    const [
      totalCompanies,
      totalRecruiters,
      totalJobOffers,
      totalApplications,
      acceptedApplications,
      pendingApplications,
      rejectedApplications,
    ] = await Promise.all([
      // Nombre d'entreprises gérées
      prisma.company.count({
        where: {
          managers: {
            some: {
              userId: session.user.id,
              role: "CEO",
            },
          },
        },
      }),

      // Nombre de recruteurs dans les entreprises gérées
      prisma.companyManager.count({
        where: {
          companyId: { in: companyIds },
          role: "RECRUITER",
        },
      }),

      // Nombre d'offres d'emploi dans les entreprises gérées
      prisma.jobOffer.count({
        where: { companyId: { in: companyIds } },
      }),

      // Nombre total de candidatures
      prisma.application.count({
        where: {
          jobOffer: {
            companyId: { in: companyIds },
          },
        },
      }),

      // Candidatures acceptées
      prisma.application.count({
        where: {
          status: "ACCEPTED",
          jobOffer: {
            companyId: { in: companyIds },
          },
        },
      }),

      // Candidatures en attente
      prisma.application.count({
        where: {
          status: "PENDING",
          jobOffer: {
            companyId: { in: companyIds },
          },
        },
      }),

      // Candidatures rejetées
      prisma.application.count({
        where: {
          status: "REJECTED",
          jobOffer: {
            companyId: { in: companyIds },
          },
        },
      }),
    ])

    // Calcul du taux de succès
    const successRate = totalApplications > 0 ? Math.round((acceptedApplications / totalApplications) * 100) : 0

    // Entreprises récentes
    const recentCompanies = await prisma.company.findMany({
      where: {
        managers: {
          some: {
            userId: session.user.id,
            role: "CEO",
          },
        },
      },
      include: {
        _count: {
          select: {
            jobOffers: true,
            managers: {
              where: { role: "RECRUITER" },
            },
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: 5,
    })

    // Top recruteurs - CORRIGÉ
    const topRecruiters = await prisma.user.findMany({
      where: {
        role: "RECRUITER",
        managedCompanies: {
          some: {
            companyId: { in: companyIds },
          },
        },
      },
      include: {
        managedCompanies: {
          include: {
            company: {
              select: { name: true },
            },
          },
        },
        _count: {
          select: {
            createdJobOffers: true, // CORRIGÉ: createdJobOffers au lieu de createdOffers
          },
        },
      },
      orderBy: {
        createdJobOffers: {
          // CORRIGÉ: createdJobOffers au lieu de createdOffers
          _count: "desc",
        },
      },
      take: 5,
    })

    const stats = {
      totalCompanies,
      totalRecruiters,
      totalJobOffers,
      totalApplications,
      acceptedApplications,
      pendingApplications,
      rejectedApplications,
      successRate,
    }

    const formattedRecentCompanies = recentCompanies.map((company) => ({
      id: company.id,
      name: company.name,
      location: company.location || "",
      recruitersCount: company._count.managers,
      jobOffersCount: company._count.jobOffers,
      createdAt: company.createdAt,
    }))

    const formattedTopRecruiters = topRecruiters.map((recruiter) => ({
      id: recruiter.id,
      name: recruiter.name || "",
      company: recruiter.managedCompanies[0]?.company.name || "Aucune entreprise",
      jobOffersCount: recruiter._count.createdJobOffers, // CORRIGÉ
      createdAt: recruiter.createdAt,
    }))

    return NextResponse.json({
      stats,
      recentCompanies: formattedRecentCompanies,
      topRecruiters: formattedTopRecruiters,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération des statistiques:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
