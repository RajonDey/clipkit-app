import * as React from "react";
import { cn } from "@/lib/utils";

const buttonStyles = {
  base: "inline-flex items-center justify-center rounded-lg font-medium transition-all duration-200 focus:outline-none disabled:opacity-50 disabled:pointer-events-none",
  variants: {
    primary:
      "bg-gradient-to-r from-accent-600 to-secondary-600 text-brand-50 hover:from-accent-500 hover:to-secondary-500 shadow-md hover:shadow-lg",
    secondary:
      "bg-brand-100 text-brand-700 hover:bg-brand-200 border border-brand-300",
    outline:
      "border-2 border-accent-500 text-accent-600 hover:bg-accent-500 hover:text-brand-50",
    ghost: "text-brand-600 hover:bg-brand-100 hover:text-brand-700",
    link: "text-accent-600 underline-offset-4 hover:underline hover:text-accent-500",
    danger:
      "bg-danger-500 text-brand-50 hover:bg-danger-600 shadow-md hover:shadow-lg",
  },
  sizes: {
    sm: "h-8 px-3 text-sm",
    md: "h-10 px-4 text-sm",
    lg: "h-12 px-6 text-base",
    xl: "h-14 px-8 text-lg",
  },
};

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: keyof typeof buttonStyles.variants;
  size?: keyof typeof buttonStyles.sizes;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "primary", size = "md", ...props }, ref) => {
    return (
      <button
        className={cn(
          buttonStyles.base,
          buttonStyles.variants[variant],
          buttonStyles.sizes[size],
          className
        )}
        ref={ref}
        {...props}
      />
    );
  }
);

Button.displayName = "Button";

export { Button, type ButtonProps };
