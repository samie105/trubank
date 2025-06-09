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
  accountOfficer: z.string().nullable(),
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
  const [accountOfficers, setAccountOfficers] = useState<{ id: string | null; fullName: string; createdAt: string }[]>([])
  const [productTypes, setProductTypes] = useState<{ id: string; name: string; accountTypeId: string }[]>([])
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
  })

  useEffect(() => {
    const savedData = localStorage.getItem("customerForm")
    if (savedData) {
      const parsedData = JSON.parse(savedData)
      if (parsedData.branch) form.setValue("branch", parsedData.branch)
      if (parsedData.accountOfficer !== undefined) form.setValue("accountOfficer", parsedData.accountOfficer)
      if (parsedData.desiredAccount) {
        form.setValue("productId", parsedData.desiredAccount)
      } else if (parsedData.productId) {
        form.setValue("productId", parsedData.productId)
      }
    }
  }, [form])

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
        console.error("Branch fetch error:", data.data)
        toast.error(data.data?.error || "Failed to fetch branches")
      }
      setIsLoadingBranches(false)
    },
    onError(error) {
      console.error("Branch fetch execution error:", error)
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
        console.error("Account officers fetch error:", data.data)
        toast.error(data.data?.error || "Failed to fetch account officers")
      }
      setIsLoadingOfficers(false)
    },
    onError(error) {
      console.error("Account officers fetch execution error:", error)
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
        // No need to filter by status since the API doesn't return status field
        const products = response.data.data || [];
        setProductTypes(products || [])
        console.log("Product types set:", products)
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
        console.error("Product types fetch error:", response.data)
        toast.error(response.data?.error || "Failed to fetch product types")
      }
      setIsLoadingProductTypes(false)
    },
    onError(error) {
      console.error("Product types fetch execution error:", error)
      toast.error(error.error.serverError || "An error occurred while fetching product types")
      setIsLoadingProductTypes(false)
    },
  })

  // Fetch data on component mount
  useEffect(() => {
    const fetchAllData = async () => {
      try {
        console.log("Starting sequential data fetching...")
        
        // Fetch data one at a time
        try {
           fetchBranches();
          console.log("Branches fetched successfully");
        } catch (err) {
          console.error("Error in fetchBranches:", err);
        }
        
        try {
           fetchAccountOfficers();
          console.log("Account officers fetched successfully");
        } catch (err) {
          console.error("Error in fetchAccountOfficers:", err);
        }
        
        try {
           fetchProductTypes();
          console.log("Product types fetched successfully");
        } catch (err) {
          console.error("Error in fetchProductTypes:", err);
        }
        
        console.log("Completed sequential data fetching");
      } catch (error) {
        console.error("Unexpected error in fetchAllData:", error);
      }
    };

    fetchAllData();
  }, [fetchBranches, fetchAccountOfficers, fetchProductTypes]);

  

  const onSubmit = async (data: ProfileFormData) => {
    const { productId, ...restOfData } = data;
    const updatedData = {
      ...formData,
      ...restOfData,
      desiredAccount: productId,
    }
    updateFormData(updatedData)
    localStorage.setItem("customerForm", JSON.stringify(updatedData))
    console.log("Form submitted, stored to localStorage:", updatedData)
    
    // Navigate to individual customer creation page
    router.push("/dashboard/customer-management/create/individual")
    
    // Note: Account creation would happen after customer creation
    // This would require integration with the customer creation API
  }
 
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
        <h2 className="text-2xl font-bold text-center">
            Customer Assignment <br /> and Account Setup
          </h2>
          <h2 className="text-sm text-center font-medium text-muted-foreground">
            Assign the customer to a branch, an officer and a product type, <br /> then proceed to create their account
          </h2>


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
                            ? accountOfficers.find((officer) => officer.id === field.value)?.fullName || "Select account officer"
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
                            {accountOfficers.map((officer) => {
                              // Use name as unique identifier for UI comparison only
                              const displayIdentifier = officer.id || officer.fullName;
                              return (
                                <CommandItem
                                  key={displayIdentifier}
                                  value={officer.fullName}
                                  onSelect={() => {
                                    // Always pass the actual ID (even if null) to the form
                                    field.onChange(officer.id)
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      (field.value === officer.id || 
                                       (field.value === null && officer.id === null)) 
                                       ? "opacity-100" : "opacity-0"
                                    )}
                                  />
                                  {officer.fullName}
                                </CommandItem>
                              );
                            })}
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
            <DropdownSkeleton label="Product Type" />
          ) : (
            <FormField
              control={form.control}
              name="productId"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Product Type</FormLabel>
                  <Popover>
                    <PopoverTrigger asChild>
                      <FormControl>
                        <Button
                          variant="outline"
                          role="combobox"
                          className={cn("w-full justify-between", !field.value && "text-muted-foreground")}
                        >
                          {field.value
                            ? productTypes.find((product) => product.id === field.value)?.name || field.value
                            : "Select product type"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search product type..." />
                        <CommandList>
                          <CommandEmpty>No product type found.</CommandEmpty>
                          <CommandGroup>
                            {productTypes.map((product) => (
                              <CommandItem
                                key={product.id}
                                value={product.name}
                                onSelect={() => {
                                  field.onChange(product.id)
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    product.id === field.value ? "opacity-100" : "opacity-0",
                                  )}
                                />
                                {product.name}
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
          <Button
            type="button"
            variant="outline"
            onClick={() => setCreating(false)}
          >
            Back
          </Button>
          <Button type="submit">Create Customer</Button>
        </div>
      </form>
    </Form>
  )
}
 