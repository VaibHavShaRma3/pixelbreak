import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "border-neon-cyan/30 bg-neon-cyan/10 text-neon-cyan",
        pink: "border-neon-pink/30 bg-neon-pink/10 text-neon-pink",
        green: "border-neon-green/30 bg-neon-green/10 text-neon-green",
        purple: "border-neon-purple/30 bg-neon-purple/10 text-neon-purple",
        yellow: "border-neon-yellow/30 bg-neon-yellow/10 text-neon-yellow",
        outline: "border-border text-muted",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}

export { Badge, badgeVariants };
