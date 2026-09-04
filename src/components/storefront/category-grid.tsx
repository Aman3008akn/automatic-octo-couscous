import Link from "next/link";
import Image from "next/image";

const CATEGORIES = [
  {
    name: "Electronics",
    slug: "electronics",
    imageUrl: "https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop",
  },
  {
    name: "Mobiles & Tablets",
    slug: "mobiles-tablets",
    imageUrl: "https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=500&auto=format&fit=crop",
  },
  {
    name: "Computers & Laptops",
    slug: "computers-laptops",
    imageUrl: "https://images.unsplash.com/photo-1496181133206-80ce9b88a853?w=500&auto=format&fit=crop",
  },
  {
    name: "Home & Kitchen",
    slug: "home-kitchen",
    imageUrl: "https://images.unsplash.com/photo-1517668808822-9eaa03afd2af?w=500&auto=format&fit=crop",
  },
  {
    name: "Fashion & Apparel",
    slug: "fashion-apparel",
    imageUrl: "https://images.unsplash.com/photo-1524805444758-089113d48a6d?w=500&auto=format&fit=crop",
  },
  {
    name: "Beauty & Care",
    slug: "beauty-care",
    imageUrl: "https://images.unsplash.com/photo-1620916566398-39f1143ab7be?w=500&auto=format&fit=crop",
  },
  {
    name: "Sports & Fitness",
    slug: "sports-fitness",
    imageUrl: "https://images.unsplash.com/photo-1584735935682-2f2b69dff9d2?w=500&auto=format&fit=crop",
  },
  {
    name: "Gaming & Consoles",
    slug: "gaming",
    imageUrl: "https://images.unsplash.com/photo-1527443224154-c4a3942d3acf?w=500&auto=format&fit=crop",
  },
];

export function CategoryGrid() {
  return (
    <section className="my-8">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-xl sm:text-2xl font-display font-bold text-ink">Shop Popular Categories</h2>
          <p className="text-xs text-navy-600 mt-0.5">Explore authentic products from verified marketplace partners</p>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3 sm:gap-4">
        {CATEGORIES.map((cat) => (
          <Link
            key={cat.slug}
            href={`/search?categorySlug=${cat.slug}`}
            className="group relative flex flex-col items-center overflow-hidden rounded-xl border border-line bg-white p-3.5 text-center transition-all duration-200 hover:border-navy-400 hover:shadow-[0_4px_12px_rgba(18,23,43,0.06)]"
          >
            <div className="relative h-16 w-16 overflow-hidden rounded-lg bg-navy-50 mb-2.5 border border-line/60">
              <Image
                src={cat.imageUrl}
                alt={cat.name}
                fill
                sizes="64px"
                className="object-cover group-hover:scale-105 transition-transform duration-300"
              />
            </div>
            <span className="text-xs font-semibold text-ink group-hover:text-navy-900 line-clamp-2 leading-tight">
              {cat.name}
            </span>
          </Link>
        ))}
      </div>
    </section>
  );
}
