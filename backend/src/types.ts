import { z } from "zod";

export const PersonaSchema = z.object({
  id: z.string(),
  name: z.string(),
  bio: z.string(),
  role: z.enum(["agent", "assistant", "collaborator"]),
  profileImageUrl: z.string().nullable(),
  moreInfoText: z.string().nullable(),
  externalLinks: z.string().nullable(),
  displayOrder: z.number(),
  isActive: z.boolean(),
  createdAt: z.string(),
  updatedAt: z.string(),
});

export const ArticleSchema = z.object({
  id: z.string(),
  title: z.string(),
  slug: z.string(),
  body: z.string(),
  excerpt: z.string(),
  featuredImageUrl: z.string().nullable(),
  topic: z.string().nullable(),
  category: z.string().nullable(),
  tags: z.string(), // JSON array string
  style: z.string().nullable(),
  isPublic: z.boolean(),
  publishedAt: z.string().nullable(),
  createdAt: z.string(),
  updatedAt: z.string(),
  personaId: z.string(),
  persona: PersonaSchema.optional(),
});

export const SiteSettingsSchema = z.object({
  id: z.string(),
  isPublic: z.boolean(),
  siteName: z.string(),
  tagline: z.string(),
  updatedAt: z.string(),
});

export const LoginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const CreatePersonaSchema = z.object({
  name: z.string().min(1),
  bio: z.string().min(1),
  role: z.enum(["agent", "assistant", "collaborator"]),
  profileImageUrl: z.string().optional(),
  moreInfoText: z.string().optional(),
  externalLinks: z.string().optional(),
  displayOrder: z.number().optional(),
});

export const UpdatePersonaSchema = CreatePersonaSchema.partial().extend({
  isActive: z.boolean().optional(),
});

export const CreateArticleSchema = z.object({
  title: z.string().min(1),
  body: z.string().min(1),
  excerpt: z.string().optional(),
  featuredImageUrl: z.string().optional(),
  topic: z.string().optional(),
  category: z.string().optional(),
  tags: z.array(z.string()).optional(),
  style: z.string().optional(),
  isPublic: z.boolean().optional(),
  publishedAt: z.string().optional(),
  personaId: z.string().min(1),
});

export const UpdateArticleSchema = CreateArticleSchema.partial();

export const UpdateSiteSettingsSchema = z.object({
  isPublic: z.boolean().optional(),
  siteName: z.string().optional(),
  tagline: z.string().optional(),
});

export type Persona = z.infer<typeof PersonaSchema>;
export type Article = z.infer<typeof ArticleSchema>;
export type SiteSettings = z.infer<typeof SiteSettingsSchema>;
