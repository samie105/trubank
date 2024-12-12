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
import { useFormContext } from "@/contexts/FormContext";
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
  profileImage: z
    .custom<File>((v) => v instanceof File, {
      message: "Profile image is required",
    })
    .refine((file) => file.size <= MAX_FILE_SIZE, `Max file size is 5MB`)
    .refine(
      (file) => ACCEPTED_IMAGE_TYPES.includes(file.type),
      "Only .jpg, .jpeg, .png and .webp formats are supported"
    ),
  branch: z.string().min(1, "Please select a branch"),
  accountOfficer: z.string().min(1, "Account officer is required"),
  desiredAccount: z.enum(accountTypes, {
    required_error: "Please select an account type",
  }),
});

type ProfileFormData = z.infer<typeof formSchema>;

export default function ProfileForm() {
  const { formData, updateFormData } = useFormContext();
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const form = useForm<ProfileFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      branch: formData.branch || "",
      accountOfficer: formData.accountOfficer || "",
      desiredAccount: formData.desiredAccount || undefined,
    },
  });

  useEffect(() => {
    const savedData = localStorage.getItem("customerForm");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      if (parsedData.branch) form.setValue("branch", parsedData.branch);
      if (parsedData.accountOfficer)
        form.setValue("accountOfficer", parsedData.accountOfficer);
      if (parsedData.desiredAccount)
        form.setValue("desiredAccount", parsedData.desiredAccount);
      if (parsedData.profileImage) {
        setPreviewUrl(parsedData.profileImage);
        // Create a dummy File object to satisfy form validation
        const dummyFile = new File([""], "profile.jpg", { type: "image/jpeg" });
        form.setValue("profileImage", dummyFile, { shouldValidate: true });
      }
    }
  }, [form]);

  const onSubmit = async (data: ProfileFormData) => {
    let profileImage = previewUrl;
    if (data.profileImage instanceof File) {
      profileImage = await fileToBase64(data.profileImage);
    }

    const updatedData = {
      ...formData,
      ...data,
      profileImage,
    };
    updateFormData(updatedData);
    localStorage.setItem("customerForm", JSON.stringify(updatedData));
    console.log("Form submitted:", updatedData);
    setStep(6); // Navigate to the next step
  };

  const handleSkip = () => {
    setStep(6);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      form.setValue("profileImage", file, { shouldValidate: true });
      setPreviewUrl(URL.createObjectURL(file));
    }
  };

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.readAsDataURL(file);
      reader.onload = () => resolve(reader.result as string);
      reader.onerror = (error) => reject(error);
    });
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-2xl font-bold">Profile Information</h2>

          <FormField
            control={form.control}
            name="profileImage"
            render={({ field: { onChange, value, ...rest } }) => (
              <FormItem>
                <FormLabel>Profile Image</FormLabel>
                <FormControl>
                  <div className="flex items-center space-x-4">
                    <div
                      className={cn(
                        "w-32 h-32 border-2 border-dashed rounded-full flex items-center justify-center cursor-pointer overflow-hidden",
                        !previewUrl && "hover:border-primary"
                      )}
                      onClick={() =>
                        document.getElementById("profileImage")?.click()
                      }
                    >
                      {previewUrl ? (
                        <Image
                          src={previewUrl}
                          alt="Profile"
                          width={128}
                          height={128}
                          className="object-cover"
                        />
                      ) : (
                        <Upload className="w-8 h-8 text-muted-foreground" />
                      )}
                    </div>
                    <input
                      id="profileImage"
                      type="file"
                      accept={ACCEPTED_IMAGE_TYPES.join(",")}
                      className="hidden"
                      onChange={(e) => {
                        handleFileChange(e);
                        onChange(e.target.files?.[0]);
                      }}
                      {...rest}
                    />
                  </div>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

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
          <Button type="button" variant="outline" onClick={() => setStep(4)}>
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
