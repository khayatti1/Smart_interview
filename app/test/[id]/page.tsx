"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Clock, CheckCircle, XCircle, ArrowLeft, ArrowRight } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface TechnicalQuestion {
  question: string
  options: string[]
  correctAnswer: number
  explanation: string
}

interface TestData {
  questions: TechnicalQuestion[]
  jobTitle: string
  companyName: string
}

export default function TestPage() {
  const params = useParams()
  const router = useRouter()
  const { toast } = useToast()
  const [testData, setTestData] = useState<TestData | null>(null)
  const [currentQuestion, setCurrentQuestion] = useState(0)
  const [answers, setAnswers] = useState<number[]>([])
  const [timeLeft, setTimeLeft] = useState(5 * 60) // 5 minutes en secondes
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [testCompleted, setTestCompleted] = useState(false)
  const [testResult, setTestResult] = useState<any>(null)

  useEffect(() => {
    fetchTest()
  }, [])

  useEffect(() => {
    if (timeLeft > 0 && !testCompleted) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000)
      return () => clearTimeout(timer)
    } else if (timeLeft === 0 && !testCompleted) {
      handleSubmitTest()
    }
  }, [timeLeft, testCompleted])

  const fetchTest = async () => {
    try {
      const response = await fetch(`/api/applications/${params.id}/test`)
      if (response.ok) {
        const data = await response.json()
        setTestData(data)
        setAnswers(new Array(data.questions.length).fill(-1))
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error,
          variant: "destructive",
        })
        router.push("/dashboard")
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors du chargement du test",
        variant: "destructive",
      })
      router.push("/dashboard")
    } finally {
      setLoading(false)
    }
  }

  const handleAnswerSelect = (answerIndex: number) => {
    const newAnswers = [...answers]
    newAnswers[currentQuestion] = answerIndex
    setAnswers(newAnswers)
  }

  const handleSubmitTest = async () => {
    setSubmitting(true)
    try {
      const response = await fetch(`/api/applications/${params.id}/test`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ answers }),
      })

      if (response.ok) {
        const result = await response.json()
        setTestResult(result)
        setTestCompleted(true)
        toast({
          title: "Test terminé",
          description: `Score: ${result.score}% - ${result.status === "ACCEPTED" ? "Félicitations !" : "Merci pour votre participation"}`,
        })
      } else {
        const error = await response.json()
        toast({
          title: "Erreur",
          description: error.error,
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Erreur",
        description: "Erreur lors de la soumission du test",
        variant: "destructive",
      })
    } finally {
      setSubmitting(false)
    }
  }

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60)
    const remainingSeconds = seconds % 60
    return `${minutes.toString().padStart(2, "0")}:${remainingSeconds.toString().padStart(2, "0")}`
  }

  const progress = testData ? ((currentQuestion + 1) / testData.questions.length) * 100 : 0
  const answeredQuestions = answers.filter((answer) => answer !== -1).length

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (testCompleted && testResult) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card className="text-center">
          <CardHeader>
            <div className="mx-auto mb-4">
              {testResult.status === "ACCEPTED" ? (
                <CheckCircle className="w-16 h-16 text-green-500" />
              ) : (
                <XCircle className="w-16 h-16 text-red-500" />
              )}
            </div>
            <CardTitle className="text-2xl">
              {testResult.status === "ACCEPTED" ? "Félicitations !" : "Test terminé"}
            </CardTitle>
            <CardDescription>
              Votre test technique pour {testData?.jobTitle} chez {testData?.companyName}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-blue-600">{testResult.score}%</div>
                  <p className="text-sm text-gray-600">Score final</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-green-600">{testResult.correctAnswers}</div>
                  <p className="text-sm text-gray-600">Bonnes réponses</p>
                </CardContent>
              </Card>
              <Card>
                <CardContent className="pt-6">
                  <div className="text-2xl font-bold text-gray-600">{testResult.totalQuestions}</div>
                  <p className="text-sm text-gray-600">Questions total</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-4">
              <Badge
                className={`text-lg px-4 py-2 ${
                  testResult.status === "ACCEPTED" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                }`}
              >
                {testResult.status === "ACCEPTED" ? "Candidature acceptée" : "Candidature refusée"}
              </Badge>

              <p className="text-gray-600">
                {testResult.status === "ACCEPTED"
                  ? "Votre score dépasse le seuil requis de 60%. L'équipe RH vous contactera prochainement."
                  : "Votre score n'atteint pas le seuil requis de 60%. Merci pour votre participation."}
              </p>
            </div>

            <Button onClick={() => router.push("/dashboard")} className="mt-6">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  if (!testData) {
    return (
      <div className="container mx-auto max-w-4xl p-6">
        <Card>
          <CardContent className="text-center py-8">
            <p>Test non trouvé</p>
            <Button onClick={() => router.push("/dashboard")} className="mt-4">
              Retour au dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const currentQ = testData.questions[currentQuestion]

  return (
    <div className="container mx-auto max-w-4xl p-6">
      {/* Header avec timer et progression */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Test technique - {testData.jobTitle}</CardTitle>
              <CardDescription>{testData.companyName}</CardDescription>
            </div>
            <div className="text-right">
              <div className="flex items-center gap-2 text-lg font-mono">
                <Clock className="w-5 h-5" />
                <span className={timeLeft < 300 ? "text-red-600" : "text-gray-700"}>{formatTime(timeLeft)}</span>
              </div>
              <p className="text-sm text-gray-600">Temps restant</p>
            </div>
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>
                Question {currentQuestion + 1} sur {testData.questions.length}
              </span>
              <span>{answeredQuestions} réponses données</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
      </Card>

      {/* Question actuelle */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle className="text-lg">Question {currentQuestion + 1}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-lg">{currentQ.question}</p>

          <div className="space-y-3">
            {currentQ.options.map((option, index) => (
              <button
                key={index}
                onClick={() => handleAnswerSelect(index)}
                className={`w-full text-left p-4 rounded-lg border-2 transition-colors ${
                  answers[currentQuestion] === index
                    ? "border-blue-500 bg-blue-50"
                    : "border-gray-200 hover:border-gray-300"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`w-6 h-6 rounded-full border-2 flex items-center justify-center ${
                      answers[currentQuestion] === index ? "border-blue-500 bg-blue-500" : "border-gray-300"
                    }`}
                  >
                    {answers[currentQuestion] === index && <div className="w-3 h-3 rounded-full bg-white"></div>}
                  </div>
                  <span>{option}</span>
                </div>
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Navigation */}
      <div className="flex justify-between items-center">
        <Button
          variant="outline"
          onClick={() => setCurrentQuestion(Math.max(0, currentQuestion - 1))}
          disabled={currentQuestion === 0}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Précédent
        </Button>

        <div className="flex gap-2">
          {testData.questions.map((_, index) => (
            <button
              key={index}
              onClick={() => setCurrentQuestion(index)}
              className={`w-8 h-8 rounded-full text-sm font-medium ${
                index === currentQuestion
                  ? "bg-blue-500 text-white"
                  : answers[index] !== -1
                    ? "bg-green-100 text-green-800"
                    : "bg-gray-100 text-gray-600"
              }`}
            >
              {index + 1}
            </button>
          ))}
        </div>

        {currentQuestion === testData.questions.length - 1 ? (
          <Button onClick={handleSubmitTest} disabled={submitting} className="bg-green-600 hover:bg-green-700">
            {submitting ? "Soumission..." : "Terminer le test"}
          </Button>
        ) : (
          <Button onClick={() => setCurrentQuestion(Math.min(testData.questions.length - 1, currentQuestion + 1))}>
            Suivant
            <ArrowRight className="w-4 h-4 ml-2" />
          </Button>
        )}
      </div>

      {/* Résumé des réponses */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-lg">Résumé de vos réponses</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-5 md:grid-cols-10 gap-2">
            {testData.questions.map((_, index) => (
              <div
                key={index}
                className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  answers[index] !== -1 ? "bg-green-100 text-green-800" : "bg-gray-100 text-gray-600"
                }`}
              >
                {index + 1}
              </div>
            ))}
          </div>
          <p className="text-sm text-gray-600 mt-3">
            {answeredQuestions} sur {testData.questions.length} questions répondues
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
