import React, { useState, FC } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";

const AccountDropdown: FC<{ collapsed: boolean; onLogout: () => void }> = ({
  collapsed,
  onLogout,
}) => {
  const [open, setOpen] = React.useState(false);
  return (
    <div className="w-full flex flex-col items-center">
      <button
        className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg font-semibold text-neutral-700 hover:bg-orange-50 transition-all ${
          open ? "bg-orange-50" : ""
        }`}
        onClick={() => setOpen((v) => !v)}
        aria-haspopup="true"
        aria-expanded={open}
        title="Account menu"
        type="button"
      >
        {React.createElement(Icons.user, {
          className: "w-5 h-5 text-neutral-400",
        })}
        {!collapsed && <span>Account</span>}
        {!collapsed && (
          <svg
            className={`ml-auto w-4 h-4 transition-transform ${
              open ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        )}
      </button>
      {open && !collapsed && (
        <div className="absolute bottom-14 left-0 w-full bg-white border border-neutral-200 rounded-lg shadow-lg z-50 animate-fade-in flex flex-col">
          <Link
            href="/dashboard/account"
            className="flex items-center gap-3 px-4 py-3 rounded-t-lg text-base font-medium text-neutral-700 hover:bg-orange-50 transition-all"
            onClick={() => setOpen(false)}
          >
            {React.createElement(Icons.user, {
              className: "w-5 h-5 text-orange-400",
            })}
            <span>Account</span>
          </Link>
          <button
            onClick={() => {
              setOpen(false);
              onLogout();
            }}
            className="flex items-center gap-3 px-4 py-3 rounded-b-lg text-base font-medium text-orange-700 hover:bg-orange-50 transition-all border-t border-neutral-100"
            type="button"
          >
            {React.createElement(Icons.logout, {
              className: "w-5 h-5 text-orange-400",
            })}
            <span>Logout</span>
          </button>
        </div>
      )}
    </div>
  );
};

const sidebarLinks = [
  { name: "Ideas", icon: Icons.idea, href: "/dashboard" },
  { name: "Clips", icon: Icons.clip, href: "/dashboard/clips" },
  { name: "Tags", icon: Icons.tag, href: "/dashboard/tags" },
];

export default function Sidebar({ active = "Ideas" }: { active?: string }) {
  const [collapsed, setCollapsed] = useState(false);
  const router = useRouter();

  const handleLogout = () => {
    // Clear token from localStorage
    localStorage.removeItem("token");
    // Redirect to home page
    router.push("/");
  };
  return (
    <aside
      className={`h-screen border-r bg-white/70 bg-[linear-gradient(135deg,_rgba(255,186,73,0.10)_0%,_rgba(255,126,20,0.10)_100%)] backdrop-blur-xl flex flex-col py-6 px-4 transition-all duration-300
        ${collapsed ? "w-16 min-w-[4rem]" : "w-64 min-w-[16rem]"}
        fixed left-0 top-0 z-40 overflow-y-auto border-neutral-200 shadow-xl`}
    >
      <div className="flex items-center mb-8 group">
        <button
          className="mr-2 p-1 rounded-full bg-white/60 hover:bg-orange-100 border border-orange-100 shadow transition-colors"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <svg
            className={`h-6 w-6 text-orange-400 transition-transform ${
              collapsed ? "rotate-180" : ""
            }`}
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            viewBox="0 0 24 24"
          >
            <path d="M9 18l6-6-6-6" />
          </svg>
        </button>
        {!collapsed && (
          <Link
            href="/dashboard"
            className="flex items-center group cursor-pointer"
          >
            <span className="mr-2">
              {/* Homepage/Auth Logo Icon (orange) */}
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8 text-orange-400"
              >
                <path d="M15 6v12a3 3 0 1 0 3-3H6a3 3 0 1 0 3 3V6a3 3 0 1 0-3 3h12a3 3 0 1 0-3-3" />
              </svg>
            </span>
            <span className="text-xl font-bold text-neutral-900">ClipKit</span>
          </Link>
        )}
      </div>
      <nav className="flex flex-col gap-2 mt-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-semibold transition-all
              ${
                active === link.name
                  ? "bg-[#333] text-white shadow-md border-l-4 border-orange-400"
                  : "hover:bg-orange-50/80 text-neutral-700 hover:text-orange-600 hover:translate-x-1"
              }
              ${collapsed ? "justify-center px-0" : ""}`}
            title={link.name}
          >
            {React.createElement(link.icon, {
              className: `w-5 h-5 ${
                active === link.name
                  ? "text-orange-500"
                  : "text-neutral-400 group-hover:text-orange-400"
              }`,
            })}
            {!collapsed && link.name}
          </Link>
        ))}
      </nav>
      {/* Account/Logout dropdown at bottom */}
      <div className="mt-auto pt-6 border-t border-orange-100 flex flex-col items-center">
        <div className="relative w-full flex justify-center">
          <AccountDropdown collapsed={collapsed} onLogout={handleLogout} />
        </div>
      </div>
      {/* AccountDropdown component for bottom dropdown menu */}
    </aside>
  );
}
