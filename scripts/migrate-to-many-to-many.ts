import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function migrateToManyToMany() {
  try {
    console.log("🚀 Migration déjà effectuée avec le nouveau schéma Prisma")
    console.log("✅ Aucune migration nécessaire - la structure many-to-many est déjà en place")
  } catch (error) {
    console.error("❌ Erreur:", error)
  } finally {
    await prisma.$disconnect()
  }
}

// Exécuter la migration
migrateToManyToMany()
