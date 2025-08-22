"use client"

import type React from "react"

import { useState, useEffect, useCallback } from "react"
import { useSession } from "next-auth/react"
import { useRouter, useSearchParams } from "next/navigation"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Briefcase,
  FileText,
  Upload,
  Loader2,
  CheckCircle,
  XCircle,
  Hourglass,
  ExternalLink,
  Download,
  Eye,
  Zap,
} from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"
import { fr } from "date-fns/locale"

type Application = {
  id: string
  status: "PENDING" | "ACCEPTED" | "REJECTED" | "TEST_PENDING" | "TEST_COMPLETED"
  cvScore: number
  testScore: number | null
  createdAt: string
  jobOffer: {
    id: string
    title: string
    company: {
      name: string
    }
  }
  cvAnalysis: {
    fileName: string
    filePath: string
    score: number
    uploadDate: string
  } | null
}

type JobOffer = {
  id: string
  title: string
  description: string
  skills: string[]
  deadline: string | null
  createdAt: string
  company: {
    name: string
    description?: string
  }
  _count?: {
    applications: number
  }
}

type CandidateStats = {
  totalApplications: number
  acceptedApplications: number
  pendingApplications: number
  rejectedApplications: number
  averageCvScore: number
  averageTestScore: number
  successRate: number
}

type UserCV = {
  id: string
  fileName: string
  filePath: string
  score: number
  analysis: any
  uploadDate: string
}

export default function CandidateDashboard() {
  const { data: session, status } = useSession()
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()

  const [applications, setApplications] = useState<Application[]>([])
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [stats, setStats] = useState<CandidateStats | null>(null)
  const [userCV, setUserCV] = useState<UserCV | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)

  const currentTab = searchParams.get("tab") || "profile"

  const fetchApplications = useCallback(async () => {
    if (session?.user?.role !== "CANDIDATE") return
    try {
      const res = await fetch("/api/applications")
      if (res.ok) {
        const data = await res.json()
        setApplications(data)
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les candidatures", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to fetch applications:", error)
      toast({
        title: "Erreur",
        description: "Erreur réseau lors du chargement des candidatures",
        variant: "destructive",
      })
    }
  }, [session, toast])

  const fetchJobOffers = useCallback(async () => {
    try {
      const res = await fetch("/api/job-offers/public")
      if (res.ok) {
        const data = await res.json()
        setJobOffers(data)
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les offres d'emploi", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to fetch job offers:", error)
      toast({ title: "Erreur", description: "Erreur réseau lors du chargement des offres", variant: "destructive" })
    }
  }, [toast])

  const fetchStats = useCallback(async () => {
    if (session?.user?.role !== "CANDIDATE") return
    try {
      const res = await fetch("/api/candidate/stats")
      if (res.ok) {
        const data = await res.json()
        setStats(data)
      } else {
        toast({ title: "Erreur", description: "Impossible de charger les statistiques", variant: "destructive" })
      }
    } catch (error) {
      console.error("Failed to fetch stats:", error)
      toast({
        title: "Erreur",
        description: "Erreur réseau lors du chargement des statistiques",
        variant: "destructive",
      })
    }
  }, [session, toast])

  const fetchUserCV = useCallback(async () => {
    if (session?.user?.role !== "CANDIDATE") return
    try {
      const response = await fetch("/api/candidate/cv")
      if (response.ok) {
        const cvData = await response.json()
        setUserCV(cvData.cv || null) // Assuming the API returns { cv: CVData }
      } else {
        setUserCV(null)
      }
    } catch (error) {
      console.error("Failed to fetch user CV", error)
      setUserCV(null)
    }
  }, [session])

  useEffect(() => {
    if (status === "loading") return
    if (!session) {
      router.push("/auth/signin")
      return
    }
    if (session.user.role !== "CANDIDATE") {
      router.push("/dashboard") // Redirect if not a candidate
      return
    }

    setLoading(true)
    Promise.all([fetchApplications(), fetchJobOffers(), fetchStats(), fetchUserCV()]).finally(() => setLoading(false))
  }, [session, status, router, fetchApplications, fetchJobOffers, fetchStats, fetchUserCV])

  const handleCVUpload = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!cvFile) return

    setUploadingCV(true)
    const formData = new FormData()
    formData.append("cv", cvFile)

    try {
      const response = await fetch("/api/candidate/cv", {
        method: "POST",
        body: formData,
      })

      if (response.ok) {
        const data = await response.json()
        toast({
          title: "CV uploadé avec succès",
          description: `Score initial: ${data.score}%`,
        })
        setCvFile(null)
        fetchUserCV() // Recharger les CV
        fetchStats() // Recharger les stats car le CV a changé
      } else {
        const error = await response.json() // Assuming error is JSON
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de l'upload",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de l'upload du CV", variant: "destructive" })
    }
    setUploadingCV(false)
  }

  const handleApply = async (jobOfferId: string) => {
    if (!session) {
      router.push(`/auth/signin?callbackUrl=/jobs/${jobOfferId}`)
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

    if (!userCV) {
      toast({
        title: "CV requis",
        description: "Veuillez d'abord téléverser votre CV dans l'onglet 'Mon Profil'",
        variant: "destructive",
      })
      router.push("/dashboard?tab=profile")
      return
    }

    // Check if already applied
    const alreadyApplied = applications.some((app) => app.jobOffer.id === jobOfferId)
    if (alreadyApplied) {
      toast({
        title: "Déjà postulé",
        description: "Vous avez déjà postulé à cette offre",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch(`/api/job-offers/${jobOfferId}/apply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        const result = await response.json()
        fetchApplications() // Refresh applications list

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
    }
  }

  const getStatusBadge = (status: Application["status"]) => {
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
        return <Badge variant="outline">Inconnu</Badge>
    }
  }

  const getScoreColor = (score: number | null) => {
    if (score === null) return "text-gray-500"
    if (score >= 75) return "text-green-600"
    if (score >= 60) return "text-orange-600"
    return "text-red-600"
  }

  const formatScore = (score: number | null) => {
    return score !== null ? `${score.toFixed(0)}%` : "N/A"
  }

  const getJobCategory = (title: string, skills: string[]) => {
    const titleLower = title.toLowerCase()
    const skillsLower = skills.map((s) => s.toLowerCase())

    if (
      titleLower.includes("développeur") ||
      titleLower.includes("developer") ||
      titleLower.includes("programmeur") ||
      skillsLower.some((s) => ["javascript", "python", "java", "react", "node", "php", "c++"].includes(s))
    ) {
      return { category: "Développement", color: "bg-blue-100 text-blue-800", icon: "💻" }
    }
    if (
      titleLower.includes("design") ||
      titleLower.includes("art") ||
      titleLower.includes("graphique") ||
      titleLower.includes("créatif") ||
      skillsLower.some((s) => ["photoshop", "illustrator", "figma", "design", "créativité"].includes(s))
    ) {
      return { category: "Design/Art", color: "bg-purple-100 text-purple-800", icon: "🎨" }
    }
    if (
      titleLower.includes("droit") ||
      titleLower.includes("juridique") ||
      titleLower.includes("avocat") ||
      titleLower.includes("juriste")
    ) {
      return { category: "Juridique", color: "bg-gray-100 text-gray-800", icon: "⚖️" }
    }
    if (
      titleLower.includes("marketing") ||
      titleLower.includes("commercial") ||
      titleLower.includes("vente") ||
      titleLower.includes("communication")
    ) {
      return { category: "Marketing", color: "bg-green-100 text-green-800", icon: "📈" }
    }
    if (titleLower.includes("rh") || titleLower.includes("ressources humaines") || titleLower.includes("recrutement")) {
      return { category: "RH", color: "bg-orange-100 text-orange-800", icon: "👥" }
    }
    return { category: "Autre", color: "bg-gray-100 text-gray-800", icon: "💼" }
  }

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center">
        <Loader2 className="h-10 w-10 animate-spin text-blue-600" />
        <p className="ml-4 text-lg text-muted-foreground">Chargement du tableau de bord...</p>
      </div>
    )
  }

  if (!session || session.user.role !== "CANDIDATE") {
    return null // Should be redirected by useEffect
  }

  const user = session.user

  return (
    <div className="container mx-auto max-w-7xl py-8 px-4">
      <div className="mb-8 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Tableau de bord Candidat</h1>
        <div className="flex items-center gap-4">
          <Avatar className="h-10 w-10">
            <AvatarFallback>{user.name ? user.name[0] : "U"}</AvatarFallback>
          </Avatar>
          <div>
            <p className="font-medium">{user.name}</p>
            <p className="text-sm text-muted-foreground">{user.email}</p>
          </div>
        </div>
      </div>

      <Tabs value={currentTab} onValueChange={(value) => router.push(`/dashboard?tab=${value}`)} className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="profile">Mon Profil</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="tests">Mes Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="profile" className="mt-6">
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
            <Card className="bg-blue-50 border-blue-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Total Candidatures</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats?.totalApplications || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-yellow-50 border-yellow-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-yellow-700">En Attente</CardTitle>
                <Hourglass className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-900">{stats?.pendingApplications || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-green-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-700">Acceptées</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{stats?.acceptedApplications || 0}</div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-red-200">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-red-700">Rejetées</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-900">{stats?.rejectedApplications || 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6">
            <Card>
              <CardHeader>
                <CardTitle>Informations Personnelles</CardTitle>
                <CardDescription>Vos informations de profil.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Nom</p>
                  <p className="text-lg font-semibold">{user.name}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Email</p>
                  <p className="text-lg font-semibold">{user.email}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Rôle</p>
                  <Badge variant="secondary">Candidat</Badge>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mon CV</CardTitle>
                <CardDescription>Gérez votre CV et consultez-le.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {userCV ? (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-sm">{userCV.fileName}</p>
                        <p className="text-xs text-muted-foreground">
                          Uploadé le {format(new Date(userCV.uploadDate), "dd/MM/yyyy")}
                        </p>
                      </div>
                      <Badge variant="default">Disponible</Badge>
                    </div>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <a
                          href={`/api/uploads${userCV.filePath.replace("/uploads/", "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-4 h-4 mr-2" />
                          Voir CV
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                        <a href={`/api/uploads${userCV.filePath.replace("/uploads/", "/")}`} download={userCV.fileName}>
                          <Download className="w-4 h-4 mr-2" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4">
                    <FileText className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground mb-3">Aucun CV téléversé</p>
                  </div>
                )}

                <form onSubmit={handleCVUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="cv-file">Sélectionner un fichier CV</Label>
                    <Input
                      id="cv-file"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={!cvFile || uploadingCV} className="w-full">
                    {uploadingCV ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Upload...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {userCV ? "Mettre à jour le CV" : "Téléverser mon CV"}
                      </>
                    )}
                  </Button>
                </form>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Performance Moyenne</CardTitle>
                <CardDescription>Vos scores moyens par candidature</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score CV Moyen</span>
                    <span className="text-sm font-bold">{formatScore(stats?.averageCvScore || 0)}</span>
                  </div>
                  <Progress value={stats?.averageCvScore || 0} className="w-full" />
                </div>
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">Score Test Moyen</span>
                    <span className="text-sm font-bold">{formatScore(stats?.averageTestScore || 0)}</span>
                  </div>
                  <Progress value={stats?.averageTestScore || 0} className="w-full" />
                </div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Mes Candidatures</CardTitle>
              <CardDescription>Suivez le statut de vos candidatures avec scores contextuels.</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-muted-foreground">Vous n'avez pas encore postulé à des offres.</p>
              ) : (
                <div className="space-y-4">
                  {applications.map((app) => (
                    <Card
                      key={app.id}
                      className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between"
                    >
                      <div className="flex-1 mb-4 md:mb-0">
                        <h3 className="text-lg font-semibold">{app.jobOffer.title}</h3>
                        <p className="text-sm text-muted-foreground">{app.jobOffer.company.name}</p>
                        <p className="text-xs text-muted-foreground">
                          Postulé le {format(new Date(app.createdAt), "dd MMMM yyyy", { locale: fr })}
                        </p>
                      </div>
                      <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Score CV:</span>
                          <span className={`text-sm font-bold ${getScoreColor(app.cvScore)}`}>
                            {formatScore(app.cvScore)}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">Test:</span>
                          <span className={`text-sm font-bold ${getScoreColor(app.testScore)}`}>
                            {formatScore(app.testScore)}
                          </span>
                        </div>
                        {getStatusBadge(app.status)}
                        {app.status === "TEST_PENDING" && (
                          <Button asChild size="sm">
                            <Link href={`/test/${app.id}`}>Passer le test</Link>
                          </Button>
                        )}
                      </div>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="opportunities" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Opportunités d'Emploi</CardTitle>
              <CardDescription>Découvrez les dernières offres qui pourraient vous intéresser.</CardDescription>
            </CardHeader>
            <CardContent>
              {jobOffers.length === 0 ? (
                <p className="text-muted-foreground">Aucune opportunité disponible pour le moment.</p>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {jobOffers.map((job) => {
                    const category = getJobCategory(job.title, job.skills)
                    const hasAppliedToThisJob = applications.some((app) => app.jobOffer.id === job.id)

                    return (
                      <Card key={job.id} className="flex flex-col">
                        <CardHeader className="pb-3">
                          <div className="flex items-center justify-between mb-2">
                            <Badge className={`${category.color} text-xs`}>
                              {category.icon} {category.category}
                            </Badge>
                            {job.deadline && (
                              <Badge variant="outline" className="text-xs">
                                Date limite: {format(new Date(job.deadline), "dd/MM/yyyy")}
                              </Badge>
                            )}
                          </div>
                          <CardTitle className="text-lg">{job.title}</CardTitle>
                          <CardDescription className="text-sm text-muted-foreground">
                            {job.company.name}
                          </CardDescription>
                        </CardHeader>
                        <CardContent className="flex-grow">
                          <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
                            {job.description || "Aucune description détaillée fournie."}
                          </p>
                          {job.skills && Array.isArray(job.skills) && job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-2 mt-2">
                              {job.skills.slice(0, 3).map((skill) => (
                                <Badge key={skill} variant="secondary" className="text-xs">
                                  {skill}
                                </Badge>
                              ))}
                              {job.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{job.skills.length - 3}
                                </Badge>
                              )}
                            </div>
                          )}
                        </CardContent>
                        <div className="p-4 pt-0 flex gap-2">
                          <Button asChild variant="outline" className="flex-1 bg-transparent">
                            <Link href={`/jobs/${job.id}`}>
                              <ExternalLink className="w-4 h-4 mr-2" />
                              Détails
                            </Link>
                          </Button>
                          <Button onClick={() => handleApply(job.id)} disabled={hasAppliedToThisJob} className="flex-1">
                            {hasAppliedToThisJob ? (
                              <>
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Postulé
                              </>
                            ) : (
                              <>
                                <Zap className="w-4 h-4 mr-2" />
                                Postuler
                              </>
                            )}
                          </Button>
                        </div>
                      </Card>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="tests" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Mes Tests</CardTitle>
              <CardDescription>Gérez vos tests QCM en attente et consultez vos résultats.</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <p className="text-muted-foreground">Aucun test disponible.</p>
              ) : (
                <div className="space-y-4">
                  {applications
                    .filter((app) => app.status === "TEST_PENDING" || app.testScore !== null)
                    .map((app) => (
                      <Card key={app.id} className="p-4">
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between">
                          <div className="flex-1 mb-4 md:mb-0">
                            <h3 className="text-lg font-semibold">{app.jobOffer.title}</h3>
                            <p className="text-sm text-muted-foreground">{app.jobOffer.company.name}</p>
                            <p className="text-xs text-muted-foreground">Score CV: {formatScore(app.cvScore)}</p>
                          </div>
                          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
                            {app.status === "TEST_PENDING" ? (
                              <>
                                <Badge variant="outline" className="bg-yellow-50 text-yellow-700 border-yellow-200">
                                  Test en attente
                                </Badge>
                                <Button asChild size="sm">
                                  <Link href={`/test/${app.id}`}>
                                    <FileText className="w-4 h-4 mr-2" />
                                    Passer le test
                                  </Link>
                                </Button>
                              </>
                            ) : (
                              <>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-medium">Score Test:</span>
                                  <span className={`text-sm font-bold ${getScoreColor(app.testScore)}`}>
                                    {formatScore(app.testScore)}
                                  </span>
                                </div>
                                {getStatusBadge(app.status)}
                              </>
                            )}
                          </div>
                        </div>
                      </Card>
                    ))}
                  {applications.filter((app) => app.status === "TEST_PENDING" || app.testScore !== null).length ===
                    0 && <p className="text-muted-foreground">Aucun test disponible pour le moment.</p>}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
