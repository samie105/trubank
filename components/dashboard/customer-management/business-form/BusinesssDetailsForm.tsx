"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
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
import { Check, ChevronDown } from "lucide-react";
import { useBusinessForm } from "@/contexts/BusinessFormContext";
import { BusinessFormData } from "@/types/types";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";

const businessTypes = [
  { value: "logistics", label: "Logistics" },
  { value: "retail", label: "Retail" },
  { value: "manufacturing", label: "Manufacturing" },
  { value: "technology", label: "Technology" },
];

const industrySectors = [
  { value: "transportation", label: "Transportation" },
  { value: "healthcare", label: "Healthcare" },
  { value: "finance", label: "Finance" },
  { value: "education", label: "Education" },
];

const phoneRegex = /^\+[1-9]\d{1,14}$/;

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  businessType: z.string().min(1, "Please select a business type"),
  industrySector: z.string().min(1, "Please select an industry/sector"),
  businessAddress: z.string().min(1, "Business address is required"),
  email: z.string().email("Invalid email address"),
  phoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
});

export default function BusinessDetailForm() {
  const { formData, updateFormData } = useBusinessForm();

  const [, setCreating] = useQueryState(
    "creating",
    parseAsBoolean.withDefault(false)
  );
  const [, setStep] = useQueryState("step", parseAsInteger);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: formData,
  });

  const onSubmit = (data: BusinessFormData) => {
    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);
    localStorage.setItem("customerForm", JSON.stringify(updatedData));
    setStep(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter business name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="businessType"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Business Type</FormLabel>
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
                      {field.value
                        ? businessTypes.find(
                            (type) => type.value === field.value
                          )?.label
                        : "Select business type"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search business type..." />
                    <CommandList>
                      <CommandEmpty>No business type found.</CommandEmpty>
                      <CommandGroup>
                        {businessTypes.map((type) => (
                          <CommandItem
                            key={type.value}
                            value={type.value}
                            onSelect={() => {
                              form.setValue("businessType", type.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                type.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {type.label}
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
          name="industrySector"
          render={({ field }) => (
            <FormItem className="flex flex-col">
              <FormLabel>Industry/Sector</FormLabel>
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
                      {field.value
                        ? industrySectors.find(
                            (sector) => sector.value === field.value
                          )?.label
                        : "Select industry/sector"}
                      <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                    </Button>
                  </FormControl>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Search industry/sector..." />
                    <CommandList>
                      <CommandEmpty>No industry/sector found.</CommandEmpty>
                      <CommandGroup>
                        {industrySectors.map((sector) => (
                          <CommandItem
                            key={sector.value}
                            value={sector.value}
                            onSelect={() => {
                              form.setValue("industrySector", sector.value);
                            }}
                          >
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                sector.value === field.value
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            {sector.label}
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
          name="businessAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter business address" {...field} />
              </FormControl>
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
                <Input placeholder="Enter email" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="phoneNumber"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Phone Number</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter phone number (e.g., +1234567890)"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setCreating(false)}>
            Back
          </Button>
          <Button type="submit" className="text-white">
            {"Save & Next"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
