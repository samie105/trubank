"use client";

import { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";
import { Loader2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useFormContext } from "@/contexts/FormContext";
import { FormData } from "@/types/types";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  nextOfKinFullName: z.string().optional(),
  nextOfKinPhone: z.string().optional(),
  nextOfKinEmail: z.string().optional(),
  nextOfKinAddress: z.string().optional(),
  nextOfKinRelationship: z.string().optional(),
});

type NextOfKinFormData = Pick<
  FormData,
  | "nextOfKinFullName"
  | "nextOfKinPhone"
  | "nextOfKinEmail"
  | "nextOfKinAddress"
  | "nextOfKinRelationship"
>;

export default function NextOfKin() {
  const { formData, updateFormData } = useFormContext();
  const [, setCreating] = useQueryState(
    "creating",
    parseAsBoolean.withDefault(false)
  );
  const [, setStep] = useQueryState("step", parseAsInteger);
  const router = useRouter();

  const form = useForm<NextOfKinFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      nextOfKinFullName: formData.nextOfKinFullName || "",
      nextOfKinPhone: formData.nextOfKinPhone || "",
      nextOfKinEmail: formData.nextOfKinEmail || "",
      nextOfKinAddress: formData.nextOfKinAddress || "",
      nextOfKinRelationship: formData.nextOfKinRelationship || "",
    },
    mode: "onChange",
  });

  useEffect(() => {
    const savedData = localStorage.getItem("customerForm");
    if (savedData) {
      const parsedData = JSON.parse(savedData);
      Object.keys(parsedData).forEach((key) => {
        if (key in form.getValues()) {
          form.setValue(key as keyof NextOfKinFormData, parsedData[key]);
        }
      });
      form.trigger();
    }
  }, [form]);

  const onSubmit = (data: NextOfKinFormData) => {
    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);
    localStorage.setItem("customerForm", JSON.stringify(updatedData));
    setCreating(false);
    setStep(7);
    console.log("Form submitted:", updatedData);
  };

  const handleCancel = () => {
    // Clear all form data from localStorage
    localStorage.removeItem("customerForm");
    // Redirect to customer management dashboard
    router.push("/dashboard/customer-management");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 animate__fadeIn animate__animated animate__faster"
      >
        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Next of Kin Details</h2>
          <div className="space-y-4">
            <FormField
              control={form.control}
              name="nextOfKinFullName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Full Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextOfKinPhone"
              render={({ field }) => (
                <Input
                  type="number"
                  placeholder="Enter Phone Number"
                  {...field}
                />
              )}
            />

            <FormField
              control={form.control}
              name="nextOfKinEmail"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Email Address" {...field} />
                  </FormControl>
                  <FormDescription>Optional</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextOfKinAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Address" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="nextOfKinRelationship"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Relationship to Customer</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter Relationship to Customer"
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
          <div className="flex gap-2">
            <Button type="button" variant="outline" onClick={handleCancel}>
              <X className="h-4 w-4 md:mr-2" />
              <span className="hidden md:inline">Cancel</span>
            </Button>
            <Button
              type="button"
              variant="outline"
              onClick={() => setStep((prev) => (prev || 1) - 1)}
            >
              Previous
            </Button>
          </div>
          <Button
            type="submit"
            className="text-white"
            disabled={!form.formState.isValid || form.formState.isSubmitting}
          >
            {form.formState.isSubmitting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Please wait
              </>
            ) : (
              "Create Customer"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
