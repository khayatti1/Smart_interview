import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Container } from '@/components/layout/container'
import { Brain, Users, Briefcase, CheckCircle, ArrowRight, Zap, Target, Clock, Star, TrendingUp } from 'lucide-react'

export default function HomePage() {
  return (
    <Container>
      <div className="max-w-7xl mx-auto">
        {/* Hero Section */}
        <section className="text-center py-16 px-4">
          <div className="max-w-4xl mx-auto">
            <Badge variant="secondary" className="mb-6 px-4 py-2">
              <Zap className="w-4 h-4 mr-2" />
              Plateforme IA de Recrutement
            </Badge>
            
            <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              Smart Interview Platform
            </h1>
            
            <p className="text-xl text-muted-foreground mb-8 max-w-2xl mx-auto">
              Révolutionnez votre processus de recrutement avec notre IA qui analyse automatiquement les CV et génère des tests techniques personnalisés.
            </p>
            
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild size="lg" className="px-8">
                <Link href="/auth/signup">
                  Commencer gratuitement
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg" className="px-8">
                <Link href="/jobs">
                  Voir les offres
                </Link>
              </Button>
            </div>
          </div>
        </section>

        {/* Comment ça marche */}
        <section className="py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Comment ça marche</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Un processus simple et automatisé en 3 étapes
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Brain className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>1. Analyse IA du CV</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Notre IA analyse automatiquement les CV et attribue un score basé sur les compétences requises.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <Target className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>2. Test technique</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Les candidats qualifiés passent un test technique généré automatiquement selon le poste.
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardHeader>
                <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-4">
                  <CheckCircle className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>3. Sélection finale</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  Les meilleurs candidats sont automatiquement sélectionnés pour l'entretien final.
                </p>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Rôles */}
        <section className="py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pour tous les acteurs du recrutement</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Une plateforme adaptée à chaque rôle
            </p>
          </div>
          
          <div className="grid md:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-orange-100 rounded-lg flex items-center justify-center mb-4">
                  <TrendingUp className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>Directeur</CardTitle>
                <CardDescription>Pilotage stratégique</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Gestion des entreprises
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Supervision des recruteurs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Statistiques globales
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
                  <Briefcase className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Recruteur</CardTitle>
                <CardDescription>Gestion des offres</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Création d'offres d'emploi
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suivi des candidatures
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Analyse des résultats
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-green-600" />
                </div>
                <CardTitle>Candidat</CardTitle>
                <CardDescription>Recherche d'emploi</CardDescription>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-sm text-muted-foreground">
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Candidature simplifiée
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Tests techniques adaptatifs
                  </li>
                  <li className="flex items-center">
                    <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                    Suivi en temps réel
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </section>

        {/* Avantages */}
        <section className="py-16 px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Pourquoi choisir notre plateforme ?</h2>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="font-semibold mb-2">Gain de temps</h3>
              <p className="text-sm text-muted-foreground">
                Automatisation complète du processus de sélection
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Target className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="font-semibold mb-2">Précision IA</h3>
              <p className="text-sm text-muted-foreground">
                Analyse précise des compétences et de l'expérience
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-purple-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="font-semibold mb-2">Qualité</h3>
              <p className="text-sm text-muted-foreground">
                Sélection des meilleurs candidats automatiquement
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 bg-orange-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="font-semibold mb-2">Performance</h3>
              <p className="text-sm text-muted-foreground">
                Statistiques détaillées et amélioration continue
              </p>
            </div>
          </div>
        </section>

        {/* CTA Final */}
        <section className="py-16 px-4">
          <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-0">
            <CardContent className="text-center py-12">
              <h2 className="text-3xl font-bold mb-4">
                Prêt à révolutionner votre recrutement ?
              </h2>
              <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
                Rejoignez les entreprises qui font confiance à notre IA pour trouver les meilleurs talents.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button asChild size="lg" className="px-8">
                  <Link href="/auth/signup">
                    Créer un compte
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg" className="px-8">
                  <Link href="/jobs">
                    Explorer les offres
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </Container>
  )
}
