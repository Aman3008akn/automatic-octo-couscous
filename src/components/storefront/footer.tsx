import Link from "next/link";
import { CartigoLogoIcon } from "@/components/ui/cartigo-logo";

export function Footer() {
  return (
    <footer className="border-t border-line bg-navy-900 text-navy-100">
      {/* Newsletter Strip */}
      <div className="bg-navy-800 border-b border-navy-700 py-8">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row items-center justify-between gap-6">
          <div className="space-y-1 text-center md:text-left">
            <h3 className="text-lg font-bold text-white">Subscribe to Cartigo Insider</h3>
            <p className="text-sm text-navy-300">Get early access to drops, exclusive discounts, and partner offers.</p>
          </div>
          <div className="flex w-full md:w-auto max-w-md">
            <input 
              type="email" 
              placeholder="Enter your email address" 
              className="w-full px-4 py-3 rounded-l-md text-ink outline-none border-none text-sm"
            />
            <button className="bg-amber-500 hover:bg-amber-600 text-navy-900 font-bold px-6 py-3 rounded-r-md transition-colors text-sm">
              Subscribe
            </button>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 pt-12 pb-8">
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pb-10 border-b border-navy-700">
          {/* Col 1: Brand Info */}
          <div className="col-span-2 lg:col-span-1 space-y-4">
            <div className="flex items-center gap-2">
              <CartigoLogoIcon className="h-8 w-8 text-amber-500" />
              <span className="font-display font-bold text-xl text-white">Cartigo</span>
            </div>
            <p className="text-xs text-navy-300 leading-relaxed">
              The premier marketplace for verified sellers and authentic products. Shop confidently with our buyer protection guarantee.
            </p>
          </div>

          {/* Col 2: Get to Know Us */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Get to Know Us</h3>
            <ul className="space-y-2.5 text-xs text-navy-300 font-medium">
              <li><Link href="#" className="hover:text-amber-400 transition-colors">About Cartigo</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Marketplace Standards</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Careers & Culture</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Press Releases</Link></li>
            </ul>
          </div>

          {/* Col 3: Make Money with Us */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Make Money with Us</h3>
            <ul className="space-y-2.5 text-xs text-navy-300 font-medium">
              <li><Link href="/reseller" className="hover:text-amber-400 transition-colors">Sell on Cartigo</Link></li>
              <li><Link href="/reseller/apply" className="hover:text-amber-400 transition-colors">Become an Affiliate</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Fulfillment by Cartigo</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Advertise Your Products</Link></li>
            </ul>
          </div>

          {/* Col 4: Let Us Help You */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Let Us Help You</h3>
            <ul className="space-y-2.5 text-xs text-navy-300 font-medium">
              <li><Link href="/orders" className="hover:text-amber-400 transition-colors">Your Account</Link></li>
              <li><Link href="/orders" className="hover:text-amber-400 transition-colors">Returns Center</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">100% Purchase Protection</Link></li>
              <li><Link href="#" className="hover:text-amber-400 transition-colors">Help & Support</Link></li>
            </ul>
          </div>

          {/* Col 5: Support */}
          <div className="space-y-4">
            <h3 className="font-bold text-white text-sm uppercase tracking-wider">Contact Us</h3>
            <ul className="space-y-2.5 text-xs text-navy-300 font-medium">
              <li className="flex items-center gap-2">
                <span className="text-amber-500">✉</span>
                <a href="mailto:admindesk@cartigo.com" className="hover:text-white transition-colors">
                  admindesk@cartigo.com
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">☏</span>
                <a href="tel:+918826817677" className="hover:text-white transition-colors">
                  +91 8826817677
                </a>
              </li>
              <li className="flex items-center gap-2">
                <span className="text-amber-500">☏</span>
                <a href="tel:+918840108332" className="hover:text-white transition-colors">
                  +91 8840108332
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom copyright row */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-navy-400">
          <p>© {new Date().getFullYear()} Cartigo Marketplace Inc. All rights reserved.</p>

          <div className="flex items-center gap-4">
            <Link href="#" className="hover:text-white transition-colors">Privacy Policy</Link>
            <Link href="#" className="hover:text-white transition-colors">Terms of Service</Link>
            <Link href="#" className="hover:text-white transition-colors">Seller Agreement</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
