import { Hono } from "hono";
import { requireAdmin } from "../authMiddleware";
import { createVibecodeSDK } from "@vibecodeapp/backend-sdk";

const uploadRouter = new Hono();
const vibecode = createVibecodeSDK();

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

    const result = await vibecode.storage.upload(file);

    return c.json({ data: { url: result.url } });
  } catch (error) {
    console.error("Upload error:", error);
    return c.json({ error: { message: "Upload failed" } }, 500);
  }
});

export { uploadRouter };
