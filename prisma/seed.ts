import { prisma } from "../src/infra/db/prisma";
import { randomUUID } from "node:crypto";
import * as bcrypt from "bcryptjs";

async function main() {
  console.log("🌱 Seeding database...");

  // 샘플 사용자 생성
  const passwordHash = await bcrypt.hash("password123", 10);
  const user = await prisma.user.upsert({
    where: { email: "test@example.com" },
    update: {},
    create: {
      id: randomUUID(),
      email: "test@example.com",
      displayName: "Test User",
      passwordHash,
    },
  });

  console.log(`✅ Created user: ${user.email}`);

  // 샘플 게시글 생성
  const post = await prisma.post.create({
    data: {
      id: randomUUID(),
      authorId: user.id,
      title: "Welcome to Hexagonal Architecture",
      content: "This is a sample post created by the seed script.",
      published: true,
    },
  });

  console.log(`✅ Created post: ${post.title}`);

  console.log("✨ Seeding completed!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

