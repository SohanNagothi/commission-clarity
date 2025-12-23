import { cn } from "@/lib/utils";
import feezyLogo from "@/assets/feezy-logo.png";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  className?: string;
}

export function Logo({ size = "md", showText = true, className }: LogoProps) {
  const sizes = {
    sm: { icon: "w-8 h-8", text: "text-lg" },
    md: { icon: "w-10 h-10", text: "text-xl" },
    lg: { icon: "w-14 h-14", text: "text-2xl" },
  };

  return (
    <div className={cn("flex items-center gap-2.5", className)}>
      <img 
        src={feezyLogo} 
        alt="Feezy Logo" 
        className={cn("object-contain", sizes[size].icon)}
      />
      {showText && (
        <span className={cn(
          "font-bold bg-gradient-primary bg-clip-text text-transparent",
          sizes[size].text
        )}>
          Feezy
        </span>
      )}
    </div>
  );
}
