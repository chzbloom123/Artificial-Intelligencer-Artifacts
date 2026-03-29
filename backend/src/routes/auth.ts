import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { prisma } from "../prisma";
import { env } from "../env";
import { LoginSchema } from "../types";

const authRouter = new Hono();

authRouter.post("/login", zValidator("json", LoginSchema), async (c) => {
  const { email, password } = c.req.valid("json");

  const admin = await prisma.adminUser.findUnique({ where: { email } });
  if (!admin) {
    return c.json({ error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" } }, 401);
  }

  const valid = await bcrypt.compare(password, admin.passwordHash);
  if (!valid) {
    return c.json({ error: { message: "Invalid credentials", code: "INVALID_CREDENTIALS" } }, 401);
  }

  const token = jwt.sign(
    { adminId: admin.id, email: admin.email },
    env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  return c.json({ data: { token, email: admin.email } });
});

authRouter.get("/me", async (c) => {
  const authHeader = c.req.header("Authorization");
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return c.json({ error: { message: "Unauthorized" } }, 401);
  }
  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as { adminId: string; email: string };
    return c.json({ data: { adminId: decoded.adminId, email: decoded.email } });
  } catch {
    return c.json({ error: { message: "Invalid token" } }, 401);
  }
});

export { authRouter };
