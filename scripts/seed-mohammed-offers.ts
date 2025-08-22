import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Création des offres pour Mohammed...');

  // Créer une entreprise de test
  let company = await prisma.company.findFirst({
    where: { name: 'TechCorp Solutions' }
  });

  if (!company) {
    company = await prisma.company.create({
      data: {
        name: 'TechCorp Solutions',
        description: 'Entreprise spécialisée dans le développement logiciel et les solutions technologiques innovantes.',
        location: 'Rabat, Maroc',
        website: 'https://techcorp-solutions.ma'
      }
    });
  }

  // Créer un recruteur de test
  const hashedPassword = await bcrypt.hash('password123', 10);
  let recruiter = await prisma.user.findUnique({
    where: { email: 'recruiter@techcorp.ma' }
  });

  if (!recruiter) {
    recruiter = await prisma.user.create({
      data: {
        name: 'Sarah Benali',
        email: 'recruiter@techcorp.ma',
        password: hashedPassword,
        role: 'RECRUITER',
        companyId: company.id
      }
    });
  }

  // Créer le candidat Mohammed
  let mohammed = await prisma.user.findUnique({
    where: { email: 'khayatti.09@gmail.com' }
  });

  if (!mohammed) {
    mohammed = await prisma.user.create({
      data: {
        name: 'Mohammed El Khayati',
        email: 'khayatti.09@gmail.com',
        password: await bcrypt.hash('mohammed123', 10),
        role: 'CANDIDATE',
        cvUrl: '/api/uploads/cv-khayatti.pdf'
      }
    });
  } else {
    // Mettre à jour le CV URL si l'utilisateur existe déjà
    mohammed = await prisma.user.update({
      where: { id: mohammed.id },
      data: { cvUrl: '/api/uploads/cv-khayatti.pdf' }
    });
  }

  // Supprimer les anciennes offres et candidatures pour recommencer
  await prisma.technicalTest.deleteMany({
    where: {
      application: {
        candidate: { email: 'khayatti.09@gmail.com' }
      }
    }
  });

  await prisma.application.deleteMany({
    where: { candidateId: mohammed.id }
  });

  await prisma.jobOffer.deleteMany({
    where: { recruiterId: recruiter.id }
  });

  // Offre 1: Ingénieur Informatique (acceptée)
  const jobOffer1 = await prisma.jobOffer.create({
    data: {
      title: 'Ingénieur Informatique - Développement Full Stack',
      description: `Nous recherchons un ingénieur informatique passionné pour rejoindre notre équipe de développement.

**Responsabilités :**
- Développer des applications web avec React, Node.js et Python
- Concevoir et implémenter des bases de données SQL
- Collaborer avec l'équipe sur des projets innovants
- Maintenir et optimiser les applications existantes

**Compétences requises :**
- Maîtrise de JavaScript, Python, Java
- Expérience avec React, Node.js
- Connaissance des bases de données SQL (PostgreSQL, MySQL)
- Familiarité avec Git et les méthodes agiles
- Capacité à travailler en équipe

**Profil recherché :**
- Formation en génie logiciel ou informatique
- Expérience en développement web
- Projets personnels ou académiques démontrant vos compétences`,
      requirements: 'JavaScript, Python, React, Node.js, SQL, Git, Méthodes agiles',
      location: 'Rabat, Maroc',
      salary: '25000-35000 MAD',
      contractType: 'CDI',
      experienceLevel: 'Junior',
      skills: ['JavaScript', 'Python', 'React', 'Node.js', 'SQL', 'Git'],
      companyId: company.id,
      recruiterId: recruiter.id,
      isActive: true
    }
  });

  // Offre 2: Designer Graphique / Art Appliqué (refusée)
  const jobOffer2 = await prisma.jobOffer.create({
    data: {
      title: 'Designer Graphique - Art Appliqué',
      description: `Nous recherchons un designer créatif spécialisé en art appliqué pour notre équipe marketing.

**Responsabilités :**
- Créer des designs pour supports print et digital
- Développer l'identité visuelle de nos produits
- Collaborer avec l'équipe marketing sur les campagnes
- Réaliser des illustrations et infographies

**Compétences requises :**
- Maîtrise d'Adobe Creative Suite (Photoshop, Illustrator, InDesign)
- Sens artistique et créativité
- Connaissance des tendances design
- Capacité à respecter les délais

**Profil recherché :**
- Formation en arts appliqués, design graphique
- Portfolio démontrant vos créations
- Expérience en agence ou en entreprise appréciée`,
      requirements: 'Adobe Creative Suite, Design graphique, Arts appliqués, Créativité, Portfolio',
      location: 'Casablanca, Maroc',
      salary: '18000-25000 MAD',
      contractType: 'CDI',
      experienceLevel: 'Junior',
      skills: ['Adobe Photoshop', 'Adobe Illustrator', 'Design Graphique', 'Arts Appliqués'],
      companyId: company.id,
      recruiterId: recruiter.id,
      isActive: true
    }
  });

  // Candidature 1: Acceptée avec test (Score élevé pour ingénieur informatique)
  const application1 = await prisma.application.create({
    data: {
      jobOfferId: jobOffer1.id,
      candidateId: mohammed.id,
      status: 'TEST_COMPLETED',
      cvPath: '/api/uploads/cv-khayatti.pdf',
      coverLetter: 'Je suis très intéressé par ce poste d\'ingénieur informatique qui correspond parfaitement à ma formation et mes compétences techniques.',
      aiScore: 85,
      cvScore: 85,
      aiAnalysis: JSON.stringify({
        score: 85,
        skills: ['JavaScript', 'Python', 'Java', 'SQL', 'React'],
        experience: 'Expérience en développement avec plusieurs projets académiques et stages',
        education: 'Cycle d\'ingénieur en Informatique et Réseaux à l\'EMSI',
        projects: [
          'Application de gestion de taxis en ligne (Python Flask)',
          'Application de gestion d\'hôpital (C++)',
          'Site web de gestion de cabinet médical (PHP)',
          'Clone Facebook (HTML, CSS, PHP)'
        ],
        languages: ['Arabe', 'Français', 'Anglais', 'Allemand'],
        recommendations: [
          'Excellent profil technique correspondant au poste',
          'Formation solide en génie logiciel',
          'Projets diversifiés démontrant les compétences'
        ],
        experienceLevel: 'Junior'
      })
    }
  });

  // Candidature 2: Refusée (Score faible pour design graphique)
  const application2 = await prisma.application.create({
    data: {
      jobOfferId: jobOffer2.id,
      candidateId: mohammed.id,
      status: 'CV_REJECTED',
      cvPath: '/api/uploads/cv-khayatti.pdf',
      coverLetter: 'Je souhaite explorer de nouveaux domaines créatifs et apporter mes compétences techniques au design.',
      aiScore: 25,
      cvScore: 25,
      aiAnalysis: JSON.stringify({
        score: 25,
        skills: ['Programmation', 'Développement web'],
        experience: 'Expérience principalement technique, peu d\'expérience en design',
        education: 'Formation en génie logiciel, pas en arts appliqués',
        projects: [
          'Projets techniques mais pas de portfolio créatif',
          'Aucun projet de design mentionné'
        ],
        languages: ['Arabe', 'Français', 'Anglais'],
        recommendations: [
          'Profil technique ne correspondant pas au poste créatif',
          'Manque d\'expérience en design graphique',
          'Formation inadéquate pour ce type de poste'
        ],
        experienceLevel: 'Junior'
      })
    }
  });

  // Créer un test technique pour la candidature acceptée
  const technicalTest = await prisma.technicalTest.create({
    data: {
      applicationId: application1.id,
      userId: mohammed.id,
      questions: JSON.stringify([
        {
          question: "Quelle est la différence entre '==' et '===' en JavaScript ?",
          options: [
            "Aucune différence",
            "=== compare le type et la valeur, == compare seulement la valeur",
            "== est plus rapide que ===",
            "=== est obsolète"
          ],
          correctAnswer: 1
        },
        {
          question: "Qu'est-ce que le DOM en développement web ?",
          options: [
            "Document Object Model",
            "Data Object Management",
            "Dynamic Object Method",
            "Database Object Model"
          ],
          correctAnswer: 0
        },
        {
          question: "Quel est le rôle principal de React ?",
          options: [
            "Gérer les bases de données",
            "Créer des interfaces utilisateur",
            "Gérer les serveurs",
            "Compiler le code"
          ],
          correctAnswer: 1
        },
        {
          question: "Qu'est-ce qu'une API REST ?",
          options: [
            "Un type de base de données",
            "Un langage de programmation",
            "Une architecture pour les services web",
            "Un framework JavaScript"
          ],
          correctAnswer: 2
        },
        {
          question: "Quelle commande Git permet de créer une nouvelle branche ?",
          options: [
            "git new branch",
            "git create branch",
            "git branch nom-branche",
            "git make branch"
          ],
          correctAnswer: 2
        },
        {
          question: "Qu'est-ce que SQL ?",
          options: [
            "Structured Query Language",
            "Simple Query Language",
            "Standard Query Language",
            "System Query Language"
          ],
          correctAnswer: 0
        },
        {
          question: "Quel est l'avantage principal des méthodes agiles ?",
          options: [
            "Code plus rapide",
            "Moins de bugs",
            "Flexibilité et adaptation au changement",
            "Interface plus belle"
          ],
          correctAnswer: 2
        },
        {
          question: "Qu'est-ce que Node.js ?",
          options: [
            "Un framework CSS",
            "Un environnement d'exécution JavaScript côté serveur",
            "Une base de données",
            "Un éditeur de code"
          ],
          correctAnswer: 1
        },
        {
          question: "Quelle est la fonction principale d'un ORM ?",
          options: [
            "Optimiser les images",
            "Mapper les objets aux tables de base de données",
            "Gérer les utilisateurs",
            "Créer des interfaces"
          ],
          correctAnswer: 1
        },
        {
          question: "Qu'est-ce que le responsive design ?",
          options: [
            "Design qui répond aux utilisateurs",
            "Design qui s'adapte à différentes tailles d'écran",
            "Design avec des animations",
            "Design coloré"
          ],
          correctAnswer: 1
        }
      ]),
      answers: JSON.stringify([1, 0, 1, 2, 2, 0, 2, 1, 1, 1]), // 8/10 bonnes réponses
      score: 80,
      completedAt: new Date()
    }
  });

  console.log('✅ Données créées avec succès !');
  console.log(`📊 Entreprise: ${company.name}`);
  console.log(`👤 Recruteur: ${recruiter.name} (${recruiter.email})`);
  console.log(`🎯 Candidat: ${mohammed.name} (${mohammed.email})`);
  console.log(`💼 Offre 1: ${jobOffer1.title} - Candidature acceptée (Score: 85%)`);
  console.log(`🎨 Offre 2: ${jobOffer2.title} - Candidature refusée (Score: 25%)`);
  console.log(`📝 Test technique: 8/10 bonnes réponses (Score: 80%)`);

  // Afficher les informations détaillées des postes
  console.log('\n📋 INFORMATIONS DÉTAILLÉES DES POSTES:');
  console.log('\n🔧 POSTE 1: INGÉNIEUR INFORMATIQUE');
  console.log('='.repeat(50));
  console.log(`Titre: ${jobOffer1.title}`);
  console.log(`Entreprise: ${company.name}`);
  console.log(`Localisation: ${jobOffer1.location}`);
  console.log(`Salaire: ${jobOffer1.salary}`);
  console.log(`Type de contrat: ${jobOffer1.contractType}`);
  console.log(`Niveau d'expérience: ${jobOffer1.experienceLevel}`);
  console.log(`Compétences requises: ${jobOffer1.skills?.join(', ')}`);
  console.log(`Status candidature Mohammed: ✅ ACCEPTÉE (Score IA: 85%)`);
  console.log(`Test technique: ✅ COMPLÉTÉ (Score: 80%)`);

  console.log('\n🎨 POSTE 2: DESIGNER GRAPHIQUE');
  console.log('='.repeat(50));
  console.log(`Titre: ${jobOffer2.title}`);
  console.log(`Entreprise: ${company.name}`);
  console.log(`Localisation: ${jobOffer2.location}`);
  console.log(`Salaire: ${jobOffer2.salary}`);
  console.log(`Type de contrat: ${jobOffer2.contractType}`);
  console.log(`Niveau d'expérience: ${jobOffer2.experienceLevel}`);
  console.log(`Compétences requises: ${jobOffer2.skills?.join(', ')}`);
  console.log(`Status candidature Mohammed: ❌ REFUSÉE (Score IA: 25%)`);
  console.log(`Raison: Profil technique ne correspondant pas au poste créatif`);
}

main()
  .catch((e) => {
    console.error('❌ Erreur:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
