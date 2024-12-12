"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2, Upload, X } from "lucide-react";
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
  rcNumber: z.string().min(1, "RC Number is required"),
  cacDocument: z
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
    .refine((file) => file !== null, "CAC document is required"),
});

type RCNumberAndCACFormData = Pick<
  BusinessFormData,
  "rcNumber" | "cacDocument"
>;

export default function RCNumberAndCACForm() {
  const { formData, updateFormData } = useBusinessForm();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<RCNumberAndCACFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      rcNumber: formData.rcNumber || "",
      cacDocument: formData.cacDocument || null,
    },
    mode: "onChange",
  });

  useEffect(() => {
    if (formData.cacDocument instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.cacDocument));
      form.setValue("cacDocument", formData.cacDocument);
    } else if (
      typeof formData.cacDocument === "string" &&
      formData.cacDocument
    ) {
      setPreviewUrl(formData.cacDocument);
      form.setValue("cacDocument", formData.cacDocument);
    }
  }, [formData, form]);

  const onSubmit = (data: RCNumberAndCACFormData) => {
    const updatedData = { ...formData, ...data };
    if (data.cacDocument instanceof File) {
      // Convert File to Data URL for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedData.cacDocument = reader.result as string;
        updateFormData(updatedData);
        localStorage.setItem(
          "CustomerBusinessForm",
          JSON.stringify(updatedData)
        );
        setStep(3);
      };
      reader.readAsDataURL(data.cacDocument);
    } else {
      updateFormData(updatedData);
      localStorage.setItem("CustomerBusinessForm", JSON.stringify(updatedData));
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
    form.setValue("cacDocument", file, { shouldValidate: true });
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    form.setValue("cacDocument", null, { shouldValidate: true });
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">RC Number and CAC Document</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="rcNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>RC Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter RC Number" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="cacDocument"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Upload CAC Document</FormLabel>
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
                            alt="CAC Document Preview"
                            width={1000}
                            height={1000}
                            className="w-20 h-20 object-cover rounded"
                          />
                          <div className="flex-1 ml-4 text-left">
                            <p className="font-medium">
                              {field.value instanceof File
                                ? field.value.name
                                : "CAC Document"}
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
