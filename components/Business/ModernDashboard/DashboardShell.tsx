"use client";

import {
  useState,
  useEffect,
  FormEvent,
  ReactNode,
  useRef,
  useCallback,
} from "react";
import {
  LayoutDashboard,
  FileText,
  Users,
  Settings,
  Search,
  Bell,
  ChevronDown,
  Menu,
  Plus,
  Check,
  Building2,
  BarChart3,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Image from "next/image";
import { UserButton } from "@/components/auth/UserButton";
import { useRouter } from "next/navigation";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import Pricing from "@/components/pricing";
import { ThemeToggle } from "@/components/theme-toggle";

interface DashboardShellProps {
  children: ReactNode;
  business: any;
  allBusinesses?: any[];
  activePage?:
    | "dashboard"
    | "invoices"
    | "clients"
    | "settings"
    | "analytics"
    | "plan";
  pendingInvoicesCount?: number;
  userPlan?: "free_user" | "professional" | "enterprise";
}

export function DashboardShell({
  children,
  business,
  allBusinesses = [],
  activePage = "dashboard",
  pendingInvoicesCount = 0,
  userPlan = "free_user",
}: DashboardShellProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isUpgradeOpen, setIsUpgradeOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    setMounted(true);
  }, []);

  // ⌘K keyboard shortcut for search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      // Escape to blur search
      if (
        e.key === "Escape" &&
        document.activeElement === searchInputRef.current
      ) {
        searchInputRef.current?.blur();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  const navItems = [
    {
      label: "Dashboard",
      icon: LayoutDashboard,
      id: "dashboard",
      href: `/dashboard/business?business_id=${business.id}`,
    },
    {
      label: "Invoices",
      icon: FileText,
      id: "invoices",
      href: `/dashboard/invoices?business_id=${business.id}`,
    },
    {
      label: "Clients",
      icon: Users,
      id: "clients",
      href: `/dashboard/clients?business_id=${business.id}`,
    },
    {
      label: "Analytics",
      icon: BarChart3,
      id: "analytics",
      href: `/dashboard/analytics?business_id=${business.id}`,
    },
    {
      label: "Settings",
      icon: Settings,
      id: "settings",
      href: `/dashboard/business/settings?business_id=${business.id}`,
    },
  ];

  const handleSearch = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      router.push(
        `/dashboard/invoices?business_id=${business.id}&search=${encodeURIComponent(
          searchQuery
        )}`
      );
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50 dark:bg-[#0B1120] text-slate-900 dark:text-white font-sans selection:bg-blue-500/30">
      {/* Modals */}
      {isUpgradeOpen && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="bg-white dark:bg-slate-950 rounded-xl shadow-2xl w-full max-w-5xl max-h-[90vh] overflow-y-auto relative border border-slate-800">
            <button
              onClick={() => setIsUpgradeOpen(false)}
              className="absolute top-4 right-4 p-2 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-full transition-colors z-10"
            >
              <span className="sr-only">Close</span>
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="w-5 h-5 text-slate-500"
              >
                <path d="M18 6 6 18" />
                <path d="m6 6 12 12" />
              </svg>
            </button>
            <div className="p-6">
              <h2 className="text-2xl font-bold text-center mb-2 text-slate-900 dark:text-white">
                Upgrade Your Plan
              </h2>
              <p className="text-center text-slate-500 mb-6">
                Unlock premium features and remove limits
              </p>
              <Pricing />
            </div>
          </div>
        </div>
      )}

      {/* Mobile Sidebar Overlay */}
      <div
        className={`fixed inset-0 bg-black/50 z-[90] md:hidden transition-opacity duration-300 ${
          isSidebarOpen
            ? "opacity-100 pointer-events-auto"
            : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsSidebarOpen(false)}
      />

      {/* Sidebar */}
      <aside
        className={`
          fixed md:sticky top-0 left-0 z-[100] h-[100dvh] w-[80vw] sm:w-80 md:w-72 flex flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4 gap-6 transition-transform duration-300 ease-in-out overflow-y-auto
          ${
            isSidebarOpen
              ? "translate-x-0"
              : "-translate-x-full md:translate-x-0"
          }
        `}
      >
        {/* Business Switcher (Unified) */}
        <div className="px-2 mb-6">
          <Popover>
            <PopoverTrigger asChild>
              <button className="w-full flex items-center gap-3 p-2 rounded-xl hover:bg-gray-100 dark:hover:bg-slate-800 transition-all cursor-pointer group text-left outline-none">
                {business.logo ? (
                  <div className="w-12 h-12 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700 shrink-0">
                    <Image
                      src={business.logo}
                      alt={business.name}
                      height={48}
                      width={48}
                      className="object-cover w-full h-full"
                    />
                  </div>
                ) : (
                  <div className="w-12 h-12 rounded-full bg-blue-600 flex items-center justify-center border border-blue-500 shadow-sm shrink-0">
                    <span className="text-lg font-bold text-white">
                      {business.name.substring(0, 2).toUpperCase()}
                    </span>
                  </div>
                )}
                <div className="flex-1 min-w-0 flex flex-col">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                    {business.name}
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 truncate">
                    {userPlan === "professional"
                      ? "Professional Plan"
                      : userPlan === "enterprise"
                        ? "Enterprise Plan"
                        : "Free Plan"}
                  </span>
                </div>
                <ChevronDown className="w-4 h-4 text-slate-400" />
              </button>
            </PopoverTrigger>
            <PopoverContent
              className="w-60 p-2 bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 text-slate-900 dark:text-white z-[110]"
              side="bottom"
              align="start"
              sideOffset={8}
            >
              <div className="space-y-1">
                <div className="px-2 py-1.5 text-xs font-medium text-slate-500">
                  My Businesses
                </div>
                {allBusinesses.map((biz) => (
                  <Link
                    key={biz.id}
                    href={`/dashboard/business?business_id=${biz.id}`}
                    className={`flex items-center gap-2 px-2 py-2 rounded-md text-sm transition-colors ${
                      biz.id === business.id
                        ? "bg-blue-600 text-white"
                        : "text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white"
                    }`}
                  >
                    <Building2 className="w-4 h-4 opacity-70" />
                    <span className="flex-1 truncate">{biz.name}</span>
                    {biz.id === business.id && (
                      <Check className="w-3 h-3 ml-auto" />
                    )}
                  </Link>
                ))}
                <div className="my-1 border-t border-gray-200 dark:border-slate-800" />
                <Link
                  href="/dashboard/business/new"
                  className="w-full flex items-center gap-2 px-2 py-2 rounded-md text-sm text-slate-600 dark:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors text-left"
                >
                  <Plus className="w-4 h-4 opacity-70" />
                  <span>Create Business</span>
                </Link>
              </div>
            </PopoverContent>
          </Popover>
        </div>

        {/* Navigation */}
        <div className="space-y-1">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              onClick={() => setIsSidebarOpen(false)}
              className={`h-10 w-full rounded-lg flex items-center px-3 gap-3 transition-all duration-200 group ${
                activePage === item.id
                  ? "bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 font-medium"
                  : "text-slate-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <item.icon
                className={`w-5 h-5 ${
                  activePage === item.id
                    ? "text-blue-600 dark:text-blue-400"
                    : "text-slate-500 group-hover:text-slate-700 dark:group-hover:text-slate-300"
                }`}
              />
              <span className="text-base">{item.label}</span>
              {item.label === "Invoices" && pendingInvoicesCount > 0 && (
                <span className="ml-auto text-[10px] font-bold bg-blue-100 dark:bg-blue-900/40 text-blue-600 dark:text-blue-300 px-1.5 py-0.5 rounded-full">
                  {pendingInvoicesCount}
                </span>
              )}
            </Link>
          ))}
        </div>

        {/* Plan Status */}
        <div className="px-2 mt-auto space-y-2">
          {/* Extra Credits Display */}
          {business.extra_invoice_credits > 0 && (
            <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-3 border border-blue-100 dark:border-blue-800/50 flex items-center justify-between">
              <span className="text-sm font-medium text-blue-700 dark:text-blue-300">
                Extra Credits
              </span>
              <Badge className="bg-blue-100 text-blue-700 dark:bg-blue-900 dark:text-blue-300 hover:bg-blue-100 dark:hover:bg-blue-900 border-0">
                {business.extra_invoice_credits}
              </Badge>
            </div>
          )}

          <div className="bg-gray-100/50 dark:bg-slate-900/50 rounded-xl p-3 border border-gray-200/50 dark:border-slate-800/50">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-slate-500 dark:text-slate-400">
                Current Plan
              </span>
              <Badge
                variant="outline"
                className={`text-xs px-2 py-0.5 h-auto min-h-5 border-0 font-semibold whitespace-nowrap ${
                  userPlan === "enterprise"
                    ? "bg-purple-500/10 text-purple-600 dark:text-purple-400"
                    : userPlan === "professional"
                      ? "bg-blue-500/10 text-blue-600 dark:text-blue-400"
                      : "bg-slate-200/50 dark:bg-slate-700/30 text-slate-600 dark:text-slate-400"
                }`}
              >
                {userPlan === "professional"
                  ? "Professional"
                  : userPlan === "enterprise"
                    ? "Enterprise"
                    : "Free"}
              </Badge>
            </div>
            {userPlan === "free_user" ? (
              <Link
                href={`/dashboard/plan?business_id=${business.id}`}
                className="block w-full"
              >
                <Button
                  size="sm"
                  className="w-full text-sm h-8 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 border-0 text-white shadow-lg shadow-blue-500/20"
                >
                  Upgrade Plan
                </Button>
              </Link>
            ) : (
              <Link
                href={`/dashboard/plan?business_id=${business.id}`}
                className="block w-full"
              >
                <Button
                  size="sm"
                  variant="neutralOutline"
                  className="w-full text-sm h-8 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300"
                >
                  Manage Plan
                </Button>
              </Link>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-w-0 overflow-hidden">
        {/* Top Header */}
        <header className="h-16 border-b border-gray-200 dark:border-slate-800 bg-white/50 dark:bg-slate-950/50 backdrop-blur-xl sticky top-0 z-30 flex items-center justify-between px-4 md:px-6">
          <div className="flex items-center gap-4">
            <Button
              variant="ghost"
              size="icon"
              className="md:hidden text-slate-500 dark:text-slate-400"
              onClick={() => setIsSidebarOpen(true)}
            >
              <Menu className="w-5 h-5" />
            </Button>

            {/* Mobile Business Name */}
            <div className="flex items-center gap-2 md:hidden">
              {business.logo ? (
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center overflow-hidden border border-gray-200 dark:border-slate-700">
                  <Image
                    src={business.logo}
                    alt={business.name}
                    height={32}
                    width={32}
                    className="object-cover w-full h-full"
                  />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center border border-blue-500 shadow-sm">
                  <span className="text-xs font-bold text-white">
                    {business.name.substring(0, 2).toUpperCase()}
                  </span>
                </div>
              )}
              <span className="text-sm font-semibold text-slate-900 dark:text-white truncate max-w-[120px]">
                {business.name}
              </span>
            </div>

            {/* Breadcrumbs */}
            <nav className="hidden md:flex items-center text-sm font-medium">
              <ol className="flex items-center gap-2">
                <li>
                  <Link
                    href={`/dashboard/business?business_id=${business.id}`}
                    className="text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-slate-200 transition-colors"
                  >
                    {business.name}
                  </Link>
                </li>
                <li className="text-slate-300 dark:text-slate-700 select-none">
                  /
                </li>
                <li>
                  <span className="text-slate-900 dark:text-white font-semibold capitalize">
                    {activePage}
                  </span>
                </li>
              </ol>
            </nav>
          </div>

          <div className="flex items-center gap-4">
            {/* Search */}
            <form
              onSubmit={handleSearch}
              className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-gray-100 dark:bg-slate-900 rounded-md border border-gray-200 dark:border-slate-800 w-48 lg:w-64 focus-within:border-blue-500/50 focus-within:ring-1 focus-within:ring-blue-500/50 transition-all"
            >
              <Search className="w-4 h-4 text-slate-500" />
              <input
                ref={searchInputRef}
                type="text"
                placeholder="Search invoices..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-transparent border-none outline-none text-xs text-slate-900 dark:text-slate-300 placeholder:text-slate-500 dark:placeholder:text-slate-600 w-full"
              />
              <div className="ml-auto text-[10px] font-mono text-slate-500 dark:text-slate-600 border border-gray-200 dark:border-slate-800 rounded px-1">
                ⌘K
              </div>
            </form>

            {/* Actions */}
            <div className="flex items-center gap-3">
              <ThemeToggle />

              {mounted ? (
                <UserButton
                  appearance={{
                    elements: {
                      avatarBox: "w-8 h-8",
                    },
                  }}
                />
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-800 animate-pulse" />
              )}
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 space-y-8 pb-24 md:pb-8">
          {children}
        </div>
      </main>

      {/* Mobile Bottom Navigation */}
      <div className="md:hidden fixed bottom-0 left-0 right-0 bg-white/90 dark:bg-slate-950/90 backdrop-blur-xl border-t border-gray-200 dark:border-slate-800 z-50 px-6 py-3 pb-6 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.1)]">
        <div className="flex justify-between items-center">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center gap-1 p-2 rounded-xl transition-all duration-200 ${
                activePage === item.id
                  ? "text-blue-600 dark:text-blue-400 scale-105"
                  : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200"
              }`}
            >
              <item.icon
                className={`w-6 h-6 ${
                  activePage === item.id
                    ? "stroke-[2.5px] fill-blue-600/10"
                    : "stroke-2"
                }`}
              />
              <span className="text-[10px] font-bold tracking-wide">
                {item.label}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
