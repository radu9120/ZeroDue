"use client";

import { useState, useRef, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";
import { toast } from "sonner";
import type { User as SupabaseUser } from "@supabase/supabase-js";

interface UserButtonProps {
  afterSignOutUrl?: string;
  /** Size of the avatar button */
  size?: "sm" | "md" | "lg";
  /** For backward compatibility with Clerk-style appearance prop (ignored) */
  appearance?: {
    elements?: {
      avatarBox?: string;
    };
  };
}

const sizeClasses = {
  sm: "w-7 h-7 text-xs",
  md: "w-9 h-9 text-sm",
  lg: "w-11 h-11 text-base",
};

export function UserButton({
  afterSignOutUrl = "/",
  size = "md",
}: UserButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    const supabase = createClient();

    // Get initial user
    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSignOut = async () => {
    try {
      const supabase = createClient();
      await supabase.auth.signOut();
      toast.success("Signed out successfully");
      router.push(afterSignOutUrl);
      router.refresh();
    } catch {
      toast.error("Failed to sign out");
    }
  };

  if (isLoading) {
    return (
      <div className="w-9 h-9 rounded-full bg-gray-200 dark:bg-slate-700 animate-pulse" />
    );
  }

  if (!user) {
    return null;
  }

  const userName =
    user.user_metadata?.full_name ||
    user.user_metadata?.name ||
    user.email?.split("@")[0] ||
    "User";
  const userEmail = user.email || "";
  const userAvatar =
    user.user_metadata?.avatar_url || user.user_metadata?.picture;
  const initials = userName
    .split(" ")
    .map((n: string) => n[0])
    .join("")
    .toUpperCase()
    .slice(0, 2);

  return (
    <div className="relative" ref={dropdownRef}>
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
      >
        {userAvatar ? (
          <img
            src={userAvatar}
            alt={userName}
            className="w-9 h-9 rounded-full object-cover border-2 border-white dark:border-slate-700 shadow-sm"
          />
        ) : (
          <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold shadow-sm">
            {initials}
          </div>
        )}
      </button>

      {isOpen && (
        <div className="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-2xl shadow-black/10 dark:shadow-black/30 border border-gray-200 dark:border-slate-700 py-2 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
          {/* User info header */}
          <div className="px-4 py-3 border-b border-gray-100 dark:border-slate-800">
            <div className="flex items-center gap-3">
              {userAvatar ? (
                <img
                  src={userAvatar}
                  alt={userName}
                  className="w-10 h-10 rounded-full object-cover"
                />
              ) : (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-cyan-500 flex items-center justify-center text-white text-sm font-semibold">
                  {initials}
                </div>
              )}
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-gray-900 dark:text-white truncate">
                  {userName}
                </p>
                <p className="text-xs text-gray-500 dark:text-slate-400 truncate">
                  {userEmail}
                </p>
              </div>
            </div>
          </div>

          {/* Menu items */}
          <div className="py-1">
            <Link
              href="/dashboard/settings"
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors"
            >
              <Settings className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              Manage account
            </Link>
          </div>

          {/* Sign out */}
          <div className="border-t border-gray-100 dark:border-slate-800 py-1">
            <button
              onClick={handleSignOut}
              className="flex items-center gap-3 px-4 py-2.5 text-sm text-gray-700 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800 transition-colors w-full"
            >
              <LogOut className="w-4 h-4 text-gray-400 dark:text-slate-500" />
              Sign out
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Auth state components to replace Clerk's SignedIn/SignedOut
interface AuthStateProps {
  children: React.ReactNode;
}

export function SignedIn({ children }: AuthStateProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading || !user) {
    return null;
  }

  return <>{children}</>;
}

export function SignedOut({ children }: AuthStateProps) {
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      setUser(user);
      setIsLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  if (isLoading || user) {
    return null;
  }

  return <>{children}</>;
}

// SignIn/SignUp button components
interface SignInButtonProps {
  children?: React.ReactNode;
  mode?: "modal" | "redirect";
}

export function SignInButton({ children }: SignInButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/sign-in");
  };

  if (children) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-slate-300 hover:text-gray-900 dark:hover:text-white transition-colors"
    >
      Sign in
    </button>
  );
}

export function SignUpButton({ children }: SignInButtonProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push("/sign-up");
  };

  if (children) {
    return (
      <div onClick={handleClick} className="cursor-pointer">
        {children}
      </div>
    );
  }

  return (
    <button
      onClick={handleClick}
      className="px-4 py-2 text-sm font-medium bg-blue-600 text-white rounded-xl hover:bg-blue-500 transition-colors"
    >
      Sign up
    </button>
  );
}
