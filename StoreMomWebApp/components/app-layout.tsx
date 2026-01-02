"use client"

import * as React from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Menu,
  Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetTrigger, SheetTitle } from "@/components/ui/sheet"
import { Separator } from "@/components/ui/separator"
import { ThemeToggle } from "@/components/theme-toggle"
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip"
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

const navigation = [
  { name: "หน้าหลัก", href: "/", icon: Home },
  { name: "ลูกค้า", href: "/customers", icon: Users },
  { name: "สินค้า", href: "/products", icon: Package },
  { name: "คำสั่งซื้อ", href: "/orders", icon: ShoppingCart },
]

const pageTitles: Record<string, string> = {
  "/": "หน้าหลัก",
  "/customers": "จัดการลูกค้า",
  "/products": "จัดการสินค้า",
  "/orders": "จัดการคำสั่งซื้อ",
}

interface AppLayoutProps {
  children: React.ReactNode
}

export function AppLayout({ children }: AppLayoutProps) {
  const pathname = usePathname()
  const [sidebarOpen, setSidebarOpen] = React.useState(false)

  const currentPageTitle = pageTitles[pathname] || "StoreMom"

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-950 dark:to-gray-900">
        {/* Desktop Sidebar */}
        <aside className="hidden lg:flex lg:flex-col lg:w-72 lg:fixed lg:inset-y-0 border-r border-gray-200/50 dark:border-gray-800/50 glass">
          {/* Logo */}
          <div className="flex h-20 items-center gap-3 px-6 border-b border-gray-200/50 dark:border-gray-800/50">
            <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
              <Sparkles className="h-5 w-5 text-white" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                StoreMom
              </span>
              <p className="text-xs text-muted-foreground">ระบบจัดการร้านค้า</p>
            </div>
          </div>

          {/* Navigation */}
          <nav className="flex-1 space-y-2 px-4 py-6">
            <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
              เมนูหลัก
            </p>
            {navigation.map((item) => {
              const isActive = pathname === item.href
              return (
                <Tooltip key={item.name}>
                  <TooltipTrigger asChild>
                    <Link
                      href={item.href}
                      className={cn(
                        "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                        isActive
                          ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                          : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-foreground"
                      )}
                    >
                      <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                      {item.name}
                    </Link>
                  </TooltipTrigger>
                  <TooltipContent side="right" className="lg:hidden">
                    {item.name}
                  </TooltipContent>
                </Tooltip>
              )
            })}
          </nav>

          {/* Footer */}
          <div className="border-t border-gray-200/50 dark:border-gray-800/50 p-4">
            <div className="flex items-center justify-between px-2">
              <div>
                <p className="text-xs font-medium text-foreground">StoreMom</p>
                <p className="text-xs text-muted-foreground">v1.0.0</p>
              </div>
              <ThemeToggle />
            </div>
          </div>
        </aside>

        {/* Mobile Sidebar */}
        <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
          <SheetContent side="left" className="w-72 p-0 glass">
            <SheetTitle className="sr-only">เมนูนำทาง</SheetTitle>
            <div className="flex h-20 items-center gap-3 px-6 border-b border-gray-200/50 dark:border-gray-800/50">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 shadow-lg shadow-violet-500/25">
                <Sparkles className="h-5 w-5 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-r from-violet-600 to-indigo-600 bg-clip-text text-transparent">
                  StoreMom
                </span>
                <p className="text-xs text-muted-foreground">ระบบจัดการร้านค้า</p>
              </div>
            </div>
            <nav className="flex-1 space-y-2 px-4 py-6">
              <p className="px-3 text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-4">
                เมนูหลัก
              </p>
              {navigation.map((item) => {
                const isActive = pathname === item.href
                return (
                  <Link
                    key={item.name}
                    href={item.href}
                    onClick={() => setSidebarOpen(false)}
                    className={cn(
                      "flex items-center gap-3 rounded-xl px-4 py-3 text-sm font-medium transition-all duration-200",
                      isActive
                        ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-lg shadow-violet-500/25"
                        : "text-muted-foreground hover:bg-gray-100 dark:hover:bg-gray-800/50 hover:text-foreground"
                    )}
                  >
                    <item.icon className={cn("h-5 w-5", isActive && "text-white")} />
                    {item.name}
                  </Link>
                )
              })}
            </nav>
            <Separator className="opacity-50" />
            <div className="p-4">
              <div className="flex items-center justify-between px-2">
                <div>
                  <p className="text-xs font-medium text-foreground">StoreMom</p>
                  <p className="text-xs text-muted-foreground">v1.0.0</p>
                </div>
                <ThemeToggle />
              </div>
            </div>
          </SheetContent>
        </Sheet>

        {/* Main Content */}
        <div className="flex-1 lg:pl-72">
          {/* Header */}
          <header className="sticky top-0 z-40 flex h-14 items-center gap-4 px-4 lg:px-8">
            {/* Mobile Menu Button */}
            <Sheet open={sidebarOpen} onOpenChange={setSidebarOpen}>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden rounded-xl">
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">เปิดเมนู</span>
                </Button>
              </SheetTrigger>
            </Sheet>

            {/* Breadcrumb */}
            <Breadcrumb className="hidden md:flex">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <BreadcrumbLink asChild>
                    <Link href="/" className="text-muted-foreground hover:text-violet-600 transition-colors">
                      หน้าหลัก
                    </Link>
                  </BreadcrumbLink>
                </BreadcrumbItem>
                {pathname !== "/" && (
                  <>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                      <BreadcrumbPage className="font-medium">{currentPageTitle}</BreadcrumbPage>
                    </BreadcrumbItem>
                  </>
                )}
              </BreadcrumbList>
            </Breadcrumb>

            {/* Page Title (Mobile) */}
            <h1 className="text-lg font-semibold md:hidden">{currentPageTitle}</h1>

            {/* Right Side */}
            <div className="ml-auto flex items-center gap-3">
              <div className="hidden lg:block">
                <ThemeToggle />
              </div>
            </div>
          </header>

          {/* Page Content */}
          <main className="flex-1 p-4 lg:p-8 animate-fade-in">
            {children}
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}
