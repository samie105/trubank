"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {  useBusinessForm } from "@/contexts/BusinessFormContext"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent } from "@/components/ui/card"
import { useQueryState } from "nuqs"
import { parseAsInteger } from "nuqs"
import { toast } from "sonner"
import { Loader2 } from "lucide-react"
import BusinessDetailsForm from "@/components/dashboard/customer-management/business-form/BusinessDetailsForm"
import BusinessConfirmPage from "@/components/dashboard/customer-management/business-form/BusinessConfirmPage"

// Loading Component
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center h-[70vh]">
      <Loader2 className="w-12 h-12 text-primary animate-spin" />
      <p className="mt-4 text-lg">Loading business data...</p>
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
            You can continue using the Business Information and Confirm tabs for now.
          </p>
        </div>
      </CardContent>
    </Card>
  )
}

// Business Editor Component
export default function BusinessEditor({id}: {id: string}) {
  const { loadEditData } = useBusinessForm()
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1))
  const [isLoading, setIsLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    async function fetchBusinessData() {
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
        
        // Fetch the business data
        const apiUrl = process.env.NEXT_PUBLIC_API_URL || "https://trubank-gateway-fdfjczfafqehhbea.uksouth-01.azurewebsites.net"
        const response = await fetch(
          `${apiUrl}/customermanagement/get-business-user?UserId=${id}`,
          {
            method: "GET",
            headers: {
              Authorization: `Bearer ${accessToken}`,
            },
          }
        )
        
        if (!response.ok) {
          throw new Error(`Failed to fetch business data: ${response.statusText}`)
        }
        
        const data = await response.json()
        
        if (!data.isSuccess || !data.result) {
          throw new Error("Failed to fetch business data")
        }
        
        console.log("Successfully fetched business data for editing:", data.result)
        
        // Load the data into the form context
        loadEditData(id, data.result)
        
        // Set loading to false
        setIsLoading(false)
      } catch (error) {
        console.error("Error fetching business data:", error)
        toast.error("Failed to load business data. Please try again.")
        setIsLoading(false)
      }
    }
    
    fetchBusinessData()
  }, [id, loadEditData, router])

  // Determine which tab to show based on the step
  const activeTab = {
    1: "business-info",
    2: "documents",
    3: "confirm",
  }[step] || "business-info"

  if (isLoading) {
    return <LoadingState />
  }

  return (
    <div className="container mx-auto py-6">
      <h1 className="text-2xl font-bold mb-4">Edit Business Customer</h1>
      <Tabs
        defaultValue="business-info"
        value={activeTab}
        className="w-full"
        onValueChange={(value) => {
          const stepMap = {
            "business-info": 1,
            "documents": 2,
            "confirm": 3,
          }
          setStep(stepMap[value as keyof typeof stepMap] || 1)
        }}
      >
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="business-info">Business Information</TabsTrigger>
          <TabsTrigger value="documents">Documents</TabsTrigger>
          <TabsTrigger value="confirm">Confirm</TabsTrigger>
        </TabsList>
        <TabsContent value="business-info">
          <BusinessDetailsForm />
        </TabsContent>
        <TabsContent value="documents">
          <PlaceholderTab title="Business Documents" />
        </TabsContent>
        <TabsContent value="confirm">
          <BusinessConfirmPage isEditMode={true} customerId={id} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
