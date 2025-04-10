"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Briefcase, Search, LineChart, Sun, Moon } from "lucide-react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import { AuthModals } from "@/components/auth/auth-modals";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export function NavigationMenu() {
  const pathname = usePathname();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  // Mounted state to avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    if (theme === "dark") {
      setTheme("light");
    } else {
      setTheme("dark");
    }
  };

  const isActive = (path: string) => {
    return pathname === path
      ? "text-primary border-primary"
      : "text-muted-foreground border-transparent";
  };

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <Link href="/" className="flex items-center space-x-1">
            <div className="relative w-[42px] h-[42px]">
              <Image
                src="/img/only.png"
                alt="ClimbUp logo"
                width={42}
                height={42}
                className="dark:invert"
              />
            </div>
            <span className="text-xl font-bold text-primary dark:text-white font-primary">
              ClimbUp
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex md:space-x-8">
            <Link
              href="/search"
              className={`flex items-center space-x-2 border-b-2 px-1 py-5 text-sm font-medium transition-colors hover:text-primary ${isActive(
                "/search"
              )}`}
            >
              <Search className="h-4 w-4" />
              <span>Search</span>
            </Link>

            <Link
              href="/tracker"
              className={`flex items-center space-x-2 border-b-2 px-1 py-5 text-sm font-medium transition-colors hover:text-primary ${isActive(
                "/tracker"
              )}`}
            >
              <Briefcase className="h-4 w-4" />
              <span>Tracker</span>
            </Link>

            <Link
              href="/dashboard"
              className={`flex items-center space-x-2 border-b-2 px-1 py-5 text-sm font-medium transition-colors hover:text-primary ${isActive(
                "/dashboard"
              )}`}
            >
              <LineChart className="h-4 w-4" />
              <span>Dashboard</span>
            </Link>
          </div>

          {/* Action buttons */}
          <div className="flex items-center space-x-3">
            {/* Auth Dropdown - visible on all screens */}
            <AuthModals />

            {/* Theme Toggle Button */}
            <Button
              variant="ghost"
              size="icon"
              onClick={toggleTheme}
              className="rounded-full"
            >
              {mounted && theme === "dark" ? (
                <Moon className="h-5 w-5" />
              ) : (
                <Sun className="h-5 w-5" />
              )}
              <span className="sr-only">Toggle theme</span>
            </Button>

            {/* Add mobile menu here if needed */}
          </div>
        </div>
      </div>
    </nav>
  );
}
