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

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_FILE_TYPES = ["image/jpeg", "image/jpg", "image/png"];

const idTypes = [
  { value: "nin", label: "National ID (NIN)", maxLength: 11 },
  { value: "bvn", label: "BVN", maxLength: 11 },
  { value: "passport", label: "Passport", maxLength: 9 },
  { value: "drivers_license", label: "Driver's License", maxLength: 12 },
] as const;

const formSchema = z
  .object({
    idType2: z.enum(["nin", "bvn", "passport", "drivers_license"] as const, {
      required_error: "Please select an ID type",
    }),
    idNumber2: z.string().min(1, "ID number is required"),
    idDocument2: z
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
  })
  .refine(
    (data) => {
      // Custom validation logic based on idType2
      if (data.idType2 !== "bvn" && !data.idDocument2) {
        return false; // Validation fails if idDocument2 is not provided for non-bvn types
      }
      return true; // Validation passes
    },
    {
      message: "ID document is required for the selected ID type",
      path: ["idDocument2"], // Specify the path to the idDocument2 field
    }
  );

type IDFormData = Pick<FormData, "idType2" | "idNumber2" | "idDocument2">;

export default function IDDetailsForm2() {
  const { formData, updateFormData } = useFormContext();
  const [dragActive, setDragActive] = useState(false);
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<IDFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      idType2: formData.idType2 || undefined,
      idNumber2: formData.idNumber2 || "",
      idDocument2: formData.idDocument2 || null,
    },
    mode: "onChange",
  });

  const selectedIdType = form.watch("idType2");

  useEffect(() => {
    if (formData.idType2) {
      form.setValue("idType2", formData.idType2);
    }
    if (formData.idNumber2) {
      form.setValue("idNumber2", formData.idNumber2);
    }
    // Set preview URL if idDocument2 exists
    if (formData.idDocument2 instanceof File) {
      setPreviewUrl(URL.createObjectURL(formData.idDocument2));
      form.setValue("idDocument2", formData.idDocument2);
    } else if (
      typeof formData.idDocument2 === "string" &&
      formData.idDocument2
    ) {
      setPreviewUrl(formData.idDocument2);
      form.setValue("idDocument2", formData.idDocument2);
    }
  }, [formData, form]);

  const onSubmit = (data: IDFormData) => {
    const updatedData = { ...formData, ...data };
    if (data.idDocument2 instanceof File) {
      // Convert File to Data URL for storage
      const reader = new FileReader();
      reader.onloadend = () => {
        updatedData.idDocument2 = reader.result as string;
        updateFormData(updatedData);
        localStorage.setItem("customerForm", JSON.stringify(updatedData));
        setStep(4);
      };
      reader.readAsDataURL(data.idDocument2);
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
    form.setValue("idDocument2", file);
    setPreviewUrl(URL.createObjectURL(file));
  };

  const removeFile = () => {
    form.setValue("idDocument2", null);
    setPreviewUrl(null);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Create Individual Customer</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="idType2"
              render={({ field }) => (
                <FormItem className="flex flex-col">
                  <FormLabel>ID Verification 2</FormLabel>
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
                                  form.setValue(
                                    "idType2",
                                    type.value as IDType
                                  );
                                  form.setValue("idNumber2", "");
                                  form.setValue("idDocument2", null);
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
                name="idNumber2"
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

            {selectedIdType && selectedIdType !== "bvn" && (
              <FormField
                control={form.control}
                name="idDocument2"
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
                                  : `${form.getValues("idType2")} ID Upload`}
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
