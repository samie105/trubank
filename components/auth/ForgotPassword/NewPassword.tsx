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
import {
  ResponsiveModal,
  ResponsiveModalContent,
  ResponsiveModalHeader,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
} from "@/components/ui/dialog-2"
import { useRouter } from "next/navigation"
import { resetPasswordAction } from "@/server/forgotpassword"
import { Eye, EyeOff, Check, X } from "lucide-react"

// Password schema with stronger validation
const newPasswordSchema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number")
      .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character"),
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })

type NewPasswordFormValues = z.infer<typeof newPasswordSchema>

export default function Component() {
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [passwordRequirements, setPasswordRequirements] = useState({
    minLength: false,
    hasUppercase: false,
    hasLowercase: false,
    hasNumber: false,
    hasSpecial: false,
  })
  const router = useRouter()

  // Use a ref for the toast ID to ensure it persists between renders
  const toastIdRef = React.useRef<string>("")

  const form = useForm<NewPasswordFormValues>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  })

  // Prefetch the login page for faster navigation after reset
  React.useEffect(() => {
    router.prefetch("/auth/login")
  }, [router])

  const { execute, status } = useAction(resetPasswordAction, {
    onSuccess(response) {
      if (response.data?.success) {
        toast.dismiss(toastIdRef.current)
        toast.success(response.data.message || "Password reset successfully")
        setShowSuccessDialog(true)
      } else if (response.data?.error) {
        toast.dismiss(toastIdRef.current)
        toast.error(response.data.message || "Failed to reset password")
      }
    },
    onExecute() {
      toastIdRef.current = String(toast.loading("Resetting your password...", { id: "reset-password" }))
    },
    onError(error) {
      toast.dismiss(toastIdRef.current)

      if (error.error.serverError) {
        toast.error("Error connecting to servers")
      } else if (error.error.validationErrors) {
        toast.error("Please check your password requirements")
      } else {
        toast.error("Failed to reset password. Please try again.")
      }
    },
    onSettled() {
      toast.dismiss("reset-password")
    },
  })

  const checkPasswordRequirements = (password: string) => {
    setPasswordRequirements({
      minLength: password.length >= 8,
      hasUppercase: /[A-Z]/.test(password),
      hasLowercase: /[a-z]/.test(password),
      hasNumber: /[0-9]/.test(password),
      hasSpecial: /[^A-Za-z0-9]/.test(password),
    })
  }

  async function onSubmit(data: NewPasswordFormValues) {
    execute(data)
  }

  return (
    <div className="flex justify-center items-center w-full">
      <div className="w-full max-w-md">
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div className="space-y-2 text-center">
              <h1 className="text-3xl font-bold">Set New Password</h1>
              <p className="text-muted-foreground">Enter your new password</p>
            </div>

            <div className="space-y-4">
              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Enter new password"
                          type={showPassword ? "text" : "password"}
                          required
                          {...field}
                          onChange={(e) => {
                            field.onChange(e)
                            checkPasswordRequirements(e.target.value)
                          }}
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
                    <div className="mt-2 space-y-1 text-xs">
                      <div className="flex items-center gap-2">
                        {passwordRequirements.minLength ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.minLength ? "text-green-500" : "text-muted-foreground"}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasUppercase ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={passwordRequirements.hasUppercase ? "text-green-500" : "text-muted-foreground"}
                        >
                          At least one uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasLowercase ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span
                          className={passwordRequirements.hasLowercase ? "text-green-500" : "text-muted-foreground"}
                        >
                          At least one lowercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasNumber ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.hasNumber ? "text-green-500" : "text-muted-foreground"}>
                          At least one number
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        {passwordRequirements.hasSpecial ? (
                          <Check className="h-3 w-3 text-green-500" />
                        ) : (
                          <X className="h-3 w-3 text-red-500" />
                        )}
                        <span className={passwordRequirements.hasSpecial ? "text-green-500" : "text-muted-foreground"}>
                          At least one special character
                        </span>
                      </div>
                    </div>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirm New Password</FormLabel>
                    <FormControl>
                      <div className="relative">
                        <Input
                          placeholder="Confirm new password"
                          type={showConfirmPassword ? "text" : "password"}
                          required
                          {...field}
                        />
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        >
                          {showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                        </Button>
                      </div>
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
                {status === "executing" ? "Resetting..." : "Reset Password"}
              </Button>
            </div>
          </form>
        </Form>
      </div>

      <ResponsiveModal open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <ResponsiveModalContent>
          <ResponsiveModalHeader>
            <ResponsiveModalTitle>Password Reset Successful</ResponsiveModalTitle>
            <ResponsiveModalDescription>
              Your password has been successfully reset. You can now log in with your new password.
            </ResponsiveModalDescription>
          </ResponsiveModalHeader>
          <ResponsiveModalFooter className="mt-5 md:mt-0">
            <Button className="text-white" onClick={() => router.push("/auth/login")}>
              Go to Login
            </Button>
          </ResponsiveModalFooter>
        </ResponsiveModalContent>
      </ResponsiveModal>
    </div>
  )
}

