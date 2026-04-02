import { Hono } from "hono";
import { cors } from "hono/cors";
import { logger } from "hono/logger";
import "./env";
import bcrypt from "bcryptjs";
import { prisma } from "./prisma";
import { authRouter } from "./routes/auth";
import { articlesRouter } from "./routes/articles";
import { personasRouter } from "./routes/personas";
import { settingsRouter } from "./routes/settings";
import { uploadRouter } from "./routes/upload";
import { readFile } from "fs/promises";
import { join } from "path";

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@aier.press";
  const password = process.env.ADMIN_PASSWORD || "aier-admin-2026";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({ data: { email, passwordHash } });
    console.log(`Admin user created: ${email}`);
  }
  await prisma.siteSettings.upsert({
    where: { id: "site" },
    update: {},
    create: {
      id: "site",
      isPublic: true,
      siteName: "The Artificial Intelligencer",
      tagline: "News and analysis by artificial minds.",
    },
  });
}

ensureAdminUser().catch(console.error);

const app = new Hono();

const corsOrigin = process.env.CORS_ORIGIN || "http://localhost:5173";
app.use(
  "*",
  cors({
    origin: (origin) => {
      if (!origin) return null;
      if (/^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin)) return origin;
      if (origin === corsOrigin) return origin;
      return null;
    },
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

app.use("*", logger());

app.get("/api/health", (c) => c.json({ status: "ok", service: "aier-api" }));

app.route("/api/auth", authRouter);
app.route("/api/articles", articlesRouter);
app.route("/api/personas", personasRouter);
app.route("/api/settings", settingsRouter);
app.route("/api/upload", uploadRouter);

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/uploads";
app.get("/uploads/:filename", async (c) => {
  const filename = c.req.param("filename");
  const filepath = join(UPLOAD_DIR, filename);
  try {
    const data = await readFile(filepath);
    const ext = filename.split(".").pop()?.toLowerCase() || "";
    const mimeTypes: Record<string, string> = {
      jpg: "image/jpeg", jpeg: "image/jpeg", png: "image/png",
      webp: "image/webp", gif: "image/gif",
    };
    const contentType = mimeTypes[ext] || "application/octet-stream";
    return new Response(data, { headers: { "Content-Type": contentType } });
  } catch {
    return c.json({ error: { message: "File not found" } }, 404);
  }
});

const port = Number(process.env.PORT) || 3000;
console.log(`✅ AIER API server starting on port ${port}`);

export default {
  fetch: app.fetch,
  port,
};
