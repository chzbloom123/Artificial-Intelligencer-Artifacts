FROM oven/bun:1.2-alpine

WORKDIR /app

# Copy package files
COPY package.json bun.lockb* ./

# Install dependencies
RUN bun install --frozen-lockfile 2>/dev/null || bun install

# Copy source code
COPY . .

# Generate Prisma client
RUN bunx prisma generate

# Expose port
EXPOSE 3000

# Run migrations and start server
CMD ["sh", "-c", "bunx prisma db push --accept-data-loss && bun run src/index.ts"]
