"use client";

import BottomNav from '@/components/BottomNav';
import { usePathname } from 'next/navigation';

// This layout applies to all pages inside the (app) group
export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  // A simple client-side check to prevent layout flash on redirect
  if (!pathname) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <main className="flex-1 overflow-y-auto pb-20">{children}</main>
      <BottomNav />
    </div>
  );
}