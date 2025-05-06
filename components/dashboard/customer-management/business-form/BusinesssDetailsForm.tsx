"use client";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { parseAsInteger, useQueryState } from "nuqs";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  registrationNumber: z
    .string()
    .min(1, "Business registration number is required"),
  tin: z.string().min(1, "Tax Identification Number is required"),
  natureOfBusiness: z.string().min(1, "Nature of business is required"),
  businessType: z.string().min(1, "Business type is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().optional(),
  customerId: z.string().optional(),
  branchId: z.string().optional(),
  accountOfficerId: z.string().optional(),
  desiredAccount: z.string().optional(),
  type: z.number().optional(),
});

export default function BusinesssDetailsForm() {
  const { formData, updateFormData } = useBusinessForm();
  const [, setStep] = useQueryState("step", parseAsInteger);
  const router = useRouter();

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: formData.businessName || "",
      registrationNumber: formData.registrationNumber || "",
      tin: formData.tin || "",
      natureOfBusiness: formData.natureOfBusiness || "",
      businessType: formData.businessType || "",
      businessAddress: formData.businessAddress || "",
      phoneNumber: formData.phoneNumber || "",
      email: formData.email || "",
      website: formData.website || "",
      customerId: formData.customerId,
      branchId: formData.branchId,
      accountOfficerId: formData.accountOfficerId,
      desiredAccount: formData.desiredAccount,
      type: formData.type || 2,
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    const apiReadyData = {
      ...data,
    };
    
    console.log("Form submitted:", data);
    updateFormData(data);
    setStep(2);
  };

  const cancel = () => {
    router.push("/dashboard/customer-management");
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-8 py-2 pb-10"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Name</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="businessType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Type</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Registration Number (RC Number)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="tin"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Tax Identification Number (TIN)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="natureOfBusiness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nature of Business</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Website (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 gap-4">
            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Business Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email Address</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Phone Number</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex space-x-4 pt-4">
          <Button
            type="button"
            onClick={cancel}
            variant="outline"
            className="flex-1"
          >
            Cancel
          </Button>
          <Button type="submit" className="flex-1">
            Continue
          </Button>
        </div>
      </form>
    </Form>
  );
}
