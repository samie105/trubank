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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const idTypes = [
  { value: "nin", label: "National ID (NIN)", maxLength: 11 },
  { value: "bvn", label: "BVN", maxLength: 11 },
  { value: "passport", label: "Passport", maxLength: 9 },
  { value: "drivers_license", label: "Driver's License", maxLength: 12 },
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
    idType: z.enum(["nin", "bvn", "passport", "drivers_license"] as const, {
      required_error: "Please select an ID type",
    }),
    idNumber: z.string().min(1, "ID number is required"),
    idDocument: z
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
      .nullable(),
    expiryDate: z.date({
      required_error: "Expiry date is required",
      invalid_type_error: "That's not a valid date!",
    }),
    issuingAuthority: z.enum(issuingAuthorities, {
      required_error: "Please select an issuing authority",
    }),
  })
  .refine(
    (data) => {
      if (data.idType !== "bvn" && !data.idDocument) {
        return false;
      }
      return true;
    },
    {
      message: "ID document is required for the selected ID type",
      path: ["idDocument"],
    }
  );

type IDFormData = Pick<
  FormData,
  "idType" | "idNumber" | "idDocument" | "expiryDate" | "issuingAuthority"
>;

export default function IDDetailsForm() {
  const { formData, updateFormData } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<IDFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idType: formData.idType || undefined,
      idNumber: formData.idNumber || "",
      idDocument: formData.idDocument || null,
      expiryDate: formData.expiryDate || undefined,
      issuingAuthority: formData.issuingAuthority || undefined,
    },
    mode: "onChange",
  });

  const selectedIdType = form.watch("idType");

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
    if (formData.idDocument instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.idDocument));
      form.setValue("idDocument", formData.idDocument);
    } else if (typeof formData.idDocument === "string" && formData.idDocument) {
      setPreviewUrl(formData.idDocument);
      form.setValue("idDocument", formData.idDocument);
    }
  }, [formData, form]);

  const onSubmit = (data: IDFormData) => {
    const updatedData = { ...formData, ...data };
    if (data.idDocument instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedData.idDocument = reader.result as string;
        updateFormData(updatedData);
        localStorage.setItem("customerForm", JSON.stringify(updatedData));
        setStep(3);
      };
      reader.readAsDataURL(data.idDocument);
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
    form.setValue("idDocument", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    form.setValue("idDocument", null);
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
                            ? idTypes.find((type) => type.value === field.value)
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
                            {idTypes.map((type) => (
                              <CommandItem
                                key={type.value}
                                value={type.value}
                                onSelect={() => {
                                  form.setValue("idType", type.value as IDType);
                                  form.setValue("idNumber", "");
                                  form.setValue("idDocument", null);
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
                        idTypes.find((type) => type.value === selectedIdType)
                          ?.label
                      }{" "}
                      Number
                    </FormLabel>
                    <FormControl>
                      <Input
                        placeholder={`Enter your ${
                          idTypes.find((type) => type.value === selectedIdType)
                            ?.label
                        } number`}
                        {...field}
                        maxLength={
                          idTypes.find((type) => type.value === selectedIdType)
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
                            {issuingAuthorities.map((authority) => (
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

            {selectedIdType && selectedIdType !== "bvn" && (
              <FormField
                control={form.control}
                name="idDocument"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Upload ID Document</FormLabel>
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
                              <p className="font-medium capitalize">
                                {field.value instanceof File
                                  ? field.value.name
                                  : `${form.getValues("idType")} ID Upload`}
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
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
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
