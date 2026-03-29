import "@vibecodeapp/proxy"; // DO NOT REMOVE OTHERWISE VIBECODE PROXY WILL NOT WORK
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

async function ensureAdminUser() {
  const email = process.env.ADMIN_EMAIL || "admin@aier.press";
  const password = process.env.ADMIN_PASSWORD || "aier-admin-2026";
  const existing = await prisma.adminUser.findUnique({ where: { email } });
  if (!existing) {
    const passwordHash = await bcrypt.hash(password, 12);
    await prisma.adminUser.create({ data: { email, passwordHash } });
    console.log(`Admin user created: ${email}`);
  }
  // Ensure site settings exist
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

// CORS middleware - validates origin against allowlist
const allowed = [
  /^http:\/\/localhost(:\d+)?$/,
  /^http:\/\/127\.0\.0\.1(:\d+)?$/,
  /^https:\/\/.*\.dev\.vibecode\.run$/,
  /^https:\/\/.*\.vibecode\.run$/,
  /^https:\/\/.*\.vibecodeapp\.com$/,
  /^https:\/\/.*\.vibecode\.dev$/,
  /^https:\/\/vibecode\.dev$/,
];

app.use(
  "*",
  cors({
    origin: (origin) => (origin && allowed.some((re) => re.test(origin)) ? origin : null),
    allowMethods: ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Logging
app.use("*", logger());

// Health check endpoint
app.get("/api/health", (c) => c.json({ status: "ok", service: "aier-api" }));

// Routes
app.route("/api/auth", authRouter);
app.route("/api/articles", articlesRouter);
app.route("/api/personas", personasRouter);
app.route("/api/settings", settingsRouter);
app.route("/api/upload", uploadRouter);

const port = Number(process.env.PORT) || 3000;

export default {
  port,
  fetch: app.fetch,
};
