"use client";

import React from "react";
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
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { forgotPasswordAction } from "@/server/forgotpassword";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export default function ForgotPassword({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const [email] = React.useState(localStorage.getItem("email") ?? "");
  const form = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email,
    },
  });
  const toastId: string = "";
  const { execute, status } = useAction(forgotPasswordAction, {
    onSuccess({ data }) {
      if (data?.success) setStep(1);
      if (data?.error) toast.error(data.message, { id: toastId });
      toast.dismiss(toastId);
    },
    onExecute() {
      toast.loading("Please wait...", { id: toastId });
    },
    onError(error) {
      if (error.error.serverError)
        toast.error("Error connecting to servers", {
          id: toastId,
        });
      if (error.error.validationErrors)
        toast.error("Please check your details", {
          id: toastId,
        });

      toast.dismiss(toastId);
    },
  });

  async function onSubmit(data: ForgotPasswordFormValues) {
    localStorage.setItem("email", data.email);
    execute(data);
  }

  return (
    <>
      <div className="flex justify-end mb-4">
        <Link
          href={"/auth/login"}
          className="back-to-login flex rounded-xl p-3 text-sm gap-x-1 items-center bg-primary/5 text-primary font-medium"
        >
          <ArrowLeft className="size-4" />
          <p>Back to Login</p>
        </Link>
      </div>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="space-y-2 text-center">
            <h1 className="text-3xl font-bold">Forgot Password</h1>
            <p className="text-muted-foreground">
              Enter your email to receive password reset instructions
            </p>
          </div>

          <div className="space-y-4">
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Enter your email address"
                      type="email"
                      autoComplete="email"
                      required
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <Button
              type="submit"
              className="w-full font-semibold bg-primary text-white hover:bg-primary/90"
              disabled={!form.formState.isValid || status === "executing"}
            >
              {status === "executing"
                ? "Sending..."
                : "Send Reset Instructions"}
            </Button>
          </div>
        </form>
      </Form>
    </>
  );
}
