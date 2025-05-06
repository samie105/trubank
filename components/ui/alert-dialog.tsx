"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogTrigger,
} from "@/components/ui/dialog"

// Re-export Dialog components with Alert prefix
export const AlertDialog = Dialog
export const AlertDialogTrigger = DialogTrigger
export const AlertDialogContent = DialogContent
export const AlertDialogHeader = DialogHeader
export const AlertDialogFooter = DialogFooter
export const AlertDialogTitle = DialogTitle
export const AlertDialogDescription = DialogDescription

// Custom components for Alert actions
export const AlertDialogAction = React.forwardRef<
  HTMLButtonElement,
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: "default" | "destructive" | "outline" }
>(({ className, variant = "default", ...props }, ref) => (
  <Button ref={ref} variant={variant} {...props} className={className} />
))
AlertDialogAction.displayName = "AlertDialogAction"

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ButtonHTMLAttributes<HTMLButtonElement>>(
  ({ className, ...props }, ref) => (
    <Button ref={ref} variant="outline" {...props} className={`mt-2 sm:mt-0 ${className}`} />
  ),
)
AlertDialogCancel.displayName = "AlertDialogCancel"

