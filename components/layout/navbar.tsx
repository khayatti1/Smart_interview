"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { useSession, signOut } from "next-auth/react"
import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet"
import { Menu, LogOut, User, Building2, Briefcase, Lock } from "lucide-react"
import { Container } from "./container"
import { ChangePasswordDialog } from "@/components/change-password-dialog"

export function Navbar() {
  const { data: session } = useSession()
  const pathname = usePathname()
  const [isOpen, setIsOpen] = useState(false)

  const isActive = (path: string) => {
    return pathname === path
  }

  const getInitials = (name: string) => {
    if (!name) return "U"
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .substring(0, 2)
  }

  const getRoleLabel = (role: string) => {
    switch (role) {
      case "CEO":
        return "Directeur"
      case "RECRUITER":
        return "Recruteur"
      case "CANDIDATE":
        return "Candidat"
      default:
        return role
    }
  }

  return (
    <header className="border-b bg-background sticky top-0 z-40">
      <Container>
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-6">
            <Link href="/" className="flex items-center space-x-2">
              <span className="font-bold text-xl">Smart Interview</span>
            </Link>
            <nav className="hidden md:flex items-center gap-6">
              <Link
                href="/jobs"
                className={`text-sm font-medium transition-colors hover:text-primary ${
                  isActive("/jobs") ? "text-primary" : "text-muted-foreground"
                }`}
              >
                Offres d'emploi
              </Link>
              {session?.user && (
                <Link
                  href="/dashboard"
                  className={`text-sm font-medium transition-colors hover:text-primary ${
                    pathname.startsWith("/dashboard") ? "text-primary" : "text-muted-foreground"
                  }`}
                >
                  Dashboard
                </Link>
              )}
            </nav>
          </div>
          <div className="flex items-center gap-4">
            {session?.user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>{getInitials(session.user.name || "")}</AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuLabel className="font-normal">
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium leading-none">{session.user.name}</p>
                      <p className="text-xs leading-none text-muted-foreground">{session.user.email}</p>
                      <p className="text-xs leading-none text-muted-foreground mt-1">
                        {getRoleLabel(session.user.role)}
                      </p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard" className="cursor-pointer">
                      <User className="mr-2 h-4 w-4" />
                      <span>Dashboard</span>
                    </Link>
                  </DropdownMenuItem>
                  <ChangePasswordDialog
                    trigger={
                      <DropdownMenuItem onSelect={(e) => e.preventDefault()}>
                        <Lock className="mr-2 h-4 w-4" />
                        <span>Changer le mot de passe</span>
                      </DropdownMenuItem>
                    }
                  />
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Se déconnecter</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <div className="hidden md:flex items-center gap-4">
                <Link href="/auth/signin">
                  <Button variant="ghost" size="sm">
                    Connexion
                  </Button>
                </Link>
                <Link href="/auth/signup">
                  <Button size="sm">Inscription</Button>
                </Link>
              </div>
            )}
            <Sheet open={isOpen} onOpenChange={setIsOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="md:hidden" aria-label="Menu">
                  <Menu className="h-5 w-5" />
                </Button>
              </SheetTrigger>
              <SheetContent side="right">
                <nav className="flex flex-col gap-4 mt-8">
                  <Link
                    href="/jobs"
                    onClick={() => setIsOpen(false)}
                    className="flex items-center gap-2 text-lg font-medium"
                  >
                    <Briefcase className="h-5 w-5" />
                    Offres d'emploi
                  </Link>
                  {session?.user ? (
                    <>
                      <Link
                        href="/dashboard"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium"
                      >
                        <Building2 className="h-5 w-5" />
                        Dashboard
                      </Link>
                      <ChangePasswordDialog
                        trigger={
                          <Button variant="ghost" className="justify-start px-2">
                            <Lock className="mr-2 h-5 w-5" />
                            Changer le mot de passe
                          </Button>
                        }
                      />
                      <Button
                        variant="ghost"
                        className="justify-start px-2"
                        onClick={() => {
                          signOut()
                          setIsOpen(false)
                        }}
                      >
                        <LogOut className="mr-2 h-5 w-5" />
                        Se déconnecter
                      </Button>
                    </>
                  ) : (
                    <>
                      <Link
                        href="/auth/signin"
                        onClick={() => setIsOpen(false)}
                        className="flex items-center gap-2 text-lg font-medium"
                      >
                        Connexion
                      </Link>
                      <Link href="/auth/signup" onClick={() => setIsOpen(false)}>
                        <Button className="w-full">Inscription</Button>
                      </Link>
                    </>
                  )}
                </nav>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </Container>
    </header>
  )
}
