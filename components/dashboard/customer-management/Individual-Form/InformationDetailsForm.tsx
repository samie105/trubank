"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-picker";
import { GetCountries } from "react-country-state-city";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Check, ChevronDown } from "lucide-react";
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
import { cn } from "@/lib/utils";
import { useFormContext } from "@/contexts/FormContext";
import { FormData, Country } from "@/types/types";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.string().min(1, "Gender is required"),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
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
  const [isLoading, setIsLoading] = useState(false);

  const [, setStep] = useQueryState("step", parseAsInteger);

  const [openCountry, setOpenCountry] = useState(false);
  const router = useRouter();
  const memoizedCountriesList = useMemo(() => countriesList, [countriesList]);

  const handleBack = async () => {
    await router.push("/dashboard/customer-management");
  };

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const cachedCountries = localStorage.getItem("countriesList");
        if (cachedCountries) {
          const parsedCountries = JSON.parse(cachedCountries);
          setCountriesList(parsedCountries);
        } else {
          const data = await GetCountries();
          setCountriesList(data);
          localStorage.setItem("countriesList", JSON.stringify(data));
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();
  }, []);

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
                            Please wait
                          </>
                        ) : field.value ? (
                          memoizedCountriesList.find(
                            (country) => country.name === field.value
                          )?.emoji ? (
                            `${
                              memoizedCountriesList.find(
                                (country) => country.name === field.value
                              )?.emoji
                            } ${field.value}`
                          ) : (
                            field.value
                          )
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
                        <CommandEmpty>No country found.</CommandEmpty>
                        <CommandGroup>
                          {memoizedCountriesList.map((country) => (
                            <CommandItem
                              key={country.id}
                              onSelect={() => {
                                form.setValue("country", country.name);
                                setOpenCountry(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  country.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {country.emoji || ""} {country.name}
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
                    type="number"
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
                  <Input placeholder="Enter TIN" type="number" {...field} />
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
