import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "RECRUITER") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer les entreprises auxquelles le recruteur est affecté
    const companyManagers = await prisma.companyManager.findMany({
      where: {
        userId: session.user.id,
      },
      include: {
        company: {
          select: {
            id: true,
            name: true,
            description: true,
            location: true,
            website: true,
          },
        },
      },
    })

    const companies = companyManagers.map((cm) => cm.company)

    console.log(`📊 Recruteur ${session.user.name} a accès à ${companies.length} entreprise(s)`)

    return NextResponse.json(companies)
  } catch (error) {
    console.error("Erreur lors de la récupération des entreprises:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
