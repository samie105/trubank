"use client"

import { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { loginAction } from "@/server/Login"
import { Eye, EyeOff } from "lucide-react"
import { useRouter, useSearchParams } from "next/navigation"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function Component() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectParam = searchParams.get("redirect")
  
  // Validate redirect path - don't redirect to auth pages or external URLs
  const getValidRedirectPath = (path: string | null): string => {
    if (!path) return "/dashboard/customer-management"
    
    // Don't redirect to auth pages
    if (path.startsWith("/auth/")) return "/dashboard/customer-management"
    
    // Don't redirect to external URLs
    if (path.startsWith("http")) return "/dashboard/customer-management"
    
    // Ensure path starts with /
    if (!path.startsWith("/")) return "/dashboard/customer-management"
    
    return path
  }
  
  const redirectPath = getValidRedirectPath(redirectParam)
  const [showPassword, setShowPassword] = useState(false)
  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  const { execute, status } = useAction(loginAction, {
    onSuccess(data) {
      if (data.data?.success) {
        toast.success("Login successful!")
        router.push(redirectPath)
      } else if (data.data?.error) {
        toast.error(data.data.error)
      }
    },
    onExecute() {
      toast.loading("Logging in...", { id: "login" })
    },
    onError(error) {
      toast.dismiss("login")

      if (error.error.serverError) {
        toast.error("Error connecting to servers")
      } else if (error.error.validationErrors) {
        toast.error("Please check your details")
      } else {
        toast.error("Login failed. Please try again.")
      }
    },
    onSettled() {
      toast.dismiss("login")
    },
  })

  async function onSubmit(data: LoginFormValues) {
    await execute(data)
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Log into your account</h1>
          <p className="text-muted-foreground">Welcome back! enter your details</p>
        </div>

        <div className="space-y-4">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" type="email" autoComplete="email" required {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Password</FormLabel>
                <FormControl>
                  <div className="relative">
                    <Input
                      placeholder="Enter password"
                      type={showPassword ? "text" : "password"}
                      autoComplete="current-password"
                      required
                      {...field}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                      onClick={() => setShowPassword(!showPassword)}
                    >
                      {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                    </Button>
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <div className="flex justify-end">
            <Link href="/auth/forgot-password" className="text-sm font-semibold text-primary hover:underline">
              Forgot password?
            </Link>
          </div>

          <Button
            type="submit"
            className="w-full font-semibold bg-primary text-white hover:bg-primary/90"
            disabled={status === "executing"}
          >
            {status === "executing" ? "Logging in..." : "Login"}
          </Button>
        </div>
      </form>
    </Form>
  )
}

