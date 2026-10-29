"use client";

import { HTMLAttributes } from "react";

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  tone?: "primary" | "forest" | "ochre" | "rust" | "neutral" | "dark";
  size?: "sm" | "md";
  /** Solid (filled) vs soft (tinted bg) */
  variant?: "solid" | "soft" | "outline";
}

const tones: Record<NonNullable<BadgeProps["tone"]>, Record<NonNullable<BadgeProps["variant"]>, string>> = {
  primary: {
    solid:   "bg-primary text-white",
    soft:    "bg-primary-soft text-gobbl-700",
    outline: "border border-primary text-primary",
  },
  forest: {
    solid:   "bg-forest-500 text-white",
    soft:    "bg-forest-100 text-forest-700",
    outline: "border border-forest-500 text-forest-600",
  },
  ochre: {
    solid:   "bg-ochre text-ink",
    soft:    "bg-ochre-soft text-golden-700",
    outline: "border border-ochre text-golden-700",
  },
  rust: {
    solid:   "bg-plume-500 text-white",
    soft:    "bg-plume-100 text-plume-700",
    outline: "border border-plume-500 text-plume-600",
  },
  neutral: {
    solid:   "bg-ink text-bg",
    soft:    "bg-surface-2 text-ink-soft border border-line",
    outline: "border border-line text-ink-soft",
  },
  dark: {
    solid:   "bg-ink text-bg",
    soft:    "bg-roost-800 text-bg",
    outline: "border border-ink text-ink",
  },
};

const sizes = {
  sm: "text-[10px] px-2 py-[3px] tracking-[0.06em]",
  md: "text-[11px] px-2.5 py-1 tracking-[0.05em]",
};

export function Badge({
  tone = "primary",
  size = "sm",
  variant = "soft",
  className = "",
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-mono font-semibold uppercase whitespace-nowrap
        ${tones[tone][variant]} ${sizes[size]} ${className}`}
      {...props}
    >
      {children}
    </span>
  );
}
