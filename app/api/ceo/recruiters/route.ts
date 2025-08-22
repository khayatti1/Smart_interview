import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les entreprises du CEO
    const ceoCompanies = await prisma.companyManager.findMany({
      where: {
        userId: session.user.id,
        role: "CEO",
      },
      select: { companyId: true },
    })

    const companyIds = ceoCompanies.map((cm) => cm.companyId)

    // Récupérer tous les recruteurs des entreprises du CEO
    const recruiters = await prisma.user.findMany({
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
          where: {
            companyId: { in: companyIds },
          },
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            createdJobOffers: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
    })

    const formattedRecruiters = recruiters.map((recruiter) => ({
      id: recruiter.id,
      name: recruiter.name || "",
      email: recruiter.email,
      companies: recruiter.managedCompanies.map((cm) => ({
        id: cm.company.id,
        name: cm.company.name,
      })),
      jobOffersCount: recruiter._count.createdJobOffers,
      createdAt: recruiter.createdAt,
    }))

    return NextResponse.json(formattedRecruiters)
  } catch (error) {
    console.error("Erreur lors de la récupération des recruteurs:", error)
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
    const { name, email, password, companyIds } = body

    // Validation
    if (!name || !email || !password) {
      return NextResponse.json({ error: "Nom, email et mot de passe sont obligatoires" }, { status: 400 })
    }

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json({ error: "Au moins une entreprise doit être sélectionnée" }, { status: 400 })
    }

    // Vérifier que toutes les entreprises appartiennent au CEO
    const ceoCompanies = await prisma.companyManager.findMany({
      where: {
        userId: session.user.id,
        role: "CEO",
        companyId: { in: companyIds },
      },
    })

    if (ceoCompanies.length !== companyIds.length) {
      return NextResponse.json({ error: "Certaines entreprises ne vous appartiennent pas" }, { status: 403 })
    }

    // Vérifier l'unicité de l'email
    const existingUser = await prisma.user.findUnique({
      where: { email },
    })

    if (existingUser) {
      return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 400 })
    }

    // Hasher le mot de passe
    const hashedPassword = await bcrypt.hash(password, 12)

    // Créer le recruteur
    const recruiter = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: "RECRUITER",
      },
    })

    // Associer le recruteur aux entreprises
    await prisma.companyManager.createMany({
      data: companyIds.map((companyId: string) => ({
        userId: recruiter.id,
        companyId,
        role: "RECRUITER" as const,
      })),
    })

    // Récupérer le recruteur avec ses entreprises
    const recruiterWithCompanies = await prisma.user.findUnique({
      where: { id: recruiter.id },
      include: {
        managedCompanies: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
        _count: {
          select: {
            createdJobOffers: true,
          },
        },
      },
    })

    const formattedRecruiter = {
      id: recruiterWithCompanies!.id,
      name: recruiterWithCompanies!.name || "",
      email: recruiterWithCompanies!.email,
      companies: recruiterWithCompanies!.managedCompanies.map((cm) => ({
        id: cm.company.id,
        name: cm.company.name,
      })),
      jobOffersCount: recruiterWithCompanies!._count.createdJobOffers,
      createdAt: recruiterWithCompanies!.createdAt,
    }

    return NextResponse.json(formattedRecruiter, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création du recruteur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
