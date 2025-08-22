"use client"

import { DialogTrigger } from "@/components/ui/dialog"

import type React from "react"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { toast } from "@/hooks/use-toast"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Briefcase,
  Users,
  TrendingUp,
  MapPin,
  Plus,
  Eye,
  Edit,
  Trash2,
  Building2,
  Calendar,
  Clock,
  CheckCircle,
} from "lucide-react"

interface Company {
  id: string
  name: string
  description?: string
}

interface JobOffer {
  id: string
  title: string
  description: string
  location?: string
  salary?: string
  type: string
  skills: string[]
  deadline?: string
  isActive: boolean
  createdAt: string
  company: {
    id: string
    name: string
    description?: string
  }
  _count: {
    applications: number
  }
}

interface Stats {
  totalOffers: number
  activeOffers: number
  totalApplications: number
  averageApplicationsPerOffer: number
}

export default function RecruiterDashboard() {
  const { data: session } = useSession()
  const [stats, setStats] = useState<Stats>({
    totalOffers: 0,
    activeOffers: 0,
    totalApplications: 0,
    averageApplicationsPerOffer: 0,
  })
  const [companies, setCompanies] = useState<Company[]>([])
  const [jobOffers, setJobOffers] = useState<JobOffer[]>([])
  const [loading, setLoading] = useState(true)
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false)
  const [editingOffer, setEditingOffer] = useState<JobOffer | null>(null)

  // Form state
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    location: "",
    salary: "",
    contractType: "",
    skills: "",
    deadline: "",
    companyId: "",
  })

  useEffect(() => {
    if (session?.user) {
      fetchData()
    }
  }, [session])

  const fetchData = async () => {
    try {
      setLoading(true)

      // Récupérer les entreprises
      const companiesRes = await fetch("/api/recruiter/companies")
      if (companiesRes.ok) {
        const companiesData = await companiesRes.json()
        setCompanies(companiesData)
      }

      // Récupérer les offres d'emploi
      const offersRes = await fetch("/api/job-offers")
      if (offersRes.ok) {
        const offersData = await offersRes.json()
        setJobOffers(offersData)

        // Calculer les statistiques
        const totalOffers = offersData.length
        const activeOffers = offersData.filter((offer: JobOffer) => offer.isActive).length
        const totalApplications = offersData.reduce(
          (sum: number, offer: JobOffer) => sum + offer._count.applications,
          0,
        )
        const averageApplicationsPerOffer = totalOffers > 0 ? Math.round(totalApplications / totalOffers) : 0

        setStats({
          totalOffers,
          activeOffers,
          totalApplications,
          averageApplicationsPerOffer,
        })
      }
    } catch (error) {
      console.error("Erreur lors du chargement des données:", error)
      toast({
        title: "Erreur",
        description: "Impossible de charger les données",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  const handleCreateOffer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!formData.title || !formData.description || !formData.companyId || !formData.deadline) {
      toast({
        title: "Erreur",
        description: "Veuillez remplir tous les champs obligatoires",
        variant: "destructive",
      })
      return
    }

    try {
      const response = await fetch("/api/job-offers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Offre d'emploi créée avec succès",
        })
        setIsCreateDialogOpen(false)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la création",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const handleEditOffer = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!editingOffer) return

    try {
      const response = await fetch(`/api/job-offers/${editingOffer.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Offre d'emploi modifiée avec succès",
        })
        setIsEditDialogOpen(false)
        setEditingOffer(null)
        resetForm()
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la modification",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const handleDeleteOffer = async (offerId: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette offre ?")) return

    try {
      const response = await fetch(`/api/job-offers/${offerId}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({
          title: "Succès",
          description: "Offre d'emploi supprimée avec succès",
        })
        fetchData()
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error || "Erreur lors de la suppression",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Erreur:", error)
      toast({
        title: "Erreur",
        description: "Erreur de connexion",
        variant: "destructive",
      })
    }
  }

  const openEditDialog = (offer: JobOffer) => {
    setEditingOffer(offer)
    setFormData({
      title: offer.title,
      description: offer.description,
      location: offer.location || "",
      salary: offer.salary || "",
      contractType: offer.type || "",
      skills: Array.isArray(offer.skills) ? offer.skills.join(", ") : "",
      deadline: offer.deadline ? new Date(offer.deadline).toISOString().split("T")[0] : "",
      companyId: offer.company.id,
    })
    setIsEditDialogOpen(true)
  }

  const resetForm = () => {
    setFormData({
      title: "",
      description: "",
      location: "",
      salary: "",
      contractType: "",
      skills: "",
      deadline: "",
      companyId: "",
    })
  }

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return { status: "none", color: "bg-gray-100 text-gray-800", text: "Aucune limite" }

    const deadlineDate = new Date(deadline)
    const now = new Date()
    const diffTime = deadlineDate.getTime() - now.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))

    if (diffDays < 0) return { status: "expired", color: "bg-red-100 text-red-800", text: "Expirée" }
    if (diffDays <= 3)
      return { status: "urgent", color: "bg-orange-100 text-orange-800", text: `${diffDays}j restants` }
    if (diffDays <= 7) return { status: "soon", color: "bg-yellow-100 text-yellow-800", text: `${diffDays}j restants` }
    return { status: "normal", color: "bg-green-100 text-green-800", text: `${diffDays}j restants` }
  }

  const getJobTypeColor = (type: string) => {
    switch (type) {
      case "CDI":
        return "bg-green-100 text-green-800 border-green-200"
      case "CDD":
        return "bg-blue-100 text-blue-800 border-blue-200"
      case "STAGE":
        return "bg-purple-100 text-purple-800 border-purple-200"
      case "FREELANCE":
        return "bg-orange-100 text-orange-800 border-orange-200"
      default:
        return "bg-gray-100 text-gray-800 border-gray-200"
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div className="container mx-auto max-w-7xl p-6 space-y-6">
      {/* En-tête avec avatar comme le CEO */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Avatar className="h-12 w-12">
            <AvatarFallback className="bg-indigo-100 text-indigo-600">
              {session?.user?.name
                ?.split(" ")
                .map((n) => n[0])
                .join("")
                .toUpperCase() || "R"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Recruteur</h1>
            <p className="text-gray-600">Bienvenue, {session?.user?.name || "Recruteur"}</p>
          </div>
        </div>
      </div>

      <Tabs defaultValue="overview" className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="offers">Offres d'emploi</TabsTrigger>
          <TabsTrigger value="companies">Entreprises</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques avec les mêmes couleurs que le CEO dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="border-indigo-200 bg-gradient-to-br from-indigo-50 to-indigo-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-indigo-700">Mes Offres</CardTitle>
                <Briefcase className="h-4 w-4 text-indigo-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-indigo-900">{stats.totalOffers}</div>
                <p className="text-xs text-indigo-600">{stats.activeOffers} actives</p>
              </CardContent>
            </Card>

            <Card className="border-emerald-200 bg-gradient-to-br from-emerald-50 to-emerald-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-emerald-700">Candidatures</CardTitle>
                <Users className="h-4 w-4 text-emerald-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-emerald-900">{stats.totalApplications}</div>
                <p className="text-xs text-emerald-600">Total reçues</p>
              </CardContent>
            </Card>

            <Card className="border-violet-200 bg-gradient-to-br from-violet-50 to-violet-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-violet-700">Moyenne</CardTitle>
                <TrendingUp className="h-4 w-4 text-violet-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-violet-900">{stats.averageApplicationsPerOffer}</div>
                <p className="text-xs text-violet-600">Candidatures par offre</p>
              </CardContent>
            </Card>

            <Card className="border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-amber-700">Entreprises</CardTitle>
                <Building2 className="h-4 w-4 text-amber-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-amber-900">{companies.length}</div>
                <p className="text-xs text-amber-600">Sous votre gestion</p>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques détaillées comme le CEO */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <Clock className="h-5 w-5 text-yellow-600" />
                  Offres actives
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-yellow-600">{stats.activeOffers}</div>
                <p className="text-sm text-gray-600">offres en cours</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <CheckCircle className="h-5 w-5 text-green-600" />
                  Total candidatures
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{stats.totalApplications}</div>
                <p className="text-sm text-gray-600">candidatures reçues</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-indigo-600" />
                  Performance
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-indigo-600">{stats.averageApplicationsPerOffer}</div>
                <p className="text-sm text-gray-600">candidatures/offre</p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="offers" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Offres d'emploi</h2>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-indigo-600 hover:bg-indigo-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Créer une offre
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle offre d'emploi</DialogTitle>
                  <DialogDescription>
                    Remplissez les informations pour créer une nouvelle offre d'emploi.
                  </DialogDescription>
                </DialogHeader>
                <form onSubmit={handleCreateOffer} className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="title">Titre du poste *</Label>
                      <Input
                        id="title"
                        value={formData.title}
                        onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="company">Entreprise *</Label>
                      <Select
                        value={formData.companyId}
                        onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Sélectionner une entreprise" />
                        </SelectTrigger>
                        <SelectContent>
                          {companies.map((company) => (
                            <SelectItem key={company.id} value={company.id}>
                              {company.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Description *</Label>
                    <Textarea
                      id="description"
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      rows={4}
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="deadline">Date limite de candidature *</Label>
                    <Input
                      id="deadline"
                      type="date"
                      value={formData.deadline}
                      onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                      min={new Date().toISOString().split("T")[0]}
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input
                        id="location"
                        value={formData.location}
                        onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="salary">Salaire</Label>
                      <Input
                        id="salary"
                        placeholder="Ex: 45000-55000€"
                        value={formData.salary}
                        onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="contractType">Type de contrat</Label>
                    <Select
                      value={formData.contractType}
                      onValueChange={(value) => setFormData({ ...formData, contractType: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Sélectionner" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="CDI">CDI</SelectItem>
                        <SelectItem value="CDD">CDD</SelectItem>
                        <SelectItem value="FREELANCE">Freelance</SelectItem>
                        <SelectItem value="STAGE">Stage</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="skills">Compétences (séparées par des virgules)</Label>
                    <Input
                      id="skills"
                      placeholder="React, Node.js, TypeScript"
                      value={formData.skills}
                      onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
                    />
                  </div>

                  <div className="flex justify-end space-x-2">
                    <Button type="button" variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                      Créer l'offre
                    </Button>
                  </div>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          {/* Table des offres avec le même style que le CEO */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Toutes mes offres
              </CardTitle>
            </CardHeader>
            <CardContent>
              {jobOffers.length === 0 ? (
                <div className="text-center py-12">
                  <Briefcase className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune offre d'emploi</h3>
                  <p className="text-gray-500">Vous n'avez pas encore créé d'offres d'emploi.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {jobOffers.map((offer) => {
                    const deadlineStatus = getDeadlineStatus(offer.deadline)
                    return (
                      <div key={offer.id} className="border rounded-lg p-4 hover:bg-gray-50">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="font-semibold text-lg">{offer.title}</h3>
                              <Badge className={getJobTypeColor(offer.type)}>{offer.type}</Badge>
                              {offer.deadline && new Date(offer.deadline) < new Date() && (
                                <Badge variant="destructive">Expirée</Badge>
                              )}
                              {!offer.isActive && <Badge variant="secondary">Inactive</Badge>}
                            </div>
                            <p className="text-gray-600 mb-1">{offer.company.name}</p>
                            {offer.location && (
                              <p className="text-sm text-gray-500 mb-2 flex items-center gap-1">
                                <MapPin className="h-4 w-4" />
                                {offer.location}
                              </p>
                            )}
                            <p className="text-sm text-gray-700 mb-3 line-clamp-2">{offer.description}</p>
                            <div className="flex flex-wrap gap-1 mb-3">
                              {Array.isArray(offer.skills) &&
                                offer.skills.slice(0, 3).map((skill, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {skill}
                                  </Badge>
                                ))}
                              {Array.isArray(offer.skills) && offer.skills.length > 3 && (
                                <Badge variant="secondary" className="text-xs">
                                  +{offer.skills.length - 3} autres
                                </Badge>
                              )}
                            </div>
                            <div className="flex items-center gap-4 text-sm text-gray-500">
                              <span className="flex items-center gap-1">
                                <Calendar className="h-4 w-4" />
                                Créée le {new Date(offer.createdAt).toLocaleDateString("fr-FR")}
                              </span>
                              {offer.deadline && <Badge className={deadlineStatus.color}>{deadlineStatus.text}</Badge>}
                              <span className="flex items-center gap-1">
                                <Users className="h-4 w-4" />
                                {offer._count.applications} candidature(s)
                              </span>
                            </div>
                          </div>
                          <div className="flex items-center gap-2">
                            <Button
                              variant="outline"
                              size="sm"
                              onClick={() => window.open(`/dashboard/job-offers/${offer.id}/applications`, "_blank")}
                            >
                              <Eye className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => openEditDialog(offer)}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button size="sm" variant="outline" onClick={() => handleDeleteOffer(offer.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Entreprises */}
        <TabsContent value="companies" className="space-y-6">
          <h2 className="text-2xl font-bold">Mes entreprises ({companies.length})</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {companies.length === 0 ? (
              <div className="col-span-full text-center py-12">
                <Building2 className="h-16 w-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">Aucune entreprise</h3>
                <p className="text-gray-500">Vous n'êtes assigné à aucune entreprise.</p>
              </div>
            ) : (
              companies.map((company) => (
                <Card key={company.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    <CardTitle className="flex items-center justify-between">
                      <span className="truncate">{company.name}</span>
                      <Building2 className="h-5 w-5 text-gray-400" />
                    </CardTitle>
                    {company.description && <p className="text-sm text-gray-600 line-clamp-2">{company.description}</p>}
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      <div className="flex items-center text-sm text-gray-600">
                        <Briefcase className="w-4 h-4 mr-2" />
                        Mes offres dans cette entreprise
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>
      </Tabs>

      {/* Dialog d'édition */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Modifier l'offre d'emploi</DialogTitle>
            <DialogDescription>Modifiez les informations de l'offre d'emploi.</DialogDescription>
          </DialogHeader>
          <form onSubmit={handleEditOffer} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-title">Titre du poste *</Label>
                <Input
                  id="edit-title"
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-company">Entreprise *</Label>
                <Select
                  value={formData.companyId}
                  onValueChange={(value) => setFormData({ ...formData, companyId: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Sélectionner une entreprise" />
                  </SelectTrigger>
                  <SelectContent>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-description">Description *</Label>
              <Textarea
                id="edit-description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-deadline">Date limite de candidature *</Label>
              <Input
                id="edit-deadline"
                type="date"
                value={formData.deadline}
                onChange={(e) => setFormData({ ...formData, deadline: e.target.value })}
                min={new Date().toISOString().split("T")[0]}
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-location">Localisation</Label>
                <Input
                  id="edit-location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-salary">Salaire</Label>
                <Input
                  id="edit-salary"
                  placeholder="Ex: 45000-55000€"
                  value={formData.salary}
                  onChange={(e) => setFormData({ ...formData, salary: e.target.value })}
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-contractType">Type de contrat</Label>
              <Select
                value={formData.contractType}
                onValueChange={(value) => setFormData({ ...formData, contractType: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sélectionner" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="CDI">CDI</SelectItem>
                  <SelectItem value="CDD">CDD</SelectItem>
                  <SelectItem value="FREELANCE">Freelance</SelectItem>
                  <SelectItem value="STAGE">Stage</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-skills">Compétences (séparées par des virgules)</Label>
              <Input
                id="edit-skills"
                placeholder="React, Node.js, TypeScript"
                value={formData.skills}
                onChange={(e) => setFormData({ ...formData, skills: e.target.value })}
              />
            </div>

            <div className="flex justify-end space-x-2">
              <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
                Annuler
              </Button>
              <Button type="submit" className="bg-indigo-600 hover:bg-indigo-700">
                Modifier l'offre
              </Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
