"use server";

import { z } from "zod";
import { actionClient } from "@/lib/safe-action";

// Base interfaces for the API
export interface ProductInterest {
  interestTypeId: string;
  rateAmount: number;
  rateType: string;
  calculationPeriod: number;
  compoundingFrequescy: number;
  effectiveDate: string;
  endDate?: string;
  triggerCondition: number;
  customerType: number;
}

export interface OverDraft {
  name: string;
  limitAmount: number;
}

export interface ProductFees {
  category: number;
  percentageFee: number;
  feeName: string;
  feeAmount: number;
  capAmount: number;
  glAccountId: string;
  feeApplicationFrequency: number;
  effectiveDate: string;
  endDate?: string;
  triggerCondition: number;
  customerType: number;
  minimumAmount: number;
  isFeesAccount: boolean;
  isInterestAccount: boolean;
}

export interface AccountMapping {
  entryType: number;
  feeType: number;
  firstLedgerId: string;
  secondLedgerId: string;
  amount: number;
  isFeesAccount: boolean;
  isInterestAccount: boolean;
}

export interface TransactionRule {
  category: number;
  description: string;
  accountMappings: AccountMapping[];
}

export interface Product {
  id?: string;
  name: string;
  ledgerId: string;
  productName: string;
  productCode: string;
  account_generation_format: string;
  productInterest: ProductInterest[];
  overDraft: OverDraft;
  productFees: ProductFees[];
  transactionRules: TransactionRule[];
}

// API Response interface
interface ApiResponse<T = unknown> {
  isSuccess: boolean;
  result: T;
  message: string;
  error?: string;
  statCode: number;
}

// Zod schemas for validation
const ProductInterestSchema = z.object({
  interestTypeId: z.string().uuid(),
  rateAmount: z.number().min(0),
  rateType: z.string(),
  calculationPeriod: z.number().min(1),
  compoundingFrequescy: z.number().min(1),
  effectiveDate: z.string(),
  endDate: z.string().optional(),
  triggerCondition: z.number().min(1),
  customerType: z.number().min(1),
});

const OverDraftSchema = z.object({
  name: z.string().min(1),
  limitAmount: z.number().min(0),
});

const ProductFeesSchema = z.object({
  category: z.number().min(1),
  percentageFee: z.number().min(0),
  feeName: z.string().min(1),
  feeAmount: z.number().min(0),
  capAmount: z.number().min(0),
  glAccountId: z.string().uuid(),
  feeApplicationFrequency: z.number().min(1),
  effectiveDate: z.string(),
  endDate: z.string().optional(),
  triggerCondition: z.number().min(1),
  customerType: z.number().min(1),
  minimumAmount: z.number().min(0),
  isFeesAccount: z.boolean(),
  isInterestAccount: z.boolean(),
});

const AccountMappingSchema = z.object({
  entryType: z.number().min(1),
  feeType: z.number().min(1),
  firstLedgerId: z.string().uuid(),
  secondLedgerId: z.string().uuid(),
  amount: z.number().min(0),
  isFeesAccount: z.boolean(),
  isInterestAccount: z.boolean(),
});

const TransactionRuleSchema = z.object({
  category: z.number().min(1),
  description: z.string().min(1),
  accountMappings: z.array(AccountMappingSchema),
});

const CreateProductSchema = z.object({
  name: z.string().min(1, "Product name is required"),
  ledgerId: z.string().uuid("Valid ledger ID is required"),
  productName: z.string().min(1, "Product name is required"),
  productCode: z.string().min(1, "Product code is required"),
  account_generation_format: z.string().min(1, "Account generation format is required"),
  productInterest: z.array(ProductInterestSchema),
  overDraft: OverDraftSchema,
  productFees: z.array(ProductFeesSchema),
  transactionRules: z.array(TransactionRuleSchema),
});

const UpdateProductSchema = CreateProductSchema.extend({
  id: z.string().uuid("Valid product ID is required"),
});

// Create Product Action
export const createProductAction = actionClient
  .schema(CreateProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Creating product...", parsedInput);

      const response = await fetch(`${process.env.API_URL}/accountmanagement/create-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedInput),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<Product> = await response.json();

      if (data.isSuccess) {
        console.log("Product created successfully");
        return {
          success: true,
          data: data.result,
          message: data.message || "Product created successfully",
        };
      } else {
        console.error("Failed to create product:", data.error || data.message);
        throw new Error(data.error || data.message || "Failed to create product");
      }
    } catch (error) {
      console.error("Error creating product:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to create product");
    }
  });

// Update Product Action
export const updateProductAction = actionClient
  .schema(UpdateProductSchema)
  .action(async ({ parsedInput }) => {
    try {
      console.log("Updating product...", parsedInput);

      const response = await fetch(`${process.env.API_URL}/accountmanagement/update-product`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(parsedInput),
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data: ApiResponse<string> = await response.json();

      if (data.isSuccess) {
        console.log("Product updated successfully");
        return {
          success: true,
          data: data.result,
          message: data.message || "Product updated successfully",
        };
      } else {
        console.error("Failed to update product:", data.error || data.message);
        throw new Error(data.error || data.message || "Failed to update product");
      }
    } catch (error) {
      console.error("Error updating product:", error);
      throw new Error(error instanceof Error ? error.message : "Failed to update product");
    }
  });
