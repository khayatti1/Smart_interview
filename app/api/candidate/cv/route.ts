import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { writeFile, mkdir } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("cv") as File

    if (!file) {
      return NextResponse.json({ error: "Aucun fichier fourni" }, { status: 400 })
    }

    // Vérifier le type de fichier
    const allowedTypes = [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ]
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: "Type de fichier non supporté. Utilisez PDF, DOC ou DOCX." }, { status: 400 })
    }

    // Vérifier la taille (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ error: "Fichier trop volumineux. Maximum 10MB." }, { status: 400 })
    }

    // Créer le dossier uploads s'il n'existe pas
    const uploadsDir = join(process.cwd(), "public", "uploads", "cv")
    if (!existsSync(uploadsDir)) {
      await mkdir(uploadsDir, { recursive: true })
    }

    // Générer un nom de fichier unique
    const timestamp = Date.now()
    const fileName = `${session.user.id}-${timestamp}-${file.name}`
    const filePath = join(uploadsDir, fileName)
    const relativePath = `/uploads/cv/${fileName}`

    // Sauvegarder le fichier
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    await writeFile(filePath, buffer)

    // Score initial basique (sera mis à jour lors de la candidature)
    const initialScore = Math.floor(Math.random() * 30) + 50 // 50-80%

    // Sauvegarder dans la base de données
    const cvAnalysis = await prisma.cVAnalysis.create({
      data: {
        userId: session.user.id,
        fileName: file.name,
        filePath: relativePath,
        score: initialScore,
        analysis: {
          uploadedAt: new Date().toISOString(),
          fileSize: file.size,
          fileType: file.type,
          initialScore: initialScore,
        },
      },
    })

    console.log(`📄 CV uploadé pour ${session.user.name}: ${file.name} (Score initial: ${initialScore}%)`)

    return NextResponse.json({
      message: "CV uploadé avec succès",
      cvId: cvAnalysis.id,
      fileName: file.name,
      score: initialScore,
      filePath: relativePath,
    })
  } catch (error) {
    console.error("Erreur lors de l'upload du CV:", error)
    return NextResponse.json({ error: "Erreur lors de l'upload du CV" }, { status: 500 })
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions)

    if (!session?.user || session.user.role !== "CANDIDATE") {
      return NextResponse.json({ error: "Non autorisé" }, { status: 401 })
    }

    // Récupérer le CV le plus récent du candidat
    const latestCV = await prisma.cVAnalysis.findFirst({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        fileName: true,
        filePath: true,
        score: true,
        analysis: true,
        createdAt: true,
      },
    })

    if (!latestCV) {
      return NextResponse.json({ error: "Aucun CV trouvé" }, { status: 404 })
    }

    return NextResponse.json({
      cv: latestCV,
    })
  } catch (error) {
    console.error("Erreur lors de la récupération du CV:", error)
    return NextResponse.json({ error: "Erreur serveur" }, { status: 500 })
  }
}
