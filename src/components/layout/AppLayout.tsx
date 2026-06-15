import { ReactNode } from "react";
import { AppHeader } from "./AppHeader";
import { BottomNav } from "./BottomNav";
import { SidebarNav } from "./SidebarNav";

export function AppLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen relative" style={{ background: '#EEEADE' }}>
      {/* Ambient glow blobs */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-40 -right-32 w-[500px] h-[500px] rounded-full opacity-[0.04]" style={{ background: 'radial-gradient(circle, #A78BFA, transparent 70%)' }} />
        <div className="absolute -bottom-40 -left-32 w-[500px] h-[500px] rounded-full opacity-[0.025]" style={{ background: 'radial-gradient(circle, #F9A8D4, transparent 70%)' }} />
        <div className="absolute top-1/3 left-1/3 w-[600px] h-[600px] rounded-full opacity-[0.015]" style={{ background: 'radial-gradient(circle, #8B5CF6, transparent 70%)' }} />
      </div>

      {/* Desktop sidebar */}
      <SidebarNav />

      {/* Content area: shifts right on desktop */}
      <div className="md:ml-64 flex flex-col min-h-screen relative z-10">
        <AppHeader />
        <main className="flex-1 pb-28 md:pb-10 px-4 py-8 md:px-10 md:py-10 overflow-y-auto overflow-x-hidden
          max-w-5xl mx-auto w-full
          md:max-w-none md:mx-0">
          {children}
        </main>
        
        {/* Footer */}
        <footer className="bg-white/80 backdrop-blur-sm border-t border-slate-200/50 py-3 px-4 text-center">
          <p className="text-xs text-slate-500">Developed by JK Technologies & Services</p>
        </footer>
      </div>

      {/* Bottom nav: mobile only */}
      <BottomNav />
    </div>
  );
}
