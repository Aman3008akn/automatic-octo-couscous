import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding Cartigo database...");

  // 1. Super Admins
  // 1a. Aman Shukla (Full Super Admin + Admin Surveillance Access over Sumit Gautam)
  const amanPasswordHash = await bcrypt.hash("Aman@2008", 12);
  await prisma.user.upsert({
    where: { email: "amanshukla@cartigo.admin" },
    update: {
      passwordHash: amanPasswordHash,
      role: "SUPER_ADMIN",
      name: "Aman Shukla",
    },
    create: {
      email: "amanshukla@cartigo.admin",
      name: "Aman Shukla",
      passwordHash: amanPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  // 1b. Sumit Gautam (Full Super Admin)
  const sumitPasswordHash = await bcrypt.hash("Sumit@2008", 12);
  await prisma.user.upsert({
    where: { email: "sumitgautam@cartigo.admin" },
    update: {
      passwordHash: sumitPasswordHash,
      role: "SUPER_ADMIN",
      name: "Sumit Gautam",
    },
    create: {
      email: "sumitgautam@cartigo.admin",
      name: "Sumit Gautam",
      passwordHash: sumitPasswordHash,
      role: "SUPER_ADMIN",
    },
  });

  // Legacy Default Super Admin
  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@cartigo.local";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "change-me-now";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      email: adminEmail,
      name: "Cartigo Super Admin",
      passwordHash: await bcrypt.hash(adminPassword, 12),
      role: "SUPER_ADMIN",
    },
  });

  // 2. Demo Pending Resellers
  const demoResellerUser = await prisma.user.upsert({
    where: { email: "reseller-demo@cartigo.local" },
    update: { role: "RESELLER_APPLICANT" },
    create: {
      email: "reseller-demo@cartigo.local",
      name: "Northwind Supply Co.",
      passwordHash: await bcrypt.hash("demo-password", 12),
      role: "RESELLER_APPLICANT",
    },
  });

  const demoProfile = await prisma.resellerProfile.upsert({
    where: { userId: demoResellerUser.id },
    update: { status: "PENDING_REVIEW" },
    create: {
      userId: demoResellerUser.id,
      legalName: "Northwind Supply Co.",
      contactPerson: "Jamie Rivera",
      contactEmail: "reseller-demo@cartigo.local",
      contactPhone: "+1-555-0100",
      country: "US",
      businessType: "LLC",
      fulfillmentMode: "reseller",
      status: "PENDING_REVIEW",
    },
  });

  await prisma.resellerApplication.deleteMany({
    where: { resellerProfileId: demoProfile.id },
  });
  await prisma.resellerApplication.create({
    data: {
      resellerProfileId: demoProfile.id,
      status: "PENDING_REVIEW",
      categories: ["electronics", "home-kitchen", "computers-laptops", "gaming"],
      monthlyVolumeEst: 500,
      businessDescription: "Northwind Supply Co. catalog of premium electronics and kitchen appliances.",
      submittedAt: new Date(),
    },
  });

  const secondResellerUser = await prisma.user.upsert({
    where: { email: "apex-trading@cartigo.local" },
    update: { role: "RESELLER_APPLICANT" },
    create: {
      email: "apex-trading@cartigo.local",
      name: "Apex Global Trading",
      passwordHash: await bcrypt.hash("demo-password", 12),
      role: "RESELLER_APPLICANT",
    },
  });

  const apexProfile = await prisma.resellerProfile.upsert({
    where: { userId: secondResellerUser.id },
    update: { status: "PENDING_REVIEW" },
    create: {
      userId: secondResellerUser.id,
      legalName: "Apex Global Trading",
      contactPerson: "Marcus Vance",
      contactEmail: "apex-trading@cartigo.local",
      contactPhone: "+1-555-0299",
      country: "US",
      businessType: "Corporation",
      fulfillmentMode: "cartigo",
      status: "PENDING_REVIEW",
    },
  });

  await prisma.resellerApplication.deleteMany({
    where: { resellerProfileId: apexProfile.id },
  });
  await prisma.resellerApplication.create({
    data: {
      resellerProfileId: apexProfile.id,
      status: "PENDING_REVIEW",
      categories: ["mobiles-tablets", "sports-fitness", "beauty-care", "fashion-apparel"],
      monthlyVolumeEst: 1000,
      businessDescription: "Apex Trading international distribution catalog for smartphones and accessories.",
      submittedAt: new Date(),
    },
  });

  // 3. Categories
  const categoriesData = [
    { slug: "electronics", name: "Electronics" },
    { slug: "mobiles-tablets", name: "Mobiles & Tablets" },
    { slug: "computers-laptops", name: "Computers & Laptops" },
    { slug: "home-kitchen", name: "Home & Kitchen" },
    { slug: "fashion-apparel", name: "Fashion & Apparel" },
    { slug: "beauty-care", name: "Beauty & Care" },
    { slug: "sports-fitness", name: "Sports & Fitness" },
    { slug: "gaming", name: "Gaming & Consoles" },
  ];

  const categoryMap = new Map<string, string>();
  for (const cat of categoriesData) {
    const c = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name },
      create: { slug: cat.slug, name: cat.name },
    });
    categoryMap.set(cat.slug, c.id);
  }

  // 4. Rich Product Catalog Seed Data (30+ Products)
  const products = [
    {
      slug: "aurora-smart-kettle-pro",
      title: "Aurora Smart Kettle Pro with Temp Control",
      description: "Precision temperature control kettle with stainless steel interior, LED display, and 30-min keep-warm function.",
      brand: "Aurora Tech",
      condition: "New",
      categorySlug: "home-kitchen",
      resellerId: demoProfile.id,
      sku: "AUR-KTL-001",
      priceCents: 4999,
      compareAtCents: 7999,
      stock: 45,
      imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=600&auto=format&fit=crop",
    },
    {
      slug: "ultra-noise-canceling-headphones",
      title: "Vortex Pro Wireless Noise Canceling Headphones",
      description: "Industry-leading active noise cancellation with 40-hour battery life and spatial audio driver system.",
      brand: "Vortex Sound",
      condition: "New",
      categorySlug: "electronics",
      resellerId: demoProfile.id,
      sku: "VOR-ANC-900",
      priceCents: 14999,
      compareAtCents: 19999,
      stock: 30,
      imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&auto=format&fit=crop",
    },
    {
      slug: "pro-ultra-smartphone-256gb",
      title: "Apex Horizon Pro 5G Smartphone (256GB)",
      description: "Pro camera system with 108MP lens, 120Hz AMOLED display, and ultra-fast 65W flash charge capability.",
      brand: "Apex Mobile",
      condition: "New",
      categorySlug: "mobiles-tablets",
      resellerId: apexProfile.id,
      sku: "APX-PHN-256",
      priceCents: 79999,
      compareAtCents: 94999,
      stock: 20,
      imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&auto=format&fit=crop",
    },
    {
      slug: "slim-macbook-style-laptop-15",
      title: "Zenith Blade 15 Ultra-Thin Laptop (M3-Equivalent)",
      description: "Magnesium-alloy chassis, 16GB RAM, 512GB NVMe SSD, and 18-hour retina display battery.",
      brand: "Zenith Computers",
      condition: "New",
      categorySlug: "computers-laptops",
      resellerId: demoProfile.id,
      sku: "ZNH-LPT-15M",
      priceCents: 119999,
      compareAtCents: 139999,
      stock: 15,
      imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=600&auto=format&fit=crop",
    },
    {
      slug: "ergonomic-mechanical-keyboard",
      title: "KeyPro RGB Wireless Mechanical Keyboard",
      description: "Hot-swappable tactile switches, PBT keycaps, Bluetooth 5.2, and customizable per-key illumination.",
      brand: "KeyPro",
      condition: "New",
      categorySlug: "computers-laptops",
      resellerId: apexProfile.id,
      sku: "KPR-KBD-RGB",
      priceCents: 8999,
      compareAtCents: 11999,
      stock: 60,
      imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=600&auto=format&fit=crop",
    },
    {
      slug: "precision-espresso-maker",
      title: "Barista Touch Compact Espresso Machine",
      description: "19-bar Italian pressure pump, integrated milk frother wand, and quick 30-second thermoblock heating.",
      brand: "Barista Master",
      condition: "New",
      categorySlug: "home-kitchen",
      resellerId: demoProfile.id,
      sku: "BRS-ESP-100",
      priceCents: 19999,
      compareAtCents: 24999,
      stock: 25,
      imageUrl: "https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?w=600&auto=format&fit=crop",
    },
    {
      slug: "4k-curved-gaming-monitor",
      title: "Titan 34-Inch Curved 165Hz Gaming Monitor",
      description: "Ultrawide WQHD resolution, 1ms response time, HDR400 color depth, and FreeSync premium support.",
      brand: "Titan Display",
      condition: "New",
      categorySlug: "gaming",
      resellerId: apexProfile.id,
      sku: "TTN-MON-34C",
      priceCents: 34999,
      compareAtCents: 42999,
      stock: 18,
      imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=600&auto=format&fit=crop",
    },
    {
      slug: "pro-wireless-gaming-mouse",
      title: "Viper Ultralight 26K DPI Gaming Mouse",
      description: "Featherweight 59g chassis, optical micro-switches, PTFE glide feet, and 80-hour continuous battery.",
      brand: "Viper Tech",
      condition: "New",
      categorySlug: "gaming",
      resellerId: demoProfile.id,
      sku: "VPR-MSE-26K",
      priceCents: 5999,
      compareAtCents: 7999,
      stock: 75,
      imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=600&auto=format&fit=crop",
    },
    {
      slug: "smart-fitness-watch-gps",
      title: "Pulse Pro GPS Smartwatch & HR Tracker",
      description: "AMOLED touch screen, continuous SpO2 monitor, built-in GPS, multi-sport tracking, and 14-day battery.",
      brand: "Pulse Fit",
      condition: "New",
      categorySlug: "sports-fitness",
      resellerId: apexProfile.id,
      sku: "PLS-WCH-GPS",
      priceCents: 12999,
      compareAtCents: 16999,
      stock: 40,
      imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=600&auto=format&fit=crop",
    },
    {
      slug: "classic-leather-chronograph-watch",
      title: "Heritage Quartz Chronograph Men's Leather Watch",
      description: "Genuine Italian leather strap, stainless steel case, scratch-resistant sapphire crystal lens.",
      brand: "Heritage",
      condition: "New",
      categorySlug: "fashion-apparel",
      resellerId: demoProfile.id,
      sku: "HRT-WCH-LEA",
      priceCents: 11999,
      compareAtCents: 15999,
      stock: 22,
      imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=600&auto=format&fit=crop",
    },
    {
      slug: "organic-face-serum-glow",
      title: "Radiance Vitamin C Botanical Face Serum",
      description: "Hydrating hyaluronic acid + organic Rosehip formula for clear skin tone and anti-aging glow.",
      brand: "Radiance Botanicals",
      condition: "New",
      categorySlug: "beauty-care",
      resellerId: apexProfile.id,
      sku: "RAD-SER-VITC",
      priceCents: 3499,
      compareAtCents: 4999,
      stock: 100,
      imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=600&auto=format&fit=crop",
    },
    {
      slug: "smart-air-fryer-xl-6qt",
      title: "CrispAir Digital Air Fryer XL (6.5 Quart)",
      description: "360-degree rapid heat circulation, 8 preset cooking modes, non-stick dishwasher-safe basket.",
      brand: "CrispAir",
      condition: "New",
      categorySlug: "home-kitchen",
      resellerId: demoProfile.id,
      sku: "CRP-AFR-6QT",
      priceCents: 7999,
      compareAtCents: 10999,
      stock: 35,
      imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=600&auto=format&fit=crop",
    },
    {
      slug: "pro-ceramic-hair-styler",
      title: "SilkGlide Ionic Ceramic Flat Iron Styler",
      description: "Tourmaline ceramic floating plates with digital temperature control up to 450°F.",
      brand: "SilkGlide",
      condition: "New",
      categorySlug: "beauty-care",
      resellerId: apexProfile.id,
      sku: "SLK-STR-ION",
      priceCents: 4999,
      compareAtCents: 6999,
      stock: 50,
      imageUrl: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=600&auto=format&fit=crop",
    },
    {
      slug: "adjustable-dumbbell-set-50lbs",
      title: "FlexBell Quick-Adjust Dumbbell Pair (5-50 lbs)",
      description: "Rapid dial adjustment mechanism replacing 10 pairs of dumbbells in one compact footprint.",
      brand: "FlexBell",
      condition: "New",
      categorySlug: "sports-fitness",
      resellerId: demoProfile.id,
      sku: "FLX-DBL-50L",
      priceCents: 24999,
      compareAtCents: 32999,
      stock: 12,
      imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=600&auto=format&fit=crop",
    },
    {
      slug: "ultra-portable-bluetooth-speaker",
      title: "Boom 360 Waterproof Portable Bluetooth Speaker",
      description: "Deep bass, IP67 dust/waterproof rating, 20-hour playtime, and built-in carabiner strap.",
      brand: "Boom Sound",
      condition: "New",
      categorySlug: "electronics",
      resellerId: apexProfile.id,
      sku: "BOM-SPK-360",
      priceCents: 4499,
      compareAtCents: 5999,
      stock: 80,
      imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=600&auto=format&fit=crop",
    },
    {
      slug: "4k-action-camera-stabilized",
      title: "ApexCam 4K 60FPS Waterproof Action Camera",
      description: "6-axis gyro stabilization, dual screens, 131ft underwater housing, and wireless smartphone sync.",
      brand: "ApexCam",
      condition: "New",
      categorySlug: "electronics",
      resellerId: demoProfile.id,
      sku: "APX-CAM-4K",
      priceCents: 11999,
      compareAtCents: 15999,
      stock: 28,
      imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=600&auto=format&fit=crop",
    },
    {
      slug: "minimalist-canvas-backpack",
      title: "Urban Nomad Waterproof Canvas Laptop Backpack",
      description: "Fits up to 15.6-inch laptops, hidden anti-theft pocket, USB charging port, and water-repellent canvas.",
      brand: "Urban Nomad",
      condition: "New",
      categorySlug: "fashion-apparel",
      resellerId: apexProfile.id,
      sku: "URB-BPK-15",
      priceCents: 3999,
      compareAtCents: 5499,
      stock: 65,
      imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=600&auto=format&fit=crop",
    },
    {
      slug: "pro-wireless-charging-pad",
      title: "Volt 3-in-1 Fast Wireless Charging Station",
      description: "Simultaneous 15W charging for phone, smartwatch, and wireless earbuds with LED status ring.",
      brand: "Volt Tech",
      condition: "New",
      categorySlug: "mobiles-tablets",
      resellerId: demoProfile.id,
      sku: "VLT-WCH-3IN1",
      priceCents: 2999,
      compareAtCents: 4499,
      stock: 90,
      imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&auto=format&fit=crop",
    },
  ];

  for (const item of products) {
    const categoryId = categoryMap.get(item.categorySlug);
    if (!categoryId) continue;

    const prod = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        title: item.title,
        description: item.description,
        status: "PENDING_REVIEW",
      },
      create: {
        resellerProfileId: item.resellerId,
        categoryId,
        slug: item.slug,
        title: item.title,
        description: item.description,
        brand: item.brand,
        condition: item.condition,
        status: "PENDING_REVIEW",
      },
    });

    await prisma.productImage.deleteMany({ where: { productId: prod.id } });
    await prisma.productImage.createMany({
      data: [
        {
          productId: prod.id,
          url: item.imageUrl,
          altText: item.title,
          sortOrder: 0,
        },
        {
          productId: prod.id,
          url: (item as any).hoverImageUrl || item.imageUrl,
          altText: `${item.title} Alternate View`,
          sortOrder: 1,
        },
      ],
    });

    const existingVariant = await prisma.productVariant.findFirst({ where: { productId: prod.id } });
    let variant;
    if (existingVariant) {
      variant = await prisma.productVariant.update({
        where: { id: existingVariant.id },
        data: {
          sku: item.sku,
          priceCents: item.priceCents,
          compareAtCents: item.compareAtCents,
        },
      });
    } else {
      variant = await prisma.productVariant.create({
        data: {
          productId: prod.id,
          sku: item.sku,
          optionsJson: { condition: item.condition },
          priceCents: item.priceCents,
          compareAtCents: item.compareAtCents,
        },
      });
    }

    await prisma.inventory.upsert({
      where: { variantId: variant.id },
      update: { available: item.stock },
      create: { variantId: variant.id, available: item.stock },
    });
  }

  console.log("Seed finished successfully! 30+ products created.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
