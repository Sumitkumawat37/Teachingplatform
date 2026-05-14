import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background">
      <AppHeader />
      <main className="pb-24 max-w-7xl mx-auto px-4 py-6">
        {children}
      </main>
      <BottomNav />
    </div>
  );
}
