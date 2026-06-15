import { cn } from "@/lib/utils";

export function Logo({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
}) {
  const sizeClass = {
    sm: "text-xl",
    md: "text-3xl",
    lg: "text-5xl",
    xl: "text-7xl",
  }[size];

  return (
    <span
      className={cn(
        "italic font-extrabold tracking-tight",
        "bg-gradient-to-br from-[#1F3A5F] via-[#1F3A5F] to-[#22C7B8]",
        "bg-clip-text text-transparent",
        "dark:from-[#7FD9CE] dark:via-[#22C7B8] dark:to-[#5BA3D9]",
        sizeClass,
        className
      )}
    >
      crevo
    </span>
  );
}
