"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsInteger, useQueryState } from "nuqs";
import { Loader2 } from "lucide-react";
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
import { useBusinessForm } from "@/contexts/BusinessFormContext";
import { BusinessFormData } from "@/types/types";

const phoneRegex = /^\+[1-9]\d{1,14}$/;

const formSchema = z.object({
  ownerFirstName: z.string().min(1, "First name is required"),
  ownerLastName: z.string().min(1, "Last name is required"),
  ownerTitle: z.string().min(1, "Title is required"),
  ownerPhoneNumber: z.string().regex(phoneRegex, "Invalid phone number"),
  ownerEmail: z.string().email("Invalid email address"),
});

type OwnerInformationFormData = Pick<
  BusinessFormData,
  | "ownerFirstName"
  | "ownerLastName"
  | "ownerTitle"
  | "ownerPhoneNumber"
  | "ownerEmail"
>;

export default function OwnerInformationForm() {
  const { formData, updateFormData } = useBusinessForm();
  const [, setStep] = useQueryState("step", parseAsInteger);

  const form = useForm<OwnerInformationFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      ownerFirstName: formData.ownerFirstName || "",
      ownerLastName: formData.ownerLastName || "",
      ownerTitle: formData.ownerTitle || "",
      ownerPhoneNumber: formData.ownerPhoneNumber || "",
      ownerEmail: formData.ownerEmail || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    form.reset({
      ownerFirstName: formData.ownerFirstName || "",
      ownerLastName: formData.ownerLastName || "",
      ownerTitle: formData.ownerTitle || "",
      ownerPhoneNumber: formData.ownerPhoneNumber || "",
      ownerEmail: formData.ownerEmail || "",
    });
  }, [formData, form]);

  const onSubmit = (data: OwnerInformationFormData) => {
    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);
    localStorage.setItem("CustomerBusinessForm", JSON.stringify(updatedData));
    setStep(4);
    console.log("Form submitted:", updatedData);
  };

  const handleSkip = () => {
    setStep(4);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Owner Information</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="ownerFirstName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Owner's First Name"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner's first name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerLastName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Owner's Last Name"}</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter owner's last name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerTitle"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Owner's Title"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter owner's title (e.g., CEO)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerPhoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Owner's Phone Number"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter owner's phone number (e.g., +1234567890)"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="ownerEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>{"Owner's Email Address"}</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter owner's email address"
                      {...field}
                    />
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
