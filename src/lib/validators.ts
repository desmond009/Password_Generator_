import { z } from "zod";

export const registerSchema = z.object({
  email: z.string().email().min(3).max(160),
  password: z.string().min(8).max(128),
});

export const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8).max(128),
});

export const vaultItemSchema = z.object({
  title: z.object({ ivB64: z.string(), ctB64: z.string() }).optional(),
  username: z.object({ ivB64: z.string(), ctB64: z.string() }).optional(),
  password: z.object({ ivB64: z.string(), ctB64: z.string() }).optional(),
  url: z.object({ ivB64: z.string(), ctB64: z.string() }).optional(),
  notes: z.object({ ivB64: z.string(), ctB64: z.string() }).optional(),
  tags: z.array(z.string()).optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type VaultItemInput = z.infer<typeof vaultItemSchema>;


