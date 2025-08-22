# Smart interview

##  Description
**Smart_interview** est une application web développée avec **Next.js** et **Node.js**, conçue pour gérer les processus de recrutement intelligents.  
Elle permet de générer des questions d’entretien personnalisées, d’analyser les CV des candidats et de gérer les offres d’emploi, offrant ainsi une interface simple et intuitive pour recruteurs et candidats.

## Fonctionnalités principales
- **Génération de questions d’entretien** : création automatique de questions adaptées aux profils des candidats.
- **Analyse de CV** : évaluation automatique des CV pour correspondance avec les offres d’emploi.
- **Gestion des offres d’emploi et candidatures** : suivi complet du processus de recrutement.
- **Interface web moderne** : navigation fluide et expérience utilisateur optimisée.
- **CRUD complet** : opérations sur les candidats, les offres et les questions générées.

## Architecture & Technologies
- **Langage** : JavaScript / TypeScript (100 %)
- **Framework** : Next.js
- **Base de données** : Prisma ORM (configuration à préciser)
- **Structure** :
  - `src/` → code source principal
  - `package.json` → configuration des dépendances
  - `.gitignore` → fichiers à ignorer pour le versionnement

## Installation
1. Clonez ou téléchargez le projet :
    ```bash
    git clone https://github.com/khayatti1/Smart_interview.git
    ```
2. Accédez au répertoire du projet :
    ```bash
    cd Smart_interview
    ```
3. Installez les dépendances :
    ```bash
    pnpm install
    ```
4. Configurez votre base de données et vos variables d’environnement dans le fichier `.env`.
5. Lancez l'application en mode développement :
    ```bash
    pnpm dev
    ```

## Utilisation
- Accédez à l’application via votre navigateur à l’adresse `http://localhost:3000`.
- Créez un compte recruteur ou candidat pour accéder aux fonctionnalités.
- Publiez des offres d’emploi et gérez les candidatures.
- Les candidats peuvent postuler et soumettre leurs CV pour analyse.
- Le système génère des questions d’entretien adaptées et permet de suivre l’avancement des candidats.
