/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Check, ChevronDown, Upload } from "lucide-react";
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
import { useBusinessForm } from "@/contexts/BusinessFormContext";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "image/webp",
];

const branches = [
  "Ikeja",
  "Surulere",
  "Victoria Island",
  "Lekki",
  "Yaba",
  "Ikoyi",
  "Apapa",
  "Oshodi",
  "Ajah",
  "Festac",
];

const accountTypes = ["Savings", "Current"] as const;

const formSchema = z.object({
  branch: z.string().min(1, "Please select a branch"),
  accountOfficer: z.string().min(1, "Account officer is required"),
  desiredAccount: z.enum(accountTypes, {
    required_error: "Please select an account type",
  }),
});

type ProfileFormData = z.infer<typeof formSchema>;

export default function BusinessProfileForm() {
  const { formData, updateFormData } = useBusinessForm();
  const [, setStep] = useQueryState("step", parseAsInteger);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: formData.branch || "",
      accountOfficer: formData.accountOfficer || "",
      desiredAccount: formData.desiredAccount || undefined,
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem("CustomerBusinessForm");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.branch) form.setValue("branch", parsedData.branch);
      if (parsedData.accountOfficer)
        form.setValue("accountOfficer", parsedData.accountOfficer);
      if (parsedData.desiredAccount)
        form.setValue("desiredAccount", parsedData.desiredAccount);
    }
  }, [form]);

  const onSubmit = async (data: ProfileFormData) => {
    const updatedData = {
      ...formData,
      ...data,
    };
    updateFormData(updatedData);
    localStorage.setItem("CustomerBusinessForm", JSON.stringify(updatedData));
    console.log("Form submitted:", updatedData);
    setStep(5); // Navigate to the next step
  };

  const handleSkip = () => {
    setStep(5);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Profile Information</h2>

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
                        className={cn(
                          "w-full justify-between",
                          !field.value && "text-muted-foreground"
                        )}
                      >
                        {field.value || "Select branch"}
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
                              key={branch}
                              value={branch}
                              onSelect={() => {
                                field.onChange(branch);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  branch === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {branch}
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
            name="accountOfficer"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Account Officer</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Enter account officer's name"
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="desiredAccount"
            render={({ field }) => (
              <FormItem className="flex flex-col">
                <FormLabel>Desired Account Type</FormLabel>
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
                        {field.value || "Select account type"}
                        <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>
                  <PopoverContent className="w-full p-0">
                    <Command>
                      <CommandInput placeholder="Search account type..." />
                      <CommandList>
                        <CommandEmpty>No account type found.</CommandEmpty>
                        <CommandGroup>
                          {accountTypes.map((type) => (
                            <CommandItem
                              key={type}
                              value={type}
                              onSelect={() => {
                                field.onChange(type);
                              }}
                            >
                              <Check
                                className={cn(
                                  "mr-2 h-4 w-4",
                                  type === field.value
                                    ? "opacity-100"
                                    : "opacity-0"
                                )}
                              />
                              {type}
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
        </div>

        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(3)}>
            Previous
          </Button>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button type="submit" className="text-white">
              {form.formState.isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </>
              ) : (
                "Create"
              )}
            </Button>
          </div>
        </div>
      </form>
    </Form>
  );
}
