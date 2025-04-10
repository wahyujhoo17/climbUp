import React from "react";
import { cn } from "@/lib/utils";

interface LoadingSpinnerProps {
  className?: string;
  size?: "sm" | "md" | "lg";
  variant?: "default" | "primary";
}

export function LoadingSpinner({
  className,
  size = "md",
  variant = "default",
}: LoadingSpinnerProps) {
  const sizeClasses = {
    sm: "h-8 w-8",
    md: "h-12 w-12",
    lg: "h-20 w-20",
  };

  const variantClasses = {
    default: "border-muted-foreground/20 border-t-muted-foreground",
    primary: "border-primary/20 border-t-primary",
  };

  return (
    <div className={cn("relative", sizeClasses[size], className)}>
      <div
        className={cn(
          "absolute inset-0 border-4 rounded-full",
          variantClasses[variant].split(" ")[0]
        )}
      ></div>
      <div
        className={cn(
          "absolute inset-0 border-t-4 rounded-full animate-spin",
          variantClasses[variant].split(" ")[1]
        )}
      ></div>
    </div>
  );
}
