"use client";

import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Briefcase, Calendar, Zap } from 'lucide-react';
import { useFormState, useFormStatus } from "react-dom";
import { useEffect } from "react";
import { useToast } from "@/components/ui/use-toast";

type Job = {
  id: string;
  title: string;
  company: { name: string };
  skills: string[];
  deadline: Date;
};

// Action corrigée pour useFormState
async function applyForJobAction(prevState: any, formData: FormData) {
  const jobId = formData.get('jobId') as string;
  
  // Simulation d'une candidature
  const score = Math.floor(Math.random() * 40) + 60; // Score entre 60 et 100
  const status = score >= 75 ? 'TEST_PENDING' : 'CV_REJECTED';
  
  // Simulation d'un délai
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return {
    success: true,
    score,
    status
  };
}

function ApplyButton() {
  const { pending } = useFormStatus();
  return (
    <Button type="submit" className="w-full" disabled={pending}>
      {pending ? "Envoi en cours..." : (
        <>
          <Zap className="mr-2 h-4 w-4" /> Postuler
        </>
      )}
    </Button>
  );
}

export function JobCard({ job }: { job: Job }) {
  const { toast } = useToast();
  const [state, formAction] = useFormState(applyForJobAction, null);

  useEffect(() => {
    if (state?.success) {
      if (state.status === 'TEST_PENDING') {
        toast({
          title: "Félicitations ! 🎉",
          description: `Votre CV a été accepté avec un score de ${state.score}%. Un test technique vous attend.`,
          variant: "default",
        });
      } else {
         toast({
          title: "Candidature reçue",
          description: `Votre CV n'a pas atteint le score requis (${state.score}%).`,
          variant: "destructive",
        });
      }
    }
  }, [state, toast]);

  return (
    <Card className="flex flex-col">
      <CardHeader>
        <div className="flex items-center gap-4 mb-2">
          <div className="bg-primary/10 p-3 rounded-lg">
            <Briefcase className="h-6 w-6 text-primary" />
          </div>
          <div>
            <CardTitle>{job.title}</CardTitle>
            <CardDescription>{job.company.name}</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent className="flex-grow">
        <p className="font-semibold mb-2 text-sm">Compétences requises :</p>
        <div className="flex flex-wrap gap-2 mb-4">
          {job.skills.map((skill) => (
            <Badge key={skill} variant="secondary">{skill}</Badge>
          ))}
        </div>
        <div className="flex items-center text-sm text-muted-foreground">
          <Calendar className="mr-2 h-4 w-4" />
          Date limite: {job.deadline.toLocaleDateString()}
        </div>
      </CardContent>
      <CardFooter>
        <form action={formAction} className="w-full">
          <input type="hidden" name="jobId" value={job.id} />
          <ApplyButton />
        </form>
      </CardFooter>
    </Card>
  );
}
