"use client"

import { useState, useEffect } from "react"
import { useSession } from "next-auth/react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { toast } from "@/hooks/use-toast"
import {
  Building2,
  Users,
  Briefcase,
  FileText,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  XCircle,
  BarChart3,
  Loader2,
} from "lucide-react"

interface Company {
  id: string
  name: string
  description: string
  location: string
  website?: string
  recruitersCount: number
  jobOffersCount: number
  createdAt: string
  updatedAt: string
  _count: {
    managers: number
    jobOffers: number
  }
}

interface Recruiter {
  id: string
  name: string
  email: string
  companies: Array<{
    id: string
    name: string
  }>
  jobOffersCount: number
  createdAt: string
  managedCompanies: Array<{
    company: {
      id: string
      name: string
    }
  }>
  _count: {
    createdOffers: number
  }
}

interface Stats {
  totalCompanies: number
  totalRecruiters: number
  totalJobOffers: number
  totalApplications: number
  acceptedApplications: number
  pendingApplications: number
  rejectedApplications: number
  successRate: number
}

interface OverviewData {
  stats: Stats
  recentCompanies: Array<{
    id: string
    name: string
    location: string
    recruitersCount: number
    jobOffersCount: number
    createdAt: string
  }>
  topRecruiters: Array<{
    id: string
    name: string
    company: string
    jobOffersCount: number
    createdAt: string
  }>
}

export default function CeoDashboard() {
  const { data: session } = useSession()
  const [overviewData, setOverviewData] = useState<OverviewData | null>(null)
  const [companies, setCompanies] = useState<Company[]>([])
  const [recruiters, setRecruiters] = useState<Recruiter[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState("overview")
  const [submitting, setSubmitting] = useState(false)

  // États pour les formulaires
  const [isCompanyDialogOpen, setIsCompanyDialogOpen] = useState(false)
  const [isRecruiterDialogOpen, setIsRecruiterDialogOpen] = useState(false)
  const [editingCompany, setEditingCompany] = useState<Company | null>(null)
  const [editingRecruiter, setEditingRecruiter] = useState<Recruiter | null>(null)
  const [selectedCompanyId, setSelectedCompanyId] = useState<string>("")
  const [editSelectedCompanyId, setEditSelectedCompanyId] = useState<string>("")

  // Charger les données
  useEffect(() => {
    loadOverviewData()
    if (activeTab === "companies") {
      loadCompanies()
    } else if (activeTab === "recruiters") {
      loadRecruiters()
    }
  }, [activeTab])

  const loadOverviewData = async () => {
    try {
      const response = await fetch("/api/ceo/overview")
      if (response.ok) {
        const data = await response.json()
        setOverviewData(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des statistiques:", error)
    } finally {
      setLoading(false)
    }
  }

  const loadCompanies = async () => {
    try {
      const response = await fetch("/api/ceo/companies")
      if (response.ok) {
        const data = await response.json()
        console.log("Companies loaded:", data) // Pour debug
        setCompanies(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des entreprises:", error)
    }
  }

  const loadRecruiters = async () => {
    try {
      const response = await fetch("/api/ceo/recruiters")
      if (response.ok) {
        const data = await response.json()
        console.log("Recruiters loaded:", data) // Pour debug
        setRecruiters(data)
      }
    } catch (error) {
      console.error("Erreur lors du chargement des recruteurs:", error)
    }
  }

  const handleCreateCompany = async (formData: FormData) => {
    setSubmitting(true)
    try {
      const data = {
        name: formData.get("name"),
        description: formData.get("description"),
        location: formData.get("location"),
        website: formData.get("website"),
      }

      const response = await fetch("/api/ceo/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({ title: "Entreprise créée avec succès" })
        setIsCompanyDialogOpen(false)
        loadCompanies()
        loadOverviewData()
      } else {
        const error = await response.json()
        toast({ title: "Erreur", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la création", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateCompany = async (formData: FormData) => {
    if (!editingCompany) return

    setSubmitting(true)
    try {
      const data = {
        name: formData.get("name"),
        description: formData.get("description"),
        location: formData.get("location"),
        website: formData.get("website"),
      }

      const response = await fetch(`/api/ceo/companies/${editingCompany.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({ title: "Entreprise mise à jour avec succès" })
        setEditingCompany(null)
        loadCompanies()
        loadOverviewData()
      } else {
        const error = await response.json()
        toast({ title: "Erreur", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleCreateRecruiter = async (formData: FormData) => {
    setSubmitting(true)
    try {
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        password: formData.get("password"),
        companyIds: [selectedCompanyId],
      }

      const response = await fetch("/api/ceo/recruiters", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({ title: "Recruteur créé avec succès" })
        setIsRecruiterDialogOpen(false)
        setSelectedCompanyId("")
        loadRecruiters()
        loadOverviewData()
      } else {
        const error = await response.json()
        toast({ title: "Erreur", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la création", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleUpdateRecruiter = async (formData: FormData) => {
    if (!editingRecruiter) return

    setSubmitting(true)
    try {
      const data = {
        name: formData.get("name"),
        email: formData.get("email"),
        companyIds: [editSelectedCompanyId],
      }

      const response = await fetch(`/api/ceo/recruiters/${editingRecruiter.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (response.ok) {
        toast({ title: "Recruteur mis à jour avec succès" })
        setEditingRecruiter(null)
        setEditSelectedCompanyId("")
        loadRecruiters()
        loadOverviewData()
      } else {
        const error = await response.json()
        toast({ title: "Erreur", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la mise à jour", variant: "destructive" })
    } finally {
      setSubmitting(false)
    }
  }

  const handleDeleteCompany = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer cette entreprise ?")) return

    try {
      const response = await fetch(`/api/ceo/companies/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Entreprise supprimée avec succès" })
        loadCompanies()
        loadOverviewData()
      } else {
        const error = await response.json()
        toast({ title: "Erreur", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" })
    }
  }

  const handleDeleteRecruiter = async (id: string) => {
    if (!confirm("Êtes-vous sûr de vouloir supprimer ce recruteur ?")) return

    try {
      const response = await fetch(`/api/ceo/recruiters/${id}`, {
        method: "DELETE",
      })

      if (response.ok) {
        toast({ title: "Recruteur supprimé avec succès" })
        loadRecruiters()
        loadOverviewData()
      } else {
        const error = await response.json()
        toast({ title: "Erreur", description: error.error, variant: "destructive" })
      }
    } catch (error) {
      toast({ title: "Erreur", description: "Erreur lors de la suppression", variant: "destructive" })
    }
  }

  // Fonction utilitaire pour obtenir le nom de l'entreprise d'un recruteur
  const getRecruiterCompanyName = (recruiter: Recruiter): string => {
    // Essayer d'abord avec companies (nouvelle structure)
    if (recruiter.companies && Array.isArray(recruiter.companies) && recruiter.companies.length > 0) {
      return recruiter.companies[0].name
    }

    // Fallback avec managedCompanies (ancienne structure)
    if (
      recruiter.managedCompanies &&
      Array.isArray(recruiter.managedCompanies) &&
      recruiter.managedCompanies.length > 0
    ) {
      const firstCompany = recruiter.managedCompanies[0]
      if (firstCompany && firstCompany.company && firstCompany.company.name) {
        return firstCompany.company.name
      }
    }

    return "Aucune entreprise"
  }

  // Fonction utilitaire pour obtenir l'ID de l'entreprise d'un recruteur
  const getRecruiterCompanyId = (recruiter: Recruiter): string => {
    // Essayer d'abord avec companies (nouvelle structure)
    if (recruiter.companies && Array.isArray(recruiter.companies) && recruiter.companies.length > 0) {
      return recruiter.companies[0].id
    }

    // Fallback avec managedCompanies (ancienne structure)
    if (
      recruiter.managedCompanies &&
      Array.isArray(recruiter.managedCompanies) &&
      recruiter.managedCompanies.length > 0
    ) {
      const firstCompany = recruiter.managedCompanies[0]
      if (firstCompany && firstCompany.company && firstCompany.company.id) {
        return firstCompany.company.id
      }
    }

    return ""
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-blue-600" />
          <p className="text-muted-foreground">Chargement du dashboard...</p>
        </div>
      </div>
    )
  }

  // Valeurs par défaut pour éviter les erreurs undefined
  const stats = overviewData?.stats || {
    totalCompanies: 0,
    totalRecruiters: 0,
    totalJobOffers: 0,
    totalApplications: 0,
    acceptedApplications: 0,
    pendingApplications: 0,
    rejectedApplications: 0,
    successRate: 0,
  }

  const recentCompanies = overviewData?.recentCompanies || []
  const topRecruiters = overviewData?.topRecruiters || []

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
                .toUpperCase() || "CEO"}
            </AvatarFallback>
          </Avatar>
          <div>
            <h1 className="text-3xl font-bold">Dashboard Directeur</h1>
            <p className="text-gray-600">Bienvenue, {session?.user?.name || "Directeur"}</p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="overview">Vue d'ensemble</TabsTrigger>
          <TabsTrigger value="companies">Mes Entreprises</TabsTrigger>
          <TabsTrigger value="recruiters">Mes Recruteurs</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          {/* Statistiques principales */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card className="border-blue-200 bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-blue-900">Mes Entreprises</CardTitle>
                <Building2 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-900">{stats.totalCompanies}</div>
                <p className="text-xs text-blue-700">Entreprises gérées</p>
              </CardContent>
            </Card>

            <Card className="border-green-200 bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-green-900">Mes Recruteurs</CardTitle>
                <Users className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-900">{stats.totalRecruiters}</div>
                <p className="text-xs text-green-700">Recruteurs actifs</p>
              </CardContent>
            </Card>

            <Card className="border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-purple-900">Offres d'emploi</CardTitle>
                <Briefcase className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-900">{stats.totalJobOffers}</div>
                <p className="text-xs text-purple-700">Postes disponibles</p>
              </CardContent>
            </Card>

            <Card className="border-orange-200 bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-orange-900">Candidatures</CardTitle>
                <FileText className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-900">{stats.totalApplications}</div>
                <p className="text-xs text-orange-700">Total des candidatures</p>
              </CardContent>
            </Card>
          </div>

          {/* Statistiques détaillées */}
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Acceptées</CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">{stats.acceptedApplications}</div>
                <p className="text-xs text-muted-foreground">Candidatures acceptées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">En attente</CardTitle>
                <Clock className="h-4 w-4 text-yellow-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">{stats.pendingApplications}</div>
                <p className="text-xs text-muted-foreground">En cours de traitement</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Rejetées</CardTitle>
                <XCircle className="h-4 w-4 text-red-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">{stats.rejectedApplications}</div>
                <p className="text-xs text-muted-foreground">Candidatures rejetées</p>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium">Taux de succès</CardTitle>
                <BarChart3 className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">{stats.successRate}%</div>
                <p className="text-xs text-muted-foreground">Candidatures acceptées</p>
              </CardContent>
            </Card>
          </div>

          {/* Entreprises récentes et top recruteurs */}
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Mes entreprises récentes</CardTitle>
                <CardDescription>Les dernières entreprises ajoutées</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {recentCompanies.length > 0 ? (
                    recentCompanies.map((company) => (
                      <div key={company.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{company.name}</p>
                          <p className="text-sm text-muted-foreground">
                            {company.location || "Localisation non définie"}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-medium">{company.recruitersCount} recruteurs</p>
                          <p className="text-sm text-muted-foreground">{company.jobOffersCount} offres</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucune entreprise récente</p>
                  )}
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Mes top recruteurs</CardTitle>
                <CardDescription>Recruteurs les plus actifs</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {topRecruiters.length > 0 ? (
                    topRecruiters.map((recruiter) => (
                      <div key={recruiter.id} className="flex items-center justify-between">
                        <div>
                          <p className="font-medium">{recruiter.name}</p>
                          <p className="text-sm text-muted-foreground">{recruiter.company}</p>
                        </div>
                        <Badge variant="secondary">{recruiter.jobOffersCount} offres</Badge>
                      </div>
                    ))
                  ) : (
                    <p className="text-sm text-muted-foreground">Aucun recruteur actif</p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="companies" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestion de mes Entreprises</h2>
            <Dialog open={isCompanyDialogOpen} onOpenChange={setIsCompanyDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter une entreprise
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer une nouvelle entreprise</DialogTitle>
                  <DialogDescription>Ajoutez une nouvelle entreprise à votre portefeuille</DialogDescription>
                </DialogHeader>
                <form action={handleCreateCompany}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom de l'entreprise</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="description">Description</Label>
                      <Input id="description" name="description" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="location">Localisation</Label>
                      <Input id="location" name="location" />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="website">Site web</Label>
                      <Input id="website" name="website" type="url" />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button type="button" variant="outline" onClick={() => setIsCompanyDialogOpen(false)}>
                      Annuler
                    </Button>
                    <Button type="submit" disabled={submitting}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        "Créer l'entreprise"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Localisation</TableHead>
                    <TableHead>Recruteurs</TableHead>
                    <TableHead>Offres</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {companies.length > 0 ? (
                    companies.map((company) => (
                      <TableRow key={company.id}>
                        <TableCell className="font-medium">{company.name}</TableCell>
                        <TableCell>{company.description || "Aucune description"}</TableCell>
                        <TableCell>{company.location || "Non définie"}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">{company.recruitersCount || company._count?.managers || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{company.jobOffersCount || company._count?.jobOffers || 0}</Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog
                              open={editingCompany?.id === company.id}
                              onOpenChange={(open) => {
                                if (!open) setEditingCompany(null)
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button variant="ghost" size="sm" onClick={() => setEditingCompany(company)}>
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Modifier l'entreprise</DialogTitle>
                                  <DialogDescription>Modifiez les informations de l'entreprise</DialogDescription>
                                </DialogHeader>
                                <form action={handleUpdateCompany}>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-name">Nom de l'entreprise</Label>
                                      <Input id="edit-name" name="name" defaultValue={company.name} required />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-description">Description</Label>
                                      <Input
                                        id="edit-description"
                                        name="description"
                                        defaultValue={company.description || ""}
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-location">Localisation</Label>
                                      <Input id="edit-location" name="location" defaultValue={company.location || ""} />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-website">Site web</Label>
                                      <Input
                                        id="edit-website"
                                        name="website"
                                        type="url"
                                        defaultValue={company.website || ""}
                                      />
                                    </div>
                                  </div>
                                  <DialogFooter>
                                    <Button type="button" variant="outline" onClick={() => setEditingCompany(null)}>
                                      Annuler
                                    </Button>
                                    <Button type="submit" disabled={submitting}>
                                      {submitting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Mise à jour...
                                        </>
                                      ) : (
                                        "Mettre à jour"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteCompany(company.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                        Aucune entreprise trouvée
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="recruiters" className="space-y-6">
          <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold">Gestion de mes Recruteurs</h2>
            <Dialog open={isRecruiterDialogOpen} onOpenChange={setIsRecruiterDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Ajouter un recruteur
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Créer un nouveau recruteur</DialogTitle>
                  <DialogDescription>Ajoutez un nouveau recruteur à vos entreprises</DialogDescription>
                </DialogHeader>
                <form action={handleCreateRecruiter}>
                  <div className="grid gap-4 py-4">
                    <div className="grid gap-2">
                      <Label htmlFor="name">Nom complet</Label>
                      <Input id="name" name="name" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="email">Email</Label>
                      <Input id="email" name="email" type="email" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="password">Mot de passe</Label>
                      <Input id="password" name="password" type="password" required />
                    </div>
                    <div className="grid gap-2">
                      <Label htmlFor="companyId">Entreprise</Label>
                      <Select value={selectedCompanyId} onValueChange={setSelectedCompanyId} required>
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
                  <DialogFooter>
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => {
                        setIsRecruiterDialogOpen(false)
                        setSelectedCompanyId("")
                      }}
                    >
                      Annuler
                    </Button>
                    <Button type="submit" disabled={submitting || !selectedCompanyId}>
                      {submitting ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Création...
                        </>
                      ) : (
                        "Créer le recruteur"
                      )}
                    </Button>
                  </DialogFooter>
                </form>
              </DialogContent>
            </Dialog>
          </div>

          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nom</TableHead>
                    <TableHead>Email</TableHead>
                    <TableHead>Entreprise</TableHead>
                    <TableHead>Offres créées</TableHead>
                    <TableHead>Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recruiters.length > 0 ? (
                    recruiters.map((recruiter) => (
                      <TableRow key={recruiter.id}>
                        <TableCell className="font-medium">{recruiter.name || "Nom non défini"}</TableCell>
                        <TableCell>{recruiter.email}</TableCell>
                        <TableCell>{getRecruiterCompanyName(recruiter)}</TableCell>
                        <TableCell>
                          <Badge variant="secondary">
                            {recruiter.jobOffersCount || recruiter._count?.createdOffers || 0}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <div className="flex space-x-2">
                            <Dialog
                              open={editingRecruiter?.id === recruiter.id}
                              onOpenChange={(open) => {
                                if (!open) {
                                  setEditingRecruiter(null)
                                  setEditSelectedCompanyId("")
                                } else {
                                  setEditSelectedCompanyId(getRecruiterCompanyId(recruiter))
                                }
                              }}
                            >
                              <DialogTrigger asChild>
                                <Button
                                  variant="ghost"
                                  size="sm"
                                  onClick={() => {
                                    setEditingRecruiter(recruiter)
                                    setEditSelectedCompanyId(getRecruiterCompanyId(recruiter))
                                  }}
                                >
                                  <Edit className="h-4 w-4" />
                                </Button>
                              </DialogTrigger>
                              <DialogContent>
                                <DialogHeader>
                                  <DialogTitle>Modifier le recruteur</DialogTitle>
                                  <DialogDescription>Modifiez les informations du recruteur</DialogDescription>
                                </DialogHeader>
                                <form action={handleUpdateRecruiter}>
                                  <div className="grid gap-4 py-4">
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-name">Nom complet</Label>
                                      <Input id="edit-name" name="name" defaultValue={recruiter.name || ""} required />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-email">Email</Label>
                                      <Input
                                        id="edit-email"
                                        name="email"
                                        type="email"
                                        defaultValue={recruiter.email}
                                        required
                                      />
                                    </div>
                                    <div className="grid gap-2">
                                      <Label htmlFor="edit-companyId">Entreprise</Label>
                                      <Select value={editSelectedCompanyId} onValueChange={setEditSelectedCompanyId}>
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
                                  <DialogFooter>
                                    <Button
                                      type="button"
                                      variant="outline"
                                      onClick={() => {
                                        setEditingRecruiter(null)
                                        setEditSelectedCompanyId("")
                                      }}
                                    >
                                      Annuler
                                    </Button>
                                    <Button type="submit" disabled={submitting || !editSelectedCompanyId}>
                                      {submitting ? (
                                        <>
                                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                          Mise à jour...
                                        </>
                                      ) : (
                                        "Mettre à jour"
                                      )}
                                    </Button>
                                  </DialogFooter>
                                </form>
                              </DialogContent>
                            </Dialog>
                            <Button variant="ghost" size="sm" onClick={() => handleDeleteRecruiter(recruiter.id)}>
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        Aucun recruteur trouvé
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}