import { Context, Next } from "hono";
import jwt from "jsonwebtoken";
import { env } from "./env";

export async function requireAdmin(c: Context, next: Next) {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: { message: "Unauthorized", code: "UNAUTHORIZED" } }, 401);
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { adminId: string; email: string };
    c.set("adminId", decoded.adminId);
    c.set("adminEmail", decoded.email);
    await next();
  } catch {
    return c.json({ error: { message: "Invalid token", code: "INVALID_TOKEN" } }, 401);
  }
}
