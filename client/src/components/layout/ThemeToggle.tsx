// client/src/components/layout/ThemeToggle.tsx
import { Sun, Moon } from "lucide-react";
import { useThemeStore } from "@/store/theme.store";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  className?: string;
}

export function ThemeToggle({ className }: ThemeToggleProps) {
  const { theme, toggleTheme } = useThemeStore();

  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-1.5 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent transition-colors",
        className
      )}
      aria-label="Toggle theme"
    >
      {theme === "dark" ? (
        <Sun className="h-3.5 w-3.5" />
      ) : (
        <Moon className="h-3.5 w-3.5" />
      )}
    </button>
  );
}
