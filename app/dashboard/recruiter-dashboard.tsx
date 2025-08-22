import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { PlusCircle, Users, FileCheck2 } from 'lucide-react';
import type { MockUser } from "@/app/lib/session";

// Action corrigée pour les formulaires
async function createJobOfferAction(formData: FormData) {
  'use server';
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const skills = formData.get('skills') as string;
  
  // Simulation de création d'offre
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Pas de retour de valeur pour éviter l'erreur TypeScript
}

// Données factices
const jobOffers = [
    { id: 'job_1', title: 'Développeur Frontend', applications: 15, accepted: 3 },
    { id: 'job_2', title: 'Ingénieur Backend', applications: 25, accepted: 2 },
];

export default function RecruiterDashboard({ user }: { user: MockUser }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <Card>
          <CardHeader>
            <CardTitle>Mes Offres d'Emploi</CardTitle>
            <CardDescription>Gérez vos offres et suivez les candidatures.</CardDescription>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              {jobOffers.map(job => (
                <li key={job.id} className="flex items-center justify-between p-4 border rounded-lg">
                  <p className="font-semibold">{job.title}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1"><Users className="h-4 w-4" /> {job.applications}</div>
                    <div className="flex items-center gap-1"><FileCheck2 className="h-4 w-4" /> {job.accepted}</div>
                    <Button variant="outline" size="sm">Voir les candidats</Button>
                  </div>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Créer une nouvelle offre</CardTitle>
            <CardDescription>Remplissez le formulaire pour publier une offre.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createJobOfferAction} className="space-y-4">
              <Input name="title" placeholder="Titre du poste" required />
              <Textarea name="description" placeholder="Description du poste" required />
              <Input name="skills" placeholder="Compétences (ex: React,Node.js)" />
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Publier l'offre
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
