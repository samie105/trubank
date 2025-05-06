"use client"

import React, { useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { useAction } from "next-safe-action/hooks"
import { toast } from "sonner"
import { forgotPasswordAction } from "@/server/forgotpassword"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPassword({
  setStep,
}: {
  setStep: (step: number) => void
}) {
  // Use state instead of localStorage for better SSR compatibility
  const [savedEmail, setSavedEmail] = useState("")

  // Get email from localStorage on client-side only
  React.useEffect(() => {
    const storedEmail = localStorage.getItem("email") || ""
    setSavedEmail(storedEmail)
  }, [])

  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: savedEmail,
    },
  })

  // Update form value when savedEmail changes
  React.useEffect(() => {
    if (savedEmail) {
      form.setValue("email", savedEmail)
    }
  }, [savedEmail, form])

  const { execute, status } = useAction(forgotPasswordAction, {
    onSuccess(response) {
      if (response.data?.success) {
        toast.success(response.data.message || "Reset instructions sent to your email")
        setStep(1)
      } else if (response.data?.error) {
        toast.error(response.data.message || "Failed to send reset instructions")
      }
    },
    onExecute() {
      toast.loading("Sending reset instructions...", { id: "forgot-password" })
    },
    onError(error) {
      toast.dismiss("forgot-password")

      if (error.error.serverError) {
        toast.error("Error connecting to servers")
      } else if (error.error.validationErrors) {
        toast.error("Please check your email address")
      } else {
        toast.error("Failed to send reset instructions. Please try again.")
      }
    },
    onSettled() {
      toast.dismiss("forgot-password")
    },
  })

  async function onSubmit(data: ForgotPasswordFormValues) {
    // Save email to localStorage for persistence
    localStorage.setItem("email", data.email)
    execute(data)
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Link
          href={"/auth/login"}
          className="back-to-login flex rounded-xl p-3 text-sm gap-x-1 items-center bg-primary/5 text-primary font-medium"
        >
          <ArrowLeft className="size-4" />
          <p>Back to Login</p>
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground">Enter your email to receive password reset instructions</p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      autoComplete="email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full font-semibold bg-primary text-white hover:bg-primary/90"
              disabled={status === "executing"}
            >
              {status === "executing" ? "Sending..." : "Send Reset Instructions"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  )
}

