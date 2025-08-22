import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PlusCircle, Building, UserCog, BarChart3, Users, FileCheck2 } from 'lucide-react';
import type { MockUser } from "@/app/lib/session";

// Action corrigée pour les formulaires
async function createRecruiterAction(formData: FormData) {
  'use server';
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // Simulation de création de recruteur
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Pas de retour de valeur pour éviter l'erreur TypeScript
}

// Données factices
const stats = { totalApplications: 124, successRate: '23%', timeToHire: '28 jours' };
const recruiters = [
    { id: 'rec_1', name: 'Bob Recruiter', email: 'recruiter@smart-interview.com' },
    { id: 'rec_2', name: 'Dana Developer', email: 'dana@smart-interview.com' },
];

export default function CeoDashboard({ user }: { user: MockUser }) {
  return (
    <div className="grid gap-8 lg:grid-cols-3">
      <div className="lg:col-span-2 space-y-8">
        <div className="grid gap-4 md:grid-cols-3">
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Candidatures totales</CardTitle>
                    <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats.totalApplications}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
                    <FileCheck2 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats.successRate}</div></CardContent>
            </Card>
            <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                    <CardTitle className="text-sm font-medium">Temps d'embauche moyen</CardTitle>
                    <BarChart3 className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent><div className="text-2xl font-bold">{stats.timeToHire}</div></CardContent>
            </Card>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Gestion des Recruteurs</CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-2">
              {recruiters.map(rec => (
                <li key={rec.id} className="flex items-center justify-between p-2 border-b">
                  <div>
                    <p className="font-semibold">{rec.name}</p>
                    <p className="text-sm text-muted-foreground">{rec.email}</p>
                  </div>
                  <Button variant="ghost" size="sm">Gérer</Button>
                </li>
              ))}
            </ul>
          </CardContent>
        </Card>
      </div>
      <div>
        <Card>
          <CardHeader>
            <CardTitle>Ajouter un Recruteur</CardTitle>
            <CardDescription>Créez un nouveau compte recruteur.</CardDescription>
          </CardHeader>
          <CardContent>
            <form action={createRecruiterAction} className="space-y-4">
              <Input name="name" placeholder="Nom complet" required />
              <Input type="email" name="email" placeholder="Adresse e-mail" required />
              <Button type="submit" className="w-full">
                <PlusCircle className="mr-2 h-4 w-4" /> Créer le compte
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
