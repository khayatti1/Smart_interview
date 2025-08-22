import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function removeRequirementsField() {
  try {
    console.log("🔄 Suppression du champ requirements...")

    // Note: Prisma ne peut pas supprimer directement un champ via une migration de script
    // Il faut utiliser une migration SQL ou laisser Prisma gérer cela avec db push

    console.log('✅ Le champ requirements sera supprimé lors du prochain "npx prisma db push"')
    console.log("📝 Assurez-vous de sauvegarder vos données importantes avant de continuer")
  } catch (error) {
    console.error("❌ Erreur:", error)
  } finally {
    await prisma.$disconnect()
  }
}

removeRequirementsField()
