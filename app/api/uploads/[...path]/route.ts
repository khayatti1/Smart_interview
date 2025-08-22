import { type NextRequest, NextResponse } from "next/server"
import { readFile } from "fs/promises"
import { join } from "path"
import { existsSync } from "fs"

export async function GET(request: NextRequest, { params }: { params: { path: string[] } }) {
  try {
    const { path } = params
    const filePath = join(process.cwd(), "public", "uploads", ...path)

    // Vérifier si le fichier existe
    if (!existsSync(filePath)) {
      return new NextResponse("File not found", { status: 404 })
    }

    // Lire le fichier
    const fileBuffer = await readFile(filePath)

    // Déterminer le type de contenu
    const extension = path[path.length - 1].split(".").pop()?.toLowerCase()
    let contentType = "application/octet-stream"

    switch (extension) {
      case "pdf":
        contentType = "application/pdf"
        break
      case "txt":
        contentType = "text/plain"
        break
      case "doc":
        contentType = "application/msword"
        break
      case "docx":
        contentType = "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
        break
    }

    return new NextResponse(new Uint8Array(fileBuffer), {
      headers: {
        "Content-Type": contentType,
        "Content-Disposition": `inline; filename="${path[path.length - 1]}"`,
      },
    })
  } catch (error) {
    console.error("Error serving file:", error)
    return new NextResponse("Internal Server Error", { status: 500 })
  }
}
