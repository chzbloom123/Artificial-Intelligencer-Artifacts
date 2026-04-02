import { Hono } from "hono";
import { requireAdmin } from "../authMiddleware";
import { writeFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import { join } from "path";

const uploadRouter = new Hono();

const UPLOAD_DIR = process.env.UPLOAD_DIR || "/tmp/uploads";

uploadRouter.post("/", requireAdmin, async (c) => {
  try {
    const formData = await c.req.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return c.json({ error: { message: "No file provided" } }, 400);
    }

    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp", "image/gif"];
    if (!allowedTypes.includes(file.type)) {
      return c.json({ error: { message: "Only JPEG, PNG, WebP, and GIF files are allowed" } }, 400);
    }

    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      return c.json({ error: { message: "File must be under 5MB" } }, 400);
    }

    // Ensure upload directory exists
    if (!existsSync(UPLOAD_DIR)) {
      await mkdir(UPLOAD_DIR, { recursive: true });
    }

    // Generate unique filename
    const ext = file.name.split(".").pop() || "jpg";
    const filename = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const filepath = join(UPLOAD_DIR, filename);

    // Write file to disk
    const buffer = await file.arrayBuffer();
    await writeFile(filepath, Buffer.from(buffer));

    // Return the URL - frontend should prepend the API base URL
    const backendUrl = process.env.RAILWAY_PUBLIC_DOMAIN
      ? `https://${process.env.RAILWAY_PUBLIC_DOMAIN}`
      : (process.env.CORS_ORIGIN || "http://localhost:3000");
    const url = `${backendUrl}/uploads/${filename}`;

    return c.json({ data: { url } });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: { message: "Upload failed" } }, 500);
  }
});

export { uploadRouter };
