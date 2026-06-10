import React from "react";
import { Home, BookOpen, FileText, User, LayoutDashboard, Users, Megaphone, Video, MessageCircle, Bell, BarChart3, GraduationCap, LogOut, Lock, UserCog, Crown, Mail, GraduationCap as MentoringIcon } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "@/lib/auth-context";
import { useProfiles } from "@/lib/supabase-data";

const studentNav = [
  { to: "/",             icon: Home,          label: "Home",          end: true },
  { to: "/dashboard",    icon: BarChart3,     label: "Dashboard",     end: true },
  { to: "/courses",      icon: BookOpen,      label: "Courses",       end: false },
  { to: "/live-classes", icon: Video,         label: "Live Classes",  end: false },
  { to: "/notes",        icon: FileText,      label: "Notes",         end: false },
  { to: "/doubts",       icon: MessageCircle, label: "Doubts",        end: false },
  { to: "/mentoring",    icon: MentoringIcon, label: "Mentoring",     end: false },
  { to: "/notifications",icon: Bell,          label: "Notifications", end: false },
  { to: "/profile",      icon: User,          label: "Profile",       end: false },
];

const superAdminOwnNav = [
  { to: "/superadmin",       icon: Crown,   label: "Dashboard",       end: true },
  { to: "/superadmin/users", icon: UserCog, label: "User Management", end: false },
];

const superAdminMgmtNav = [
  { to: "/admin/content",       icon: BookOpen,      label: "Course",        end: false },
  { to: "/admin/students",      icon: Users,         label: "Students",      end: false },
  { to: "/notes",               icon: FileText,      label: "Notes",         end: false },
  { to: "/admin/email-center",  icon: Mail,          label: "Email Center",  end: false },
  { to: "/admin/live",          icon: Video,         label: "Live Classes",  end: false },
  { to: "/admin/announcements", icon: Megaphone,     label: "Announcements", end: false },
  { to: "/admin/doubts",        icon: MessageCircle, label: "Doubts",        end: false },
  { to: "/admin/access",        icon: Lock,          label: "Course Access", end: false },
];

const adminNav = [
  { to: "/admin",                icon: LayoutDashboard, label: "Dashboard",     end: true },
  { to: "/admin/profile",        icon: User,            label: "My Profile",    end: false },
  { to: "/admin/teachers",       icon: GraduationCap,   label: "Teachers",      end: false },
  { to: "/admin/content",        icon: BookOpen,        label: "Course",        end: false },
  { to: "/notes",                icon: FileText,        label: "Notes",         end: false },
  { to: "/admin/students",       icon: Users,           label: "Students",      end: false },
  { to: "/admin/email-center",   icon: Mail,            label: "Email Center",  end: false },
  { to: "/admin/live",           icon: Video,           label: "Live Classes",  end: false },
  { to: "/admin/announcements",  icon: Megaphone,       label: "Announcements", end: false },
  { to: "/admin/doubts",         icon: MessageCircle,   label: "Doubts",        end: false },
  { to: "/admin/access",         icon: Lock,            label: "Course Access", end: false },
];

const navLink = (item: { to: string; icon: React.ElementType; label: string; end: boolean }, activeClass: string, hoverClass: string, index: number = 0) => (
  <NavLink
    key={item.to}
    to={item.to}
    end={item.end}
    className={({ isActive }) =>
      `group flex items-center gap-3 px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
        isActive ? `${activeClass}` : `${hoverClass}`
      }`
    }
  >
    <item.icon style={{ width: 18, height: 18 }} className="shrink-0" />
    {item.label}
  </NavLink>
);

export function SidebarNav() {
  const { role, logout, user } = useAuth();
  const { data: profiles = [] } = useProfiles();
  const navigate = useNavigate();

  // Get current user's profile for avatar
  const myProfile = profiles.find((p: any) => p.user_id === user?.id);
  const avatarUrl = myProfile?.avatar_url;

  const isSuperAdmin = role === "super_admin";
  const isAdmin = role === "admin" || role === "teacher";

  const activeStyle = "bg-gradient-to-r from-violet-600 to-pink-500 text-white font-semibold shadow-[0_4px_16px_rgba(139,92,246,0.20)]";
  const hoverStyle = "text-slate-500 hover:text-slate-800 hover:bg-[#F3EEFF]";

  return (
    <aside
      className="hidden md:flex flex-col fixed top-0 left-0 h-screen w-64 z-40 border-r"
      style={{
        background: 'rgba(255,255,255,0.78)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderColor: 'rgba(255,255,255,0.55)',
        boxShadow: '0 8px 24px rgba(15,23,42,0.06)',
      }}
    >
      {/* Logo */}
      <div className="px-6 py-5 border-b border-black/[0.04]">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center shadow-lg shadow-violet-500/20">
            <GraduationCap className="w-5 h-5 text-white" />
          </div>
          <div>
            <p className="font-semibold text-slate-800 text-[15px]" style={{ fontFamily: 'Poppins, sans-serif' }}>
              UPSC Nadiya
            </p>
            <span className={`inline-flex items-center gap-1 text-[10px] font-medium px-2 py-0.5 rounded-full mt-0.5 ${
              isSuperAdmin ? "bg-amber-50 text-amber-600" : isAdmin ? "bg-violet-50 text-violet-600" : "bg-pink-50 text-pink-600"
            }`}>
              {isSuperAdmin ? "Super Admin" : role === "admin" ? "Admin" : isAdmin ? "Teacher" : "Student"}
            </span>
          </div>
        </div>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto px-3 py-5 space-y-0.5 scrollbar-hide">
        {isSuperAdmin ? (
          <>
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2">Admin</p>
            {superAdminOwnNav.map((item, i) => navLink(item, activeStyle, hoverStyle, i))}
            <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-4 mb-2 mt-5">Manage Platform</p>
            {superAdminMgmtNav.map((item, i) => navLink(item, activeStyle, hoverStyle, i + 3))}
          </>
        ) : (
          (isAdmin ? adminNav : studentNav).map((item, i) => navLink(item, activeStyle, hoverStyle, i))
        )}
      </nav>

      {/* User card + logout */}
      <div className="px-3 py-4 border-t border-black/[0.04] space-y-2">
        <div className="flex items-center gap-3 px-3 py-2.5 bg-slate-50 rounded-xl">
          <div className="w-9 h-9 rounded-xl overflow-hidden shadow-lg shadow-violet-500/20 shrink-0">
            {avatarUrl ? (
              <img
                src={avatarUrl}
                alt="Profile"
                className="w-full h-full object-cover"
                onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
              />
            ) : (
              <div className="w-full h-full bg-gradient-to-br from-violet-500 to-pink-500 flex items-center justify-center text-white text-sm font-bold">
                {(user?.name?.[0] ?? user?.email?.[0] ?? "U").toUpperCase()}
              </div>
            )}
          </div>
          <div className="min-w-0 flex-1">
            <p className="text-sm font-semibold text-slate-700 truncate">{user?.name ?? "User"}</p>
            <p className="text-xs text-slate-400 truncate">{user?.email}</p>
          </div>
        </div>
        <button
          onClick={() => { logout(); navigate("/login"); }}
          className="w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-slate-500 hover:text-red-500 hover:bg-red-50 text-sm font-medium transition-all duration-200"
        >
          <LogOut style={{ width: 18, height: 18 }} /> Sign Out
        </button>
      </div>
    </aside>
  );
}
