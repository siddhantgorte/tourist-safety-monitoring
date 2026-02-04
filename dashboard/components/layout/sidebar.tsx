"use client"

import { MapPin, AlertCircle, Shield, BarChart3, Users, Grid3x3, LogOut } from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"

interface SidebarProps {
  userRole?: string
}

export function Sidebar({ userRole = "L2" }: SidebarProps) {
  const pathname = usePathname();

  const menuItems = [
    { href: "/", label: "Overview", icon: Grid3x3, exact: true },
    { href: "/map", label: "Live Tracking", icon: MapPin },
    { href: "/incidents", label: "Incidents", icon: AlertCircle },
    { href: "/id-verification", label: "Digital ID", icon: Shield },
    { href: "/analytics", label: "Analytics", icon: BarChart3 },
    { href: "/users", label: "Users", icon: Users },
  ]

  return (
    <aside className="w-64 bg-sidebar border-r border-sidebar-border flex flex-col">
      {/* Logo */}
      <div className="p-6 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded bg-sidebar-primary flex items-center justify-center">
            <Shield className="w-5 h-5 text-sidebar-primary-foreground" />
          </div>
          <div>
            <h1 className="text-sm font-bold text-sidebar-foreground">SafetyHub</h1>
            <p className="text-xs text-sidebar-accent">Tourist Safety</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {menuItems.map((item) => {
          const Icon = item.icon
          const isActive = item.exact ? pathname === item.href : pathname.startsWith(item.href)

          return (
            <Link
              key={item.href}
              href={item.href}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm transition-colors ${isActive
                  ? "bg-sidebar-primary text-sidebar-primary-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/10"
                }`}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </Link>
          )
        })}
      </nav>

      {/* Footer */}
      <div className="p-4 border-t border-sidebar-border">
        <div className="text-xs text-sidebar-accent mb-4">
          <p className="font-medium">Role: {userRole}</p>
          <p className="text-sidebar-foreground/60">Authorized Officer</p>
        </div>
        <button className="w-full flex items-center gap-2 px-4 py-2 rounded-lg text-sm text-sidebar-foreground hover:bg-sidebar-accent/10 transition-colors">
          <LogOut className="w-4 h-4" />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  )
}
