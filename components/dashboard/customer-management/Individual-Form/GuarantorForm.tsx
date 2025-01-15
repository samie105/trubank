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
import { useFormContext } from "@/contexts/FormContext";
import { FormData } from "@/types/types";
import Image from "next/image";

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const formSchema = z.object({
  guarantorFullName: z.string().min(1, "Guarantor full name is required"),
  guarantorRelationship: z.string().min(1, "Relationship is required"),
  guarantorPhone: z.string().min(1, "Phone number is required"),
  guarantorEmail: z.string().email("Invalid email address"),
  guarantorAddress: z.string().min(1, "Address is required"),
  guarantorId: z
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
    .nullable(),
});

type GuarantorFormData = Pick<
  FormData,
  | "guarantorFullName"
  | "guarantorRelationship"
  | "guarantorPhone"
  | "guarantorEmail"
  | "guarantorAddress"
  | "guarantorId"
>;

export default function GuarantorForm() {
  const { formData, updateFormData } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<GuarantorFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      guarantorFullName: formData.guarantorFullName || "",
      guarantorRelationship: formData.guarantorRelationship || "",
      guarantorPhone: formData.guarantorPhone || "",
      guarantorEmail: formData.guarantorEmail || "",
      guarantorAddress: formData.guarantorAddress || "",
      guarantorId: formData.guarantorId || null,
    },
  });

  useEffect(() => {
    if (formData.guarantorId instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.guarantorId));
    } else if (
      typeof formData.guarantorId === "string" &&
      formData.guarantorId
    ) {
      setPreviewUrl(formData.guarantorId);
    }
  }, [formData]);

  const onSubmit = (data: GuarantorFormData) => {
    const updatedData = { ...formData, ...data };
    if (data.guarantorId instanceof File) {
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedData.guarantorId = reader.result as string;
        updateFormData(updatedData);
        localStorage.setItem("customerForm", JSON.stringify(updatedData));
        setStep(6); // Adjust this step number as needed
      };
      reader.readAsDataURL(data.guarantorId);
    } else {
      updateFormData(updatedData);
      localStorage.setItem("customerForm", JSON.stringify(updatedData));
      setStep(6); // Adjust this step number as needed
    }
    console.log("Form submitted:", updatedData);
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
    form.setValue("guarantorId", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    form.setValue("guarantorId", null);
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate__fadeIn animate__animated animate__faster"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Guarantor Details</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="guarantorFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guarantor Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Guarantor Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guarantor Relationship to Customer</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Relationship" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorPhone"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
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
              name="guarantorEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guarantor Email Address</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="Enter Guarantor Email Address"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Guarantor Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Guarantor Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="guarantorId"
              render={({ field: { value, ...field } }) => (
                <FormItem>
                  <FormLabel>
                    {" Upload of Guarantor's ID (PDF/JPG/PNG format)"}
                  </FormLabel>
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
                      {...field}
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
                              {value instanceof File
                                ? value.name
                                : "Guarantor ID"}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              {value instanceof File
                                ? `${(value.size / 1024 / 1024).toFixed(2)} MB`
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
                              : "Choose a file or drag & drop here"}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            JPEG and PNG format, up to 5MB
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
          <Button type="button" variant="outline" onClick={() => setStep(4)}>
            Previous
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
      </form>
    </Form>
  );
}
