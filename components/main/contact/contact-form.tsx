/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useAction } from "next-safe-action/hooks";
import { submitContact } from "@/server/main/contact/contact-form";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

export function ContactForm() {
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  let toastId: string | number;
  const { execute, status } = useAction(submitContact, {
    onSuccess({ data }) {
      if (data?.success) {
        toast.success("Message sent successfully!", {
          description: data.message || "We'll get back to you as soon as possible.",
          id: toastId,
        });
        form.reset();
      } else {
        toast.error("Failed to send message", { 
          description: data?.message || "Please try again later.",
          id: toastId 
        });
      }
      toast.dismiss(toastId);
    },
    onExecute() {
      toastId = toast.loading("Sending your message...");
    },
    onError({ error }) {
      toast.error("Something went wrong", {
        description: error.serverError || "Please try again later.",
        id: toastId,
      });
      toast.dismiss(toastId);
    },
  });

  async function onSubmit(data: z.infer<typeof formSchema>) {
    execute(data);
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-4 sm:grid-cols-2">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-black/50">Name</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your name"
                    className={
                      "border-gray-200 bg-white focus:border-primary text-black/80 focus:ring-primary"
                    }
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
                <FormLabel className="text-black/50">Email</FormLabel>
                <FormControl>
                  <Input
                    placeholder="Your email"
                    className={
                      "border-gray-200 bg-white focus:border-primary text-black/80 focus:ring-primary"
                    }
                    {...field}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="subject"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black/50">Subject</FormLabel>
              <FormControl>
                <Input
                  placeholder="Message subject"
                  className={
                    "border-gray-200 bg-white focus:border-primary text-black/80 focus:ring-primary"
                  }
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="message"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-black/50">Message</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Your message"
                  className="min-h-[150px] resize-none border-gray-200 bg-white focus:border-primary text-black/80 focus:ring-primary"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        <Button
          type="submit"
          className="w-full bg-primary text-white hover:bg-primary/90"
          disabled={status === "executing"}
        >
          {status === "executing" ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </Form>
  );
}
