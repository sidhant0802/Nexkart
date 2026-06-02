// src/customer/pages/Home/SectionBox/SectionBox.tsx

import { motion } from "framer-motion";
import { useTheme } from "../../../../routes/CustomerRoutes";
import { ReactNode } from "react";

export type AccentColor =
  | "indigo" | "blue"   | "pink"   | "amber"
  | "purple" | "rose"   | "red"    | "cyan"
  | "violet" | "slate"  | "emerald";

interface Props {
  accent: AccentColor;
  children: ReactNode;
  className?: string;
}

const PRESETS: Record<AccentColor, { bgDark: string; bgLight: string; border: string; orb: string }> = {
  indigo:  { bgDark: "from-indigo-500/8 via-indigo-500/3 to-transparent",   bgLight: "from-indigo-50 via-white to-white",   border: "border-indigo-500/20",   orb: "from-indigo-500 to-cyan-400" },
  blue:    { bgDark: "from-blue-500/8 via-blue-500/3 to-transparent",       bgLight: "from-blue-50 via-white to-white",     border: "border-blue-500/20",     orb: "from-blue-500 to-cyan-400" },
  pink:    { bgDark: "from-pink-500/8 via-pink-500/3 to-transparent",       bgLight: "from-pink-50 via-white to-white",     border: "border-pink-500/20",     orb: "from-pink-500 to-rose-400" },
  amber:   { bgDark: "from-amber-500/8 via-amber-500/3 to-transparent",     bgLight: "from-amber-50 via-white to-white",    border: "border-amber-500/20",    orb: "from-amber-500 to-orange-400" },
  purple:  { bgDark: "from-purple-500/8 via-purple-500/3 to-transparent",   bgLight: "from-purple-50 via-white to-white",   border: "border-purple-500/20",   orb: "from-purple-500 to-fuchsia-400" },
  rose:    { bgDark: "from-rose-500/8 via-rose-500/3 to-transparent",       bgLight: "from-rose-50 via-white to-white",     border: "border-rose-500/20",     orb: "from-rose-500 to-pink-400" },
  red:     { bgDark: "from-red-500/8 via-red-500/3 to-transparent",         bgLight: "from-red-50 via-white to-white",      border: "border-red-500/20",      orb: "from-red-500 to-orange-500" },
  cyan:    { bgDark: "from-cyan-500/8 via-cyan-500/3 to-transparent",       bgLight: "from-cyan-50 via-white to-white",     border: "border-cyan-500/20",     orb: "from-cyan-500 to-teal-400" },
  violet:  { bgDark: "from-violet-500/8 via-violet-500/3 to-transparent",   bgLight: "from-violet-50 via-white to-white",   border: "border-violet-500/20",   orb: "from-violet-500 to-purple-400" },
  slate:   { bgDark: "from-slate-500/8 via-slate-500/3 to-transparent",     bgLight: "from-slate-50 via-white to-white",    border: "border-slate-500/20",    orb: "from-slate-500 to-gray-400" },
  emerald: { bgDark: "from-emerald-500/8 via-emerald-500/3 to-transparent", bgLight: "from-emerald-50 via-white to-white", border: "border-emerald-500/20", orb: "from-emerald-500 to-teal-400" },
};

const SectionBox = ({ accent, children, className = "" }: Props) => {
  const { isDark } = useTheme();
  const c = PRESETS[accent];

  return (
    <section className={`py-5 ${isDark ? "bg-[#0a0a0f]" : "bg-gray-50"}`}>
      <div className="max-w-7xl mx-auto px-4 lg:px-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`relative rounded-3xl border p-5 lg:p-6 overflow-hidden 
                      bg-gradient-to-br ${isDark ? c.bgDark : c.bgLight} ${c.border} ${
                        isDark ? "shadow-2xl shadow-black/40" : "shadow-md shadow-gray-200/60"
                      } ${className}`}
        >
          {/* Decorative orb */}
          <div
            className={`absolute -top-16 -right-16 w-56 h-56 rounded-full opacity-20 blur-3xl pointer-events-none bg-gradient-to-br ${c.orb}`}
          />

          <div className="relative z-10">{children}</div>
        </motion.div>
      </div>
    </section>
  );
};

export default SectionBox;