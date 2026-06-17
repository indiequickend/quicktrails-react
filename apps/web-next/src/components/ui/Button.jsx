import Link from "next/link";
import { cn } from "@/lib/utils";

const variantClasses = {
  default: "bg-primary text-primary-foreground hover:bg-primary/90",
  outline: "border border-border bg-transparent hover:bg-muted",
  ghost: "bg-transparent hover:bg-muted",
  destructive: "bg-destructive text-destructive-foreground hover:bg-destructive/90",
};

const sizeClasses = {
  default: "h-11 px-6 text-base",
  sm: "h-9 px-4 text-sm",
  lg: "h-13 px-8 text-lg",
  icon: "h-10 w-10",
};

export function Button({
  className,
  variant = "default",
  size = "default",
  href,
  type = "button",
  ...props
}) {
  const classes = cn(
    "inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-colors duration-200 disabled:opacity-50 disabled:pointer-events-none",
    variantClasses[variant],
    sizeClasses[size],
    className
  );

  if (href) {
    return <Link href={href} className={classes} {...props} />;
  }

  return <button type={type} className={classes} {...props} />;
}
