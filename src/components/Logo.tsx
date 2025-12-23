import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: "w-7 h-7", text: "text-lg", letter: "text-sm" },
    md: { icon: "w-9 h-9", text: "text-xl", letter: "text-base" },
    lg: { icon: "w-12 h-12", text: "text-2xl", letter: "text-lg" },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <div
        className={cn(
          "relative flex items-center justify-center rounded-xl bg-gradient-primary shadow-md",
          sizes[size].icon
        )}
      >
        {/* Inner glow effect */}
        <div className="absolute inset-0 rounded-xl bg-gradient-to-br from-white/20 to-transparent" />
        <span
          className={cn(
            "font-bold text-primary-foreground relative z-10",
            sizes[size].letter
          )}
        >
          F
        </span>
      </div>
      {showText && (
        <span className={cn("font-bold text-foreground", sizes[size].text)}>
          Feezy
        </span>
      )}
    </div>
  );
}
