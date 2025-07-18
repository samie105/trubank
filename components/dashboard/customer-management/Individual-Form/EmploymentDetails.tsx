"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { parseAsInteger, useQueryState } from "nuqs"
import { Loader2, Upload, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { DateTimePicker } from "@/components/ui/date-picker"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { cn } from "@/lib/utils"
import { useFormContext } from "@/contexts/FormContext"
import type { FormData } from "@/types/types"
import Image from "next/image"
import { useRouter } from "next/navigation"

const MAX_FILE_SIZE = 5 * 1024 * 1024 // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"]

const formSchema = z.object({
  currentEmployerName: z.string().optional(),
  employerAddress: z.string().optional(),
  jobTitle: z.string().optional(),
  startDate: z.date().optional(),
  endDate: z.date().optional(),
  employmentDocument: z
    .custom<File | string | null>()
    .refine(
      (file) => !file || file instanceof File || typeof file === "string",
      "Please upload a valid file"
    )
    .refine(
      (file) => !file || !(file instanceof File) || file.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        !file ||
        !(file instanceof File) ||
        ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .pdf files are accepted"
    )
    .nullable()
    .optional(),
})

type EmploymentFormData = Pick<
  FormData,
  "currentEmployerName" | "employerAddress" | "jobTitle" | "startDate" | "endDate" | "employmentDocument"
>

export default function EmploymentDetails() {
  const { formData, updateFormData } = useFormContext()
  const [dragActive, setDragActive] = useState(false)
  const [, setStep] = useQueryState("step", parseAsInteger)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const router = useRouter()

  const form = useForm<EmploymentFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentEmployerName: formData.currentEmployerName || "",
      employerAddress: formData.employerAddress || "",
      jobTitle: formData.jobTitle || "",
      startDate: formData.startDate instanceof Date 
        ? formData.startDate 
        : formData.startDate 
          ? new Date(formData.startDate) 
          : undefined,
      endDate: formData.endDate instanceof Date 
        ? formData.endDate 
        : formData.endDate 
          ? new Date(formData.endDate) 
          : undefined,
      employmentDocument: formData.employmentDocument || null,
    },
    mode: "onChange",
  })

  useEffect(() => {
    if (formData.employmentDocument instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.employmentDocument))
      form.setValue("employmentDocument", formData.employmentDocument)
    } else if (typeof formData.employmentDocument === "string" && formData.employmentDocument) {
      setPreviewUrl(formData.employmentDocument)
      form.setValue("employmentDocument", formData.employmentDocument)
    }
  }, [formData, form])

  const onSubmit = (data: EmploymentFormData) => {
    const updatedData = { ...formData, ...data }
    if (data.employmentDocument instanceof File) {
      const reader = new FileReader()
      reader.onloadend = () => {
        updatedData.employmentDocument = reader.result as string
        updateFormData(updatedData)
        localStorage.setItem("customerForm", JSON.stringify(updatedData))
        setStep(5)
      }
      reader.readAsDataURL(data.employmentDocument)
    } else {
      updateFormData(updatedData)
      localStorage.setItem("customerForm", JSON.stringify(updatedData))
      setStep(5)
    }
    console.log("Form submitted:", updatedData)
  }

  const handleSkip = () => {
    setStep(5)
  }

  const handleCancel = () => {
    // Clear all form data from localStorage
    localStorage.removeItem("customerForm")
    // Redirect to customer management dashboard
    router.push("/dashboard/customer-management")
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true)
    } else if (e.type === "dragleave") {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0])
    }
  }

  const handleFile = (file: File) => {
    form.setValue("employmentDocument", file, { shouldValidate: true })
    setPreviewUrl(URL.createObjectURL(file))
  }

  const removeFile = () => {
    form.setValue("employmentDocument", null, { shouldValidate: true })
    setPreviewUrl(null)
  }

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate__fadeIn animate__animated animate__faster"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Employment Details</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="currentEmployerName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Current Employer Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Current Employer Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="employerAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Employer Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Employer Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="jobTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Job Title/Role</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Job Title/Role" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="startDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Employment Start Date</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        granularity="day"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="endDate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Employment End Date <span className="text-muted-foreground">(if applicable)</span>
                    </FormLabel>
                    <FormControl>
                      <DateTimePicker
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        granularity="day"
                        value={field.value ? new Date(field.value) : undefined}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="employmentDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>
                    Upload of employment verification document{" "}
                    <span className="text-muted-foreground">(Optional - Offer Letter, Payslip, etc.)</span>
                  </FormLabel>
                  <FormControl>
                    <div
                      className={cn(
                        "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
                        dragActive && "border-primary",
                        "hover:border-primary transition-colors",
                      )}
                      onDragEnter={handleDrag}
                      onDragLeave={handleDrag}
                      onDragOver={handleDrag}
                      onDrop={handleDrop}
                      onClick={() => {
                        const input = document.createElement("input")
                        input.type = "file"
                        input.accept = ACCEPTED_FILE_TYPES.join(",")
                        input.onchange = (e) => handleFileChange(e as unknown as React.ChangeEvent<HTMLInputElement>)
                        input.click()
                      }}
                    >
                      {previewUrl ? (
                        <div className="flex items-center justify-between">
                          <Image
                            src={previewUrl || "/placeholder.svg"}
                            alt="Document Preview"
                            width={1000}
                            height={1000}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1 ml-4 text-left">
                            <p className="font-medium">
                              {field.value instanceof File ? field.value.name : "Employment Document"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {field.value instanceof File ? `${(field.value.size / 1024 / 1024).toFixed(2)} MB` : ""}
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              removeFile()
                            }}
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      ) : (
                        <div className="flex flex-col items-center gap-2">
                          <Upload className="h-8 w-8 text-muted-foreground" />
                          <p className="text-sm text-muted-foreground">
                            {dragActive ? "Drop your file here" : "Choose a file or drag & drop here"}
                          </p>
                          <p className="text-xs text-muted-foreground">JPEG and PNG format, up to 5MB</p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
              Previous
            </Button>
          </div>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit" className="text-white" disabled={form.formState.isSubmitting}>
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Save & Next"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

