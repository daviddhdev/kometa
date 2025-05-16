"use client";

import { Button } from "@/components/ui/button";
import {
  BookOpen,
  Calendar,
  LayoutDashboard,
  Library,
  Menu,
  X,
} from "lucide-react";
import Link from "next/link";
import { useState } from "react";

export function Nav() {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold">kometa</span>
          </Link>
          <div className="hidden md:flex items-center gap-4">
            <Link href="/">
              <Button variant="ghost">Library</Button>
            </Link>
            <Link href="/collections">
              <Button variant="ghost">
                <Library className="h-4 w-4 mr-2" />
                Collections
              </Button>
            </Link>
            <Link href="/upcoming">
              <Button variant="ghost">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
          </div>
        </div>
        <div className="flex items-center gap-4">
          <Link href="/upload" className="hidden md:block">
            <Button>Upload</Button>
          </Link>
          <Button
            variant="ghost"
            className="md:hidden"
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          >
            {isMobileMenuOpen ? (
              <X className="h-6 w-6" />
            ) : (
              <Menu className="h-6 w-6" />
            )}
          </Button>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="container mx-auto px-4 py-4 flex flex-col gap-2">
            <Link href="/">
              <Button variant="ghost" className="w-full justify-start">
                Library
              </Button>
            </Link>
            <Link href="/collections">
              <Button variant="ghost" className="w-full justify-start">
                <Library className="h-4 w-4 mr-2" />
                Collections
              </Button>
            </Link>
            <Link href="/upcoming">
              <Button variant="ghost" className="w-full justify-start">
                <Calendar className="h-4 w-4 mr-2" />
                Upcoming
              </Button>
            </Link>
            <Link href="/dashboard">
              <Button variant="ghost" className="w-full justify-start">
                <LayoutDashboard className="h-4 w-4 mr-2" />
                Dashboard
              </Button>
            </Link>
            <Link href="/upload">
              <Button className="w-full">Upload</Button>
            </Link>
          </div>
        </div>
      )}
    </nav>
  );
}
