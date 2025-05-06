"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {  useFormContext } from "@/contexts/FormContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import InformationDetailsForm from "@/components/dashboard/customer-management/Individual-Form/InformationDetailsForm"
import { Card, CardContent } from "@/components/ui/card"
import ConfirmDetails from "@/components/dashboard/customer-management/Individual-Form/ConfirmPage"
import { useQueryState } from "nuqs"
import { parseAsInteger } from "nuqs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"

// Loading Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="mt-4 text-lg">Loading customer data...</p>
    </div>
  )
}

// Placeholder components for tabs that might be missing
function PlaceholderTab({ title }: { title: string }) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="flex flex-col items-center justify-center py-10">
          <h2 className="text-lg font-medium mb-4">{title}</h2>
          <p className="text-muted-foreground text-center">
            This section will be implemented in a future update.
            You can continue using the Information and Confirm tabs for now.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Customer Editor Component
export default function CustomerEditor({id}: {id: string}) {
  const { loadEditData } = useFormContext()
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1))
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchCustomerData() {
      try {
        setIsLoading(true)
        
        // Get the auth token from cookies
        const accessToken = document.cookie
          .split('; ')
          .find(row => row.startsWith('accessToken='))
          ?.split('=')[1]
        
        if (!accessToken) {
          toast.error("Authentication required. Please log in again.")
          router.push("/auth/login")
          return
        }
        
        // Fetch the customer data
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
        const response = await fetch(
          `${apiUrl}/customermanagement/get-individual-user?UserId=${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch customer data: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.isSuccess || !data.result) {
          throw new Error("Failed to fetch customer data")
        }
        
        console.log("Successfully fetched customer data for editing:", data.result)
        
        // Load the data into the form context
        loadEditData(id, data.result)
        
        // Set loading to false
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching customer data:", error)
        toast.error("Failed to load customer data. Please try again.")
        setIsLoading(false)
      }
    }
    
    fetchCustomerData()
  }, [id, loadEditData, router])

  // Determine which tab to show based on the step
  const activeTab = {
    1: "information",
    2: "kyc",
    3: "employment",
    4: "guarantor",
    5: "profile",
    6: "confirm",
  }[step] || "information"

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Customer</h1>
      <Tabs
        defaultValue="information"
        value={activeTab}
        className="w-full"
        onValueChange={(value) => {
          const stepMap = {
            information: 1,
            kyc: 2,
            employment: 3,
            guarantor: 4,
            profile: 5,
            confirm: 6,
          }
          setStep(stepMap[value as keyof typeof stepMap] || 1)
        }}
      >
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="information">Information</TabsTrigger>
          <TabsTrigger value="kyc">KYC</TabsTrigger>
          <TabsTrigger value="employment">Employment</TabsTrigger>
          <TabsTrigger value="guarantor">Guarantor</TabsTrigger>
          <TabsTrigger value="profile">Profile</TabsTrigger>
          <TabsTrigger value="confirm">Confirm</TabsTrigger>
        </TabsList>
        <TabsContent value="information">
          <InformationDetailsForm />
        </TabsContent>
        <TabsContent value="kyc">
          <PlaceholderTab title="KYC Documents" />
        </TabsContent>
        <TabsContent value="employment">
          <PlaceholderTab title="Employment Details" />
        </TabsContent>
        <TabsContent value="guarantor">
          <PlaceholderTab title="Guarantor & Next of Kin" />
        </TabsContent>
        <TabsContent value="profile">
          <PlaceholderTab title="Profile Details" />
        </TabsContent>
        <TabsContent value="confirm">
          <ConfirmDetails params={{ id: id, edit: true }} />
        </TabsContent>
      </Tabs>
    </div>
  )
}

// Mai