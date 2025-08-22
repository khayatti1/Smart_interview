import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import bcrypt from "bcryptjs"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const body = await request.json()
    const { name, email, password, companyIds } = body

    // Validation
    if (!name || !email) {
      return NextResponse.json({ error: "Nom et email sont obligatoires" }, { status: 400 })
    }

    if (!companyIds || !Array.isArray(companyIds) || companyIds.length === 0) {
      return NextResponse.json({ error: "Au moins une entreprise doit être sélectionnée" }, { status: 400 })
    }

    // Vérifier que le recruteur existe et appartient aux entreprises du CEO
    const recruiter = await prisma.user.findFirst({
      where: {
        id,
        role: "RECRUITER",
        managedCompanies: {
          some: {
            company: {
              managers: {
                some: {
                  userId: session.user.id,
                  role: "CEO",
                },
              },
            },
          },
        },
      },
    })

    if (!recruiter) {
      return NextResponse.json({ error: "Recruteur non trouvé ou accès non autorisé" }, { status: 404 })
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

    // Vérifier l'unicité de l'email (sauf pour l'utilisateur actuel)
    if (email !== recruiter.email) {
      const existingUser = await prisma.user.findUnique({
        where: { email },
      })

      if (existingUser) {
        return NextResponse.json({ error: "Un utilisateur avec cet email existe déjà" }, { status: 400 })
      }
    }

    // Préparer les données de mise à jour
    const updateData: any = {
      name,
      email,
    }

    // Hasher le nouveau mot de passe si fourni
    if (password && password.trim().length > 0) {
      updateData.password = await bcrypt.hash(password, 12)
    }

    // Mettre à jour le recruteur
    const updatedRecruiter = await prisma.user.update({
      where: { id },
      data: updateData,
    })

    // Supprimer les anciennes associations
    await prisma.companyManager.deleteMany({
      where: {
        userId: id,
        role: "RECRUITER",
      },
    })

    // Créer les nouvelles associations
    await prisma.companyManager.createMany({
      data: companyIds.map((companyId: string) => ({
        userId: id,
        companyId,
        role: "RECRUITER" as const,
      })),
    })

    // Récupérer le recruteur avec ses nouvelles entreprises
    const recruiterWithCompanies = await prisma.user.findUnique({
      where: { id },
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

    return NextResponse.json(formattedRecruiter)
  } catch (error) {
    console.error("Erreur lors de la mise à jour du recruteur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}

export async function DELETE(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que le recruteur existe et appartient aux entreprises du CEO
    const recruiter = await prisma.user.findFirst({
      where: {
        id,
        role: "RECRUITER",
        managedCompanies: {
          some: {
            company: {
              managers: {
                some: {
                  userId: session.user.id,
                  role: "CEO",
                },
              },
            },
          },
        },
      },
    })

    if (!recruiter) {
      return NextResponse.json({ error: "Recruteur non trouvé ou accès non autorisé" }, { status: 404 })
    }

    // Vérifier s'il y a des offres d'emploi créées par ce recruteur
    const jobOffersCount = await prisma.jobOffer.count({
      where: { createdById: id },
    })

    if (jobOffersCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer un recruteur qui a créé des offres d'emploi" },
        { status: 400 },
      )
    }

    // Supprimer le recruteur (les CompanyManager seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.user.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Recruteur supprimé avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression du recruteur:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
