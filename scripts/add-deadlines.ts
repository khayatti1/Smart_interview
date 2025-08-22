import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()

async function addDeadlines() {
  try {
    console.log("🔄 Ajout de dates limites aux offres existantes...")

    // Récupérer toutes les offres sans date limite
    const offersWithoutDeadline = await prisma.jobOffer.findMany({
      where: {
        deadline: null,
        isActive: true,
      },
    })

    console.log(`📊 ${offersWithoutDeadline.length} offres trouvées sans date limite`)

    // Ajouter des dates limites variées (entre 7 et 30 jours)
    for (const offer of offersWithoutDeadline) {
      const randomDays = Math.floor(Math.random() * 23) + 7 // Entre 7 et 30 jours
      const deadline = new Date()
      deadline.setDate(deadline.getDate() + randomDays)

      await prisma.jobOffer.update({
        where: { id: offer.id },
        data: { deadline },
      })

      console.log(`✅ ${offer.title}: Date limite ajoutée (${deadline.toLocaleDateString("fr-FR")})`)
    }

    console.log("🎉 Toutes les dates limites ont été ajoutées!")
  } catch (error) {
    console.error("❌ Erreur:", error)
  } finally {
    await prisma.$disconnect()
  }
}

addDeadlines()
