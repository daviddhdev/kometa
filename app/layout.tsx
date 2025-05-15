import { Nav } from "@/components/nav";
import { Providers } from "@/components/providers";
import { ComicProvider } from "@/lib/comic-context";
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import { initializeAdminUser } from "./lib/init-admin";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Comic Reader",
  description: "Your personal comic collection manager",
};

// Initialize admin user on app start
initializeAdminUser().catch(console.error);

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Providers>
          <ComicProvider>
            <Nav />
            {children}
          </ComicProvider>
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
