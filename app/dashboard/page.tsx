import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import CandidateDashboard from "@/components/dashboards/candidate-dashboard"
import CEODashboard from "@/components/dashboards/ceo-dashboard"
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  // Afficher le dashboard selon le rôle
  switch (session.user.role) {
    case "CEO":
      return <CEODashboard />
    case "RECRUITER":
      return <RecruiterDashboard />
    case "CANDIDATE":
      return <CandidateDashboard />
    default:
      redirect("/auth/signin")
  }
}
