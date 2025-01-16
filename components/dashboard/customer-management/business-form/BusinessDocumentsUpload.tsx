"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Upload, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { cn } from "@/lib/utils";
import { useBusinessForm } from "@/contexts/BusinessFormContext";
import Image from "next/image";
import { BusinessFormData } from "@/types/types";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = [
  "image/jpeg",
  "image/jpg",
  "image/png",
  "application/pdf",
];

const formSchema = z.object({
  businessIncorporationCertificate: z
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
    .refine(
      (file) => file !== null,
      "Business Incorporation Certificate is required"
    ),
  memorandumArticles: z
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
    .nullable(),
  businessLicense: z
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
    .nullable(),
});

type BusinessDocumentsFormData = Pick<
  BusinessFormData,
  "businessIncorporationCertificate" | "memorandumArticles" | "businessLicense"
>;

export default function BusinessDocumentsUpload() {
  const { formData, updateFormData } = useBusinessForm();
  const [dragActive, setDragActive] = useState<string | null>(null);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrls, setPreviewUrls] = useState<{
    [key: string]: string | null;
  }>({
    businessIncorporationCertificate: null,
    memorandumArticles: null,
    businessLicense: null,
  });

  const form = useForm<BusinessDocumentsFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessIncorporationCertificate: null,
      memorandumArticles: null,
      businessLicense: null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    // Set preview URLs for existing files
    const urls: { [key: string]: string } = {};

    (Object.keys(previewUrls) as (keyof BusinessDocumentsFormData)[]).forEach(
      (key) => {
        if (formData[key] instanceof File) {
          urls[key] = URL.createObjectURL(formData[key] as File);
          form.setValue(key, formData[key] as File | string | null);
        } else if (typeof formData[key] === "string" && formData[key]) {
          urls[key] = formData[key] as string;
          form.setValue(key, formData[key] as File | string | null);
        }
      }
    );

    setPreviewUrls((prev) => ({ ...prev, ...urls }));

    // Cleanup function to revoke object URLs
    return () => {
      Object.values(urls).forEach((url) => {
        if (url.startsWith("blob:")) {
          URL.revokeObjectURL(url);
        }
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formData, form]);

  const onSubmit = async (data: BusinessDocumentsFormData) => {
    const updatedData = { ...formData } as BusinessFormData;

    // Process each file
    for (const [key, value] of Object.entries(data)) {
      if (value instanceof File) {
        // Convert File to Data URL
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onloadend = () => resolve(reader.result as string);
          reader.readAsDataURL(value);
        });
        updatedData[key as keyof BusinessDocumentsFormData] = dataUrl;
      } else {
        updatedData[key as keyof BusinessDocumentsFormData] = value;
      }
    }

    updateFormData(updatedData);
    localStorage.setItem("CustomerBusinessForm", JSON.stringify(updatedData));
    setStep(3);
  };

  const handleDrag = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(fieldName);
    } else if (e.type === "dragleave") {
      setDragActive(null);
    }
  };

  const handleDrop = (e: React.DragEvent, fieldName: string) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(null);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFile(e.dataTransfer.files[0], fieldName);
    }
  };

  const handleFileChange = (
    e: React.ChangeEvent<HTMLInputElement>,
    fieldName: string
  ) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0], fieldName);
    }
  };

  const handleFile = (file: File, fieldName: string) => {
    // Cleanup previous preview URL if it exists
    if (previewUrls[fieldName]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[fieldName]!);
    }

    form.setValue(fieldName as keyof BusinessDocumentsFormData, file, {
      shouldValidate: true,
    });
    setPreviewUrls((prev) => ({
      ...prev,
      [fieldName]: URL.createObjectURL(file),
    }));
  };

  const removeFile = (fieldName: string) => {
    // Cleanup preview URL
    if (previewUrls[fieldName]?.startsWith("blob:")) {
      URL.revokeObjectURL(previewUrls[fieldName]!);
    }

    form.setValue(fieldName as keyof BusinessDocumentsFormData, null, {
      shouldValidate: true,
    });
    setPreviewUrls((prev) => ({
      ...prev,
      [fieldName]: null,
    }));
  };

  const FileUploadField = ({
    name,
    label,
    description,
  }: {
    name: keyof BusinessDocumentsFormData;
    label: string;
    description?: string;
  }) => (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          {description && (
            <FormDescription className="text-sm text-muted-foreground">
              {description}
            </FormDescription>
          )}
          <FormControl>
            <div
              className={cn(
                "border-2 border-dashed rounded-lg p-6 text-center cursor-pointer",
                dragActive === name && "border-primary",
                "hover:border-primary transition-colors"
              )}
              onDragEnter={(e) => handleDrag(e, name)}
              onDragLeave={(e) => handleDrag(e, name)}
              onDragOver={(e) => handleDrag(e, name)}
              onDrop={(e) => handleDrop(e, name)}
              onClick={() => {
                const input = document.createElement("input");
                input.type = "file";
                input.accept = ACCEPTED_FILE_TYPES.join(",");
                input.onchange = (e) =>
                  handleFileChange(
                    e as unknown as React.ChangeEvent<HTMLInputElement>,
                    name
                  );
                input.click();
              }}
            >
              {previewUrls[name] ? (
                <div className="flex items-center justify-between">
                  <Image
                    src={previewUrls[name]! || "/placeholder.svg"}
                    alt="Document Preview"
                    width={1000}
                    height={1000}
                    className="w-20 h-20 object-cover rounded"
                  />
                  <div className="flex-1 ml-4 text-left">
                    <p className="font-medium">
                      {field.value instanceof File
                        ? field.value.name
                        : `${label} Document`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {field.value instanceof File
                        ? `${(field.value.size / 1024 / 1024).toFixed(2)} MB`
                        : ""}
                    </p>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={(e) => {
                      e.stopPropagation();
                      removeFile(name);
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
                    JPEG, PNG and PDF format, up to 5MB
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
          <FormMessage />
        </FormItem>
      )}
    />
  );

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">
            Business Registration Documents
          </h2>
          <p className="text-sm text-muted-foreground">
            Upload of scanned copies of these documents (PDF/JPEG/PNG format)
          </p>
          <div className="space-y-4">
            <FileUploadField
              name="businessIncorporationCertificate"
              label="Business Incorporation Certificate"
            />
            <FileUploadField
              name="memorandumArticles"
              label="Memorandum and Articles of Association"
              description="(if applicable)"
            />
            <FileUploadField
              name="businessLicense"
              label="Business License"
              description="(if applicable)"
            />
          </div>
        </div>
        <div className="flex justify-between">
          <Button type="button" variant="outline" onClick={() => setStep(1)}>
            Previous
          </Button>
          <div className="space-x-2">
            <Button type="button" variant="outline" onClick={() => setStep(3)}>
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
