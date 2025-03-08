"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import { ArrowLeft, Percent } from "lucide-react";
import { DateTimePicker } from "@/components/ui/date-picker";
import { Separator } from "@/components/ui/separator";

// Form Schemas
const productDetailsSchema = z.object({
  productName: z.string().min(1, "Product name is required"),
  accountType: z.string().min(1, "Account type is required"),
});

const interestSchema = z.object({
  interestType: z.string().min(1, "Interest type is required"),
  rate: z.string().min(1, "Interest rate is required"),
  rateUnit: z.string().default("per-annum"),
  calculationPeriod: z.string().min(1, "Calculation period is required"),
  compoundingFrequency: z.string().min(1, "Compounding frequency is required"),
  effectiveDate: z.date({
    required_error: "Effective date is required",
  }),
  endDate: z.date().optional(),
  triggerCondition: z.string().min(1, "Trigger condition is required"),
  customerType: z.string().min(1, "Customer type is required"),
  specificCustomer: z.string().optional(),
});

const feeSchema = z.object({
  transactionType: z.string().min(1, "Transaction type is required"),
  feeType: z.enum(["rate", "amount"]).default("rate"),
  feeValue: z.string().min(1, "Value is required"),
  feeApplicationFrequency: z
    .string()
    .min(1, "Fee application frequency is required"),
  effectiveDate: z.date({
    required_error: "Effective date is required",
  }),
  endDate: z.date().optional(),
  triggerCondition: z.string().min(1, "Trigger condition is required"),
  customerType: z.string().min(1, "Customer type is required"),
  specificCustomers: z.string().optional(),
});

const overdraftSchema = z.object({
  overdraftName: z.string().min(1, "Overdraft name is required"),
  overdraftLimit: z.string().min(1, "Overdraft limit is required"),
  customerType: z.string().min(1, "Customer type is required"),
  specificCustomers: z.string().optional(),
});

// Combined schema for full validation
type FormData = {
  // Product Details
  productName: string;
  accountType: string;

  // Interest
  interestType: string;
  rate: string;
  rateUnit: string;
  calculationPeriod: string;
  compoundingFrequency: string;
  effectiveDate: Date;
  endDate?: Date;
  triggerCondition: string;
  customerType: string;
  specificCustomer?: string;

  // Fee
  transactionType: string;
  feeType: "rate" | "amount";
  feeValue: string;
  feeApplicationFrequency: string;
  feeEffectiveDate: Date;
  feeEndDate?: Date;
  feeTriggerCondition: string;
  feeCustomerType: string;
  feeSpecificCustomers?: string;

  // Overdraft
  overdraftName: string;
  overdraftLimit: string;
  overdraftCustomerType: string;
  overdraftSpecificCustomers?: string;
};

const steps = ["Product details", "Interest", "Fee", "Overdraft"];

export default function CreateProductPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Get the appropriate schema for the current step
  const getStepSchema = (step: number) => {
    switch (step) {
      case 0:
        return productDetailsSchema;
      case 1:
        return interestSchema;
      case 2:
        return feeSchema;
      case 3:
        return overdraftSchema;
      default:
        return productDetailsSchema;
    }
  };

  const form = useForm<FormData>({
    resolver: zodResolver(getStepSchema(currentStep)),
    mode: "onChange",
    defaultValues: {
      rateUnit: "per-annum",
      feeType: "rate",
    },
  });

  // Load saved data from localStorage on mount
  useEffect(() => {
    const savedData = localStorage.getItem("createProductForm");
    if (savedData) {
      try {
        const parsedData = JSON.parse(savedData);

        // Convert string dates back to Date objects
        if (parsedData.effectiveDate) {
          parsedData.effectiveDate = new Date(parsedData.effectiveDate);
        }
        if (parsedData.endDate) {
          parsedData.endDate = new Date(parsedData.endDate);
        }
        if (parsedData.feeEffectiveDate) {
          parsedData.feeEffectiveDate = new Date(parsedData.feeEffectiveDate);
        }
        if (parsedData.feeEndDate) {
          parsedData.feeEndDate = new Date(parsedData.feeEndDate);
        }

        form.reset(parsedData);
      } catch (error) {
        console.error("Error parsing saved form data:", error);
        localStorage.removeItem("createProductForm");
      }
    }
  }, []);

  // Go to previous step
  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };
  // Validate current step and proceed to next
  const handleNext = async () => {
    // Get the current step's schema
    const currentSchema = getStepSchema(currentStep);

    // Get only the relevant fields for the current step
    const currentStepData = form.getValues();
    let fieldsToValidate = {};

    // Extract only the fields relevant to the current step
    switch (currentStep) {
      case 0: // Product details
        fieldsToValidate = {
          productName: currentStepData.productName,
          accountType: currentStepData.accountType,
        };
        break;
      case 1: // Interest
        fieldsToValidate = {
          interestType: currentStepData.interestType,
          rate: currentStepData.rate,
          rateUnit: currentStepData.rateUnit,
          calculationPeriod: currentStepData.calculationPeriod,
          compoundingFrequency: currentStepData.compoundingFrequency,
          effectiveDate: currentStepData.effectiveDate,
          endDate: currentStepData.endDate,
          triggerCondition: currentStepData.triggerCondition,
          customerType: currentStepData.customerType,
          specificCustomer: currentStepData.specificCustomer,
        };
        break;
      case 2: // Fee
        fieldsToValidate = {
          transactionType: currentStepData.transactionType,
          feeType: currentStepData.feeType,
          feeValue: currentStepData.feeValue,
          feeApplicationFrequency: currentStepData.feeApplicationFrequency,
          effectiveDate: currentStepData.feeEffectiveDate,
          endDate: currentStepData.feeEndDate,
          triggerCondition: currentStepData.feeTriggerCondition,
          customerType: currentStepData.feeCustomerType,
          specificCustomers: currentStepData.feeSpecificCustomers,
        };
        break;
      case 3: // Overdraft
        fieldsToValidate = {
          overdraftName: currentStepData.overdraftName,
          overdraftLimit: currentStepData.overdraftLimit,
          customerType: currentStepData.overdraftCustomerType,
          specificCustomers: currentStepData.overdraftSpecificCustomers,
        };
        break;
    }

    // Validate only the current step's fields
    const validationResult = currentSchema.safeParse(fieldsToValidate);

    if (validationResult.success) {
      const formData = form.getValues();
      localStorage.setItem("createProductForm", JSON.stringify(formData));

      if (currentStep < steps.length - 1) {
        setCurrentStep(currentStep + 1);
      }
    } else {
      // Show specific error messages
      const errors = validationResult.error.format();
      console.error("Validation errors:", errors);
      toast.error("Please fill all required fields correctly");
    }
  };

  // Final form submission
  const handleSubmit = async () => {
    const data = form.getValues();

    // Validate all steps before final submission
    try {
      // Check each section individually to provide accurate error messages

      // Check Product Details section
      const productDetailsValid = productDetailsSchema.safeParse({
        productName: data.productName,
        accountType: data.accountType,
      });
      console.log(productDetailsValid);

      if (!productDetailsValid.success) {
        setCurrentStep(0);
        toast.error("Please complete the Product details section");
        return;
      }

      // Check Interest section
      const interestValid = interestSchema.safeParse({
        interestType: data.interestType,
        rate: data.rate,
        rateUnit: data.rateUnit,
        calculationPeriod: data.calculationPeriod,
        compoundingFrequency: data.compoundingFrequency,
        effectiveDate: data.effectiveDate,
        endDate: data.endDate,
        triggerCondition: data.triggerCondition,
        customerType: data.customerType,
        specificCustomer: data.specificCustomer,
      });

      if (!interestValid.success) {
        setCurrentStep(1);
        toast.error("Please complete the Interest section");
        return;
      }

      // Check Fee section
      const feeValid = feeSchema.safeParse({
        transactionType: data.transactionType,
        feeType: data.feeType,
        feeValue: data.feeValue,
        feeApplicationFrequency: data.feeApplicationFrequency,
        effectiveDate: data.feeEffectiveDate,
        endDate: data.feeEndDate,
        triggerCondition: data.feeTriggerCondition,
        customerType: data.feeCustomerType,
        specificCustomers: data.feeSpecificCustomers,
      });

      if (!feeValid.success) {
        setCurrentStep(2);
        toast.error("Please complete the Fee section");
        return;
      }

      // Check Overdraft section
      const overdraftValid = overdraftSchema.safeParse({
        overdraftName: data.overdraftName,
        overdraftLimit: data.overdraftLimit,
        customerType: data.overdraftCustomerType,
        specificCustomers: data.overdraftSpecificCustomers,
      });

      if (!overdraftValid.success) {
        setCurrentStep(3);
        toast.error("Please complete the Overdraft section");
        return;
      }

      // If we get here, all sections are valid

      setIsSubmitting(true);

      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Clear form data from localStorage
      localStorage.removeItem("createProductForm");

      // Show success message
      toast.success("Product created successfully");

      // Redirect to products page
      router.push("/dashboard/financial-accounting/manage-product");
    } catch (error) {
      console.error("Error submitting form:", error);
      toast.error("Error creating product");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container border max-w-5xl rounded-lg px-6 mx-auto pb-10 pt-5">
      <Button
        variant="ghost"
        className="flex bg-secondary/30 items-center gap-2 mb-5"
        onClick={() =>
          router.push("/dashboard/financial-accounting/manage-product")
        }
      >
        <ArrowLeft className="h-4 w-4" />
        Back to Products
      </Button>
      <div className="md:flex flex-col md:flex-row space-y-5 gap-10">
        <div className="w-64 shrink-0">
          <h1 className="text-2xl font-bold mb-1">
            Create <span className="text-primary">Product</span>
          </h1>
          <p className="text-sm text-muted-foreground mb-6">
            Add Your Product Details
          </p>
          <div className="space-y-1 hidden md:block">
            {steps.map((step, index) => (
              <div
                key={step}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-lg",
                  currentStep === index
                    ? "bg-primary/10 text-primary"
                    : "text-muted-foreground"
                )}
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    currentStep === index ? "bg-primary" : "bg-muted"
                  )}
                />
                {step}
              </div>
            ))}
          </div>
          <div className="md:hidden">
            <div
              className={cn(
                "inline-flex items-center gap-3 px-4 py-3 rounded-lg",
                "bg-secondary/50 text-muted-foreground"
              )}
            >
              <div className="w-2 h-2 rounded-full bg-foreground" />
              {steps[currentStep]}
            </div>
          </div>
        </div>
        <Separator className="md:hidden mx-auto w-20" />
        <div className="flex-1">
          <form
            onSubmit={form.handleSubmit(handleSubmit)}
            className="space-y-6"
          >
            {/* Product Details Step */}
            {currentStep === 0 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="productName">Product Name</Label>
                  <Input
                    id="productName"
                    placeholder="Enter product name"
                    {...form.register("productName")}
                  />
                  {form.formState.errors.productName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.productName.message}
                    </p>
                  )}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="accountType">Account Type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("accountType", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("accountType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="savings">Savings</SelectItem>
                      <SelectItem value="checking">Checking</SelectItem>
                      <SelectItem value="investment">Investment</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.accountType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.accountType.message}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Interest Step */}
            {currentStep === 1 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="interestType">Type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("interestType", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("interestType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select interest type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="fixed">Fixed</SelectItem>
                      <SelectItem value="variable">Variable</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.interestType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.interestType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Interest Rate</Label>
                  <div className="flex gap-2">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">
                        <Percent className="h-4 w-4" />
                      </span>
                      <Input
                        id="rate"
                        className="pl-9"
                        placeholder="Enter Interest Rate"
                        {...form.register("rate")}
                      />
                    </div>
                    <Select
                      defaultValue="per-annum"
                      value={form.watch("rateUnit")}
                      onValueChange={(value) =>
                        form.setValue("rateUnit", value)
                      }
                    >
                      <SelectTrigger className="w-[180px]">
                        <SelectValue placeholder="per annum" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="per-annum">per annum</SelectItem>
                        <SelectItem value="per-month">per month</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {form.formState.errors.rate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.rate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="calculationPeriod">Calculation Period</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("calculationPeriod", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("calculationPeriod")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.calculationPeriod && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.calculationPeriod.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="compoundingFrequency">
                    Compounding Frequency
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("compoundingFrequency", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("compoundingFrequency")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Period" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.compoundingFrequency && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.compoundingFrequency.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <DateTimePicker
                    displayFormat={{ hour24: "yyyy/MM/dd" }}
                    granularity="day"
                    value={form.watch("effectiveDate")}
                    onChange={(date) =>
                      form.setValue("effectiveDate", date as Date, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {form.formState.errors.effectiveDate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.effectiveDate.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    End Date{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <DateTimePicker
                    displayFormat={{ hour24: "yyyy/MM/dd" }}
                    granularity="day"
                    value={form.watch("endDate")}
                    onChange={(date) =>
                      form.setValue("endDate", date as Date, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="triggerCondition">Trigger Condition</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("triggerCondition", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("triggerCondition")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="transaction-type">
                        Transaction Type
                      </SelectItem>
                      <SelectItem value="minimum-balance">
                        Minimum Balance
                      </SelectItem>
                      <SelectItem value="maximum-balance">
                        Maximum Balance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.triggerCondition && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.triggerCondition.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="customerType">Customer Type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("customerType", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("customerType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.customerType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.customerType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="specificCustomer">
                    Specific Customer{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("specificCustomer", value)
                    }
                    value={form.watch("specificCustomer")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customer" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Fee Step */}
            {currentStep === 2 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="transactionType">Transaction Type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("transactionType", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("transactionType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Transaction Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="deposit">Deposit</SelectItem>
                      <SelectItem value="withdrawal">Withdrawal</SelectItem>
                      <SelectItem value="transfer">Transfer</SelectItem>
                      <SelectItem value="all">All Transactions</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.transactionType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.transactionType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Tabs
                      defaultValue="rate w-[180px]"
                      value={form.watch("feeType")}
                      onValueChange={(value) =>
                        form.setValue("feeType", value as "rate" | "amount")
                      }
                    >
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger
                          className="border-none rounded-md"
                          value="rate"
                        >
                          Rate
                        </TabsTrigger>
                        <TabsTrigger
                          className="border-none rounded-md"
                          value="amount"
                        >
                          Amount
                        </TabsTrigger>
                      </TabsList>
                    </Tabs>
                  </div>

                  {form.watch("feeType") === "rate" ? (
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-muted-foreground">
                        <Percent className="h-4 w-4" />
                      </span>
                      <Input
                        id="feeValue"
                        className="pl-9"
                        placeholder="Enter Rate"
                        {...form.register("feeValue")}
                      />
                    </div>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-muted-foreground">
                        ₦
                      </span>
                      <Input
                        id="feeValue"
                        className="pl-7"
                        type="number"
                        placeholder="Enter Amount"
                        {...form.register("feeValue")}
                      />
                    </div>
                  )}

                  {form.formState.errors.feeValue && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.feeValue.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeApplicationFrequency">
                    Fee Application Frequency
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("feeApplicationFrequency", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("feeApplicationFrequency")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Frequency" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="per-transaction">
                        Per Transaction
                      </SelectItem>
                      <SelectItem value="daily">Daily</SelectItem>
                      <SelectItem value="weekly">Weekly</SelectItem>
                      <SelectItem value="monthly">Monthly</SelectItem>
                      <SelectItem value="quarterly">Quarterly</SelectItem>
                      <SelectItem value="yearly">Yearly</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.feeApplicationFrequency && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.feeApplicationFrequency.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>Effective Date</Label>
                  <DateTimePicker
                    displayFormat={{ hour24: "yyyy/MM/dd" }}
                    granularity="day"
                    value={form.watch("feeEffectiveDate")}
                    onChange={(date) =>
                      form.setValue("feeEffectiveDate", date as Date, {
                        shouldValidate: true,
                      })
                    }
                  />
                  {form.formState.errors.feeEffectiveDate && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.feeEffectiveDate?.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label>
                    End Date{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <DateTimePicker
                    displayFormat={{ hour24: "yyyy/MM/dd" }}
                    granularity="day"
                    value={form.watch("feeEndDate")}
                    onChange={(date) =>
                      form.setValue("feeEndDate", date as Date, {
                        shouldValidate: true,
                      })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeTriggerCondition">Trigger Condition</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("feeTriggerCondition", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("feeTriggerCondition")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Condition" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="balanced">Balanced</SelectItem>
                      <SelectItem value="transaction-type">
                        Transaction Type
                      </SelectItem>
                      <SelectItem value="minimum-balance">
                        Minimum Balance
                      </SelectItem>
                      <SelectItem value="maximum-balance">
                        Maximum Balance
                      </SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.feeTriggerCondition && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.feeTriggerCondition.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeCustomerType">Customer Type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("feeCustomerType", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("feeCustomerType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.feeCustomerType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.feeCustomerType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="feeSpecificCustomers">
                    Specific Customers{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("feeSpecificCustomers", value)
                    }
                    value={form.watch("feeSpecificCustomers")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            {/* Overdraft Step */}
            {currentStep === 3 && (
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="overdraftName">Overdraft Name</Label>
                  <Input
                    id="overdraftName"
                    placeholder="Enter overdraft name"
                    {...form.register("overdraftName")}
                  />
                  {form.formState.errors.overdraftName && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.overdraftName.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overdraftLimit">Set Overdraft Limit</Label>
                  <div className="relative">
                    <span className="absolute left-3 top-2">₦</span>
                    <Input
                      id="overdraftLimit"
                      className="pl-7"
                      type="number"
                      placeholder="Enter amount"
                      {...form.register("overdraftLimit")}
                    />
                  </div>
                  {form.formState.errors.overdraftLimit && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.overdraftLimit.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overdraftCustomerType">Customer Type</Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("overdraftCustomerType", value, {
                        shouldValidate: true,
                      })
                    }
                    value={form.watch("overdraftCustomerType")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customer type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="individual">Individual</SelectItem>
                      <SelectItem value="business">Business</SelectItem>
                    </SelectContent>
                  </Select>
                  {form.formState.errors.overdraftCustomerType && (
                    <p className="text-sm text-red-500">
                      {form.formState.errors.overdraftCustomerType.message}
                    </p>
                  )}
                </div>

                <div className="space-y-2">
                  <Label htmlFor="overdraftSpecificCustomers">
                    Specific Customers{" "}
                    <span className="text-muted-foreground">(optional)</span>
                  </Label>
                  <Select
                    onValueChange={(value) =>
                      form.setValue("overdraftSpecificCustomers", value)
                    }
                    value={form.watch("overdraftSpecificCustomers")}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select Customers" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="premium">Premium</SelectItem>
                      <SelectItem value="standard">Standard</SelectItem>
                      <SelectItem value="vip">VIP</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-4">
              <Button
                type="button"
                variant="outline"
                onClick={() => {
                  form.reset();
                  localStorage.removeItem("createProductForm");
                }}
              >
                Clear
              </Button>

              {currentStep > 0 && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={handlePrevious}
                >
                  Previous
                </Button>
              )}

              {currentStep < steps.length - 1 ? (
                <Button
                  type="button"
                  className="bg-primary hover:bg-primary"
                  onClick={handleNext}
                >
                  Next
                </Button>
              ) : (
                <Button
                  type="submit"
                  className="bg-primary hover:bg-primary"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Creating..." : "Create Product"}
                </Button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
