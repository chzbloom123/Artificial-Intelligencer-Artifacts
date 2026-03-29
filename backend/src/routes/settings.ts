import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { prisma } from "../prisma";
import { requireAdmin } from "../authMiddleware";
import { UpdateSiteSettingsSchema } from "../types";

const settingsRouter = new Hono();

// GET /api/settings — public
settingsRouter.get("/", async (c) => {
  let settings = await prisma.siteSettings.findUnique({ where: { id: "site" } });
  if (!settings) {
    settings = await prisma.siteSettings.create({
      data: { id: "site" },
    });
  }
  return c.json({ data: settings });
});

// PUT /api/settings (admin)
settingsRouter.put("/", requireAdmin, zValidator("json", UpdateSiteSettingsSchema), async (c) => {
  const data = c.req.valid("json");
  const settings = await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: data,
    create: { id: "site", ...data },
  });
  return c.json({ data: settings });
});

export { settingsRouter };
