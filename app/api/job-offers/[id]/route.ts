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

    const jobOffer = await prisma.jobOffer.findUnique({
      where: { id },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
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
    })

    if (!jobOffer) {
      return NextResponse.json({ error: "Offre d'emploi non trouvée" }, { status: 404 })
    }

    // Vérifier les permissions
    const hasAccess =
      session.user.role === "CEO" ||
      (session.user.role === "RECRUITER" && jobOffer.createdBy.id === session.user.id) ||
      session.user.role === "CANDIDATE"

    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    return NextResponse.json(jobOffer)
  } catch (error) {
    console.error("Erreur lors de la récupération de l'offre d'emploi:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await params
    const body = await request.json()
    const { title, description, location, salary, contractType, skills, deadline } = body

    // Vérifier que l'offre existe et que l'utilisateur a les permissions
    const existingOffer = await prisma.jobOffer.findUnique({
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

    if (!existingOffer) {
      return NextResponse.json({ error: "Offre d'emploi non trouvée" }, { status: 404 })
    }

    // Vérifier les permissions
    const hasAccess =
      (session.user.role === "CEO" && existingOffer.company.managers.length > 0) ||
      (session.user.role === "RECRUITER" && existingOffer.createdBy.id === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
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
    } else if (existingOffer.skills && Array.isArray(existingOffer.skills)) {
      skillsArray = existingOffer.skills as string[]
    }

    // Mettre à jour l'offre d'emploi
    const updatedJobOffer = await prisma.jobOffer.update({
      where: { id },
      data: {
        title: title || existingOffer.title,
        description: description || existingOffer.description,
        location: location !== undefined ? location : existingOffer.location,
        salary: salary !== undefined ? salary : existingOffer.salary,
        type: contractType || existingOffer.type,
        skills: skillsArray,
        deadline: deadline ? new Date(deadline) : existingOffer.deadline,
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
    })

    return NextResponse.json(updatedJobOffer)
  } catch (error) {
    console.error("Erreur lors de la modification de l'offre d'emploi:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non authentifié" }, { status: 401 })
    }

    const { id } = await params

    // Vérifier que l'offre existe et que l'utilisateur a les permissions
    const existingOffer = await prisma.jobOffer.findUnique({
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
        _count: {
          select: {
            applications: true,
          },
        },
      },
    })

    if (!existingOffer) {
      return NextResponse.json({ error: "Offre d'emploi non trouvée" }, { status: 404 })
    }

    // Vérifier les permissions
    const hasAccess =
      (session.user.role === "CEO" && existingOffer.company.managers.length > 0) ||
      (session.user.role === "RECRUITER" && existingOffer.createdBy.id === session.user.id)

    if (!hasAccess) {
      return NextResponse.json({ error: "Accès non autorisé" }, { status: 403 })
    }

    // Vérifier s'il y a des candidatures
    if (existingOffer._count.applications > 0) {
      return NextResponse.json({ error: "Impossible de supprimer une offre qui a des candidatures" }, { status: 400 })
    }

    // Supprimer l'offre d'emploi
    await prisma.jobOffer.delete({
      where: { id },
    })

    return NextResponse.json({ message: "Offre d'emploi supprimée avec succès" })
  } catch (error) {
    console.error("Erreur lors de la suppression de l'offre d'emploi:", error)
    return NextResponse.json({ error: "Erreur interne du serveur" }, { status: 500 })
  }
}
