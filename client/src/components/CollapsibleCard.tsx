import { useState, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentColor = "emerald" | "blue" | "amber" | "violet" | "rose" | "none";

interface CollapsibleCardProps {
  title: string;
  subtitle?: string;
  icon?: ReactNode;
  badge?: string;
  defaultOpen?: boolean;
  className?: string;
  children: ReactNode;
  headerRight?: ReactNode;
  accent?: AccentColor;
  highlight?: boolean;
}

const accentBorder: Record<AccentColor, string> = {
  emerald: "border-l-4 border-l-emerald-500",
  blue:    "border-l-4 border-l-blue-500",
  amber:   "border-l-4 border-l-amber-500",
  violet:  "border-l-4 border-l-violet-500",
  rose:    "border-l-4 border-l-rose-500",
  none:    "",
};

const badgeColor: Record<AccentColor, string> = {
  emerald: "bg-emerald-100 text-emerald-800",
  blue:    "bg-blue-100 text-blue-800",
  amber:   "bg-amber-100 text-amber-800",
  violet:  "bg-violet-100 text-violet-800",
  rose:    "bg-rose-100 text-rose-800",
  none:    "bg-slate-100 text-slate-700",
};

const bodyVariants = {
  open:   { height: "auto", opacity: 1, transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  closed: { height: 0,      opacity: 0, transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

export default function CollapsibleC
