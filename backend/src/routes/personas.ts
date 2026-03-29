import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { requireAdmin } from "../authMiddleware";
import { CreatePersonaSchema, UpdatePersonaSchema } from "../types";

const personasRouter = new Hono();

// GET /api/personas — public list of active personas
personasRouter.get("/", async (c) => {
  const personas = await prisma.persona.findMany({
    where: { isActive: true },
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { articles: { where: { isPublic: true } } } } },
  });
  return c.json({ data: personas });
});

// GET /api/personas/admin/all — admin list (all including inactive)
// NOTE: This must come BEFORE /:id to avoid "admin" being treated as an id
personasRouter.get("/admin/all", requireAdmin, async (c) => {
  const personas = await prisma.persona.findMany({
    orderBy: { displayOrder: "asc" },
    include: { _count: { select: { articles: true } } },
  });
  return c.json({ data: personas });
});

// GET /api/personas/:id — public persona profile with articles
personasRouter.get("/:id", async (c) => {
  const id = c.req.param("id");
  const persona = await prisma.persona.findUnique({
    where: { id, isActive: true },
    include: {
      articles: {
        where: { isPublic: true },
        orderBy: [{ publishedAt: "desc" }, { createdAt: "desc" }],
      },
      _count: { select: { articles: { where: { isPublic: true } } } },
    },
  });

  if (!persona) return c.json({ error: { message: "Persona not found" } }, 404);
  return c.json({ data: persona });
});

// POST /api/personas (admin create)
personasRouter.post("/", requireAdmin, zValidator("json", CreatePersonaSchema), async (c) => {
  const data = c.req.valid("json");
  const persona = await prisma.persona.create({ data });
  return c.json({ data: persona }, 201);
});

// PUT /api/personas/:id (admin update)
personasRouter.put("/:id", requireAdmin, zValidator("json", UpdatePersonaSchema), async (c) => {
  const id = c.req.param("id");
  const data = c.req.valid("json");
  const persona = await prisma.persona.update({ where: { id }, data });
  return c.json({ data: persona });
});

// DELETE /api/personas/:id (admin delete)
personasRouter.delete("/:id", requireAdmin, async (c) => {
  const id = c.req.param("id");

  // Check if persona has articles
  const articleCount = await prisma.article.count({ where: { personaId: id } });
  if (articleCount > 0) {
    return c.json({
      error: { message: `Cannot delete: this persona has ${articleCount} article(s). Delete or reassign them first.`, code: "HAS_ARTICLES" }
    }, 400);
  }

  await prisma.persona.delete({ where: { id } });
  return c.body(null, 204);
});

export { personasRouter };
