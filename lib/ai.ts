import { openai } from '@ai-sdk/openai';
import { generateObject } from 'ai';
import { z } from 'zod';

// Définir la structure de la réponse que nous attendons de l'IA
const analysisSchema = z.object({
  score: z.number().describe('Le score de correspondance entre 0 et 100.'),
  justification: z.string().describe('Une brève explication (2-3 phrases) justifiant le score.'),
  strengths: z.array(z.string()).describe('Les 2 ou 3 points forts principaux du candidat pour ce poste.'),
  weaknesses: z.array(z.string()).describe('Les 2 ou 3 points faibles ou compétences manquantes.'),
});

/**
 * Analyse un CV par rapport à une description de poste en utilisant l'IA.
 * @param jobDescription La description complète de l'offre d'emploi.
 * @param cvText Le contenu textuel du CV du candidat.
 * @returns Un objet contenant le score, la justification, les points forts et faibles.
 */
export async function analyzeCvWithAI(jobDescription: string, cvText: string) {
  try {
    const { object: analysis } = await generateObject({
      model: openai('gpt-4o'), // Utilise le modèle GPT-4o, très performant
      schema: analysisSchema,
      prompt: `
        En tant qu'expert en recrutement technique, analyse le CV suivant par rapport à la description de poste fournie.
        Fournis un score de correspondance de 0 à 100. Sois objectif et base-toi uniquement sur les informations présentes.

        --- DESCRIPTION DU POSTE ---
        ${jobDescription}

        --- CV DU CANDIDAT ---
        ${cvText}
      `,
    });

    return analysis;
  } catch (error) {
    console.error("AI_ANALYSIS_ERROR", error);
    // En cas d'erreur de l'API, retourner un score par défaut pour ne pas bloquer le flux
    return { score: 50, justification: "Analyse IA indisponible.", strengths: [], weaknesses: [] };
  }
}
