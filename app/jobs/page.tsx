"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Container } from "@/components/layout/container"
import { PageHeader } from "@/components/ui/page-header"
import { Briefcase, MapPin, Clock, AlertCircle } from "lucide-react"

interface JobOffer {
  id: string
  title: string
  description: string
  skills: string[]
  deadline: string | null
  company: {
    name: string
  }
  createdAt: string
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const { data: session } = useSession()
  const router = useRouter()

  useEffect(() => {
    fetchJobs()
  }, [])

  const fetchJobs = async () => {
    try {
      const response = await fetch("/api/job-offers/public")
      if (response.ok) {
        const data = await response.json()
        // Filtrer les offres non expirées
        const activeJobs = data.filter((job: JobOffer) => {
          if (!job.deadline) return true
          return new Date(job.deadline) >= new Date()
        })
        setJobs(activeJobs)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des offres:", error)
    } finally {
      setLoading(false)
    }
  }

  const getDeadlineInfo = (deadline: string | null) => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays <= 3) {
      return {
        urgent: true,
        text: `${diffDays} jour${diffDays !== 1 ? "s" : ""} restant${diffDays !== 1 ? "s" : ""}`,
        color: "bg-red-100 text-red-800",
      }
    } else if (diffDays <= 7) {
      return {
        urgent: false,
        text: `${diffDays} jours restants`,
        color: "bg-orange-100 text-orange-800",
      }
    } else {
      return {
        urgent: false,
        text: `Jusqu'au ${deadlineDate.toLocaleDateString("fr-FR")}`,
        color: "bg-blue-100 text-blue-800",
      }
    }
  }

  const handleJobDetailsClick = (jobId: string) => {
    if (!session) {
      router.push("/auth/signin")
    } else {
      router.push(`/jobs/${jobId}`)
    }
  }

  if (loading) {
    return (
      <Container>
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Chargement des offres...</p>
        </div>
      </Container>
    )
  }

  return (
    <Container>
      <PageHeader
        title="Offres d'emploi"
        description="Découvrez les opportunités disponibles et postulez en quelques clics"
      >
        <div className="text-sm text-muted-foreground">
          {jobs.length} offre{jobs.length !== 1 ? "s" : ""} disponible{jobs.length !== 1 ? "s" : ""}
        </div>
      </PageHeader>

      {jobs.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Briefcase className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-medium text-gray-900 mb-2">Aucune offre disponible</h3>
            <p className="text-gray-600 mb-4">Revenez plus tard pour découvrir de nouvelles opportunités.</p>
            <Button asChild variant="outline">
              <Link href="/">Retour à l'accueil</Link>
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {jobs.map((job) => {
            const deadlineInfo = getDeadlineInfo(job.deadline)

            return (
              <Card key={job.id} className="hover:shadow-lg transition-all duration-200 hover:-translate-y-1">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex-1">
                      <CardTitle className="text-lg leading-tight mb-1">{job.title}</CardTitle>
                      <CardDescription className="flex items-center">
                        <MapPin className="w-4 h-4 mr-1" />
                        {job.company.name}
                      </CardDescription>
                    </div>
                    <Briefcase className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  </div>

                  {deadlineInfo && (
                    <div className="flex items-center gap-2">
                      {deadlineInfo.urgent ? (
                        <AlertCircle className="w-4 h-4 text-red-500" />
                      ) : (
                        <Clock className="w-4 h-4 text-blue-500" />
                      )}
                      <Badge className={`text-xs ${deadlineInfo.color}`}>{deadlineInfo.text}</Badge>
                    </div>
                  )}
                </CardHeader>

                <CardContent className="pt-0">
                  <p className="text-sm text-gray-600 mb-4 line-clamp-3">{job.description}</p>

                  <div className="mb-4">
                    <p className="text-sm font-medium text-gray-700 mb-2">Compétences requises :</p>
                    <div className="flex flex-wrap gap-1">
                      {job.skills.slice(0, 3).map((skill) => (
                        <Badge key={skill} variant="secondary" className="text-xs">
                          {skill}
                        </Badge>
                      ))}
                      {job.skills.length > 3 && (
                        <Badge variant="outline" className="text-xs">
                          +{job.skills.length - 3}
                        </Badge>
                      )}
                    </div>
                  </div>

                  <div className="flex items-center justify-between">
                    <div className="text-xs text-gray-500">
                      Publié le {new Date(job.createdAt).toLocaleDateString("fr-FR")}
                    </div>
                    <Button size="sm" onClick={() => handleJobDetailsClick(job.id)}>
                      Voir les détails
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </Container>
  )
}
