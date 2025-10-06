import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

try {
  const totals = await prisma.question.groupBy({
    by: ["category"],
    _count: { category: true }
  });

  totals.sort((a, b) => a.category.localeCompare(b.category));

  const sum = await prisma.question.count();

  console.log("Category counts:");
  for (const row of totals) {
    console.log(`- ${row.category}: ${row._count.category}`);
  }
  console.log(`Total questions: ${sum}`);
} finally {
  await prisma.$disconnect();
}
