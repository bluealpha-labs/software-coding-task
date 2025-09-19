"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/lib/auth-context"
import { Button } from "@workspace/ui/components/button"
import Link from "next/link"

export default function Page() {
  const { user, isLoading } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading && user) {
      router.push("/dashboard")
    }
  }, [user, isLoading, router])

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <div className="flex flex-col items-center justify-center gap-6 text-center">
        <h1 className="text-4xl font-bold">BlueAlpha</h1>
        <p className="text-xl text-muted-foreground max-w-md">
          Marketing Analytics Dashboard powered by Google Meridian MMM
        </p>
        <div className="flex gap-4">
          <Button asChild>
            <Link href="/login">Sign In</Link>
          </Button>
          <Button variant="outline" asChild>
            <Link href="/register">Create Account</Link>
          </Button>
        </div>
      </div>
    </div>
  )
}
