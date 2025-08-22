// --- SIMULATION DE SESSION ---
// Dans un vrai projet, ceci serait géré par NextAuth.js (`auth()` ou `useSession`)
import { cookies } from 'next/headers';

export type MockUser = {
  id: string;
  name: string;
  email: string;
  role: 'CEO' | 'RECRUITER' | 'CANDIDATE';
  companyId?: string;
};

const users: Record<string, MockUser> = {
  ceo: { id: 'user_ceo_1', name: 'Alice CEO', email: 'ceo@smart-interview.com', role: 'CEO', companyId: 'comp_1' },
  recruiter: { id: 'user_recruiter_1', name: 'Bob Recruiter', email: 'recruiter@smart-interview.com', role: 'RECRUITER', companyId: 'comp_1' },
  candidate: { id: 'user_candidate_1', name: 'Charlie Candidate', email: 'candidate@test.com', role: 'CANDIDATE' },
};

export async function getSession() {
  const cookieStore = await cookies();
  const roleCookie = cookieStore.get('user-role')?.value || 'candidate';
  return users[roleCookie] || users.candidate;
}
