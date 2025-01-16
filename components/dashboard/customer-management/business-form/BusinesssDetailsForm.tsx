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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useBusinessForm } from "@/contexts/BusinessFormContext";
import { BusinessFormData } from "@/types/types";
import { parseAsBoolean, parseAsInteger, useQueryState } from "nuqs";

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
});

export default function BusinessDetailForm() {
  const { formData, updateFormData } = useBusinessForm();
  const [, setCreating] = useQueryState(
    "creating",
    parseAsBoolean.withDefault(false)
  );
  const [, setStep] = useQueryState("step", parseAsInteger);

  const form = useForm<BusinessFormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessName: formData.businessName,
      registrationNumber: formData.registrationNumber,
      tin: formData.tin,
      natureOfBusiness: formData.natureOfBusiness,
      businessType: formData.businessType,
      businessAddress: formData.businessAddress,
      phoneNumber: formData.phoneNumber,
      email: formData.email,
      website: formData.website,
    },
  });

  const onSubmit = (data: BusinessFormData) => {
    const updatedData = { ...formData, ...data };
    updateFormData(updatedData);
    localStorage.setItem("customerForm", JSON.stringify(updatedData));
    setStep(2);
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <h2 className="text-xl font-semibold">Business Profile Details</h2>

        <FormField
          control={form.control}
          name="businessName"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Business Name" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="registrationNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Business Registration Number</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Business Reg. Number" {...field} />
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
                  <Input placeholder="Enter TIN" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="natureOfBusiness"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Nature of Business/Industry</FormLabel>
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Industry" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="retail">Retail</SelectItem>
                    <SelectItem value="manufacturing">Manufacturing</SelectItem>
                    <SelectItem value="services">Services</SelectItem>
                    <SelectItem value="technology">Technology</SelectItem>
                  </SelectContent>
                </Select>
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
                <Select
                  onValueChange={field.onChange}
                  defaultValue={field.value}
                >
                  <FormControl>
                    <SelectTrigger>
                      <SelectValue placeholder="Select Business Type" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    <SelectItem value="sole_proprietorship">
                      Sole Proprietorship
                    </SelectItem>
                    <SelectItem value="partnership">Partnership</SelectItem>
                    <SelectItem value="corporation">Corporation</SelectItem>
                    <SelectItem value="llc">LLC</SelectItem>
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="businessAddress"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Address</FormLabel>
              <FormControl>
                <Input placeholder="Enter Business Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <h3 className="text-lg font-medium">Business Contact Details</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FormField
            control={form.control}
            name="phoneNumber"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Phone Number</FormLabel>
                <FormControl>
                  <Input
                    type="tel"
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
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Email Address</FormLabel>
                <FormControl>
                  <Input placeholder="Enter Email Address" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="website"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Business Website (optional)</FormLabel>
              <FormControl>
                <Input placeholder="Enter Website Address" {...field} />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <div className="flex justify-between mt-4">
          <Button variant="outline" onClick={() => setCreating(false)}>
            Back
          </Button>
          <Button type="submit" className="text-white">
            Save & Next
          </Button>
        </div>
      </form>
    </Form>
  );
}
