import { PrismaClient } from "@prisma/client";
const prisma = new PrismaClient();

async function main() {
  console.log("Seeding banners...");
  
  // Clear existing hero banners
  await prisma.banner.deleteMany({
    where: { position: "HERO_CAROUSEL" }
  });

  const banners = [
    {
      title: "Unbeatable Offers",
      imageUrl: "/images/banners/mega-sale.jpg",
      position: "HERO_CAROUSEL",
      isActive: true,
      order: 1,
      linkUrl: "/search"
    },
    {
      title: "Big Brands Bigger Savings",
      imageUrl: "/images/banners/big-brands-savings.jpg",
      position: "HERO_CAROUSEL",
      isActive: true,
      order: 2,
      linkUrl: "/search?categorySlug=electronics"
    },
    {
      title: "Fashion For Every You",
      imageUrl: "/images/banners/fashion-sale.jpg",
      position: "HERO_CAROUSEL",
      isActive: true,
      order: 3,
      linkUrl: "/search?categorySlug=fashion-apparel"
    },
    {
      title: "Mega Electronics Sale",
      imageUrl: "/images/banners/electronics-sale.jpg",
      position: "HERO_CAROUSEL",
      isActive: true,
      order: 4,
      linkUrl: "/search?categorySlug=computers-laptops"
    }
  ];

  for (const banner of banners) {
    await prisma.banner.create({ data: banner });
  }

  console.log("Seeded successfully");
}

main().catch(e => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
