"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Upload, X, ChevronDown, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DateTimePicker } from "@/components/ui/date-picker";
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
import { FormData } from "@/types/types";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const addressProofTypes = [
  "Utility Bill",
  "Bank Statement",
  "Lease Agreement",
] as const;

const issuingAuthorities = [
  "Electricity Company",
  "Water Corporation",
  "Banking Institution",
  "Property Management Company",
  "Telecommunications Company",
  "Other",
] as const;

const formSchema = z.object({
  proofOfAddress: z
    .custom<File | string | null>()
    .refine(
      (file) => !file || file instanceof File || typeof file === "string",
      "Please upload a valid file"
    )
    .refine(
      (file) => !file || !(file instanceof File) || file.size <= MAX_FILE_SIZE,
      "File size must be less than 5MB"
    )
    .refine(
      (file) =>
        !file ||
        !(file instanceof File) ||
        ACCEPTED_FILE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png, and .pdf files are accepted"
    )
    .refine((file) => file !== null, "Proof of address document is required"),
  addressProofType: z.enum(addressProofTypes, {
    required_error: "Please select type of address proof",
  }),
  issuingAuthorityPOA: z.enum(issuingAuthorities, {
    required_error: "Please select issuing authority",
  }),
  dateOfIssue: z.date({
    required_error: "Date of issue is required",
  }),
});

type ProofOfAddressFormData = Pick<
  FormData,
  "proofOfAddress" | "addressProofType" | "issuingAuthorityPOA" | "dateOfIssue"
>;

export default function ProofOfAddress() {
  const { formData, updateFormData } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProofOfAddressFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      proofOfAddress: formData.proofOfAddress || null,
      addressProofType: formData.addressProofType || undefined,
      issuingAuthorityPOA: formData.issuingAuthorityPOA || undefined,
      dateOfIssue:
        formData.dateOfIssue instanceof Date
          ? formData.dateOfIssue
          : new Date(formData.dateOfIssue),
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (formData.proofOfAddress instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.proofOfAddress));
      form.setValue("proofOfAddress", formData.proofOfAddress);
    } else if (
      typeof formData.proofOfAddress === "string" &&
      formData.proofOfAddress
    ) {
      setPreviewUrl(formData.proofOfAddress);
      form.setValue("proofOfAddress", formData.proofOfAddress);
    }
    if (formData.dateOfIssue) {
      form.setValue("dateOfIssue", new Date(formData.dateOfIssue));
    }
  }, [formData, form]);

  const onSubmit = (data: ProofOfAddressFormData) => {
    const updatedData = { ...formData, ...data };
    if (data.proofOfAddress instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedData.proofOfAddress = reader.result as string;
        updateFormData(updatedData);
        localStorage.setItem("customerForm", JSON.stringify(updatedData));
        setStep(4);
      };
      reader.readAsDataURL(data.proofOfAddress);
    } else {
      updateFormData(updatedData);
      localStorage.setItem("customerForm", JSON.stringify(updatedData));
      setStep(4);
    }
    console.log("Form submitted:", updatedData);
  };

  const handleSkip = () => {
    setStep(4);
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
    form.setValue("proofOfAddress", file, { shouldValidate: true });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    form.setValue("proofOfAddress", null, { shouldValidate: true });
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate__fadeIn animate__animated animate__faster"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Proof of Address</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="addressProofType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Type of Address Proof</FormLabel>
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
                          {field.value || "Select proof type"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search proof type..." />
                        <CommandList>
                          <CommandEmpty>No proof type found.</CommandEmpty>
                          <CommandGroup>
                            {addressProofTypes.map((type) => (
                              <CommandItem
                                key={type}
                                value={type}
                                onSelect={() => {
                                  form.setValue("addressProofType", type);
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

            <FormField
              control={form.control}
              name="issuingAuthorityPOA"
              render={({ field }) => (
                <FormItem>
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
                          {field.value || "Select issuing authority"}
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
                            {issuingAuthorities.map((authority) => (
                              <CommandItem
                                key={authority}
                                value={authority}
                                onSelect={() => {
                                  form.setValue(
                                    "issuingAuthorityPOA",
                                    authority
                                  );
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

            <FormField
              control={form.control}
              name="dateOfIssue"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Date of Issue</FormLabel>
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
              name="proofOfAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload Proof of Address</FormLabel>
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
                                : "Proof of Address Document"}
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
                            Maximum file size: 5MB (JPG, JPEG, PNG, PDF)
                          </p>
                        </div>
                      )}
                    </div>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(2)}>
            Previous
          </Button>
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
