import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import { AuthProvider } from "@/contexts/AuthContext"
import { ApiStatus } from "@/components/ApiStatus"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "Employee Management System",
  description: "Modern dashboard for employee management",
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={inter.className}>
        <AuthProvider>
          {children}
          <ApiStatus />
        </AuthProvider>
      </body>
    </html>
  )
}
