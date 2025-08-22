import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CEO") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Vérifier que l'entreprise appartient au CEO
    const companyManager = await prisma.companyManager.findFirst({
      where: {
        userId: session.user.id,
        companyId: id,
        role: "CEO",
      },
    })

    if (!companyManager) {
      return NextResponse.json({ error: "Entreprise non trouvée ou accès non autorisé" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, location, website } = body

    // Validation
    if (!name || name.trim().length === 0) {
      return NextResponse.json({ error: "Le nom de l'entreprise est obligatoire" }, { status: 400 })
    }

    // Vérifier l'unicité du nom (sauf pour l'entreprise actuelle)
    const existingCompany = await prisma.company.findFirst({
      where: {
        name: name.trim(),
        NOT: { id },
      },
    })

    if (existingCompany) {
      return NextResponse.json({ error: "Une entreprise avec ce nom existe déjà" }, { status: 400 })
    }

    // Mettre à jour l'entreprise
    const updatedCompany = await prisma.company.update({
      where: { id },
      data: {
        name: name.trim(),
        description: description?.trim() || "",
        location: location?.trim() || null,
        website: website?.trim() || null,
      },
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
      id: updatedCompany.id,
      name: updatedCompany.name,
      description: updatedCompany.description || "",
      location: updatedCompany.location || "",
      website: updatedCompany.website || "",
      recruitersCount: updatedCompany._count.managers,
      jobOffersCount: updatedCompany._count.jobOffers,
      createdAt: updatedCompany.createdAt,
      updatedAt: updatedCompany.updatedAt,
    }

    return NextResponse.json(formattedCompany)
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'entreprise:", error)
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

    // Vérifier que l'entreprise appartient au CEO
    const companyManager = await prisma.companyManager.findFirst({
      where: {
        userId: session.user.id,
        companyId: id,
        role: "CEO",
      },
    })

    if (!companyManager) {
      return NextResponse.json({ error: "Entreprise non trouvée ou accès non autorisé" }, { status: 404 })
    }

    // Vérifier s'il y a des offres d'emploi liées
    const jobOffersCount = await prisma.jobOffer.count({
      where: { companyId: id },
    })

    if (jobOffersCount > 0) {
      return NextResponse.json(
        { error: "Impossible de supprimer une entreprise qui a des offres d'emploi" },
        { status: 400 },
      )
    }

    // Supprimer l'entreprise (les CompanyManager seront supprimés automatiquement grâce à onDelete: Cascade)
    await prisma.company.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Entreprise supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'entreprise:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
