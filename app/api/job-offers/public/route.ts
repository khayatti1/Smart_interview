import { NextResponse } from "next/server"
import { prisma } from "@/lib/prisma"

export async function GET() {
  try {
    const jobOffers = await prisma.jobOffer.findMany({
      where: {
        isActive: true,
        OR: [{ deadline: null }, { deadline: { gte: new Date() } }],
      },
      include: {
        company: {
          select: {
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
      orderBy: [{ deadline: "asc" }, { createdAt: "desc" }],
    })

    return NextResponse.json(jobOffers)
  } catch (error) {
    console.error("Erreur lors de la récupération des offres publiques:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
