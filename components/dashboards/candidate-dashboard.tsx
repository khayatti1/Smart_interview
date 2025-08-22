"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
  Briefcase,
  Calendar,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  TrendingUp,
  Users,
  Award,
  Building,
  MapPin,
  Zap,
  Upload,
  Brain,
  Eye,
  Download,
  FileText,
  Target,
} from "lucide-react"
import Link from "next/link"

type Application = {
  id: string
  status: "PENDING" | "ACCEPTED" | "REJECTED"
  createdAt: string
  jobOffer: {
    id: string
    title: string
    deadline: string | null
    company: {
      name: string
      location: string | null
    }
  }
  test: {
    id: string
    status: "PENDING" | "IN_PROGRESS" | "COMPLETED" | "EXPIRED"
    score: number | null
    completedAt: string | null
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
    location: string | null
  }
  _count: {
    applications: number
  }
}

type CVData = {
  id: string
  fileName: string
  filePath: string
  score: number
  analysis: any
  createdAt: string
}

type Stats = {
  totalApplications: number
  pendingApplications: number
  acceptedApplications: number
  rejectedApplications: number
  testsCompleted: number
  successRate: number
  averageTestScore: number
  cvScore: number
}

export default function CandidateDashboard() {
  const { data: session } = useSession()
  const { toast } = useToast()
  const [applications, setApplications] = useState<Application[]>([])
  const [availableJobs, setAvailableJobs] = useState<JobOffer[]>([])
  const [stats, setStats] = useState<Stats>({
    totalApplications: 0,
    pendingApplications: 0,
    acceptedApplications: 0,
    rejectedApplications: 0,
    testsCompleted: 0,
    successRate: 0,
    averageTestScore: 0,
    cvScore: 0,
  })
  const [cv, setCV] = useState<CVData | null>(null)
  const [loading, setLoading] = useState(true)
  const [uploadingCV, setUploadingCV] = useState(false)
  const [cvFile, setCvFile] = useState<File | null>(null)

  useEffect(() => {
    if (session?.user?.role === "CANDIDATE") {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      const response = await fetch("/api/candidate/stats")
      if (response.ok) {
        const data = await response.json()
        setStats(data.stats)
        setApplications(data.applications || [])
        setAvailableJobs(data.availableJobs || [])
        setCV(data.cv)
      } else {
        toast({
          title: "Erreur",
          description: "Impossible de charger les données",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

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
        fetchData()
      } else {
        const error = await response.text()
        toast({
          title: "Erreur",
          description: error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de l'upload du CV", variant: "destructive" })
    }
    setUploadingCV(false)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return <CheckCircle className="h-4 w-4 text-green-600" />
      case "REJECTED":
        return <XCircle className="h-4 w-4 text-red-600" />
      case "PENDING":
        return <Clock className="h-4 w-4 text-yellow-600" />
      default:
        return <Clock className="h-4 w-4 text-gray-600" />
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "Acceptée"
      case "REJECTED":
        return "Rejetée"
      case "PENDING":
        return "En attente"
      default:
        return "Inconnu"
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "ACCEPTED":
        return "bg-green-100 text-green-800"
      case "REJECTED":
        return "bg-red-100 text-red-800"
      case "PENDING":
        return "bg-yellow-100 text-yellow-800"
      default:
        return "bg-gray-100 text-gray-800"
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 80) return "text-green-600"
    if (score >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getDeadlineStatus = (deadline: string | null) => {
    if (!deadline) return null

    const deadlineDate = new Date(deadline)
    const today = new Date()
    const diffTime = deadlineDate.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) {
      return { text: "Expirée", color: "bg-red-100 text-red-800", urgent: true }
    } else if (diffDays <= 3) {
      return { text: `${diffDays}j restant(s)`, color: "bg-orange-100 text-orange-800", urgent: true }
    } else if (diffDays <= 7) {
      return { text: `${diffDays}j restants`, color: "bg-yellow-100 text-yellow-800", urgent: false }
    } else {
      return { text: `${diffDays}j restants`, color: "bg-blue-100 text-blue-800", urgent: false }
    }
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-muted-foreground">Chargement de votre dashboard...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl px-4 py-8">
      {/* Header avec avatar comme les autres dashboards */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-blue-100 text-blue-600">
              {session?.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "C"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Candidat</h1>
            <p className="text-gray-600">Bienvenue, {session?.user?.name || "Candidat"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="opportunities">Opportunités</TabsTrigger>
          <TabsTrigger value="tests">Mes Tests</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales avec couleurs harmonisées */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-700">Mes Candidatures</CardTitle>
                <Briefcase className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.totalApplications}</div>
                <p className="text-xs text-blue-600">Candidatures envoyées</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Acceptées</CardTitle>
                <CheckCircle className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{stats.acceptedApplications}</div>
                <p className="text-xs text-emerald-600">Candidatures réussies</p>
              </CardContent>
            </Card>

            <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-700">Taux de Succès</CardTitle>
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-900">{stats.successRate}%</div>
                <p className="text-xs text-violet-600">Candidatures acceptées</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Score Tests</CardTitle>
                <Brain className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-bold text-amber-900`}>
                  {stats.averageTestScore}%
                </div>
                <p className="text-xs text-amber-600">{stats.testsCompleted} tests complétés</p>
              </CardContent>
            </Card>
          </div>

          {/* Section principale avec les 4 cards demandées - Layout en 3+1 */}
          <div className="grid gap-6 md:grid-cols-3">
            {/* Informations personnelles */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-blue-600" />
                  Informations Personnelles
                </CardTitle>
                <CardDescription>Votre profil candidat</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-4">
                  <Avatar className="h-16 w-16">
                    <AvatarFallback className="text-lg bg-blue-100 text-blue-600">
                      {session?.user?.name
                        ?.split(" ")
                        .map((n) => n[0])
                        .join("")
                        .toUpperCase() || "C"}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <h3 className="text-lg font-semibold">{session?.user?.name}</h3>
                    <p className="text-muted-foreground">{session?.user?.email}</p>
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">Candidat</Badge>
                  </div>
                </div>

                <div className="grid gap-3 pt-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Candidatures totales</span>
                    <span className="font-medium text-blue-600">{stats.totalApplications}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Taux de succès</span>
                    <span className="font-medium text-emerald-600">{stats.successRate}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Score moyen tests</span>
                    <span className={`font-medium ${getScoreColor(stats.averageTestScore)}`}>
                      {stats.averageTestScore}%
                    </span>
                  </div>
                  {cv && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Score CV</span>
                      <span className={`font-medium ${getScoreColor(cv.score)}`}>
                        {cv.score}%
                      </span>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Gestion du CV */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileText className="h-5 w-5 text-emerald-600" />
                  Gestion du CV
                </CardTitle>
                <CardDescription>Téléversez et gérez votre CV</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleCVUpload} className="space-y-4">
                  <div>
                    <Label htmlFor="cv-upload">Fichier CV (PDF, DOC, DOCX)</Label>
                    <Input
                      id="cv-upload"
                      type="file"
                      accept=".pdf,.doc,.docx"
                      onChange={(e) => setCvFile(e.target.files?.[0] || null)}
                      className="mt-1"
                    />
                  </div>
                  <Button type="submit" disabled={!cvFile || uploadingCV} className="w-full bg-emerald-600 hover:bg-emerald-700">
                    {uploadingCV ? (
                      <>
                        <div className="w-4 h-4 mr-2 animate-spin rounded-full border-2 border-white border-t-transparent" />
                        Upload en cours...
                      </>
                    ) : (
                      <>
                        <Upload className="w-4 h-4 mr-2" />
                        {cv ? "Mettre à jour le CV" : "Téléverser le CV"}
                      </>
                    )}
                  </Button>
                </form>

                {cv && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <p className="text-sm font-medium text-emerald-800">CV actuel: {cv.fileName}</p>
                      <Badge className="bg-emerald-100 text-emerald-800">Score: {cv.score}%</Badge>
                    </div>
                    <p className="text-xs text-emerald-600 mb-3">
                      Uploadé le {new Date(cv.createdAt).toLocaleDateString()}
                    </p>
                    <div className="flex gap-2">
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        <a
                          href={`/api/uploads${cv.filePath.replace("/uploads/", "/")}`}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Eye className="w-3 h-3 mr-1" />
                          Voir CV
                        </a>
                      </Button>
                      <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent border-emerald-300 text-emerald-700 hover:bg-emerald-50">
                        <a href={`/api/uploads${cv.filePath.replace("/uploads/", "/")}`} download>
                          <Download className="w-3 h-3 mr-1" />
                          Télécharger
                        </a>
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Candidatures récentes */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5 text-violet-600" />
                  Candidatures Récentes
                </CardTitle>
                <CardDescription>Vos 2 dernières candidatures</CardDescription>
              </CardHeader>
              <CardContent>
                {applications.slice(0, 2).length === 0 ? (
                  <div className="text-center py-6">
                    <Briefcase className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Aucune candidature récente</p>
                    <Button asChild className="mt-3" size="sm">
                      <Link href="/jobs">Découvrir les offres</Link>
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {applications.slice(0, 2).map((application) => {
                      const deadlineStatus = getDeadlineStatus(application.jobOffer.deadline)
                      return (
                        <div key={application.id} className="border rounded-lg p-3 hover:bg-violet-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex-1">
                              <p className="font-medium text-sm">{application.jobOffer.title}</p>
                              <p className="text-xs text-muted-foreground flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {application.jobOffer.company.name}
                                {application.jobOffer.company.location && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <MapPin className="h-3 w-3" />
                                    {application.jobOffer.company.location}
                                  </>
                                )}
                              </p>
                              <div className="flex items-center gap-2 mt-1">
                                <span className="text-xs text-muted-foreground">
                                  {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                                </span>
                                {application.test?.score && (
                                  <Badge variant="secondary" className="text-xs">
                                    Test: {application.test.score}%
                                  </Badge>
                                )}
                              </div>
                            </div>
                            <div className="flex flex-col items-end gap-1">
                              {deadlineStatus && (
                                <Badge className={`${deadlineStatus.color} text-xs`}>
                                  {deadlineStatus.urgent && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {deadlineStatus.text}
                                </Badge>
                              )}
                              <Badge className={`${getStatusColor(application.status)} text-xs`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{getStatusText(application.status)}</span>
                              </Badge>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Toutes mes candidatures - pleine largeur avec tableau */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-amber-600" />
                Toutes mes Candidatures
              </CardTitle>
              <CardDescription>Vue d'ensemble complète avec détails</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune candidature</h3>
                  <p className="text-muted-foreground mb-4 text-sm">Vous n'avez pas encore postulé à des offres d'emploi.</p>
                  <Button asChild className="bg-amber-600 hover:bg-amber-700">
                    <Link href="/jobs">
                      <Zap className="w-4 h-4 mr-2" />
                      Découvrir les offres
                    </Link>
                  </Button>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left p-4 font-medium text-gray-600">Poste</th>
                        <th className="text-left p-4 font-medium text-gray-600">Entreprise</th>
                        <th className="text-left p-4 font-medium text-gray-600">Date</th>
                        <th className="text-left p-4 font-medium text-gray-600">Statut</th>
                        <th className="text-left p-4 font-medium text-gray-600">Test</th>
                        <th className="text-left p-4 font-medium text-gray-600">Deadline</th>
                      </tr>
                    </thead>
                    <tbody>
                      {applications.map((application) => {
                        const deadlineStatus = getDeadlineStatus(application.jobOffer.deadline)
                        return (
                          <tr key={application.id} className="border-b hover:bg-amber-50 transition-colors">
                            <td className="p-4">
                              <div className="flex items-center gap-2">
                                <div className="bg-amber-100 p-2 rounded">
                                  <Briefcase className="h-4 w-4 text-amber-600" />
                                </div>
                                <div>
                                  <h4 className="font-medium text-sm">{application.jobOffer.title}</h4>
                                </div>
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-sm">
                                <Building className="h-3 w-3 text-gray-400" />
                                <span>{application.jobOffer.company.name}</span>
                                {application.jobOffer.company.location && (
                                  <>
                                    <span className="mx-1 text-gray-400">•</span>
                                    <MapPin className="h-3 w-3 text-gray-400" />
                                    <span className="text-gray-600">{application.jobOffer.company.location}</span>
                                  </>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="flex items-center gap-1 text-sm text-gray-600">
                                <Calendar className="h-3 w-3" />
                                {new Date(application.createdAt).toLocaleDateString("fr-FR")}
                              </div>
                            </td>
                            <td className="p-4">
                              <Badge className={`${getStatusColor(application.status)} text-xs`}>
                                {getStatusIcon(application.status)}
                                <span className="ml-1">{getStatusText(application.status)}</span>
                              </Badge>
                            </td>
                            <td className="p-4">
                              {application.test?.score ? (
                                <div className="flex items-center gap-1">
                                  <Award className="h-3 w-3 text-gray-400" />
                                  <span className={`text-sm font-medium ${getScoreColor(application.test.score)}`}>
                                    {application.test.score}%
                                  </span>
                                </div>
                              ) : (
                                <span className="text-sm text-gray-400">-</span>
                              )}
                            </td>
                            <td className="p-4">
                              {deadlineStatus ? (
                                <Badge className={`${deadlineStatus.color} text-xs`}>
                                  {deadlineStatus.urgent && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {deadlineStatus.text}
                                </Badge>
                              ) : (
                                <span className="text-sm text-gray-400">Aucune</span>
                              )}
                            </td>
                            <td className="p-4">
                              {application.status === "PENDING" && application.test?.status === "PENDING" && (
                                <Button asChild size="sm" className="h-7 text-xs bg-amber-600 hover:bg-amber-700">
                                  <Link href={`/test/${application.id}`}>
                                    <Brain className="w-3 h-3 mr-1" />
                                    Passer le test
                                  </Link>
                                </Button>
                              )}
                            </td>
                          </tr>
                        )
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

          {/* Opportunities Tab */}
        <TabsContent value="opportunities" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Nouvelles Opportunités</CardTitle>
              <CardDescription>Découvrez les dernières offres d'emploi disponibles</CardDescription>
            </CardHeader>
            <CardContent>
              {availableJobs.length === 0 ? (
                <div className="text-center py-8">
                  <Briefcase className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucune offre disponible</h3>
                  <p className="text-muted-foreground">Il n'y a pas d'offres d'emploi disponibles pour le moment.</p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2">
                  {availableJobs.slice(0, 6).map((job) => {
                    const deadlineStatus = getDeadlineStatus(job.deadline)
                    const hasApplied = applications.some((app) => app.jobOffer.id === job.id)

                    return (
                      <Card key={job.id} className="hover:shadow-md transition-shadow">
                        <CardHeader className="pb-3">
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <CardTitle className="text-lg mb-1">{job.title}</CardTitle>
                              <CardDescription className="flex items-center gap-1">
                                <Building className="h-3 w-3" />
                                {job.company.name}
                                {job.company.location && (
                                  <>
                                    <span className="mx-1">•</span>
                                    <MapPin className="h-3 w-3" />
                                    {job.company.location}
                                  </>
                                )}
                              </CardDescription>
                            </div>
                          </div>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <p className="text-sm text-muted-foreground line-clamp-2">{job.description}</p>

                          {job.skills.length > 0 && (
                            <div className="flex flex-wrap gap-1">
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

                          <div className="flex items-center justify-between text-xs text-muted-foreground">
                            <div className="flex items-center gap-3">
                              <span className="flex items-center gap-1">
                                <Users className="h-3 w-3" />
                                {job._count.applications} candidature{job._count.applications !== 1 ? "s" : ""}
                              </span>
                              {deadlineStatus && (
                                <Badge className={`${deadlineStatus.color} text-xs`}>
                                  {deadlineStatus.urgent && <AlertCircle className="w-3 h-3 mr-1" />}
                                  {deadlineStatus.text}
                                </Badge>
                              )}
                            </div>
                          </div>

                          <div className="flex gap-2 pt-2">
                            <Button asChild variant="outline" size="sm" className="flex-1 bg-transparent">
                              <Link href={`/jobs/${job.id}`}>Voir détails</Link>
                            </Button>
                            {hasApplied ? (
                              <Button disabled size="sm" className="flex-1">
                                <CheckCircle className="w-3 h-3 mr-1" />
                                Déjà postulé
                              </Button>
                            ) : (
                              <Button asChild size="sm" className="flex-1">
                                <Link href={`/jobs/${job.id}`}>
                                  <Zap className="w-3 h-3 mr-1" />
                                  Postuler
                                </Link>
                              </Button>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              )}

              {availableJobs.length > 6 && (
                <div className="text-center mt-6">
                  <Button asChild variant="outline">
                    <Link href="/jobs">Voir toutes les offres ({availableJobs.length})</Link>
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Tests Tab */}
        <TabsContent value="tests" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Award className="h-5 w-5 text-purple-600" />
                Mes Tests Techniques
              </CardTitle>
              <CardDescription>Historique de vos tests et scores</CardDescription>
            </CardHeader>
            <CardContent>
              {applications.filter((app) => app.test).length === 0 ? (
                <div className="text-center py-8">
                  <Award className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium mb-2">Aucun test</h3>
                  <p className="text-muted-foreground">Vous n'avez pas encore de tests techniques.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {applications
                    .filter((app) => app.test)
                    .map((application) => (
                      <div key={application.id} className="border rounded-lg p-4 hover:bg-purple-50 transition-colors border-purple-200">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <div className="bg-purple-100 p-2 rounded">
                                <Award className="h-4 w-4 text-purple-600" />
                              </div>
                              <div>
                                <h3 className="font-semibold">{application.jobOffer.title}</h3>
                                <p className="text-sm text-muted-foreground flex items-center gap-1">
                                  <Building className="h-3 w-3" />
                                  {application.jobOffer.company.name}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                              <span className="flex items-center gap-1">
                                <Clock className="h-3 w-3" />
                                Statut: {application.test?.status}
                              </span>
                              {application.test?.score && (
                                <span className={`flex items-center gap-1 ${getScoreColor(application.test.score)}`}>
                                  <Award className="h-3 w-3" />
                                  Score: {application.test.score}%
                                </span>
                              )}
                              {application.test?.completedAt && (
                                <span className="flex items-center gap-1">
                                  <Calendar className="h-3 w-3" />
                                  Complété le {new Date(application.test.completedAt).toLocaleDateString()}
                                </span>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            {application.test?.status === "PENDING" && (
                              <Button asChild size="sm" className="bg-purple-600 hover:bg-purple-700">
                                <Link href={`/test/${application.id}`}>
                                  <Award className="w-3 h-3 mr-1" />
                                  Commencer
                                </Link>
                              </Button>
                            )}
                            {application.test?.status === "COMPLETED" && (
                              <Badge
                                className={
                                  application.test.score && application.test.score >= 60 
                                    ? "bg-green-100 text-green-800" 
                                    : "bg-red-100 text-red-800"
                                }
                              >
                                {application.test.score && application.test.score >= 60 ? "Réussi" : "Échoué"}
                              </Badge>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}