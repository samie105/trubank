"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Check, ChevronDown, Upload, X } from "lucide-react";
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
import { useFormContext } from "@/contexts/FormContext";
import { FormData, IDType } from "@/types/types";
import Image from "next/image";
import { DateTimePicker } from "@/components/ui/date-picker";
import { useRouter } from "next/navigation";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const idTypes = [
  { value: "Driver_Licence", label: "Driver's License", maxLength: 20 },
  { value: "International_Passport", label: "International Passport", maxLength: 20 },
  { value: "Voters_Card", label: "Voter's Card", maxLength: 20 },
  { value: "NationalIdentityCard", label: "National Identity Card", maxLength: 20 },
  { value: "BVN", label: "Bank Verification Number", maxLength: 20 },
  { value: "Nin", label: "NIN Document", maxLength: 20 }
] as const;

const issuingAuthorities = [
  "National Identity Management Commission (NIMC)",
  "Central Bank of Nigeria (CBN)",
  "Nigeria Immigration Service (NIS)",
  "Federal Road Safety Corps (FRSC)",
  "Other",
] as const;

const formSchema = z
  .object({
    idType: z.string().optional(),
    idNumber: z.string().optional(),
    IdFile: z
      .custom<File | string | null>()
      .refine(
        (file) => !file || file instanceof File || typeof file === "string",
        "Please upload a valid file"
      )
      .refine(
        (file) =>
          !file || !(file instanceof File) || file.size <= MAX_FILE_SIZE,
        "File size must be less than 5MB"
      )
      .refine(
        (file) =>
          !file ||
          !(file instanceof File) ||
          ACCEPTED_FILE_TYPES.includes(file.type),
        "Only .jpg, .jpeg, and .png files are accepted"
      )
      .nullable()
      .optional(),
    expiryDate: z.date({
      invalid_type_error: "That's not a valid date!",
    }).optional(),
    issuingAuthority: z.string().optional(),
  });

type IDFormData = Pick<
  FormData,
  "idType" | "idNumber" | "IdFile" | "expiryDate" | "issuingAuthority"
>;

export default function IDDetailsForm() {
  const { formData, updateFormData } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const router = useRouter();

  const form = useForm<IDFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idType: formData.idType || undefined,
      idNumber: formData.idNumber || "",
      IdFile: formData.IdFile || null,
      expiryDate: formData.expiryDate || undefined,
      issuingAuthority: formData.issuingAuthority || undefined,
    },
    mode: "onChange",
  });

  const selectedIdType = form.watch("idType");
  
  // Create enhanced idTypes array that includes current value if not found in predefined options
  const enhancedIdTypes = [...idTypes] as Array<{value: string, label: string, maxLength: number}>;
  const currentIdType = form.watch("idType");
  if (currentIdType && !idTypes.find(type => type.value === currentIdType)) {
    enhancedIdTypes.push({ 
      value: currentIdType, 
      label: currentIdType.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      maxLength: 20 
    });
  }

  // Create enhanced issuingAuthorities array that includes current value if not found
  const enhancedIssuingAuthorities = [...issuingAuthorities] as string[];
  const currentIssuingAuthority = form.watch("issuingAuthority");
  if (currentIssuingAuthority && !issuingAuthorities.includes(currentIssuingAuthority as typeof issuingAuthorities[number])) {
    enhancedIssuingAuthorities.push(currentIssuingAuthority);
  }

  useEffect(() => {
    if (formData.idType) {
      form.setValue("idType", formData.idType);
    }
    if (formData.idNumber) {
      form.setValue("idNumber", formData.idNumber);
    }
    if (formData.expiryDate) {
      form.setValue("expiryDate", new Date(formData.expiryDate));
    }
    if (formData.issuingAuthority) {
      form.setValue("issuingAuthority", formData.issuingAuthority);
    }
    if (formData.IdFile instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.IdFile));
      form.setValue("IdFile", formData.IdFile);
    } else if (typeof formData.IdFile === "string" && formData.IdFile) {
      setPreviewUrl(formData.IdFile);
      form.setValue("IdFile", formData.IdFile);
    }
  }, [formData, form]);

  const onSubmit = (data: IDFormData) => {
    const updatedData = { ...formData, ...data };
    if (data.IdFile instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedData.IdFile = reader.result as string;
        updateFormData(updatedData);
        localStorage.setItem("customerForm", JSON.stringify(updatedData));
        setStep(3);
      };
      reader.readAsDataURL(data.IdFile);
    } else {
      updateFormData(updatedData);
      localStorage.setItem("customerForm", JSON.stringify(updatedData));
      setStep(3);
    }
    console.log("Form submitted:", updatedData);
  };

  const handleSkip = () => {
    setStep(3);
  };

  const handleCancel = () => {
    // Clear all form data from localStorage
    localStorage.removeItem("customerForm");
    // Redirect to customer management dashboard
    router.push("/dashboard/customer-management");
  };

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0]);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleFile = (file: File) => {
    form.setValue("IdFile", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    form.setValue("IdFile", null);
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate__fadeIn animate__animated animate__faster"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Individual Customer</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="idType"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>ID Verification</FormLabel>
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
                            ? enhancedIdTypes.find((type) => type.value === field.value)
                                ?.label
                            : "Select ID"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search ID type..." />
                        <CommandList>
                          <CommandEmpty>No ID type found.</CommandEmpty>
                          <CommandGroup>
                            {enhancedIdTypes.map((type) => (
                              <CommandItem
                                key={type.value}
                                value={type.value}
                                onSelect={() => {
                                  form.setValue("idType", type.value as IDType);
                                  form.setValue("idNumber", "");
                                  form.setValue("IdFile", null);
                                  setPreviewUrl(null);
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

            {selectedIdType && (
              <FormField
                control={form.control}
                name="idNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      {
                        enhancedIdTypes.find((type) => type.value === selectedIdType)
                          ?.label
                      }{" "}
                      Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter your ${
                          enhancedIdTypes.find((type) => type.value === selectedIdType)
                            ?.label
                        } number`}
                        {...field}
                        maxLength={
                          enhancedIdTypes.find((type) => type.value === selectedIdType)
                            ?.maxLength
                        }
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <FormField
              control={form.control}
              name="expiryDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Expiry Date</FormLabel>
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
              name="issuingAuthority"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>Issuing Authority</FormLabel>
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
                          {field.value || "Select Issuing Authority"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search issuing authority..." />
                        <CommandList>
                          <CommandEmpty>
                            No issuing authority found.
                          </CommandEmpty>
                          <CommandGroup>
                            {enhancedIssuingAuthorities.map((authority) => (
                              <CommandItem
                                key={authority}
                                value={authority}
                                onSelect={() => {
                                  form.setValue("issuingAuthority", authority);
                                }}
                              >
                                <Check
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    authority === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {authority}
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

            {selectedIdType && selectedIdType !== "BVN" && (
              <FormField
                control={form.control}
                name="IdFile"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload ID</FormLabel>
                    <FormControl>
                      <div
                        className={cn(
                          "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
                          dragActive && "border-primary",
                          "hover:border-primary transition-colors"
                        )}
                        onDragEnter={handleDrag}
                        onDragLeave={handleDrag}
                        onDragOver={handleDrag}
                        onDrop={handleDrop}
                        onClick={() => {
                          const input = document.createElement("input");
                          input.type = "file";
                          input.accept = ACCEPTED_FILE_TYPES.join(",");
                          input.onchange = (e) =>
                            handleFileChange(
                              e as unknown as React.ChangeEvent<HTMLInputElement>
                            );
                          input.click();
                        }}
                      >
                        {previewUrl ? (
                          <div className="flex items-center justify-between">
                            <Image
                              src={previewUrl}
                              alt="ID Preview"
                              width={1000}
                              height={1000}
                              className="w-20 h-20 object-cover rounded"
                            />
                            <div className="flex-1 ml-4 text-left">
                              <p className="font-medium">
                                {field.value instanceof File
                                  ? field.value.name
                                  : "ID Document"}
                              </p>
                              <p className="text-sm text-muted-foreground">
                                {field.value instanceof File
                                  ? `${(field.value.size / 1024 / 1024).toFixed(
                                      2
                                    )} MB`
                                  : ""}
                              </p>
                            </div>
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              onClick={(e) => {
                                e.stopPropagation();
                                removeFile();
                              }}
                            >
                              <X className="h-4 w-4" />
                            </Button>
                          </div>
                        ) : (
                          <div className="flex flex-col items-center gap-2">
                            <Upload className="h-8 w-8 text-muted-foreground" />
                            <p className="text-sm text-muted-foreground">
                              {dragActive
                                ? "Drop your file here"
                                : "Drop your file here, or Browse"}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              Maximum file size: 5MB (JPG, JPEG, PNG)
                            </p>
                          </div>
                        )}
                      </div>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </div>
        </div>
        <div className="flex justify-between">
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </Button>
            <Button type="button" variant="outline" onClick={() => setStep(1)}>
              Previous
            </Button>
          </div>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={handleSkip}>
              Skip
            </Button>
            <Button
              type="submit"
              className="text-white"
              disabled={form.formState.isSubmitting}
            >
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
  );
}
