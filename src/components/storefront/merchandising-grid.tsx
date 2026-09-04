import Link from "next/link";
import { StorefrontImage } from "@/components/ui/storefront-image";

type CampaignCard = {
  id: string;
  title: string;
  badge?: string;
  ctaText: string;
  ctaUrl: string;
  items: {
    name: string;
    imageUrl: string;
    price: string;
    slug: string;
  }[];
};

const CAMPAIGN_CARDS: CampaignCard[] = [
  {
    id: "electronics-deals",
    title: "Up to 40% Off Electronics",
    badge: "Limited Event",
    ctaText: "See All Tech Deals",
    ctaUrl: "/search?categorySlug=electronics",
    items: [
      {
        name: "ANC Headphones",
        imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400&auto=format&fit=crop",
        price: "₹14,999",
        slug: "ultra-noise-canceling-headphones",
      },
      {
        name: "Bluetooth Speaker",
        imageUrl: "https://images.unsplash.com/photo-1608043152269-423dbba4e7e1?w=400&auto=format&fit=crop",
        price: "₹3,499",
        slug: "ultra-portable-bluetooth-speaker",
      },
      {
        name: "4K Action Camera",
        imageUrl: "https://images.unsplash.com/photo-1526170375885-4d8ecf77b99f?w=400&auto=format&fit=crop",
        price: "₹11,999",
        slug: "4k-action-camera-stabilized",
      },
      {
        name: "Wireless Charging Pad",
        imageUrl: "https://images.unsplash.com/photo-1583394838336-acd977736f90?w=400&auto=format&fit=crop",
        price: "₹2,499",
        slug: "pro-wireless-charging-pad",
      },
    ],
  },
  {
    id: "home-kitchen-deals",
    title: "Home & Kitchen Essentials",
    badge: "Best Sellers",
    ctaText: "Explore Home Deals",
    ctaUrl: "/search?categorySlug=home-kitchen",
    items: [
      {
        name: "Smart Kettle Pro",
        imageUrl: "https://images.unsplash.com/photo-1570222094114-d054a817e56b?w=400&auto=format&fit=crop",
        price: "₹4,999",
        slug: "aurora-smart-kettle-pro",
      },
      {
        name: "Espresso Maker",
        imageUrl: "https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?w=400&auto=format&fit=crop",
        price: "₹19,999",
        slug: "precision-espresso-maker",
      },
      {
        name: "Digital Air Fryer XL",
        imageUrl: "https://images.unsplash.com/photo-1584269600464-37b1b58a9fe7?w=400&auto=format&fit=crop",
        price: "₹7,999",
        slug: "smart-air-fryer-xl-6qt",
      },
      {
        name: "Ceramic Cookware",
        imageUrl: "https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=400&auto=format&fit=crop",
        price: "₹8,999",
        slug: "home-kitchen",
      },
    ],
  },
  {
    id: "fashion-deals",
    title: "Trending Fashion & Watches",
    badge: "Up to 50% Off",
    ctaText: "Shop Style Picks",
    ctaUrl: "/search?categorySlug=fashion-apparel",
    items: [
      {
        name: "Quartz Chronograph",
        imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=400&auto=format&fit=crop",
        price: "₹11,999",
        slug: "classic-leather-chronograph-watch",
      },
      {
        name: "Canvas Backpack",
        imageUrl: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=400&auto=format&fit=crop",
        price: "₹3,999",
        slug: "minimalist-canvas-backpack",
      },
      {
        name: "Smart Watch GPS",
        imageUrl: "https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=400&auto=format&fit=crop",
        price: "₹12,999",
        slug: "smart-fitness-watch-gps",
      },
      {
        name: "Luxury Sunglasses",
        imageUrl: "https://images.unsplash.com/photo-1511499767150-a48a237f0083?w=400&auto=format&fit=crop",
        price: "₹5,999",
        slug: "fashion-apparel",
      },
    ],
  },
  {
    id: "gaming-deals",
    title: "Gaming & Workstation Gear",
    badge: "Top Rated",
    ctaText: "Shop Gaming Station",
    ctaUrl: "/search?categorySlug=gaming",
    items: [
      {
        name: "34\" Curved Monitor",
        imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=400&auto=format&fit=crop",
        price: "₹34,999",
        slug: "4k-curved-gaming-monitor",
      },
      {
        name: "Mechanical Keyboard",
        imageUrl: "https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=400&auto=format&fit=crop",
        price: "₹8,999",
        slug: "ergonomic-mechanical-keyboard",
      },
      {
        name: "Ultralight Mouse",
        imageUrl: "https://images.unsplash.com/photo-1615663245857-ac93bb7c39e7?w=400&auto=format&fit=crop",
        price: "₹5,999",
        slug: "gaming",
      },
      {
        name: "Zenith Laptop 15\"",
        imageUrl: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?w=400&auto=format&fit=crop",
        price: "₹89,999",
        slug: "zenith-pro-laptop-15",
      },
    ],
  },
];

export function MerchandisingGrid() {
  return (
    <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
      {CAMPAIGN_CARDS.map((card) => (
        <div
          key={card.id}
          className="flex flex-col justify-between rounded-xl border border-line bg-white p-5 shadow-[0_2px_8px_rgba(18,23,43,0.04)] hover:shadow-[0_8px_20px_rgba(18,23,43,0.06)] transition-all"
        >
          <div>
            <div className="flex items-center justify-between gap-2 mb-3">
              <h3 className="font-display text-base font-bold text-ink leading-tight">
                {card.title}
              </h3>
              {card.badge && (
                <span className="shrink-0 rounded-full bg-amber-500/15 border border-amber-500/30 px-2.5 py-0.5 text-[10px] font-mono font-bold text-amber-600 uppercase">
                  {card.badge}
                </span>
              )}
            </div>

            {/* 4 Micro Product Thumbnails Grid */}
            <div className="grid grid-cols-2 gap-2.5 mb-4">
              {card.items.map((item, idx) => (
                <Link
                  key={idx}
                  href={`/products/${item.slug}`}
                  className="group relative flex flex-col items-center justify-between rounded-lg border border-line/60 bg-navy-50/20 p-2 text-center hover:border-navy-400 hover:bg-white transition-all"
                >
                  <div className="relative aspect-square w-full overflow-hidden mb-1.5">
                    <StorefrontImage
                      src={item.imageUrl}
                      alt={item.name}
                      fill
                      sizes="120px"
                      className="object-contain p-1 group-hover:scale-105 transition-transform"
                    />
                  </div>
                  <span className="text-[11px] font-medium text-ink line-clamp-1 group-hover:text-navy-600 transition-colors">
                    {item.name}
                  </span>
                  <span className="text-[10px] font-bold text-navy-900 font-mono">
                    {item.price}
                  </span>
                </Link>
              ))}
            </div>
          </div>

          <Link
            href={card.ctaUrl}
            className="text-xs font-bold text-navy-900 hover:text-amber-600 flex items-center gap-1 transition-colors pt-1"
          >
            <span>{card.ctaText}</span>
            <span>→</span>
          </Link>
        </div>
      ))}
    </section>
  );
}
