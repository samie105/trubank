"use client";

import React, { useEffect, useState, useMemo } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { DateTimePicker } from "@/components/ui/date-picker";
import { GetCountries, GetState } from "react-country-state-city";
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
import { FormData, Country, State } from "@/types/types";
import { PhoneInput } from "./PhoneInput";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
// import { useRouter } from "next/navigation";
import Link from "next/link";

const formSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  dob: z.date({ required_error: "Date of birth is required" }),
  gender: z.enum(["Male", "Female"], { required_error: "Gender is required" }),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(1, "Phone number is required"),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  address: z.string().min(1, "Address is required"),
  maritalStatus: z.enum(["Married", "Single"], {
    required_error: "Marital status is required",
  }),
  alternatePhone: z.string().min(1, "Alternate phone number is required"),
  employmentStatus: z.enum(
    ["Employed", "Self-employed", "Unemployed", "Student"],
    { required_error: "Employment status is required" }
  ),
  tin: z.string().min(1, "Tax Identification Number is required").optional(),
});

export default function InformationDetailsForm() {
  const { formData, updateFormData } = useFormContext();
  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    mode: "onChange",
    defaultValues: {
      ...formData,
      dob: formData.dob instanceof Date ? formData.dob : new Date(formData.dob),
    },
  });

  const [countryId, setCountryId] = useState<number | null>(null);
  const [, setStateId] = useState<number | null>(null);
  const [countriesList, setCountriesList] = useState<Country[]>([]);
  const [stateList, setStateList] = useState<State[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  // const [, setCreating] = useQueryState(
  //   "creating",
  //   parseAsBoolean.withDefault(false)
  // );
  const [, setStep] = useQueryState("step", parseAsInteger);

  const [openCountry, setOpenCountry] = useState(false);
  const [openState, setOpenState] = useState(false);
  // const router = useRouter();
  const memoizedCountriesList = useMemo(() => countriesList, [countriesList]);
  const memoizedStateList = useMemo(() => stateList, [stateList]);

  useEffect(() => {
    const fetchCountries = async () => {
      setIsLoading(true);
      try {
        const cachedCountries = localStorage.getItem("countriesList");
        if (cachedCountries) {
          const parsedCountries = JSON.parse(cachedCountries);
          setCountriesList(parsedCountries);
          const nigeriaCountry = parsedCountries.find(
            (country: Country) => country.name === "Nigeria"
          );
          if (nigeriaCountry) {
            setCountryId(nigeriaCountry.id);
          }
        } else {
          const data = await GetCountries();
          setCountriesList(data);
          localStorage.setItem("countriesList", JSON.stringify(data));
          const nigeriaCountry = data.find(
            (country) => country.name === "Nigeria"
          );
          if (nigeriaCountry) {
            setCountryId(nigeriaCountry.id);
          }
        }
      } catch (error) {
        console.error("Failed to fetch countries:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCountries();

    const savedData = localStorage.getItem("customerForm");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        if (key === "dob") {
          form.setValue("dob", new Date(parsedData[key]));
        } else {
          form.setValue(key as keyof FormData, parsedData[key]);
        }
      });
      form.trigger();
    }
  }, [form]);

  useEffect(() => {
    if (countryId !== null) {
      const fetchStates = async () => {
        setIsLoading(true);
        try {
          const cachedStates = localStorage.getItem(`stateList_${countryId}`);
          if (cachedStates) {
            const parsedStates = JSON.parse(cachedStates);
            setStateList(parsedStates);
          } else {
            const data = await GetState(countryId);
            setStateList(data);
            localStorage.setItem(
              `stateList_${countryId}`,
              JSON.stringify(data)
            );
          }
        } catch (error) {
          console.error("Failed to fetch states:", error);
        } finally {
          setIsLoading(false);
        }
      };

      fetchStates();
    }
  }, [countryId]);

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
                                form.setValue(
                                  "gender",
                                  gender as "Male" | "Female"
                                );
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
              <PhoneInput
                value={field.value}
                onChange={(value) => form.setValue("phone", value)}
                countriesList={memoizedCountriesList}
              />
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
                                setCountryId(country.id);
                                form.setValue("state", "");
                                setStateId(null);
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
            name="state"
            render={({ field }) => (
              <FormItem>
                <FormLabel>State</FormLabel>
                <Popover open={openState} onOpenChange={setOpenState}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openState}
                        className={cn(
                          "w-full justify-between disabled:cursor-not-allowed",
                          !field.value && "text-muted-foreground"
                        )}
                        disabled={!countryId || isLoading}
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Please wait
                          </>
                        ) : field.value ? (
                          memoizedStateList.find(
                            (state) => state.name === field.value
                          )?.name
                        ) : (
                          "Select state"
                        )}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search state..." />
                      <CommandList>
                        <CommandEmpty>No state found.</CommandEmpty>
                        <CommandGroup>
                          {memoizedStateList.map((state) => (
                            <CommandItem
                              key={state.id}
                              onSelect={() => {
                                form.setValue("state", state.name);
                                setStateId(state.id);
                                setOpenState(false);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  state.name === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {state.name}
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
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select marital status" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="Married">Married</SelectItem>
                    <SelectItem value="Single">Single</SelectItem>
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
                  onValueChange={field.onChange}
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
          <Button variant="outline" asChild>
            <Link href="/dashboard/customer-management">Back</Link>
          </Button>
          <Button
            type="submit"
            className="text-white"
            disabled={isLoading || !form.formState.isValid}
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
