import { cn } from "@/lib/utils";

interface LoadingPlaceholderProps {
  className?: string;
  text?: string;
}

export function LoadingPlaceholder({
  className,
  text = "Loading...",
}: LoadingPlaceholderProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center gap-2",
        className
      )}
    >
      <div className="h-8 w-8 animate-spin rounded-full border-4 border-primary border-t-transparent" />
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}
