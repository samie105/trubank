"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import { useAction } from "next-safe-action/hooks";
import { toast } from "sonner";
import { verifyOtpAction, resendOtpAction } from "@/server/forgotpassword";
import Link from "next/link";

const otpSchema = z.object({
  otp: z.string().length(4, "OTP must be 4 digits"),
});

type OtpFormValues = z.infer<typeof otpSchema>;

export default function OtpVerification({
  setStep,
}: {
  setStep: (step: number) => void;
}) {
  const [countdown, setCountdown] = useState(60);
  const [canResend, setCanResend] = useState(false);
  const [email] = useState(localStorage.getItem("email") as string);

  const form = useForm<OtpFormValues>({
    resolver: zodResolver(otpSchema),
    defaultValues: {
      otp: "",
    },
  });

  let toastId: string;

  const { execute: verifyOtp, status: verifyStatus } = useAction(
    verifyOtpAction,
    {
      onSuccess({ data }) {
        if (data?.success) {
          toast.success("Account verification successful", { id: toastId });
          setStep(2);
        }
        if (data?.error) toast.error(data.message, { id: toastId });
        toast.dismiss(toastId);
      },
      onExecute() {
        toast.loading("Verifying code, please wait...");
      },
      onError(error) {
        if (error.error.serverError)
          toast.error("Error connecting to servers", { id: toastId });
        if (error.error.validationErrors)
          toast.error("Please check your details", { id: toastId });
        toast.dismiss(toastId);
      },
    }
  );

  const { execute: resendOtp, status: resendStatus } = useAction(
    resendOtpAction,
    {
      onSuccess({ data }) {
        if (data?.success) toast.success("Code resent", { id: toastId });
        if (!data?.success)
          toast.error("Couldn't send code, try again", { id: toastId });
        toast.dismiss(toastId);
      },
      onExecute() {
        toast.loading("Sending code, please wait...");
      },
      onError(error) {
        if (error.error.serverError)
          toast.error("Error connecting to servers", { id: toastId });
        if (error.error.validationErrors)
          toast.error("Please check your details", { id: toastId });
        toast.dismiss(toastId);
      },
    }
  );

  useEffect(() => {
    const timer = setInterval(() => {
      setCountdown((prevCountdown) => {
        if (prevCountdown <= 1) {
          clearInterval(timer);
          setCanResend(true);
          return 0;
        }
        return prevCountdown - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [canResend]);

  async function onSubmit(data: OtpFormValues) {
    verifyOtp(data);
  }

  async function handleResendOtp() {
    resendOtp({ email });
    setCountdown(60);
    setCanResend(false);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="space-y-2 text-center">
          <h1 className="text-3xl font-bold">Verify OTP</h1>
          <p className="text-muted-foreground">
            Enter the 4-digit code sent to <b>{email}</b>. Wrong email?{" "}
            <Link
              href={"/auth/forgot-password"}
              className="font-medium text-primary underline"
            >
              change email
            </Link>
          </p>
        </div>

        <div className="space-y-4">
          <div className="w-full flex justify-center">
            <FormField
              control={form.control}
              name="otp"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Input your OTP here</FormLabel>
                  <FormControl>
                    <InputOTP maxLength={4} className="" {...field}>
                      <InputOTPGroup>
                        <InputOTPSlot index={0} />
                        <InputOTPSlot index={1} />
                        <InputOTPSlot index={2} />
                        <InputOTPSlot index={3} />
                      </InputOTPGroup>
                    </InputOTP>
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>

          <Button
            type="submit"
            className="w-full font-semibold bg-primary text-white hover:bg-primary/90"
            disabled={
              !form.formState.isValid ||
              verifyStatus === "executing" ||
              resendStatus === "executing"
            }
          >
            {verifyStatus === "executing" ? "Verifying..." : "Verify OTP"}
          </Button>

          <div className="text-center">
            {canResend ? (
              <Button
                type="button"
                variant="secondary"
                onClick={handleResendOtp}
                className="bg-transparent hover:bg-transparent"
                disabled={resendStatus === "executing"}
              >
                {resendStatus === "executing" ? (
                  "Resending..."
                ) : (
                  <div className="text-muted-foreground">
                    {"Didn't receive any OTP"}?{" "}
                    <span className="text-primary">Resend OTP</span>
                  </div>
                )}
              </Button>
            ) : (
              <span className="text-sm text-muted-foreground">
                Resend OTP in {countdown} seconds
              </span>
            )}
          </div>
        </div>
      </form>
    </Form>
  );
}
