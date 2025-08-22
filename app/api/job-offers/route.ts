import { NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    let jobOffers

    if (session.user.role === "CEO") {
      // Les CEOs voient toutes les offres de leurs entreprises
      const companies = await prisma.company.findMany({
        where: {
          managers: {
            some: {
              userId: session.user.id,
            },
          },
        },
        select: { id: true },
      })

      const companyIds = companies.map((company) => company.id)

      jobOffers = await prisma.jobOffer.findMany({
        where: {
          companyId: {
            in: companyIds,
          },
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          createdBy: {
            select: {
              id: true,
              name: true,
              email: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else if (session.user.role === "RECRUITER") {
      // Les recruteurs voient leurs propres offres
      jobOffers = await prisma.jobOffer.findMany({
        where: {
          createdById: session.user.id,
        },
        include: {
          company: {
            select: {
              id: true,
              name: true,
              description: true,
            },
          },
          _count: {
            select: {
              applications: true,
            },
          },
        },
        orderBy: {
          createdAt: "desc",
        },
      })
    } else {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    return NextResponse.json(jobOffers)
  } catch (error) {
    console.error("Erreur lors de la récupération des offres d'emploi:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user || session.user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { title, description, location, salary, contractType, skills, deadline, companyId } = body

    // Validation des champs requis
    if (!title || !description || !companyId) {
      return NextResponse.json({ error: "Titre, description et entreprise sont requis" }, { status: 400 })
    }

    // Vérifier que le recruteur a accès à cette entreprise
    const companyAccess = await prisma.companyManager.findFirst({
      where: {
        userId: session.user.id,
        companyId: companyId,
      },
    })

    if (!companyAccess) {
      return NextResponse.json({ error: "Accès non autorisé à cette entreprise" }, { status: 403 })
    }

    // Traiter les compétences
    let skillsArray: string[] = []
    if (skills && typeof skills === "string") {
      skillsArray = skills
        .split(",")
        .map((skill: string) => skill.trim())
        .filter((skill: string) => skill.length > 0)
    } else if (Array.isArray(skills)) {
      skillsArray = skills.filter((skill: string) => skill && skill.trim().length > 0)
    }

    // Créer l'offre d'emploi
    const jobOffer = await prisma.jobOffer.create({
      data: {
        title,
        description,
        location: location || null,
        salary: salary || null,
        type: contractType || null,
        skills: skillsArray,
        deadline: deadline ? new Date(deadline) : null,
        companyId,
        createdById: session.user.id,
        isActive: true,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
          },
        },
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    console.log(`✅ Offre d'emploi "${jobOffer.title}" créée avec succès`)

    return NextResponse.json(jobOffer, { status: 201 })
  } catch (error) {
    console.error("Erreur lors de la création de l'offre d'emploi:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
