import { useState, useId, type ReactNode } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";

type AccentColor = "emerald" | "blue" | "amber" | "violet" | "rose" | "cyan" | "none";

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
  emerald: "border-l-4 border-l-[#10B981]",
  blue:    "border-l-4 border-l-[#3B82F6]",
  amber:   "border-l-4 border-l-[#F59E0B]",
  violet:  "border-l-4 border-l-[#8B5CF6]",
  rose:    "border-l-4 border-l-[#EF4444]",
  cyan:    "border-l-4 border-l-[#06B6D4]",
  none:    "",
};

const badgeColor: Record<AccentColor, string> = {
  emerald: "bg-[#10B981]/10 text-[#34D399] border border-[#10B981]/30",
  blue:    "bg-[#3B82F6]/10 text-[#60A5FA] border border-[#3B82F6]/30",
  amber:   "bg-[#F59E0B]/10 text-[#FCD34D] border border-[#F59E0B]/30",
  violet:  "bg-[#8B5CF6]/10 text-[#A78BFA] border border-[#8B5CF6]/30",
  rose:    "bg-[#EF4444]/10 text-[#F87171] border border-[#EF4444]/30",
  cyan:    "bg-[#06B6D4]/10 text-[#67E8F9] border border-[#06B6D4]/30",
  none:    "bg-[#1E2433] text-[#94A3B8]",
};

const bodyVariants = {
  open:   { height: "auto", opacity: 1,
    transition: { duration: 0.28, ease: [0.4, 0, 0.2, 1] } },
  closed: { height: 0, opacity: 0,
    transition: { duration: 0.22, ease: [0.4, 0, 1, 1] } },
};

export default function CollapsibleCard({
  title, subtitle, icon, badge, defaultOpen = true,
  className, children, headerRight, accent = "none", highlight = false,
}: CollapsibleCardProps) {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  const contentId = useId();

  return (
    <div className={cn(
      "rounded-xl border border-[#1E2433]",
      "bg-[#141820] shadow-sm overflow-hidden",
      accentBorder[accent], className
    )}>
      <button
        type="button"
        aria-expanded={isOpen}
        aria-controls={contentId}
        onClick={() => setIsOpen(v => !v)}
        className={cn(
          "w-full flex items-center justify-between gap-3 px-5 py-4 text-left",
          "transition-colors duration-150",
          "hover:bg-[#1A1F2E]",
          "focus-visible:outline-none focus-visible:ring-2",
          "focus-visible:ring-[#10B981]",
          highlight && "bg-[#1A1F2E]"
        )}
      >
        <div className="flex items-center gap-3 min-w-0">
          {icon && (
            <span className="shrink-0 text-[#94A3B8]">{icon}</span>
          )}
          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-semibold text-[#F1F5F9] text-sm sm:text-base leading-tight truncate">
                {title}
              </span>
              {badge && (
                <span className={cn(
                  "inline-flex items-center px-2 py-0.5 rounded-full",
                  "text-xs font-medium shrink-0",
                  badgeColor[accent]
                )}>
                  {badge}
                </span>
              )}
            </div>
            {subtitle && (
              <p className="text-xs text-[#94A3B8] mt-0.5 truncate">
                {subtitle}
              </p>
            )}
          </div>
        </div>
        <div className="flex items-center gap-3 shrink-0">
          {headerRight && (
            <div className="hidden sm:flex items-center gap-2 text-xs text-[#64748B]">
              {headerRight}
            </div>
          )}
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.22, ease: "easeInOut" }}
            className="text-[#475569]"
          >
            <ChevronDown className="w-4 h-4" />
          </motion.span>
        </div>
      </button>

      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={contentId}
            key="body"
            variants={bodyVariants}
            initial="closed"
            animate="open"
            exit="closed"
            style={{ overflow: "hidden" }}
          >
            <div className="px-5 pb-5 pt-1">{children}</div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
```

**Step 3** — Scroll to the bottom of the GitHub page. In the commit message box type:
```
feat: update CollapsibleCard with exact app color palette
```

Then click **Commit directly to main** → green **Commit changes** button.

---

## ✅ TASK 2 of 4 — Replace CollapseAllToggle.tsx

**Step 1** — Go to this URL, click ✏️, press Command+A, then Delete:
```
https://github.com/cannaplan/gaia-commons-council-app-4.0/blob/main/client/src/components/CollapseAllToggle.tsx
