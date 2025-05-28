"use server";

import { actionClient } from "@/lib/safe-action";
import { z } from "zod";

const formSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters"),
  email: z.string().email("Invalid email address"),
  subject: z.string().min(5, "Subject must be at least 5 characters"),
  message: z.string().min(10, "Message must be at least 10 characters"),
});

const GOOGLE_SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbyFrXwKzkG3KIG2yXCWojO7CWSC_9SbEwszyC5Dkxwyv1nNjqFBlW2jDPgRtygQ1XQrQw/exec';

export const submitContact = actionClient
  .schema(formSchema)
  .action(async ({ parsedInput }) => {
    try {
      const formData = new FormData();
      formData.append('Name', parsedInput.name);
      formData.append('Email', parsedInput.email);
      formData.append('Subject', parsedInput.subject);
      formData.append('Message', parsedInput.message);

      const response = await fetch(GOOGLE_SCRIPT_URL, {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();

      if (result.status === 'success') {
        return { success: true, message: result.message };
      } else {
        return { success: false, message: result.message || 'Failed to send message' };
      }
    } catch (error) {
      console.error('Error submitting form:', error);
      return { success: false, message: 'An error occurred while sending the message' };
    }
  });
