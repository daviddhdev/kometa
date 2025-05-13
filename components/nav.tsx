import { Button } from "@/components/ui/button";
import { BookOpen, Calendar, Library } from "lucide-react";
import Link from "next/link";

export function Nav() {
  return (
    <nav className="border-b">
      <div className="container mx-auto px-4 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <Link href="/" className="flex items-center gap-2">
            <BookOpen className="h-6 w-6" />
            <span className="font-semibold">Comic Reader</span>
          </Link>
          <div className="flex items-center gap-4">
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
          </div>
        </div>
        <Link href="/upload">
          <Button>Upload</Button>
        </Link>
      </div>
    </nav>
  );
}
