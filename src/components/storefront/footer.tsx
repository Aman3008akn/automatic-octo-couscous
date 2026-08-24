import Link from "next/link";
import { CartigoLogoIcon } from "@/components/ui/cartigo-logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-paper pt-12 pb-8 text-xs text-navy-600">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 pb-10 border-b border-line">
          {/* Col 1: Get to Know Cartigo */}
          <div className="space-y-3">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider">Get to Know Us</h3>
            <ul className="space-y-2 font-medium">
              <li><Link href="#" className="hover:text-ink">About Cartigo</Link></li>
              <li><Link href="#" className="hover:text-ink">Marketplace Standards</Link></li>
              <li><Link href="#" className="hover:text-ink">Careers & Culture</Link></li>
              <li><Link href="#" className="hover:text-ink">Press Releases</Link></li>
            </ul>
          </div>

          {/* Col 2: Shop Marketplace */}
          <div className="space-y-3">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider">Shop Marketplace</h3>
            <ul className="space-y-2 font-medium">
              <li><Link href="/search?categorySlug=electronics" className="hover:text-ink">Electronics</Link></li>
              <li><Link href="/search?categorySlug=mobiles-tablets" className="hover:text-ink">Mobiles & Tablets</Link></li>
              <li><Link href="/search?categorySlug=computers-laptops" className="hover:text-ink">Computers & Laptops</Link></li>
              <li><Link href="/search?categorySlug=home-kitchen" className="hover:text-ink">Home & Kitchen</Link></li>
              <li><Link href="/search" className="hover:text-ink">Today's Deals</Link></li>
            </ul>
          </div>

          {/* Col 3: Customer Service */}
          <div className="space-y-3">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider">Customer Service</h3>
            <ul className="space-y-2 font-medium">
              <li><Link href="/orders" className="hover:text-ink">Track Your Orders</Link></li>
              <li><Link href="#" className="hover:text-ink">Shipping Rates & Policies</Link></li>
              <li><Link href="#" className="hover:text-ink">Returns & Replacements</Link></li>
              <li><Link href="#" className="hover:text-ink">Help Center & FAQ</Link></li>
              <li className="pt-3">
                <span className="text-xs font-bold text-ink mb-1.5 block uppercase tracking-wide">WhatsApp Support:</span>
                <a href="https://wa.me/918826817677" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-green-600 transition-colors">
                  <span className="text-green-500 text-sm">💬</span> +91 88268 17677
                </a>
                <a href="https://wa.me/918840108332" target="_blank" rel="noreferrer" className="flex items-center gap-1.5 hover:text-green-600 transition-colors mt-1">
                  <span className="text-green-500 text-sm">💬</span> +91 88401 08332
                </a>
              </li>
            </ul>
          </div>

          {/* Col 4: Sell on Cartigo */}
          <div className="space-y-3">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider">Sell on Cartigo</h3>
            <ul className="space-y-2 font-medium">
              <li><Link href="/reseller" className="hover:text-ink font-bold text-amber-600">Become a Partner Reseller</Link></li>
              <li><Link href="/reseller/apply" className="hover:text-ink">Submit Application</Link></li>
              <li><Link href="/reseller/status" className="hover:text-ink">Application Status Tracker</Link></li>
              <li><Link href="/reseller/dashboard" className="hover:text-ink">Reseller Dashboard</Link></li>
            </ul>
          </div>

          {/* Col 5: Legal & Security */}
          <div className="space-y-3">
            <h3 className="font-bold text-ink text-sm uppercase tracking-wider">Legal & Trust</h3>
            <ul className="space-y-2 font-medium">
              <li><Link href="#" className="hover:text-ink">Privacy Policy</Link></li>
              <li><Link href="#" className="hover:text-ink">Terms of Use</Link></li>
              <li><Link href="#" className="hover:text-ink">Buyer Protection Policy</Link></li>
              <li><Link href="#" className="hover:text-ink">Prohibited Products Policy</Link></li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2.5">
            <CartigoLogoIcon className="h-7 w-7" />
            <span className="font-display font-bold text-base text-ink">Cartigo</span>
            <span className="text-navy-400">© {new Date().getFullYear()} Cartigo Marketplace Inc. All rights reserved.</span>
          </div>

          <div className="flex items-center gap-6 font-semibold text-navy-600">
            <span>🛡️ Verified Resellers Only</span>
            <span>💳 Encrypted Payments</span>
            <span>📦 Fast Shipping</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
