"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Upload, X, ChevronDown } from "lucide-react";
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
import { useBusinessForm } from "@/contexts/BusinessFormContext";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const utilityBillTypes = [
  "Utility_Bill",
  "Water_Bill",
] as const;

// Function to convert API values to user-friendly display values
const getProofDisplayName = (type: string): string => {
  return type.replace(/_/g, " ");
};

const utilityBillIssuers = [
  "IBEDC",
  "EKEDC",
  "AEDC",
  "PHEDC",
  "MTN",
  "Airtel",
  "Glo",
  "9mobile",
  "Other",
] as const;

const formSchema = z.object({
  utilityBillType: z.enum(utilityBillTypes, {
    required_error: "Please select utility bill type",
  }),
  utilityBillIssuer: z.enum(utilityBillIssuers, {
    required_error: "Please select utility bill issuer",
  }),
  issueDateOfBill: z.date({
    required_error: "Issue date is required",
  }),
  utilityBill: z
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
      "Only .jpg, .jpeg, and .png files are accepted"
    )
    .refine((file) => file !== null, "Utility bill is required").nullable(),
});

type ProofOfBusinessAddressFormData = {
  utilityBillType: string;
  utilityBillIssuer: string;
  issueDateOfBill: Date;
  utilityBill: File | string | null;
};

export default function ProofofAddressBusiness({isEditMode}:{isEditMode:boolean}) {
  const { formData, updateFormData } = useBusinessForm();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProofOfBusinessAddressFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      utilityBillType: formData.utilityBillType || undefined,
      utilityBillIssuer: formData.utilityBillIssuer || undefined,
      issueDateOfBill: formData.issueDateOfBill
        ? new Date(formData.issueDateOfBill)
        : undefined,
      utilityBill: formData.utilityBill || null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (formData.utilityBill instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.utilityBill));
      form.setValue("utilityBill", formData.utilityBill);
    } else if (
      typeof formData.utilityBill === "string" &&
      formData.utilityBill
    ) {
      setPreviewUrl(formData.utilityBill);
      form.setValue("utilityBill", formData.utilityBill);
    }

    return () => {
      if (previewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(previewUrl);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, form]);

  const onSubmit = async (data: ProofOfBusinessAddressFormData) => {
    const updatedData = { ...formData };

    if (data.utilityBill instanceof File) {
      const dataUrl = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onloadend = () => resolve(reader.result as string);
        if (data.utilityBill instanceof File) {
          reader.readAsDataURL(data.utilityBill);
        }
      });
      updatedData.utilityBill = dataUrl;
    }

    updatedData.utilityBillType = data.utilityBillType;
    updatedData.utilityBillIssuer = data.utilityBillIssuer;
    updatedData.issueDateOfBill = data.issueDateOfBill;

    updateFormData(updatedData);
    localStorage.setItem("CustomerBusinessForm", JSON.stringify(updatedData));
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
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    form.setValue("utilityBill", file, { shouldValidate: true });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    if (previewUrl?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrl);
    }
    form.setValue("utilityBill", null, { shouldValidate: true });
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Proof of Business Address</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="utilityBillType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Utility Bill Type</FormLabel>
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
                          {field.value ? getProofDisplayName(field.value) : "Select Bill Type"}
                          <ChevronDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                        </Button>
                      </FormControl>
                    </PopoverTrigger>
                    <PopoverContent className="w-full p-0">
                      <Command>
                        <CommandInput placeholder="Search bill type..." />
                        <CommandList>
                          <CommandEmpty>No bill type found.</CommandEmpty>
                          <CommandGroup>
                            {utilityBillTypes.map((type) => (
                              <CommandItem
                                key={type}
                                value={type}
                                onSelect={() => {
                                  form.setValue("utilityBillType", type);
                                }}
                              >
                                <X
                                  className={cn(
                                    "mr-2 h-4 w-4",
                                    type === field.value
                                      ? "opacity-100"
                                      : "opacity-0"
                                  )}
                                />
                                {getProofDisplayName(type)}
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

            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <FormField
                control={form.control}
                name="utilityBillIssuer"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Utility Bill Issuer</FormLabel>
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
                          <CommandInput placeholder="Search issuer..." />
                          <CommandList>
                            <CommandEmpty>No issuer found.</CommandEmpty>
                            <CommandGroup>
                              {utilityBillIssuers.map((issuer) => (
                                <CommandItem
                                  key={issuer}
                                  value={issuer}
                                  onSelect={() => {
                                    form.setValue("utilityBillIssuer", issuer);
                                  }}
                                >
                                  <X
                                    className={cn(
                                      "mr-2 h-4 w-4",
                                      issuer === field.value
                                        ? "opacity-100"
                                        : "opacity-0"
                                    )}
                                  />
                                  {issuer}
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
                name="issueDateOfBill"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Issue Date of the Bill</FormLabel>
                    <FormControl>
                      <DateTimePicker
                        displayFormat={{ hour24: "yyyy/MM/dd" }}
                        granularity="day"
                        value={field.value}
                        onChange={(date) => field.onChange(date)}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="utilityBill"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload of scanned bill copy</FormLabel>
                  <FormMessage />
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
                            src={previewUrl || "/placeholder.svg"}
                            alt="Bill Preview"
                            width={1000}
                            height={1000}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1 ml-4 text-left">
                            <p className="font-medium">
                              {field.value instanceof File
                                ? field.value.name
                                : "Utility Bill"}
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
                            Choose a file or drag & drop here
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPEG and PNG format, up to 5MB
                          </p>
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            className="mt-2"
                          >
                            Select file
                          </Button>
                        </div>
                      )}
                    </div>
                  </FormControl>
                </FormItem>
              )}
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(2)}>
            Previous
          </Button>
          <Button
            type="submit"
            className="bg-primary hover:bg-primary text-white"
            disabled={form.formState.isSubmitting}
          >
           {!isEditMode? "Edit Customer":"Create Customer"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
