import { cn } from "@/lib/utils";

export function Chip({ active, className, ...props }) {
  return (
    <button
      type="button"
      className={cn(
        "px-3.5 py-1.5 rounded-full text-sm font-medium border transition-colors duration-200 whitespace-nowrap",
        active
          ? "bg-primary text-primary-foreground border-primary"
          : "bg-background text-foreground border-border hover:bg-muted",
        className
      )}
      {...props}
    />
  );
}
