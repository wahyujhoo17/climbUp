import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/ui/theme-provider";
import { Toaster } from "@/components/ui/toaster";
import { NavigationMenu } from "@/components/navigation-menu";

// Use variable fonts instead of subsets if having issues
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "ClimbUp - Track Your Job Search Journey",
  description:
    "Organize your job search, track applications, and visualize progress",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <NavigationMenu />
          <div className="min-h-screen bg-background relative">
            <div className="absolute inset-0 z-0 bg-[url('/patterns/topography.svg')] bg-repeat opacity-[0.07] dark:opacity-[0.04]"></div>
            <div className="relative z-10">
              <main className="container mx-auto px-4 py-8">{children}</main>
            </div>
          </div>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
