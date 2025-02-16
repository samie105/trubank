"use server";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export const submitContact = actionClient
  .schema(formSchema)
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  .action(async ({ parsedInput }) => {
    // Simulate API delay
    await new Promise((resolve) => setTimeout(resolve, 2000));

    // Simulate success (you can add error simulation with Math.random())
    return { success: true };
  });
