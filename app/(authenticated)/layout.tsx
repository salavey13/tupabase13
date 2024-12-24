"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { useApp } from "@/lib/contexts/app-context";
import { Navigation } from '@/components/Navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname(); // Get the current pathname
  const { state } = useApp();

  useEffect(() => {
    if (state.user) {
      // Redirect unauthenticated-only pages for logged-in users
      if (pathname === "/login") {
        router.push("/events");
      }
    } else {
      // Redirect authenticated-only pages for guests
      const protectedPaths = ["/admin", "/events/new"];
      if (protectedPaths.some((path) => pathname?.startsWith(path))) {
        router.push("/login");
      }
    }
  }, [state.user, pathname, router]);

  // Avoid rendering until we know the user's state
  if (state.user === undefined) {
    return null;
  }

  return (
      <main>
        <Navigation />
        {children}
      </main>
    );
}
