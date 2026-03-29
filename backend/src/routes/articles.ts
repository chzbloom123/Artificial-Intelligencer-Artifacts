import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { requireAdmin } from "../authMiddleware";
import { CreateArticleSchema, UpdateArticleSchema } from "../types";

const articlesRouter = new Hono();

// Helper to generate slug from title
function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .trim();
}

// Helper to auto-generate excerpt
function generateExcerpt(body: string): string {
  const plain = body.replace(/<[^>]+>/g, "").trim();
  if (plain.length <= 200) return plain;
  const trimmed = plain.substring(0, 200);
  const lastSpace = trimmed.lastIndexOf(" ");
  return lastSpace > 0 ? trimmed.substring(0, lastSpace) + "..." : trimmed + "...";
}

// GET /api/articles/admin/all — admin list (all articles)
// NOTE: This must come BEFORE /:slug to avoid "admin" being treated as a slug
articlesRouter.get("/admin/all", requireAdmin, async (c) => {
  const articles = await prisma.article.findMany({
    include: { persona: true },
    orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
  });
  return c.json({ data: articles });
});

// GET /api/articles — public list (with pagination, category filter)
articlesRouter.get("/", async (c) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  if (settings && !settings.isPublic) {
    return c.json({ data: [], meta: { page: 1, limit: 20, total: 0, totalPages: 0 } });
  }

  const page = parseInt(c.req.query("page") || "1");
  const limit = parseInt(c.req.query("limit") || "20");
  const category = c.req.query("category");
  const topic = c.req.query("topic");
  const search = c.req.query("search");

  const where: Record<string, unknown> = { isPublic: true };
  if (category) where.category = category;
  if (topic) where.topic = topic;
  if (search) {
    where.OR = [
      { title: { contains: search } },
      { excerpt: { contains: search } },
    ];
  }

  const [articles, total] = await Promise.all([
    prisma.article.findMany({
      where,
      include: { persona: true },
      orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.article.count({ where }),
  ]);

  return c.json({
    data: articles,
    meta: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

// GET /api/articles/:slug
articlesRouter.get("/:slug", async (c) => {
  const settings = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  const slug = c.req.param("slug");

  const article = await prisma.article.findUnique({
    where: { slug },
    include: { persona: true },
  });

  if (!article) return c.json({ error: { message: "Article not found" } }, 404);
  if (!article.isPublic || (settings && !settings.isPublic)) {
    return c.json({ error: { message: "Article not found" } }, 404);
  }

  return c.json({ data: article });
});

// POST /api/articles (admin create)
articlesRouter.post("/", requireAdmin, zValidator("json", CreateArticleSchema), async (c) => {
  const data = c.req.valid("json");

  let slug = generateSlug(data.title);
  // Ensure unique slug
  let existing = await prisma.article.findUnique({ where: { slug } });
  let counter = 1;
  while (existing) {
    slug = `${generateSlug(data.title)}-${counter}`;
    existing = await prisma.article.findUnique({ where: { slug } });
    counter++;
  }

  const excerpt = data.excerpt || generateExcerpt(data.body);
  const tags = JSON.stringify(data.tags || []);

  const article = await prisma.article.create({
    data: {
      title: data.title,
      slug,
      body: data.body,
      excerpt,
      featuredImageUrl: data.featuredImageUrl,
      topic: data.topic,
      category: data.category,
      tags,
      style: data.style,
      isPublic: data.isPublic ?? true,
      publishedAt: data.publishedAt ? new Date(data.publishedAt) : new Date(),
      personaId: data.personaId,
    },
    include: { persona: true },
  });

  return c.json({ data: article }, 201);
});

// PUT /api/articles/:id (admin update)
articlesRouter.put("/:id", requireAdmin, zValidator("json", UpdateArticleSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");

  const updateData: Record<string, unknown> = { ...data };
  if (data.tags !== undefined) updateData.tags = JSON.stringify(data.tags);
  if (data.publishedAt !== undefined) updateData.publishedAt = new Date(data.publishedAt);

  // Handle slug update if title changes
  if (data.title) {
    const current = await prisma.article.findUnique({ where: { id } });
    if (current && current.title !== data.title) {
      let slug = generateSlug(data.title);
      let existing = await prisma.article.findFirst({ where: { slug, NOT: { id } } });
      let counter = 1;
      while (existing) {
        slug = `${generateSlug(data.title)}-${counter}`;
        existing = await prisma.article.findFirst({ where: { slug, NOT: { id } } });
        counter++;
      }
      updateData.slug = slug;
    }
  }

  const article = await prisma.article.update({
    where: { id },
    data: updateData as Record<string, unknown>,
    include: { persona: true },
  });

  return c.json({ data: article });
});

// DELETE /api/articles/:id (admin delete)
articlesRouter.delete("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");
  await prisma.article.delete({ where: { id } });
  return c.body(null, 204);
});

export { articlesRouter };
