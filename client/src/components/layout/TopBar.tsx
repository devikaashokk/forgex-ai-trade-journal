// client/src/components/layout/TopBar.tsx
import { Sun, Moon, Bell } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useThemeStore } from "@/store/theme.store";
import { useAuthStore } from "@/store/auth.store";

export function TopBar() {
  const { theme, toggleTheme } = useThemeStore();
  const { user } = useAuthStore();

  return (
    <header className="sticky top-0 z-20 border-b border-border bg-background/95 backdrop-blur-sm">
      <div className="flex items-center justify-between px-4 md:px-6 h-14">
        {/* Left — page context (empty, each page has own heading) */}
        <div className="md:hidden" />
        <div className="hidden md:block" />

        {/* Right — actions */}
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            {theme === "dark" ? (
              <Sun className="h-4 w-4" />
            ) : (
              <Moon className="h-4 w-4" />
            )}
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-muted-foreground hover:text-foreground"
          >
            <Bell className="h-4 w-4" />
          </Button>
          <div className="ml-1 h-7 w-7 rounded-full bg-primary/20 flex items-center justify-center">
            <span className="text-xs font-semibold text-primary">
              {user?.name?.charAt(0).toUpperCase() ?? "U"}
            </span>
          </div>
        </div>
      </div>
    </header>
  );
}
