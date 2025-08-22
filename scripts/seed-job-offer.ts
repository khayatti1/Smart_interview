import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createJobOfferForIlyas() {
  console.log('Création d\'une offre adaptée au profil d\'Ilyas...');

  try {
    // Trouver ou créer une entreprise
    let company = await prisma.company.findFirst({
      where: { name: 'TechCorp Innovation' }
    });

    if (!company) {
      company = await prisma.company.create({
        data: {
          name: 'TechCorp Innovation',
          description: 'Entreprise spécialisée dans le développement de solutions logicielles innovantes avec une expertise en microservices et intelligence artificielle.'
        }
      });
    }

    // Trouver ou créer un recruteur
    let recruiter = await prisma.user.findFirst({
      where: { role: 'RECRUITER' }
    });

    if (!recruiter) {
      const bcrypt = require('bcryptjs');
      const hashedPassword = await bcrypt.hash('recruiter123', 10);
      
      recruiter = await prisma.user.create({
        data: {
          name: 'Sarah Recruiter',
          email: 'sarah@techcorp.com',
          password: hashedPassword,
          role: 'RECRUITER',
          companyId: company.id,
        }
      });
    }

    // Créer l'offre d'emploi parfaitement adaptée au profil d'Ilyas
    const jobOffer = await prisma.jobOffer.create({
      data: {
        title: 'Ingénieur Full Stack - Microservices & IA',
        description: `Nous recherchons un Ingénieur Full Stack passionné pour rejoindre notre équipe de développement.

MISSION :
Vous participerez au développement d'une plateforme innovante de recrutement automatisé utilisant l'IA et le NLP, similaire à votre expérience chez 3D Smart Factory.

RESPONSABILITÉS :
• Développer des microservices avec l'écosystème Spring
• Créer des interfaces utilisateur modernes avec Angular et Next.js
• Implémenter des solutions d'authentification avec OAuth 2.0, JWT et Keycloak
• Gérer les bases de données PostgreSQL et MongoDB
• Mettre en place des pipelines CI/CD avec Docker et GitHub Actions
• Collaborer en méthodologie SCRUM avec Jira

ENVIRONNEMENT TECHNIQUE :
• Architecture microservices avec Apache Kafka
• APIs RESTful
• Conteneurisation Docker
• Intégration d'IA et NLP pour l'automatisation
• Gestion de projet agile

PROFIL RECHERCHÉ :
• Formation en Génie Logiciel ou équivalent
• Expérience en développement full stack
• Maîtrise des technologies Spring, Angular, Next.js
• Connaissance des bases de données relationnelles et NoSQL
• Expérience avec Docker et les outils DevOps
• Certification Agile/SCRUM appréciée
• Français et Anglais courants

AVANTAGES :
• Projet innovant dans le domaine de l'IA
• Équipe technique experte
• Formation continue
• Environnement de travail moderne`,
        skills: [
          'Spring Ecosystem',
          'Angular',
          'Next.js',
          'PostgreSQL',
          'MongoDB',
          'Docker',
          'GitHub Actions',
          'Microservices',
          'OAuth 2.0',
          'JWT',
          'Keycloak',
          'Apache Kafka',
          'RESTful APIs',
          'SCRUM',
          'Jira',
          'NLP',
          'Redis'
        ],
        deadline: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000), // 30 jours
        companyId: company.id,
        recruiterId: recruiter.id,
      }
    });

    console.log('✅ Offre créée avec succès !');
    console.log(`📋 Titre: ${jobOffer.title}`);
    console.log(`🏢 Entreprise: ${company.name}`);
    console.log(`🎯 Compétences: ${jobOffer.skills.join(', ')}`);
    console.log(`📅 Date limite: ${jobOffer.deadline?.toLocaleDateString('fr-FR')}`);
    console.log('\n🎉 Cette offre devrait donner un score > 75% pour le profil d\'Ilyas !');

  } catch (error) {
    console.error('❌ Erreur lors de la création de l\'offre:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createJobOfferForIlyas();
