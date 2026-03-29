export interface Persona {
  id: string;
  name: string;
  bio: string;
  role: "agent" | "assistant" | "collaborator";
  profileImageUrl: string | null;
  moreInfoText: string | null;
  externalLinks: string | null;
  displayOrder: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  _count?: { articles: number };
  articles?: Article[];
}

export interface Article {
  id: string;
  title: string;
  slug: string;
  body: string;
  excerpt: string;
  featuredImageUrl: string | null;
  topic: string | null;
  category: string | null;
  tags: string; // JSON array string
  style: string | null;
  isPublic: boolean;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
  personaId: string;
  persona?: Persona;
}

export interface SiteSettings {
  id: string;
  isPublic: boolean;
  siteName: string;
  tagline: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  meta?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  error?: { message: string; code?: string };
}
