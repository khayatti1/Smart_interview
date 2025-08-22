import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    if (session.user.role === "CEO") {
      // Les CEOs voient leurs entreprises
      const companyManagers = await prisma.companyManager.findMany({
        where: {
          userId: session.user.id,
          role: "CEO",
        },
        include: {
          company: {
            include: {
              _count: {
                select: {
                  managers: {
                    where: {
                      role: "RECRUITER",
                    },
                  },
                  jobOffers: true,
                },
              },
            },
          },
        },
        orderBy: {
          company: {
            createdAt: "desc",
          },
        },
      })

      const companies = companyManagers.map((cm) => ({
        id: cm.company.id,
        name: cm.company.name,
        description: cm.company.description || "",
        location: cm.company.location || "",
        website: cm.company.website || "",
        recruitersCount: cm.company._count.managers,
        jobOffersCount: cm.company._count.jobOffers,
        createdAt: cm.company.createdAt,
        updatedAt: cm.company.updatedAt,
      }))

      return NextResponse.json(companies)
    }

    return NextResponse.json([])
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, description, location, website } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Le nom de l'entreprise est obligatoire" }, { status: 400 })
    }

    // Vérifier l'unicité du nom
    const existingCompany = await prisma.company.findFirst({
      where: { name: name.trim() },
    })

    if (existingCompany) {
      return NextResponse.json({ error: "Une entreprise avec ce nom existe déjà" }, { status: 400 })
    }

    // Créer l'entreprise
    const company = await prisma.company.create({
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        location: location?.trim() || null,
        website: website?.trim() || null,
      },
    })

    // Associer le CEO à l'entreprise
    await prisma.companyManager.create({
      data: {
        userId: session.user.id,
        companyId: company.id,
        role: "CEO",
      },
    })

    // Retourner l'entreprise avec les compteurs
    const companyWithCounts = await prisma.company.findUnique({
      where: { id: company.id },
      include: {
        _count: {
          select: {
            managers: {
              where: { role: "RECRUITER" },
            },
            jobOffers: true,
          },
        },
      },
    })

    const formattedCompany = {
      id: companyWithCounts!.id,
      name: companyWithCounts!.name,
      description: companyWithCounts!.description || "",
      location: companyWithCounts!.location || "",
      website: companyWithCounts!.website || "",
      recruitersCount: companyWithCounts!._count.managers,
      jobOffersCount: companyWithCounts!._count.jobOffers,
      createdAt: companyWithCounts!.createdAt,
      updatedAt: companyWithCounts!.updatedAt,
    }

    return NextResponse.json(formattedCompany, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
