"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Image from "next/image"
import { signIn } from "next-auth/react"

export default function LoginPage() {
  return (
    <div className="flex h-screen w-full items-center justify-center bg-muted/40">
      <Card className="w-full max-w-md">
        <CardHeader className="space-y-1">
          <div className="flex justify-center mb-4">
            <div className="w-15 h-15 rounded-full overflow-hidden bg-primary/10 flex items-center justify-center">
              <Image
                src="/usc-logo.png?height=60&width=60"
                alt="Logo"
                width={60}
                height={60}
                className="rounded-full"
              />
            </div>
          </div>
          <CardTitle className="text-2xl text-center">Sign in</CardTitle>
          <CardDescription className="text-center">
            Enter your credentials to access your account
          </CardDescription>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="email">Email</Label>
            <Input id="email" placeholder="name@example.com" type="email" />
          </div>
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="password">Password</Label>
              {/* <Link href="#" className="text-sm text-primary hover:underline">
                Forgot password?
              </Link> */}
            </div>
            <Input id="password" type="password" />
          </div>

          <Button className="w-full" disabled>
            Sign In
          </Button>

          {/* OR divider */}
          <div className="relative my-4">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-gray-300" />
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-background px-2 text-muted-foreground">or</span>
            </div>
          </div>

          {/* Google sign-in button */}
          <Button
            variant="outline"
            className="flex items-center justify-center w-full border-gray-300 bg-white text-gray-700 hover:bg-gray-50"
            onClick={() => signIn("google", { callbackUrl: "/dashboard" })}
          >
            <Image src="/google-icon.svg" alt="Google" width={20} height={20} className="mr-2" />
            Sign in with Google
          </Button>
        </CardContent>

        {/* Optional footer links or legal text */}
        {/* <CardFooter className="text-center text-sm text-muted-foreground"> */}
          {/* Don't have an account? <Link href="#" className="text-primary hover:underline">Sign up</Link> */}
        {/* </CardFooter> */}
      </Card>
    </div>
  )
}
