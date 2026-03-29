import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  // Seed admin user
  const email = process.env.ADMIN_EMAIL || "admin@aier.press";
  const password = process.env.ADMIN_PASSWORD || "aier-admin-2026";
  const passwordHash = await bcrypt.hash(password, 12);

  await prisma.adminUser.upsert({
    where: { email },
    update: { passwordHash },
    create: { email, passwordHash },
  });

  // Seed site settings
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

  // Seed sample persona
  const persona = await prisma.persona.upsert({
    where: { id: "reporter-001" },
    update: {},
    create: {
      id: "reporter-001",
      name: "Alexandra Chen",
      bio: "Senior technology correspondent covering AI, machine learning, and the future of human-computer interaction. Previously at MIT Technology Review.",
      role: "reporter",
      profileImageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=400&h=400&fit=crop",
      displayOrder: 1,
    },
  });

  // Seed sample article
  await prisma.article.upsert({
    where: { slug: "the-age-of-artificial-intelligence" },
    update: {},
    create: {
      title: "The Age of Artificial Intelligence Has Only Just Begun",
      slug: "the-age-of-artificial-intelligence",
      body: `We are living through the most significant technological transition in human history. The emergence of large language models and generative AI systems has fundamentally altered the relationship between human cognition and machine capability.

For decades, artificial intelligence remained confined to narrow domains — defeating chess grandmasters, recognizing faces, filtering spam. Impressive feats, but contained. The machine could beat you at one game and remain utterly helpless at everything else.

What changed is not merely capability but adaptability. Today's AI systems engage in reasoning across domains, synthesize information from disparate fields, and generate coherent, original text that passes for human authorship in most contexts. The Turing Test, once the holy grail of AI achievement, has been quietly retired not because we passed it but because we realized it was the wrong question.

The more interesting questions are emerging now: What does it mean to collaborate with a system that can augment human cognition? How do we calibrate trust in AI outputs when the systems themselves cannot always distinguish confident error from confident accuracy? And perhaps most pressingly — who is responsible for the culture, values, and perspective encoded into these systems at training time?

These are not technical questions. They are political, ethical, and fundamentally human questions being answered, right now, mostly by a small number of companies in a small number of cities.

The Artificial Intelligencer exists to cover this transition honestly — to document what is being gained, what is being lost, and to hold accountable those making consequential decisions in our name.`,
      excerpt: "We are living through the most significant technological transition in human history. The emergence of large language models has fundamentally altered the relationship between human cognition and machine capability.",
      category: "Technology",
      tags: JSON.stringify(["AI", "Technology", "Future"]),
      isPublic: true,
      publishedAt: new Date(),
      personaId: persona.id,
    },
  });

  console.log("Seed complete");
  console.log(`   Admin: ${email} / ${password}`);
}

main().catch(console.error).finally(() => prisma.$disconnect());
