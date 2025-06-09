"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-picker";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Check, ChevronDown, AlertCircle } from "lucide-react";
import {
  Form,
  FormField,
  FormItem,
  FormLabel,
  FormControl,
  FormMessage,
} from "@/components/ui/form";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { cn } from "@/lib/utils";
import { useFormContext } from "@/contexts/FormContext";
import { FormData } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { fetchCountries, type Country } from "@/server/customer-management/fetchCountries";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"), // This is now the country ID
  address: z.string().min(1, "Address is required"),
  maritalStatus: z.string().min(1, "Marital status is required"),
  alternatePhone: z.string().min(1, "Alternate phone number is required"),
  employmentStatus: z.string().optional(),
  tin: z.string().optional(),
});

export default function InformationDetailsForm() {
  const { formData, updateFormData } = useFormContext();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      ...formData,
      dob: formData.dob instanceof Date 
        ? formData.dob 
        : formData.dob 
          ? new Date(formData.dob) 
          : undefined,
    },
  });

  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [isLoading, setIsLoading] = useState(true); // Start with loading state true
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [fetchRetries, setFetchRetries] = useState(0);
  const MAX_RETRIES = 10;

  const [, setStep] = useQueryState("step", parseAsInteger);

  const [openCountry, setOpenCountry] = useState(false);
  const router = useRouter();
  const memoizedCountriesList = useMemo(() => countriesList, [countriesList]);

  const handleBack = async () => {
    await router.push("/dashboard/customer-management");
  };

  // Function to get country name by ID
  const getCountryNameById = (id: string): string => {
    const country = memoizedCountriesList.find(country => country.id === id);
    return country ? country.name : "";
  };

  // Function to retry fetching countries
  const retryFetchCountries = () => {
    setErrorMessage(null);
    setFetchRetries(prev => prev + 1);
    getCountriesData();
  };

  // Function to fetch countries data
  const getCountriesData = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    
    try {
      // Direct fetch from server action - no localStorage caching
      const countries = await fetchCountries();
      
      if (countries && Array.isArray(countries)) {
        setCountriesList(countries);
      } else {
        throw new Error("Invalid countries data received");
      }
    } catch (error) {
      console.error("Failed to fetch countries:", error);
      setErrorMessage(error instanceof Error ? error.message : "Failed to load countries. Please try again.");
      setCountriesList([]); // Set empty array on error to prevent undefined errors
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    getCountriesData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Don't include getCountriesData in deps to avoid infinite loops

  const onSubmit = (data: FormData) => {
    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);
    localStorage.setItem("customerForm", JSON.stringify(updatedData));
    console.log("Form submitted:", data);
    setStep(2);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-4 animate__fadeIn animate__animated animate__faster"
      >
        <h2 className="text-lg font-semibold">Create Individual Customer</h2>

        {/* Error Alert */}
        {errorMessage && (
          <Alert variant="destructive" className="mb-4">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
              <span>{errorMessage}</span>
              {fetchRetries < MAX_RETRIES && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={retryFetchCountries}
                  className="ml-4"
                  disabled={isLoading}
                >
                  {isLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Retry"}
                </Button>
              )}
            </AlertDescription>
          </Alert>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>First Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter first name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Last Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter last name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="dob"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Date of Birth</FormLabel>
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
            name="gender"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Gender</FormLabel>
                <Popover>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Select gender"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search gender..." />
                      <CommandList>
                        <CommandEmpty>No gender found.</CommandEmpty>
                        <CommandGroup>
                          {["Male", "Female"].map((gender) => (
                            <CommandItem
                              value={gender}
                              key={gender}
                              onSelect={() => {
                                form.setValue("gender", gender);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  gender === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {gender}
                            </CommandItem>
                          ))}
                          {/* Allow other values that don't match predefined options */}
                          {field.value && 
                            !["Male", "Female"].includes(field.value) && (
                              <CommandItem
                                value={field.value}
                                key={field.value}
                                onSelect={() => {
                                  form.setValue("gender", field.value);
                                }}
                              >
                                <Check className="mr-2 h-4 w-4 opacity-100" />
                                {field.value}
                              </CommandItem>
                            )
                          }
                        </CommandGroup>
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email</FormLabel>
                <FormControl>
                  <Input placeholder="Enter email address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="phone"
            render={({ field }) => (
              <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  type="tel"
                  placeholder="Enter Phone Number"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="country"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Country</FormLabel>
                <Popover open={openCountry} onOpenChange={setOpenCountry}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        disabled={isLoading}
                        aria-expanded={openCountry}
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading countries...
                          </>
                        ) : field.value ? (
                          getCountryNameById(field.value) || field.value
                        ) : (
                          "Select country"
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search country..." />
                      <CommandList>
                        {isLoading ? (
                          <div className="flex items-center justify-center p-4 text-sm">
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Loading countries...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No country found.</CommandEmpty>
                            <CommandGroup>
                              {memoizedCountriesList.map((country) => (
                                <CommandItem
                                  key={country.id}
                                  onSelect={() => {
                                    form.setValue("country", country.id);
                                    setOpenCountry(false);
                                  }}
                                >
                                  <Check
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      country.id === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {country.countryCode && `${country.countryCode} `} {country.name}
                                </CommandItem>
                              ))}
                            </CommandGroup>
                          </>
                        )}
                      </CommandList>
                    </Command>
                  </PopoverContent>
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="address"
            render={({ field }) => (
              <FormItem className="md:col-span-2">
                <FormLabel>Residential Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={form.control}
            name="maritalStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Marital Status</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="married">Married</SelectItem>
                    <SelectItem value="single">Single</SelectItem>
                    <SelectItem value="divorced">Divorced</SelectItem>
                    <SelectItem value="widowed">Widowed</SelectItem>
                    {/* Allow custom values by keeping current value in dropdown if it doesn't match options */}
                    {field.value && 
                      !["married", "single", "divorced", "widowed"].includes(field.value.toLowerCase()) && (
                        <SelectItem value={field.value}>{field.value}</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="alternatePhone"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Alternate Phone Number</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter alternate phone number"
                    type="tel"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="employmentStatus"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Occupation/Employment Status</FormLabel>
                <Select
                  onValueChange={(value) => field.onChange(value)}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select employment status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Employed">Employed</SelectItem>
                    <SelectItem value="Self-employed">Self-employed</SelectItem>
                    <SelectItem value="Unemployed">Unemployed</SelectItem>
                    <SelectItem value="Student">Student</SelectItem>
                    {/* Allow custom values by keeping current value in dropdown if it doesn't match options */}
                    {field.value && 
                      !["Employed", "Self-employed", "Unemployed", "Student"].includes(field.value) && (
                        <SelectItem value={field.value}>{field.value}</SelectItem>
                      )
                    }
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="tin"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tax Identification Number (TIN)</FormLabel>
                <FormControl>
                  <Input placeholder="Enter TIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex justify-between mt-4">
          <Button variant="outline" type="button" onClick={() => handleBack()}>
            Back
          </Button>
          <Button
            type="submit"
            className="text-white"
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Save & Next"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
