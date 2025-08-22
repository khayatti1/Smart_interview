"use client"

import { useState, useEffect, useCallback, use } from "react"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Briefcase, Building, MapPin, DollarSign, Calendar, Users, Zap, CheckCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type JobOffer = {
  id: string
  title: string
  description: string
  skills: string[]
  salary: string | null
  location: string | null
  deadline: Date | string | null // Updated to accept Date or string
  createdAt: string
  company: {
    name: string
    description?: string
  }
  _count?: {
    applications: number
  }
}

type Application = {
  id: string
  status: string
  cvScore: number
  testScore: number | null
  jobOfferId: string
}

export default function JobDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const { data: session, status: sessionStatus } = useSession()
  const router = useRouter()
  const { id } = use(params)

  const { toast } = useToast()
  const [jobOffer, setJobOffer] = useState<JobOffer | null>(null)
  const [loading, setLoading] = useState(true)
  const [applicationStatus, setApplicationStatus] = useState<string | null>(null)
  const [applying, setApplying] = useState(false)

  const fetchJobOffer = useCallback(async () => {
    try {
      const res = await fetch(`/api/job-offers/${id}`)
      if (res.ok) {
        const data = await res.json()
        setJobOffer(data)
      } else {
        toast({ title: "Erreur", description: "Offre d'emploi non trouvée", variant: "destructive" })
        router.push("/jobs")
      }
    } catch (error) {
      console.error("Failed to fetch job offer:", error)
      toast({ title: "Erreur", description: "Erreur réseau lors du chargement de l'offre", variant: "destructive" })
      router.push("/jobs")
    } finally {
      setLoading(false)
    }
  }, [id, router, toast])

  const fetchApplicationStatus = useCallback(async () => {
    if (sessionStatus !== "authenticated" || session?.user?.role !== "CANDIDATE") {
      setApplicationStatus(null)
      return
    }
    try {
      const res = await fetch(`/api/applications?jobOfferId=${id}`)
      if (res.ok) {
        const data: Application[] = await res.json()
        const existingApplication = data.find((app) => app.jobOfferId === id)
        if (existingApplication) {
          setApplicationStatus(existingApplication.status)
        } else {
          setApplicationStatus(null)
        }
      } else {
        setApplicationStatus(null)
      }
    } catch (error) {
      console.error("Failed to fetch application status:", error)
      setApplicationStatus(null)
    }
  }, [id, sessionStatus, session?.user?.role])

  useEffect(() => {
    fetchJobOffer()
    fetchApplicationStatus()
  }, [fetchJobOffer, fetchApplicationStatus])

  const handleApply = async () => {
    if (sessionStatus === "loading") return

    if (!session) {
      router.push(`/auth/signin?callbackUrl=/jobs/${id}`)
      return
    }

    if (session.user.role !== "CANDIDATE") {
      toast({
        title: "Accès refusé",
        description: "Seuls les candidats peuvent postuler",
        variant: "destructive",
      })
      return
    }

    setApplying(true)
    try {
      const response = await fetch(`/api/job-offers/${id}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const result = await response.json()
        setApplicationStatus(result.status) // Update status immediately

        if (result.status === "ACCEPTED") {
          toast({
            title: "Félicitations ! 🎉",
            description: `Votre CV a été accepté avec un score de ${result.cvScore}%. Un test technique vous attend dans votre dashboard.`,
            duration: 6000,
          })
        } else if (result.status === "PENDING") {
          toast({
            title: "Candidature reçue",
            description: `Votre candidature est en cours d'examen. Score CV: ${result.cvScore}%.`,
            duration: 6000,
          })
        } else {
          toast({
            title: "Candidature reçue",
            description: `Votre candidature a été enregistrée. Score CV: ${result.cvScore}%. Le score requis n'a pas été atteint.`,
            variant: "destructive",
            duration: 6000,
          })
        }
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur réseau", variant: "destructive" })
    } finally {
      setApplying(false)
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <Badge className="bg-green-500 hover:bg-green-600">Acceptée</Badge>
      case "REJECTED":
        return <Badge variant="destructive">Rejetée</Badge>
      case "PENDING":
        return <Badge variant="secondary">En attente</Badge>
      case "TEST_PENDING":
        return <Badge className="bg-blue-500 hover:bg-blue-600">Test à faire</Badge>
      case "TEST_COMPLETED":
        return <Badge className="bg-purple-500 hover:bg-purple-600">Test complété</Badge>
      default:
        return null
    }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Chargement de l'offre d'emploi...</p>
      </div>
    )
  }

  if (!jobOffer) {
    return (
      <div className="flex h-screen items-center justify-center">
        <p className="text-lg text-muted-foreground">Offre d'emploi non trouvée.</p>
      </div>
    )
  }

  const deadlineDate = jobOffer.deadline ? new Date(jobOffer.deadline) : null

  return (
    <div className="container mx-auto max-w-4xl py-8 px-4">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between mb-2">
            <CardTitle className="text-3xl font-bold">{jobOffer.title}</CardTitle>
            {applicationStatus && getStatusBadge(applicationStatus)}
          </div>
          <CardDescription className="text-lg text-muted-foreground flex items-center gap-2">
            <Building className="h-5 w-5" />
            {jobOffer.company.name}
            {jobOffer.location && (
              <>
                <span className="mx-1">•</span>
                <MapPin className="h-5 w-5" />
                {jobOffer.location}
              </>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            {jobOffer.salary && (
              <div className="flex items-center gap-2">
                <DollarSign className="h-4 w-4 text-green-600" />
                <span className="font-medium">Salaire:</span> {jobOffer.salary}
              </div>
            )}
            {deadlineDate && (
              <div className="flex items-center gap-2">
                <Calendar className="h-4 w-4 text-blue-600" />
                <span className="font-medium">Date limite:</span> {format(deadlineDate, "dd MMMM yyyy", { locale: fr })}
              </div>
            )}
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-600" />
              <span className="font-medium">Candidatures:</span> {jobOffer._count?.applications || 0}
            </div>
            <div className="flex items-center gap-2">
              <Briefcase className="h-4 w-4 text-orange-600" />
              <span className="font-medium">Publié le:</span>{" "}
              {format(new Date(jobOffer.createdAt), "dd MMMM yyyy", { locale: fr })}
            </div>
          </div>

          <Separator />

          <div>
            <h3 className="text-xl font-semibold mb-3">Description du poste</h3>
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {jobOffer.description || "Aucune description détaillée fournie pour le moment."}
            </p>
          </div>

          {jobOffer.skills && Array.isArray(jobOffer.skills) && jobOffer.skills.length > 0 && (
            <div>
              <h3 className="text-xl font-semibold mb-3">Compétences requises</h3>
              <div className="flex flex-wrap gap-2">
                {jobOffer.skills.map((skill) => (
                  <Badge key={skill} variant="secondary" className="text-base px-3 py-1">
                    {skill}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <div className="pt-4">
            {applicationStatus ? (
              <Button disabled className="w-full text-lg py-3">
                <CheckCircle className="w-5 h-5 mr-2" />
                Déjà postulé ({getStatusBadge(applicationStatus)?.props.children})
              </Button>
            ) : (
              <Button onClick={handleApply} disabled={applying} className="w-full text-lg py-3">
                {applying ? (
                  <>
                    <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                    Candidature en cours...
                  </>
                ) : (
                  <>
                    <Zap className="w-5 h-5 mr-2" />
                    Postuler à cette offre
                  </>
                )}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
