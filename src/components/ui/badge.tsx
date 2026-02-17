import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-accent-primary/30 bg-accent-primary/10 text-accent-primary dark:[text-shadow:0_0_8px_var(--accent-primary)]",
        secondary:
          "border-accent-secondary/30 bg-accent-secondary/10 text-accent-secondary dark:[text-shadow:0_0_8px_var(--accent-secondary)]",
        success:
          "border-accent-tertiary/30 bg-accent-tertiary/10 text-accent-tertiary dark:[text-shadow:0_0_8px_var(--accent-tertiary)]",
        purple:
          "border-accent-purple/30 bg-accent-purple/10 text-accent-purple dark:[text-shadow:0_0_8px_var(--accent-purple)]",
        yellow:
          "border-accent-yellow/30 bg-accent-yellow/10 text-accent-yellow dark:[text-shadow:0_0_8px_var(--accent-yellow)]",
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
