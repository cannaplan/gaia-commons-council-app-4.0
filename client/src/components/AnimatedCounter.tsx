import React, { useState, useEffect, useRef } from "react";
import { motion, useSpring, useTransform } from "framer-motion";

interface AnimatedCounterProps {
  value: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
  decimals?: number;
  className?: string;
}

export function AnimatedCounter({
  value,
  duration = 2,
  prefix = "",
  suffix = "",
  decimals = 0,
  className = "",
}: AnimatedCounterProps) {
  const [isInView, setIsInView] = useState(false);
  const ref = useRef<HTMLSpanElement | null>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { threshold: 0.1 },
    );

    if (ref.current) {
      observer.observe(ref.current);
    }

    return () => observer.disconnect();
  }, []);

  const spring = useSpring(0, {
    stiffness: 80,
    damping: 20,
  });

  const display = useTransform(
    spring,
    (current) =>
      prefix +
      current.toLocaleString(undefined, {
        minimumFractionDigits: decimals,
        maximumFractionDigits: decimals,
      }) +
      suffix,
  );

  useEffect(() => {
    if (isInView) {
      spring.set(value);
    }
  }, [spring, value, isInView]);

  return (
    <motion.span ref={ref} className={className}>
      <motion.span>{display}</motion.span>
    </motion.span>
  );
}

interface AnimatedProgressProps {
  value: number;
  max?: number;
  className?: string;
  barClassName?: string;
  showLabel?: boolean;
  label?: string;
}

export function AnimatedProgress({
  value,
  max = 100,
  className = "",
  barClassName = "",
  showLabel = true,
  label = "",
}: AnimatedProgressProps) {
  const percentage = Math.min((value / max) * 100, 100);

  return (
    <div className={className}>
      {showLabel && (
        <div className="mb-1 flex items-center justify-between text-xs">
          <span>{label}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
        <motion.div
          className={barClassName}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}

interface AnimatedBadgeProps {
  children: React.ReactNode;
  variant?: "default" | "success" | "warning" | "destructive";
  pulse?: boolean;
  className?: string;
}

export function AnimatedBadge({
  children,
  variant = "default",
  pulse = false,
  className = "",
}: AnimatedBadgeProps) {
  const variants: Record<NonNullable<AnimatedBadgeProps["variant"]>, string> = {
    default: "bg-primary/10 text-primary border-primary/20",
    success: "bg-green-500/10 text-green-600 border-green-500/20",
    warning: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    destructive: "bg-red-500/10 text-red-600 border-red-500/20",
  };

  return (
    <motion.span
      className={[
        "inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium",
        variants[variant],
        className,
      ]
        .filter(Boolean)
        .join(" ")}
      animate={pulse ? { scale: [1, 1.05, 1] } : undefined}
      transition={pulse ? { duration: 1.2, repeat: Infinity, ease: "easeInOut" } : undefined}
    >
      {children}
    </motion.span>
  );
}
