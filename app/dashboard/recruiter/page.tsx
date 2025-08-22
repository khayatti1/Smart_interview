import { redirect } from "next/navigation"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import RecruiterDashboard from "@/components/dashboards/recruiter-dashboard"

export default async function RecruiterDashboardPage() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    redirect("/auth/signin")
  }

  if (session.user.role !== "RECRUITER") {
    redirect("/dashboard")
  }

  return <RecruiterDashboard />
}
