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
import { parseAsInteger, useQueryState } from "nuqs";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2 } from "lucide-react";
import { useRouter } from "next/navigation";

const formSchema = z.object({
  businessName: z.string().min(1, "Business name is required"),
  registrationNumber: z.string().min(1, "Business registration number is required"),
  tin: z.string().min(1, "Tax Identification Number is required"),
  natureOfBusiness: z.string().min(1, "Nature of business is required"),
  businessType: z.string().min(1, "Business type is required"),
  businessAddress: z.string().min(1, "Business address is required"),
  phoneNumber: z.string().min(1, "Phone number is required"),
  email: z.string().email("Invalid email address"),
  website: z.string().optional(),
});

type FormValues = z.infer<typeof formSchema>;

interface BusinessDetailsFormProps {
  isEditMode?: boolean;
}

export default function BusinessDetailsForm({ isEditMode = false }: BusinessDetailsFormProps) {
  const { formData, updateFormData } = useBusinessForm();
  const [, setStep] = useQueryState("step", parseAsInteger);
  const router = useRouter();
  
  // Sample business types and industries
  const businessTypes = [
    "Sole Proprietorship",
    "Partnership",
    "Limited Liability Company (LLC)",
    "Corporation",
    "Nonprofit Organization"
  ];
  
  const industries = [
    "Agriculture",
    "Manufacturing",
    "Technology",
    "Retail",
    "Healthcare",
    "Financial Services",
    "Education",
    "Construction",
    "Transportation",
    "Entertainment"
  ];

  const form = useForm<FormValues>({
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
    },
  });

  const onSubmit = (data: FormValues) => {
    try {
      console.log("Form submitted:", data);
      const updatedData = {
        ...formData,
        ...data,
     
      };
      updateFormData(updatedData);
      localStorage.setItem("CustomerBusinessForm", JSON.stringify(updatedData));
      
      // Debug logging
      console.log("Setting step to 2");
      setStep(2);
    } catch (error) {
      console.error("Error submitting form:", error);
    }
  };
  
  const handleSkip = () => {
    setStep(2);
  };

  const handlePrevious = () => {
   router.push("/dashboard/customer-management");
  };

  // Add debug function to check form state
  const checkFormState = () => {
    console.log("Form state:", form.formState);
    console.log("Form values:", form.getValues());
    console.log("Form errors:", form.formState.errors);
  };

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(onSubmit)}
        className="space-y-6 py-2 pb-10 max-w-4xl mx-auto"
      >
        <h2 className="text-2xl font-bold">Business Profile Details</h2>
        
        <div className="space-y-6">
          {/* Business Name */}
          <div>
            <FormField
              control={form.control}
              name="businessName"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Business Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Business Name" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Registration Number and TIN */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="registrationNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Business Registration Number</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Business Reg. Number" {...field} className="h-12" />
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
                  <FormLabel className="text-base font-medium">Tax Identification Number (TIN)</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter TIN" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Nature of Business and Business Type */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="natureOfBusiness"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Nature of Business/Industry</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Industry" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {industries.map((industry) => (
                        <SelectItem key={industry} value={industry}>
                          {industry}
                        </SelectItem>
                      ))}
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
                  <FormLabel className="text-base font-medium">Business Type</FormLabel>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <FormControl>
                      <SelectTrigger className="h-12">
                        <SelectValue placeholder="Select Business Type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {businessTypes.map((type) => (
                        <SelectItem key={type} value={type}>
                          {type}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Business Address */}
          <div>
            <FormField
              control={form.control}
              name="businessAddress"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Business Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Business Address" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          <h2 className="text-xl font-bold pt-4">Business Contact Details</h2>
          
          {/* Phone Number and Email */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="phoneNumber"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">Phone Number</FormLabel>
                  <FormControl>
                    <div className="flex">
                      <div className="flex items-center px-3 border border-r-0 rounded-l-md bg-muted">
                        <span className="text-green-600 font-medium">NG</span>
                      </div>
                      <Input 
                        placeholder="0803 456 7890" 
                        {...field} 
                        className="h-12 rounded-l-none"
                      />
                    </div>
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
                  <FormLabel className="text-base font-medium">Email Address</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Email Address" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
          
          {/* Website */}
          <div>
            <FormField
              control={form.control}
              name="website"
              render={({ field }) => (
                <FormItem>
                  <FormLabel className="text-base font-medium">
                    Business Website <span className="text-muted-foreground text-sm">(optional)</span>
                  </FormLabel>
                  <FormControl>
                    <Input placeholder="Enter Website Address" {...field} className="h-12" />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        <div className="flex justify-between pt-6">
          <Button
            type="button"
            onClick={handlePrevious}
            variant="outline"
          >
            Previous
          </Button>
          
          <div className="flex space-x-2">
            {!isEditMode && (
              <Button
                type="button"
                onClick={handleSkip}
                variant="outline"
              >
                Skip
              </Button>
            )}
            
            <Button 
              type="submit"
              className="bg-primary text-white"
              onClick={() => {
                if (!form.formState.isSubmitting) {
                    console.log("consoling")
                  checkFormState();
                }
              }}
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