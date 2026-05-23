import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { SidebarNav } from "./SidebarNav";
import { FloatingParticles } from "@/components/FloatingParticles";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-[#050505] relative overflow-hidden">
      {/* Animated floating particles background - reduced on mobile */}
      <FloatingParticles count={18} className="hidden md:block" />
      <FloatingParticles count={6} className="md:hidden" />

      {/* Decorative neon glow blobs - hidden on mobile for performance */}
      <div className="hidden md:block fixed top-20 -right-32 w-96 h-96 bg-[#A855F7]/15 rounded-full blur-3xl pointer-events-none animate-blob" style={{ zIndex: 0 }} />
      <div className="hidden md:block fixed top-1/2 -left-32 w-80 h-80 bg-[#EC4899]/15 rounded-full blur-3xl pointer-events-none animate-blob-2" style={{ zIndex: 0 }} />
      <div className="hidden md:block fixed bottom-32 right-16 w-64 h-64 bg-[#C084FC]/12 rounded-full blur-3xl pointer-events-none animate-float-slow" style={{ zIndex: 0 }} />
      <div className="hidden md:block fixed top-1/3 left-1/4 w-72 h-72 bg-[#D946EF]/8 rounded-full blur-3xl pointer-events-none animate-float" style={{ zIndex: 0, animationDelay: '1s' }} />

      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Content area: shifts right on desktop */}
      <div className="md:ml-72 flex flex-col min-h-screen overflow-hidden">
        <AppHeader />
        <main className="flex-1 pb-28 md:pb-10 px-4 py-5 md:px-8 md:py-7 relative z-10 overflow-y-auto overflow-x-hidden
          max-w-5xl mx-auto w-full
          md:max-w-none md:mx-0">
          {children}
        </main>
      </div>

      {/* Bottom nav: mobile only */}
      <BottomNav />
    </div>
  );
}
