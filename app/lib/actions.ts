'use server'

import { redirect } from 'next/navigation'
import { revalidatePath } from 'next/cache'

export async function applyForJob(jobId: string) {
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

export async function createJobOffer(formData: FormData) {
  const title = formData.get('title') as string;
  const description = formData.get('description') as string;
  const skills = formData.get('skills') as string;
  
  // Simulation de création d'offre
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  revalidatePath('/dashboard');
  return { success: true };
}

export async function createRecruiter(formData: FormData) {
  const name = formData.get('name') as string;
  const email = formData.get('email') as string;
  
  // Simulation de création de recruteur
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  revalidatePath('/dashboard');
  return { success: true };
}
