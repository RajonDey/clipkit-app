"use client";
import React, { useState } from "react";
import Link from "next/link";
import { Icons } from "@/components/icons";
import { useRouter } from "next/navigation";

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
      className={`h-screen border-r bg-brand-50/90 backdrop-blur-md flex flex-col py-6 px-4 transition-all duration-300
        ${collapsed ? "w-16 min-w-[4rem]" : "w-64 min-w-[16rem]"}
        fixed left-0 top-0 z-40 overflow-y-auto border-brand-200 shadow-sm`}
    >
      <div className="flex items-center mb-8 group">
        <button
          className="mr-2 p-1 rounded-full hover:bg-accent-100 transition-colors"
          onClick={() => setCollapsed((c) => !c)}
          aria-label="Toggle sidebar"
        >
          <svg
            className={`h-6 w-6 transition-transform ${
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
          <Link href="/dashboard" className="flex items-center">
            <span className="mr-2">
              <Icons.logo className="h-8 w-8 text-accent-600 group-hover:text-accent-500 transition-colors" />
            </span>
            <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-accent-600 to-secondary-600 group-hover:from-accent-500 group-hover:to-secondary-500 transition-all duration-300">
              ClipKit
            </span>
          </Link>
        )}
      </div>
      <nav className="flex flex-col gap-2 mt-4">
        {sidebarLinks.map((link) => (
          <Link
            key={link.name}
            href={link.href}
            className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all
              ${
                active === link.name
                  ? "bg-gradient-to-r from-accent-100/80 to-secondary-100/80 text-accent-700 shadow-sm"
                  : "hover:bg-brand-200/60 text-brand-700 hover:text-brand-900 hover:translate-x-1"
              }
              ${collapsed ? "justify-center px-0" : ""}`}
            title={link.name}
          >
            {React.createElement(link.icon, {
              className: "w-5 h-5",
            })}
            {!collapsed && link.name}
          </Link>
        ))}

        {/* Account section */}
        <Link
          href="/dashboard/account"
          className={`flex items-center gap-3 px-4 py-3 rounded-lg text-base font-medium transition-all
            ${
              active === "Account"
                ? "bg-gradient-to-r from-accent-100/80 to-secondary-100/80 text-accent-700 shadow-sm"
                : "hover:bg-brand-200/60 text-brand-700 hover:text-brand-900 hover:translate-x-1"
            }
            ${collapsed ? "justify-center px-0" : ""}`}
          title="Account"
        >
          {React.createElement(Icons.user, {
            className: "w-5 h-5",
          })}
          {!collapsed && "Account"}
        </Link>
      </nav>

      {/* Logout at bottom */}
      <div className="mt-auto pt-6 border-t border-brand-200">
        <button
          onClick={handleLogout}
          className="flex items-center gap-3 px-4 py-3 rounded-lg font-medium text-brand-700 bg-white/50 hover:bg-white transition-all shadow-sm"
          title="Logout"
        >
          {React.createElement(Icons.logout, {
            className: "w-5 h-5 text-danger-500",
          })}
          {!collapsed && <span className="text-danger-600">Logout</span>}
        </button>
      </div>
    </aside>
  );
}
