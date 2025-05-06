/* eslint-disable @typescript-eslint/no-unused-vars */
"use client"

import { useEffect, useState } from "react"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs"
import { Loader2, Check, ChevronDown } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { useFormContext } from "@/contexts/FormContext"
import { useRouter } from "next/navigation"
import { useAction } from "next-safe-action/hooks"
import { 
  fetchBranchesAction, 
  fetchAccountOfficersAction, 
  fetchProductTypesAction,
  // Will be used when customer creation flow is implemented
  // createCustomerAccountAction 
} from "@/server/general/fetch-data"
import { toast } from "sonner"
import { DropdownSkeleton } from "@/components/ui/dropdown-skeleton"
import { logoutAction } from "@/server/auth/auth-server"

const formSchema = z.object({
  branch: z.string().optional(),
  accountOfficer: z.string().optional(),
  productId: z.string().optional(),
}).passthrough();

type ProfileFormData = z.infer<typeof formSchema>

export default function ProfileForm() {
  const { formData, updateFormData } = useFormContext()
  const [, setCreating] = useQueryState("creating", parseAsBoolean.withDefault(false))
  const router = useRouter()
  const [, setStep] = useQueryState("step", parseAsInteger)

  // State for branches, account officers, and product types
  const [branches, setBranches] = useState<{ id: string; name: string }[]>([])
  const [accountOfficers, setAccountOfficers] = useState<{ id: string; fullName: string }[]>([])
  const [productTypes, setProductTypes] = useState<{ id: string; name: string; accountType: string; status: string }[]>([])
  const [isLoadingBranches, setIsLoadingBranches] = useState(true)
  const [isLoadingOfficers, setIsLoadingOfficers] = useState(true)
  const [isLoadingProductTypes, setIsLoadingProductTypes] = useState(true)

  // Action to handle logout
  const { execute: executeLogout } = useAction(logoutAction, {
    onSuccess() {
      router.push("/auth/login")
    },
  })

  // Action to create customer account - to be used after customer creation
  // const { execute: executeCreateAccount } = useAction(createCustomerAccountAction, {
  //   onExecute() {
  //     toast.loading("Creating customer account...", { id: "create-account" })
  //   },
  //   onSuccess(response) {
  //     toast.dismiss("create-account")
  //     
  //     if (response.data?.success && response.data.data) {
  //       toast.success(`Account created successfully: ${response.data.data.accountNumber}`)
  //       router.push("/dashboard/customer-management")
  //     } else {
  //       toast.error(response.data?.error || "Failed to create account")
  //     }
  //   },
  //   onError(error) {
  //     toast.dismiss("create-account")
  //     toast.error(error.error.serverError || "An error occurred while creating the account")
  //   },
  // })

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ...formData,
      branch: formData.branch || "",
      accountOfficer: formData.accountOfficer || "",
      productId: formData.productId || "",
    },
  })

  router.prefetch("/dashboard/customer-management/create/individual")

  // Fetch branches action
  const { execute: fetchBranches } = useAction(fetchBranchesAction, {
    onExecute() {
      setIsLoadingBranches(true)
    },
    onSuccess(data) {
      if (data.data?.success) {
        setBranches(data.data.data || [])
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p>{data.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={() => executeLogout()} variant="outline" className="mt-2">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(data.data?.error || "Failed to fetch branches")
      }
      setIsLoadingBranches(false)
    },
    onError(error) {
      toast.error(error.error.serverError || "An error occurred while fetching branches")
      setIsLoadingBranches(false)
    },
  })

  // Fetch account officers action
  const { execute: fetchAccountOfficers } = useAction(fetchAccountOfficersAction, {
    onExecute() {
      setIsLoadingOfficers(true)
    },
    onSuccess(data) {
      if (data.data?.success) {
        setAccountOfficers(data.data.data || [])
      } else if (data.data?.statusCode === 401 || data.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p>{data.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={() => executeLogout()} variant="outline" className="mt-2">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(data.data?.error || "Failed to fetch account officers")
      }
      setIsLoadingOfficers(false)
    },
    onError(error) {
      toast.error(error.error.serverError || "An error occurred while fetching account officers")
      setIsLoadingOfficers(false)
    },
  })

  // Fetch product types action
  const { execute: fetchProductTypes } = useAction(fetchProductTypesAction, {
    onExecute() {
      setIsLoadingProductTypes(true)
    },
    onSuccess(response) {
      if (response.data?.success) {
        // Only use active products
        const products = response.data.data || [];
        const activeProducts = products.filter(product => product.status === "Active")
        setProductTypes(activeProducts || [])
      } else if (response.data?.statusCode === 401 || response.data?.error?.includes("Authentication required")) {
        toast.error(
          <div className="flex flex-col gap-2">
            <p>{response.data?.error || "Your session has expired. Please log in again."}</p>
            <Button size="sm" onClick={() => executeLogout()} variant="outline" className="mt-2">
              Logout
            </Button>
          </div>,
        )
      } else {
        toast.error(response.data?.error || "Failed to fetch product types")
      }
      setIsLoadingProductTypes(false)
    },
    onError(error) {
      toast.error(error.error.serverError || "An error occurred while fetching product types")
      setIsLoadingProductTypes(false)
    },
  })

  // Fetch data on component mount
  useEffect(() => {
    fetchBranches()
    fetchAccountOfficers()
    fetchProductTypes()
  }, [fetchBranches, fetchAccountOfficers, fetchProductTypes])

  useEffect(() => {
    const savedData = localStorage.getItem("customerForm")
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      if (parsedData.branch) form.setValue("branch", parsedData.branch)
      if (parsedData.accountOfficer) form.setValue("accountOfficer", parsedData.accountOfficer)
      if (parsedData.productId) form.setValue("productId", parsedData.productId)
    }
  }, [form])

  const onSubmit = async (data: ProfileFormData) => {
    const updatedData = {
      ...formData,
      ...data,
    }
    updateFormData(updatedData)
    localStorage.setItem("customerForm", JSON.stringify(updatedData))
    console.log("Form submitted:", updatedData)
    
    // Navigate to individual customer creation page
    router.push("/dashboard/customer-management/create/individual")
    
    // Note: Account creation would happen after customer creation
    // This would require integration with the customer creation API
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Profile Information</h2>

          {isLoadingBranches ? (
            <DropdownSkeleton label="Branch" />
          ) : (
            <FormField
              control={form.control}
              name="branch"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Branch</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? branches.find((branch) => branch.id === field.value)?.name || field.value
                            : "Select branch"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search branch..." />
                        <CommandList>
                          <CommandEmpty>No branch found.</CommandEmpty>
                          <CommandGroup>
                            {branches.map((branch) => (
                              <CommandItem
                                key={branch.id}
                                value={branch.name}
                                onSelect={() => {
                                  field.onChange(branch.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    branch.id === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {branch.name}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isLoadingOfficers ? (
            <DropdownSkeleton label="Account Officer" />
          ) : (
            <FormField
              control={form.control}
              name="accountOfficer"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Account Officer</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? accountOfficers.find((officer) => officer.id === field.value)?.fullName || field.value
                            : "Select account officer"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search account officer..." />
                        <CommandList>
                          <CommandEmpty>No account officer found.</CommandEmpty>
                          <CommandGroup>
                            {accountOfficers.map((officer) => (
                              <CommandItem
                                key={officer.id}
                                value={officer.fullName}
                                onSelect={() => {
                                  field.onChange(officer.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    officer.id === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {officer.fullName}
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}

          {isLoadingProductTypes ? (
            <DropdownSkeleton label="Desired Product" />
          ) : (
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Desired Product</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? productTypes.find((type) => type.id === field.value)?.name || field.value
                            : "Select product"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product..." />
                        <CommandList>
                          <CommandEmpty>No product found.</CommandEmpty>
                          <CommandGroup>
                            {productTypes.map((type) => (
                              <CommandItem
                                key={type.id}
                                value={type.name}
                                onSelect={() => {
                                  field.onChange(type.id)
                                }}
                              >
                                <Check
                                  className={cn("mr-2 h-4 w-4", type.id === field.value ? "opacity-100" : "opacity-0")}
                                />
                                {type.name} ({type.accountType})
                              </CommandItem>
                            ))}
                          </CommandGroup>
                        </CommandList>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  <FormMessage />
                </FormItem>
              )}
            />
          )}
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setCreating(false)}>
            Back
          </Button>
          <div className="space-x-2">
            <Button type="submit" disabled={isLoadingOfficers||isLoadingProductTypes||isLoadingBranches} className="text-white">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Create Customer"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  )
}

