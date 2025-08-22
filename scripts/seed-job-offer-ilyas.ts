import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedJobOfferForIlyas() {
  try {
    console.log('🚀 Création d\'une offre d\'emploi générale...');

    // Trouver un recruteur existant
    const recruiter = await prisma.user.findFirst({
      where: { role: 'RECRUITER' }
    });

    if (!recruiter) {
      console.error('❌ Aucun recruteur trouvé. Créez d\'abord un recruteur.');
      return;
    }

    // Trouver une entreprise
    const company = await prisma.company.findFirst();

    if (!company) {
      console.error('❌ Aucune entreprise trouvée. Créez d\'abord une entreprise.');
      return;
    }

    // Créer une offre d'emploi générale
    const jobOffer = await prisma.jobOffer.create({
      data: {
        title: "Développeur Full-Stack - Technologies Modernes",
        description: `
🚀 REJOIGNEZ NOTRE ÉQUIPE TECHNIQUE !

Nous recherchons un Développeur Full-Stack motivé pour contribuer à nos projets innovants utilisant les dernières technologies.

📋 VOS MISSIONS :
• Développement d'applications web modernes avec React/Angular et Node.js
• Création d'APIs RESTful robustes et sécurisées
• Participation à l'architecture microservices
• Intégration de solutions d'authentification (OAuth 2.0, JWT)
• Collaboration en méthodologie Agile/SCRUM
• Optimisation des performances et de la sécurité

🛠️ STACK TECHNIQUE :
• Frontend: React, Angular, Next.js, TypeScript, HTML5, CSS3
• Backend: Node.js, Express, Spring Boot, Java
• Bases de données: PostgreSQL, MongoDB, Redis
• DevOps: Docker, GitHub Actions, CI/CD
• Cloud: AWS, Azure
• Outils: Git, Jira, Confluence

🎯 PROFIL RECHERCHÉ :
• Formation en Informatique (Bac+3 à Bac+5)
• Expérience en développement web (stages, projets, alternance)
• Maîtrise de JavaScript/TypeScript
• Connaissance des frameworks modernes (React, Angular, ou Vue.js)
• Expérience avec les APIs REST
• Notions de bases de données relationnelles et NoSQL
• Esprit d'équipe et curiosité technique

💡 COMPÉTENCES APPRÉCIÉES :
• Expérience avec les microservices
• Connaissances en sécurité web
• Pratique des méthodologies Agile
• Contributions open source
• Certifications techniques

🌟 AVANTAGES :
• Projets techniques stimulants
• Formation continue
• Équipe bienveillante et experte
• Télétravail partiel possible
• Évolution de carrière rapide
• Participation aux conférences tech

📍 Localisation: Hybride (Bureau + Télétravail)
💰 Salaire: Selon expérience et profil
⏰ Type: CDI / Stage / Alternance

Candidatez dès maintenant pour rejoindre une équipe passionnée ! 🚀
        `,
        skills: [
          "JavaScript",
          "TypeScript", 
          "React",
          "Angular",
          "Node.js",
          "Express",
          "PostgreSQL",
          "MongoDB",
          "Docker",
          "Git",
          "RESTful API",
          "HTML",
          "CSS",
          "Agile",
          "SCRUM"
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        recruiterId: recruiter.id,
        companyId: company.id,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });

    console.log('✅ Offre créée avec succès !');
    console.log(`📋 Titre: ${jobOffer.title}`);
    console.log(`🆔 ID: ${jobOffer.id}`);
    console.log(`🏢 Entreprise: ${company.name}`);
    console.log(`👤 Recruteur: ${recruiter.name}`);
    console.log(`🎯 Compétences (${jobOffer.skills.length}): ${jobOffer.skills.join(', ')}`);
    console.log(`📅 Date limite: ${jobOffer.deadline?.toLocaleDateString('fr-FR')}`);
    console.log('\n🎉 Cette offre permettra de tester l\'analyse IA sur différents profils !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'offre:', error);
  } finally {
    await prisma.$disconnect();
  }
}

seedJobOfferForIlyas();
