"use server";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const loginAction = actionClient
  .schema(loginSchema)
  .action(async ({ parsedInput: { email, password } }) => {
    // Simulate database communication delay
    await new Promise((resolve) => setTimeout(resolve, 2000));
    console.log(email, password);
    // Simulate success/error (change this to test different scenarios)
    const isSuccess = true;

    if (isSuccess) {
      return { success: true };
    } else {
      return { error: "Invalid email or password" };
    }
  });
