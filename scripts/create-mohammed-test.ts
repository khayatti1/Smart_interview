import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function createMohammedTest() {
  try {
    console.log('🚀 Création du test pour Mohammed...');

    // Trouver Mohammed
    const mohammed = await prisma.user.findFirst({
      where: {
        email: 'mohammed.khayati@example.com'
      }
    });

    if (!mohammed) {
      console.error('❌ Mohammed non trouvé');
      return;
    }

    // Trouver l'offre d'ingénieur informatique
    const jobOffer = await prisma.jobOffer.findFirst({
      where: {
        title: {
          contains: 'Ingénieur'
        }
      }
    });

    if (!jobOffer) {
      console.error('❌ Offre d\'emploi non trouvée');
      return;
    }

    // Créer ou trouver la candidature
    let application = await prisma.application.findFirst({
      where: {
        candidateId: mohammed.id,
        jobOfferId: jobOffer.id
      }
    });

    if (!application) {
      application = await prisma.application.create({
        data: {
          candidateId: mohammed.id,
          jobOfferId: jobOffer.id,
          status: 'TEST_PENDING',
          aiScore: 85,
          aiAnalysis: 'Excellent profil technique correspondant au poste'
        }
      });
    }

    // Créer le test technique avec des questions réalistes
    const questions = [
      {
        question: "Qu'est-ce que JavaScript?",
        options: ["Un langage de programmation", "Une base de données", "Un serveur web", "Un système d'exploitation"],
        correctAnswer: 0
      },
      {
        question: "Quelle est la différence entre '==' et '===' en JavaScript?",
        options: ["Aucune différence", "=== compare type et valeur", "== est plus rapide", "=== est obsolète"],
        correctAnswer: 1
      },
      {
        question: "Qu'est-ce que CSS?",
        options: ["Un langage de programmation", "Un langage de style", "Une base de données", "Un framework"],
        correctAnswer: 1
      },
      {
        question: "Que signifie API?",
        options: ["Application Programming Interface", "Advanced Programming Interface", "Automated Program Interface", "Application Process Interface"],
        correctAnswer: 0
      },
      {
        question: "Qu'est-ce que Git?",
        options: ["Un éditeur de texte", "Un système de contrôle de version", "Un langage de programmation", "Une base de données"],
        correctAnswer: 1
      },
      {
        question: "Quelle est la fonction principale d'une base de données SQL?",
        options: ["Stocker des données structurées", "Créer des interfaces utilisateur", "Gérer le réseau", "Compiler du code"],
        correctAnswer: 0
      },
      {
        question: "Qu'est-ce qu'un algorithme?",
        options: ["Un langage de programmation", "Une suite d'instructions pour résoudre un problème", "Un type de base de données", "Un composant matériel"],
        correctAnswer: 1
      },
      {
        question: "Quel est le rôle principal d'un système d'exploitation?",
        options: ["Créer des sites web", "Gérer les ressources matérielles et logicielles", "Programmer des applications", "Stocker des données"],
        correctAnswer: 1
      },
      {
        question: "Qu'est-ce qu'un framework en développement logiciel?",
        options: ["Un langage de programmation", "Une structure de base pour développer des applications", "Un type de serveur", "Un système d'exploitation"],
        correctAnswer: 1
      },
      {
        question: "Qu'est-ce que le cloud computing?",
        options: ["L'utilisation de services informatiques via internet", "La programmation en réseau", "La création de sites web", "L'analyse de données locales"],
        correctAnswer: 0
      }
    ];

    // Vérifier si le test existe déjà
    const existingTest = await prisma.technicalTest.findFirst({
      where: {
        applicationId: application.id
      }
    });

    if (!existingTest) {
      await prisma.technicalTest.create({
        data: {
          applicationId: application.id,
          userId: mohammed.id,
          questions: JSON.stringify(questions)
        }
      });
    }

    console.log('✅ Test créé avec succès pour Mohammed');
    console.log(`📝 Application ID: ${application.id}`);
    console.log(`🎯 Job Offer: ${jobOffer.title}`);
    console.log(`👤 Candidat: ${mohammed.name}`);

  } catch (error) {
    console.error('❌ Erreur lors de la création du test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

createMohammedTest();
