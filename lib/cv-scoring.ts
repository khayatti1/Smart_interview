interface CVAnalysis {
  score: number
  matchingSkills: string[]
  missingSkills: string[]
  experience: string
  education: string
  summary: string
}

export async function analyzeCV(cvPath: string, requiredSkills: string[]): Promise<CVAnalysis> {
  try {
    // Simulation d'analyse CV basée sur les compétences requises
    const allSkills = [
      "JavaScript",
      "TypeScript",
      "React",
      "Node.js",
      "Python",
      "Java",
      "C++",
      "C#",
      "HTML",
      "CSS",
      "SQL",
      "MongoDB",
      "PostgreSQL",
      "MySQL",
      "Docker",
      "Kubernetes",
      "AWS",
      "Azure",
      "GCP",
      "Git",
      "Linux",
      "Windows",
      "MacOS",
      "Agile",
      "Scrum",
      "REST",
      "GraphQL",
      "Express",
      "Next.js",
      "Vue.js",
      "Angular",
      "Spring",
      "Django",
      "Flask",
      "Laravel",
      "PHP",
      "Ruby",
      "Go",
      "Rust",
      "Swift",
      "Kotlin",
      "Flutter",
      "React Native",
      "iOS",
      "Android",
      "Unity",
      "Unreal",
      "Photoshop",
      "Illustrator",
      "Figma",
      "Sketch",
      "Adobe XD",
      "InDesign",
      "After Effects",
      "Premiere Pro",
    ]

    // Simuler les compétences trouvées dans le CV (basé sur le nom du fichier et compétences requises)
    const simulatedCVSkills = [
      ...requiredSkills.slice(0, Math.floor(requiredSkills.length * 0.8)), // 80% des compétences requises
      ...allSkills.slice(0, Math.floor(Math.random() * 5) + 3), // 3-7 compétences aléatoires
    ]

    const matchingSkills = requiredSkills.filter((skill) =>
      simulatedCVSkills.some(
        (cvSkill) =>
          cvSkill.toLowerCase().includes(skill.toLowerCase()) || skill.toLowerCase().includes(cvSkill.toLowerCase()),
      ),
    )

    const missingSkills = requiredSkills.filter((skill) => !matchingSkills.includes(skill))

    // Calculer le score basé sur les compétences correspondantes
    const skillScore = requiredSkills.length > 0 ? (matchingSkills.length / requiredSkills.length) * 100 : 75

    // Ajouter des variations aléatoires pour simuler l'expérience et l'éducation
    const experienceBonus = Math.floor(Math.random() * 20) - 10 // -10 à +10
    const educationBonus = Math.floor(Math.random() * 15) - 5 // -5 à +10

    const finalScore = Math.max(0, Math.min(100, Math.round(skillScore + experienceBonus + educationBonus)))

    const analysis: CVAnalysis = {
      score: finalScore,
      matchingSkills,
      missingSkills,
      experience: `${Math.floor(Math.random() * 8) + 1} ans d'expérience professionnelle`,
      education: ["Bac+3", "Bac+5", "Bac+2", "Autodidacte"][Math.floor(Math.random() * 4)],
      summary: `Profil ${finalScore >= 75 ? "excellent" : finalScore >= 50 ? "bon" : "à développer"} avec ${matchingSkills.length}/${requiredSkills.length} compétences correspondantes.`,
    }

    return analysis
  } catch (error) {
    console.error("Erreur lors de l'analyse du CV:", error)

    // Retourner une analyse par défaut en cas d'erreur
    return {
      score: 60,
      matchingSkills: [],
      missingSkills: requiredSkills,
      experience: "Expérience non déterminée",
      education: "Formation non déterminée",
      summary: "Analyse automatique non disponible",
    }
  }
}

// Fonction pour analyser un CV existant
export function analyzeCVContent(cvContent: string, requiredSkills: string[]): CVAnalysis {
  const content = cvContent.toLowerCase()

  const matchingSkills = requiredSkills.filter((skill) => content.includes(skill.toLowerCase()))

  const missingSkills = requiredSkills.filter((skill) => !matchingSkills.includes(skill))

  const skillScore = requiredSkills.length > 0 ? (matchingSkills.length / requiredSkills.length) * 100 : 75

  // Analyser l'expérience (recherche de mots-clés)
  const experienceKeywords = ["ans", "année", "expérience", "stage", "projet"]
  const hasExperience = experienceKeywords.some((keyword) => content.includes(keyword))
  const experienceBonus = hasExperience ? 10 : -5

  // Analyser l'éducation
  const educationKeywords = ["diplôme", "université", "école", "formation", "master", "licence"]
  const hasEducation = educationKeywords.some((keyword) => content.includes(keyword))
  const educationBonus = hasEducation ? 5 : 0

  const finalScore = Math.max(0, Math.min(100, Math.round(skillScore + experienceBonus + educationBonus)))

  return {
    score: finalScore,
    matchingSkills,
    missingSkills,
    experience: hasExperience ? "Expérience professionnelle détectée" : "Peu d'expérience détectée",
    education: hasEducation ? "Formation supérieure détectée" : "Formation non spécifiée",
    summary: `Score de ${finalScore}% basé sur ${matchingSkills.length}/${requiredSkills.length} compétences correspondantes.`,
  }
}
