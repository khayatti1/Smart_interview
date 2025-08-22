import Link from "next/link"
import { Container } from "./container"

export function Footer() {
  return (
    <footer className="bg-gray-50 border-t mt-8">
      <Container>
        <div className="py-6">
          <div className="flex flex-col md:flex-row justify-between items-center text-sm text-gray-600 space-y-2 md:space-y-0">
            <div className="flex items-center space-x-4">
              <span className="font-semibold text-gray-900">Smart Interview</span>
              <span>•</span>
              <span>M²@smartinterview.ma</span>
            </div>
            <div className="flex items-center space-x-4">
              <Link href="/privacy" className="hover:text-gray-900">
                Confidentialité
              </Link>
              <span>•</span>
              <Link href="/terms" className="hover:text-gray-900">
                Conditions
              </Link>
              <span>•</span>
              <span>&copy; 2024 khayatti-moudid</span>
            </div>
          </div>
        </div>
      </Container>
    </footer>
  )
}
