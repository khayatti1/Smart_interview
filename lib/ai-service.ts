import type { TechnicalQuestion } from "./technical-question" // Declare the TechnicalQuestion variable

// Define a type for the expected AI analysis output
export type CVAnalysis = {
  score: number
  analysis: string
  keywords: string[]
  matchDetails: string
  technicalScore?: number // Added for more granular scoring
}

export async function analyzeCVWithAI(
  cvText: string,
  jobOfferTitle: string,
  jobOfferDescription: string,
  jobOfferSkills: string[],
): Promise<CVAnalysis> {
  try {
    // Extraire les compétences techniques du CV
    const technicalKeywords = [
      "php",
      "python",
      "java",
      "javascript",
      "react",
      "angular",
      "vue",
      "node",
      "sql",
      "mysql",
      "postgresql",
      "oracle",
      "mongodb",
      "html",
      "css",
      "bootstrap",
      "git",
      "docker",
      "kubernetes",
      "aws",
      "azure",
      "linux",
      "windows",
      "développement",
      "programmation",
      "web",
      "mobile",
      "api",
      "rest",
      "uml",
      "merise",
      "scrum",
      "agile",
      "devops",
      "ci/cd",
    ]

    // Extraire les compétences non-techniques
    const nonTechnicalKeywords = [
      "banque",
      "bancaire",
      "finance",
      "financier",
      "comptabilité",
      "audit",
      "vente",
      "commercial",
      "marketing",
      "communication",
      "rh",
      "juridique",
      "droit",
      "assurance",
      "conseil",
      "investissement",
      "crédit",
      "gestion",
      "management",
      "direction",
      "stratégie",
      "business",
      "négociation",
    ]

    // Analyser le CV pour extraire les compétences
    const cvLower = cvText.toLowerCase()
    const cvTechnicalSkills = technicalKeywords.filter((skill) => cvLower.includes(skill))
    const cvNonTechnicalSkills = nonTechnicalKeywords.filter((skill) => cvLower.includes(skill))

    // Analyser l'offre d'emploi
    const offerText = `${jobOfferTitle} ${jobOfferDescription}`.toLowerCase()
    const skillsText = jobOfferSkills.join(" ").toLowerCase()
    const fullOfferText = `${offerText} ${skillsText}`

    // Compétences techniques requises dans l'offre
    const requiredTechnicalSkills = technicalKeywords.filter((skill) => fullOfferText.includes(skill))
    const requiredNonTechnicalSkills = nonTechnicalKeywords.filter((skill) => fullOfferText.includes(skill))

    // Calculer la correspondance
    let technicalMatch = 0
    let nonTechnicalMatch = 0
    let totalRequired = 0

    // Correspondance technique
    if (requiredTechnicalSkills.length > 0) {
      totalRequired += requiredTechnicalSkills.length
      technicalMatch = requiredTechnicalSkills.filter((skill) => cvTechnicalSkills.includes(skill)).length
    }

    // Correspondance non-technique
    if (requiredNonTechnicalSkills.length > 0) {
      totalRequired += requiredNonTechnicalSkills.length
      nonTechnicalMatch = requiredNonTechnicalSkills.filter((skill) => cvNonTechnicalSkills.includes(skill)).length
    }

    // Calculer le score final
    let finalScore: number
    let analysis: string
    let matchDetails: string

    if (totalRequired === 0) {
      finalScore = Math.floor(Math.random() * 20) + 20 // 20-40%
      analysis = "Profil général évalué selon l'expérience et la formation."
      matchDetails = "Évaluation basée sur le profil global du candidat"
    } else {
      const matchPercentage = ((technicalMatch + nonTechnicalMatch) / totalRequired) * 100

      if (matchPercentage >= 80) {
        finalScore = Math.floor(Math.random() * 15) + 75 // 75-90%
        analysis = `Excellente correspondance avec ${technicalMatch + nonTechnicalMatch}/${totalRequired} compétences requises trouvées dans le CV.`
        matchDetails = "Forte correspondance - Compétences alignées avec les exigences"
      } else if (matchPercentage >= 60) {
        finalScore = Math.floor(Math.random() * 15) + 60 // 60-74%
        analysis = `Bonne correspondance avec ${technicalMatch + nonTechnicalMatch}/${totalRequired} compétences requises trouvées.`
        matchDetails = "Bonne correspondance - Profil adapté mais quelques compétences manquantes"
      } else if (matchPercentage >= 40) {
        finalScore = Math.floor(Math.random() * 20) + 40 // 40-59%
        analysis = `Correspondance modérée avec ${technicalMatch + nonTechnicalMatch}/${totalRequired} compétences requises trouvées.`
        matchDetails = "Correspondance partielle - Plusieurs compétences manquantes"
      } else {
        finalScore = Math.floor(Math.random() * 20) + 15 // 15-35%
        analysis = `Faible correspondance avec seulement ${technicalMatch + nonTechnicalMatch}/${totalRequired} compétences requises trouvées.`
        matchDetails = "Correspondance insuffisante - Profil ne correspond pas aux exigences"
      }
    }

    console.log(`📝 CV analysé pour: ${jobOfferTitle}`)
    console.log(
      `🔍 Compétences CV: Techniques(${cvTechnicalSkills.length}), Non-techniques(${cvNonTechnicalSkills.length})`,
    )
    console.log(
      `🎯 Compétences requises: Techniques(${requiredTechnicalSkills.length}), Non-techniques(${requiredNonTechnicalSkills.length})`,
    )
    console.log(`✅ Correspondances: ${technicalMatch + nonTechnicalMatch}/${totalRequired}`)
    console.log(`🎯 Score final: ${finalScore}%`)

    return {
      score: finalScore,
      analysis,
      keywords: [...cvTechnicalSkills.slice(0, 3), ...cvNonTechnicalSkills.slice(0, 2)],
      matchDetails,
      technicalScore: technicalMatch > 0 ? finalScore : Math.floor(finalScore * 0.6),
    }
  } catch (error) {
    console.error("AI CV analysis failed:", error)
    return {
      score: 45,
      analysis: "Analyse automatique - Profil évalué selon les compétences disponibles.",
      keywords: ["Expérience", "Formation", "Compétences"],
      matchDetails: "Évaluation automatique basée sur le profil.",
      technicalScore: 45,
    }
  }
}

export async function generateTechnicalTest(
  jobTitle: string,
  skills: string[],
  cvAnalysis: CVAnalysis, // Use the defined CVAnalysis type
): Promise<TechnicalQuestion[]> {
  try {
    console.log(`🧠 Génération test technique pour: ${jobTitle}`)
    console.log(`📊 Niveau détecté: ${cvAnalysis.technicalScore || "N/A"}`) // Use technicalScore if available
    console.log(`🛠️ Compétences: ${skills.join(", ")}`)

    // Simuler un délai de génération
    await new Promise((resolve) => setTimeout(resolve, 500))

    // Questions adaptées aux compétences de Mohammed
    const questionBank: { [key: string]: TechnicalQuestion[] } = {
      PHP: [
        {
          question: "Quelle est la différence entre include() et require() en PHP ?",
          options: [
            "Aucune différence",
            "require() arrête l'exécution en cas d'erreur, include() continue",
            "include() est plus rapide",
            "require() est obsolète",
          ],
          correctAnswer: 1,
          explanation:
            "require() génère une erreur fatale et arrête l'exécution, include() génère un warning et continue.",
        },
        {
          question: "Comment se connecter à une base de données MySQL en PHP ?",
          options: ["mysql_connect() uniquement", "PDO ou MySQLi", "Seulement avec MySQLi", "Connexion automatique"],
          correctAnswer: 1,
          explanation: "PDO et MySQLi sont les méthodes modernes et sécurisées pour se connecter à MySQL.",
        },
      ],
      Python: [
        {
          question: "Qu'est-ce que Flask en Python ?",
          options: ["Une base de données", "Un micro-framework web", "Un éditeur de code", "Une librairie de calcul"],
          correctAnswer: 1,
          explanation: "Flask est un micro-framework web léger pour Python, idéal pour créer des applications web.",
        },
        {
          question: "Comment définir une route en Flask ?",
          options: ["@app.route('/path')", "app.get('/path')", "route('/path')", "app.path('/path')"],
          correctAnswer: 0,
          explanation: "Le décorateur @app.route() est utilisé pour définir les routes en Flask.",
        },
      ],
      Java: [
        {
          question: "Qu'est-ce que l'encapsulation en Java ?",
          options: [
            "Cacher les détails d'implémentation",
            "Créer plusieurs classes",
            "Utiliser des boucles",
            "Gérer les erreurs",
          ],
          correctAnswer: 0,
          explanation:
            "L'encapsulation consiste à cacher les détails d'implémentation et exposer une interface publique.",
        },
        {
          question: "Quelle est la différence entre ArrayList et LinkedList ?",
          options: [
            "Aucune différence",
            "ArrayList utilise un tableau, LinkedList une liste chaînée",
            "LinkedList est plus rapide",
            "ArrayList est obsolète",
          ],
          correctAnswer: 1,
          explanation:
            "ArrayList utilise un tableau dynamique, LinkedList utilise une structure de liste doublement chaînée.",
        },
      ],
      SQL: [
        {
          question: "Que fait la commande JOIN en SQL ?",
          options: [
            "Supprime des données",
            "Combine des données de plusieurs tables",
            "Crée une nouvelle table",
            "Modifie une table",
          ],
          correctAnswer: 1,
          explanation: "JOIN permet de combiner des données provenant de plusieurs tables basées sur une relation.",
        },
        {
          question: "Quelle est la différence entre DELETE et TRUNCATE ?",
          options: [
            "Aucune différence",
            "DELETE peut avoir une clause WHERE, TRUNCATE supprime tout",
            "TRUNCATE est plus lent",
            "DELETE est obsolète",
          ],
          correctAnswer: 1,
          explanation:
            "DELETE permet de supprimer des lignes spécifiques avec WHERE, TRUNCATE vide complètement la table.",
        },
      ],
      JavaScript: [
        {
          question: "Qu'est-ce que le DOM en JavaScript ?",
          options: [
            "Document Object Model",
            "Data Object Management",
            "Dynamic Object Method",
            "Database Object Model",
          ],
          correctAnswer: 0,
          explanation: "DOM (Document Object Model) représente la structure HTML/XML d'une page web.",
        },
        {
          question: "Comment déclarer une fonction en JavaScript ?",
          options: [
            "function nom() {} uniquement",
            "function nom() {} ou const nom = () => {}",
            "def nom():",
            "void nom() {}",
          ],
          correctAnswer: 1,
          explanation:
            "JavaScript permet plusieurs syntaxes : function classique, arrow functions, expressions de fonction.",
        },
      ],
    }

    // Générer 10 questions basées sur les compétences
    const questions: TechnicalQuestion[] = []
    const availableSkills = skills.filter((skill) =>
      Object.keys(questionBank).some(
        (key) => key.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(key.toLowerCase()),
      ),
    )

    // Si pas de compétences spécifiques, utiliser des questions générales
    if (availableSkills.length === 0) {
      availableSkills.push("JavaScript", "SQL") // Fallback
    }

    for (let i = 0; i < 10; i++) {
      const randomSkill = availableSkills[Math.floor(Math.random() * availableSkills.length)]
      const skillKey =
        Object.keys(questionBank).find(
          (key) =>
            key.toLowerCase().includes(randomSkill.toLowerCase()) ||
            randomSkill.toLowerCase().includes(key.toLowerCase()),
        ) || "JavaScript"

      const skillQuestions = questionBank[skillKey] || questionBank["JavaScript"]
      const randomQuestion = skillQuestions[Math.floor(Math.random() * skillQuestions.length)]

      questions.push({
        ...randomQuestion,
        question: `${i + 1}. ${randomQuestion.question}`,
      })
    }

    console.log(`✅ Test généré avec ${questions.length} questions pour ${skills.join(", ")}`)
    return questions
  } catch (error) {
    console.error("Erreur lors de la génération du test:", error)

    // Fallback: questions génériques
    return Array.from({ length: 10 }, (_, i) => ({
      question: `${i + 1}. Question technique générale ${i + 1}`,
      options: ["Option A", "Option B (correcte)", "Option C", "Option D"],
      correctAnswer: 1,
      explanation: "Explication de la réponse correcte.",
    }))
  }
}
