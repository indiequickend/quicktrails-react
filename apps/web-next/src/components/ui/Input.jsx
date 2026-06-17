import { cn } from "@/lib/utils";

export function Input({ className, ...props }) {
  return (
    <input
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}

export function Textarea({ className, ...props }) {
  return (
    <textarea
      className={cn(
        "flex min-h-28 w-full rounded-xl border border-input bg-background px-4 py-3 text-base placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}

export function Label({ className, ...props }) {
  return <label className={cn("text-sm font-medium mb-1.5 block", className)} {...props} />;
}

export function Select({ className, ...props }) {
  return (
    <select
      className={cn(
        "flex h-11 w-full rounded-xl border border-input bg-background px-4 text-base focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring",
        className
      )}
      {...props}
    />
  );
}
