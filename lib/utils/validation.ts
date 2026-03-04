import { z } from 'zod';

export const sessionSchema = z.object({
  email: z.string().email('Please enter a valid email address'),
  images: z.array(z.string()).max(5, 'Maximum 5 images allowed'),
});

export const processSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
  transcript: z.string().min(50, 'Transcript must be at least 50 characters'),
});

export const emailSchema = z.object({
  sessionId: z.string().uuid('Invalid session ID'),
});
