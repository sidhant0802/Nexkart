// src/customer/components/Footer/Footer.tsx

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  MapPin, Phone, Mail, Zap, ArrowRight,
  Shield, Truck, RefreshCw, Headphones,
  ChevronDown, CheckCircle,
} from "lucide-react";

const footerSections = [
  {
    title: "Company",
    links: [
      { label: "About Nexkart", href: "/about" },
      { label: "Careers", href: "/careers", badge: "Hiring!" },
      { label: "Press & Media", href: "/press" },
      { label: "Blog", href: "/blog" },
    ],
  },
  {
    title: "Support",
    links: [
      { label: "Help Center", href: "/help" },
      { label: "Track Order", href: "/track" },
      { label: "Returns", href: "/returns" },
      { label: "Contact Us", href: "/contact" },
    ],
  },
  {
    title: "Sell",
    links: [
      { label: "Start Selling", href: "/become-seller", badge: "Free!" },
      { label: "Seller Portal", href: "/seller" },
      { label: "Guidelines", href: "/guidelines" },
      { label: "Commission Rates", href: "/commissions" },
    ],
  },
  {
    title: "Legal",
    links: [
      { label: "Privacy Policy", href: "/privacy" },
      { label: "Terms of Service", href: "/terms" },
      { label: "Cookie Policy", href: "/cookies" },
      { label: "Sitemap", href: "/sitemap" },
    ],
  },
];

// ✅ Using emoji instead of missing icons
const socials = [
  { emoji: "f", href: "#", label: "Facebook", bg: "#1877f2" },
  { emoji: "𝕏", href: "#", label: "Twitter", bg: "#000000" },
  { emoji: "📸", href: "#", label: "Instagram", bg: "#e4405f" },
  { emoji: "▶", href: "#", label: "YouTube", bg: "#ff0000" },
  { emoji: "in", href: "#", label: "LinkedIn", bg: "#0077b5" },
];

const trustBadges = [
  { icon: Shield, text: "SSL Secured", sub: "256-bit encryption" },
  { icon: Truck, text: "Fast Delivery", sub: "Same day possible" },
  { icon: RefreshCw, text: "Easy Returns", sub: "7-day policy" },
  { icon: Headphones, text: "24/7 Support", sub: "Always here" },
];

const paymentMethods = [
  "Visa", "Mastercard", "RuPay",
  "UPI", "PayTM", "Razorpay", "EMI",
];

const Footer = () => {
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setLoading(true);
    await new Promise((r) => setTimeout(r, 1000));
    setLoading(false);
    setSubscribed(true);
  };

  return (
    <footer className="bg-[#07070f] border-t border-white/5">

      {/* Trust Badges */}
      <div className="border-b border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {trustBadges.map((badge, i) => (
              <motion.div
                key={badge.text}
                initial={{ opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center gap-3"
              >
                <div className="w-10 h-10 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-center justify-center flex-shrink-0">
                  <badge.icon size={18} className="text-indigo-400" />
                </div>
                <div>
                  <div className="text-white text-sm font-semibold">
                    {badge.text}
                  </div>
                  <div className="text-white/30 text-xs">{badge.sub}</div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-14">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">

          {/* Brand Column */}
          <div className="lg:col-span-3 space-y-6">
            <Link to="/">
              <motion.div
                whileHover={{ scale: 1.03 }}
                className="flex items-center gap-2.5 w-fit"
              >
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                  <Zap size={20} className="text-white" />
                </div>
                <span className="text-2xl font-black bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                  Nexkart
                </span>
              </motion.div>
            </Link>

            <p className="text-white/35 text-sm leading-relaxed">
              India's fastest-growing multivendor marketplace. Connecting
              millions of buyers with 2,000+ verified sellers across 50+
              categories.
            </p>

            {/* Contact Info */}
            <div className="space-y-2.5">
              {[
                { icon: MapPin, text: "Koramangala, Bangalore - 560034" },
                { icon: Phone, text: "1800-NEXKART (Free)" },
                { icon: Mail, text: "support@nexkart.in" },
              ].map(({ icon: Icon, text }) => (
                <div
                  key={text}
                  className="flex items-center gap-3 text-white/35 text-xs"
                >
                  <Icon size={13} className="text-indigo-400 flex-shrink-0" />
                  {text}
                </div>
              ))}
            </div>

            {/* Social Links */}
            <div>
              <p className="text-white/25 text-xs uppercase tracking-widest mb-3">
                Follow Us
              </p>
              <div className="flex gap-2">
                {socials.map((s) => (
                  <motion.a
                    key={s.label}
                    href={s.href}
                    whileHover={{ scale: 1.15, y: -3 }}
                    whileTap={{ scale: 0.9 }}
                    title={s.label}
                    className="w-9 h-9 rounded-xl flex items-center justify-center text-white text-xs font-bold border border-white/10 hover:border-white/20 transition-all"
                    style={{ backgroundColor: `${s.bg}20` }}
                  >
                    {s.emoji}
                  </motion.a>
                ))}
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-3 p-4 rounded-2xl bg-white/2 border border-white/5">
              {[
                { value: "2K+", label: "Vendors" },
                { value: "50K+", label: "Products" },
                { value: "1M+", label: "Buyers" },
              ].map((stat) => (
                <div key={stat.label} className="text-center">
                  <div className="text-white font-black text-base bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">
                    {stat.value}
                  </div>
                  <div className="text-white/25 text-[10px]">{stat.label}</div>
                </div>
              ))}
            </div>
          </div>

          {/* Links Grid */}
          <div className="lg:col-span-6">
            {/* Desktop */}
            <div className="hidden md:grid grid-cols-2 lg:grid-cols-4 gap-6">
              {footerSections.map((section) => (
                <div key={section.title}>
                  <h3 className="text-white font-bold text-sm mb-5">
                    {section.title}
                  </h3>
                  <ul className="space-y-2.5">
                    {section.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.href}
                          className="flex items-center gap-2 text-white/35 text-xs hover:text-white/80 transition-colors group"
                        >
                          <span className="group-hover:translate-x-1 transition-transform duration-200">
                            {link.label}
                          </span>
                          {"badge" in link && link.badge && (
                            <span className="text-[9px] font-black px-1.5 py-0.5 rounded bg-green-500/20 text-green-400">
                              {link.badge}
                            </span>
                          )}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </div>

            {/* Mobile Accordion */}
            <div className="md:hidden space-y-2">
              {footerSections.map((section) => (
                <div
                  key={section.title}
                  className="border border-white/5 rounded-2xl overflow-hidden"
                >
                  <button
                    onClick={() =>
                      setOpenSection(
                        openSection === section.title ? null : section.title
                      )
                    }
                    className="w-full flex items-center justify-between p-4 text-white font-semibold text-sm"
                  >
                    {section.title}
                    <motion.div
                      animate={{
                        rotate: openSection === section.title ? 180 : 0,
                      }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChevronDown size={16} className="text-white/30" />
                    </motion.div>
                  </button>
                  <AnimatePresence>
                    {openSection === section.title && (
                      <motion.div
                        initial={{ height: 0 }}
                        animate={{ height: "auto" }}
                        exit={{ height: 0 }}
                        transition={{ duration: 0.2 }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 pb-4 space-y-3">
                          {section.links.map((link) => (
                            <Link
                              key={link.label}
                              to={link.href}
                              className="block text-white/35 text-xs hover:text-white transition-colors"
                            >
                              {link.label}
                            </Link>
                          ))}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div className="lg:col-span-3 space-y-6">
            <div>
              <h3 className="text-white font-bold text-lg mb-2">
                Stay in the loop 📬
              </h3>
              <p className="text-white/35 text-sm leading-relaxed">
                Get exclusive deals and new arrivals before everyone else.
              </p>
            </div>

            <AnimatePresence mode="wait">
              {subscribed ? (
                <motion.div
                  key="success"
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center gap-3 p-4 rounded-2xl bg-green-500/10 border border-green-500/20"
                >
                  <CheckCircle size={20} className="text-green-400" />
                  <div>
                    <div className="text-green-400 font-semibold text-sm">
                      Subscribed! 🎉
                    </div>
                    <div className="text-white/30 text-xs">
                      Check your inbox soon
                    </div>
                  </div>
                </motion.div>
              ) : (
                <motion.form
                  key="form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  onSubmit={handleSubscribe}
                  className="space-y-3"
                >
                  <div className="relative">
                    <Mail
                      size={15}
                      className="absolute left-3.5 top-1/2 -translate-y-1/2 text-white/25"
                    />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="your@email.com"
                      required
                      className="w-full pl-10 pr-4 py-3 rounded-xl bg-white/5 border border-white/10 text-white text-sm placeholder-white/25 focus:outline-none focus:border-indigo-500/50 transition-all"
                    />
                  </div>
                  <motion.button
                    type="submit"
                    disabled={loading}
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-indigo-500/20 disabled:opacity-60"
                  >
                    {loading ? (
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    ) : (
                      <>
                        Subscribe Now
                        <ArrowRight size={15} />
                      </>
                    )}
                  </motion.button>
                  <p className="text-white/20 text-[11px] text-center">
                    No spam. Unsubscribe anytime.
                  </p>
                </motion.form>
              )}
            </AnimatePresence>

            {/* App Download */}
            <div>
              <p className="text-white/25 text-xs uppercase tracking-widest mb-3">
                Download App
              </p>
              <div className="space-y-2">
                {[
                  { platform: "App Store", emoji: "🍎", rating: "4.8★", dl: "1M+" },
                  { platform: "Play Store", emoji: "🤖", rating: "4.7★", dl: "5M+" },
                ].map((app) => (
                  <motion.button
                    key={app.platform}
                    whileHover={{ scale: 1.03, x: 3 }}
                    whileTap={{ scale: 0.97 }}
                    className="w-full flex items-center gap-3 p-3 rounded-xl border border-white/8 bg-white/3 hover:border-white/15 hover:bg-white/5 transition-all"
                  >
                    <div className="w-8 h-8 rounded-lg bg-white/10 flex items-center justify-center text-base">
                      {app.emoji}
                    </div>
                    <div className="text-left">
                      <div className="text-white text-xs font-semibold">
                        {app.platform}
                      </div>
                      <div className="text-white/30 text-[10px]">
                        {app.rating} · {app.dl} Downloads
                      </div>
                    </div>
                  </motion.button>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-white/5">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5">
          <div className="flex flex-col lg:flex-row items-center justify-between gap-4">
            <p className="text-white/20 text-xs text-center">
              © 2024 Nexkart Technologies Pvt. Ltd. All rights reserved.
              Made with ❤️ in India 🇮🇳
            </p>

            {/* Payment Methods */}
            <div className="flex items-center gap-1.5 flex-wrap justify-center">
              {paymentMethods.map((method) => (
                <motion.span
                  key={method}
                  whileHover={{ scale: 1.08, y: -2 }}
                  className="px-2.5 py-1 border border-white/8 rounded-lg text-white/20 text-[10px] font-medium hover:border-white/20 hover:text-white/40 transition-all cursor-default"
                >
                  {method}
                </motion.span>
              ))}
            </div>

            {/* Legal Links */}
            <div className="flex items-center gap-3 text-white/20 text-xs">
              {["Privacy", "Terms", "Cookies"].map((item, i, arr) => (
                <span key={item} className="flex items-center gap-3">
                  <Link
                    to={`/${item.toLowerCase()}`}
                    className="hover:text-white/50 transition-colors"
                  >
                    {item}
                  </Link>
                  {i < arr.length - 1 && (
                    <span className="text-white/10">•</span>
                  )}
                </span>
              ))}
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;