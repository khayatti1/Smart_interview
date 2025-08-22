import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function GET(request: NextRequest, { params }: { params: Promise<{ userId: string }> }) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const { userId } = await params

    // Vérifier les permissions
    if (session.user.role === "CANDIDATE" && session.user.id !== userId) {
      return NextResponse.json({ error: "Accès refusé" }, { status: 403 })
    }

    // Récupérer l'utilisateur avec ses CV
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        cvAnalyses: {
          orderBy: { createdAt: "desc" },
          take: 1,
          select: {
            id: true,
            fileName: true,
            filePath: true,
            score: true,
            analysis: true,
            createdAt: true,
          },
        },
      },
    })

    if (!user) {
      return NextResponse.json({ error: "Utilisateur non trouvé" }, { status: 404 })
    }

    const latestCV = user.cvAnalyses[0] || null

    return NextResponse.json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
      cv: latestCV
        ? {
            fileName: latestCV.fileName,
            filePath: latestCV.filePath,
            score: latestCV.score,
            analysis: latestCV.analysis,
            uploadDate: latestCV.createdAt,
          }
        : null,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du CV:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
