"use client";

import { useState, useEffect } from "react";
import { createClient } from "@/lib/supabase/client";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
  User,
  Lock,
  Shield,
  Loader2,
  Check,
  AlertTriangle,
  ArrowLeft,
  Crown,
  Zap,
  Rocket,
  X,
  Calendar,
  CreditCard,
  Clock,
} from "lucide-react";
import type { User as SupabaseUser } from "@supabase/supabase-js";
import Link from "next/link";
import { ThemeToggle } from "@/components/theme-toggle";

export default function SettingsPage() {
  const router = useRouter();
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [currentPlan, setCurrentPlan] = useState<string>("free_user");
  const [subscriptionStatus, setSubscriptionStatus] = useState<{
    isTrialing?: boolean;
    trialEndsAt?: string;
    cancelAtPeriodEnd?: boolean;
    periodEnd?: string;
    hasUsedTrial?: boolean;
  }>({});

  // Delete account states
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirmText, setDeleteConfirmText] = useState("");
  const [isDeleting, setIsDeleting] = useState(false);

  // Form states
  const [fullName, setFullName] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  useEffect(() => {
    const supabase = createClient();

    supabase.auth.getUser().then(({ data: { user } }) => {
      if (!user) {
        router.push("/sign-in");
        return;
      }
      setUser(user);
      setFullName(
        user.user_metadata?.full_name || user.user_metadata?.name || ""
      );
      setIsLoading(false);
    });

    // Fetch current plan
    fetch("/api/plan")
      .then((res) => res.json())
      .then((data) => setCurrentPlan(data.plan || "free_user"))
      .catch(() => setCurrentPlan("free_user"));

    // Fetch subscription status from user metadata
    supabase.auth.getUser().then(({ data: { user } }) => {
      if (user?.user_metadata) {
        setSubscriptionStatus({
          isTrialing: user.user_metadata.is_trialing,
          trialEndsAt: user.user_metadata.trial_ends_at,
          cancelAtPeriodEnd:
            user.user_metadata.subscription_cancel_at_period_end,
          periodEnd: user.user_metadata.subscription_period_end,
          hasUsedTrial: user.user_metadata.has_used_trial,
        });
      }
    });
  }, [router]);

  const handleUpdateProfile = async () => {
    if (!user) return;

    setIsSaving(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        data: { full_name: fullName },
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setIsSaving(false);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword !== confirmPassword) {
      toast.error("Passwords don't match");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setIsChangingPassword(true);
    try {
      const supabase = createClient();
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        toast.error(error.message);
        return;
      }

      toast.success("Password changed successfully!");
      setNewPassword("");
      setConfirmPassword("");
    } catch {
      toast.error("Failed to change password");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirmText !== "DELETE") {
      toast.error("Please type DELETE to confirm");
      return;
    }

    setIsDeleting(true);
    try {
      const response = await fetch("/api/account/delete", {
        method: "DELETE",
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || "Failed to delete account");
      }

      // Sign out and redirect
      const supabase = createClient();
      await supabase.auth.signOut();

      toast.success("Account deleted successfully");
      router.push("/");
    } catch (error) {
      toast.error(
        error instanceof Error ? error.message : "Failed to delete account"
      );
    } finally {
      setIsDeleting(false);
      setShowDeleteModal(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex items-center justify-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600" />
      </div>
    );
  }

  const isOAuthUser = user?.app_metadata?.provider !== "email";

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      {/* Delete Account Confirmation Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="w-full max-w-md bg-white dark:bg-slate-900 rounded-2xl shadow-2xl p-6 relative">
            <button
              onClick={() => {
                setShowDeleteModal(false);
                setDeleteConfirmText("");
              }}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-red-100 dark:bg-red-900/30 rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-6 h-6 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Delete Account
                </h3>
                <p className="text-sm text-gray-500 dark:text-slate-400">
                  This action cannot be undone
                </p>
              </div>
            </div>

            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4">
              <p className="text-sm text-red-800 dark:text-red-300">
                <strong>Warning:</strong> This will permanently delete:
              </p>
              <ul className="text-sm text-red-700 dark:text-red-400 mt-2 space-y-1 list-disc list-inside">
                <li>All your businesses</li>
                <li>All your invoices</li>
                <li>All your clients</li>
                <li>Your subscription (if any)</li>
                <li>All activity history</li>
              </ul>
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-2">
                Type <span className="font-bold text-red-600">DELETE</span> to
                confirm
              </label>
              <Input
                value={deleteConfirmText}
                onChange={(e) =>
                  setDeleteConfirmText(e.target.value.toUpperCase())
                }
                placeholder="Type DELETE"
                className="w-full border-red-200 dark:border-red-800 focus:border-red-500"
              />
            </div>

            <div className="flex gap-3">
              <Button
                variant="ghost"
                onClick={() => {
                  setShowDeleteModal(false);
                  setDeleteConfirmText("");
                }}
                className="flex-1"
                disabled={isDeleting}
              >
                Cancel
              </Button>
              <Button
                onClick={handleDeleteAccount}
                disabled={deleteConfirmText !== "DELETE" || isDeleting}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white disabled:opacity-50"
              >
                {isDeleting ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  "Delete My Account"
                )}
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="sticky top-0 z-40 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-4">
              <Link
                href="/dashboard"
                className="flex items-center gap-2 text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
              >
                <ArrowLeft className="w-5 h-5" />
                <span className="hidden sm:inline">Back to Dashboard</span>
              </Link>
            </div>
            <ThemeToggle />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-12">
        <div className="space-y-6 sm:space-y-8">
          {/* Page Header */}
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Account Settings
            </h1>
            <p className="text-sm sm:text-base text-gray-600 dark:text-slate-400 mt-1">
              Manage your account settings and preferences
            </p>
          </div>

          {/* Profile Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <User className="w-4 h-4 sm:w-5 sm:h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Profile Information
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  Update your personal details
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Full Name
                </label>
                <Input
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  placeholder="Enter your name"
                  className="w-full sm:max-w-md"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                  Email Address
                </label>
                <div className="flex flex-col sm:flex-row sm:items-center gap-2">
                  <Input
                    value={user?.email || ""}
                    disabled
                    className="w-full sm:max-w-md bg-gray-50 dark:bg-slate-800"
                  />
                  <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                    <Check className="w-4 h-4" />
                    <span className="text-sm">Verified</span>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-slate-500 mt-1">
                  Email cannot be changed
                </p>
              </div>

              {isOAuthUser && (
                <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-100 dark:border-blue-800">
                  <Shield className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-blue-700 dark:text-blue-300">
                    Signed in with{" "}
                    {user?.app_metadata?.provider === "google"
                      ? "Google"
                      : "OAuth provider"}
                  </span>
                </div>
              )}

              <div className="pt-4">
                <Button
                  onClick={handleUpdateProfile}
                  disabled={isSaving}
                  className="w-full sm:w-auto bg-blue-600 hover:bg-blue-500 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    "Save Changes"
                  )}
                </Button>
              </div>
            </div>
          </div>

          {/* Password Section - Only for email users */}
          {!isOAuthUser && (
            <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
              <div className="flex items-center gap-3 mb-5 sm:mb-6">
                <div className="w-9 h-9 sm:w-10 sm:h-10 bg-amber-100 dark:bg-amber-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                  <Lock className="w-4 h-4 sm:w-5 sm:h-5 text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                    Change Password
                  </h2>
                  <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                    Update your password to keep your account secure
                  </p>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    New Password
                  </label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    className="w-full sm:max-w-md"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-slate-300 mb-1.5">
                    Confirm New Password
                  </label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="w-full sm:max-w-md"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    onClick={handleChangePassword}
                    disabled={
                      isChangingPassword || !newPassword || !confirmPassword
                    }
                    variant="neutral"
                    className="w-full sm:w-auto"
                  >
                    {isChangingPassword ? (
                      <>
                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                        Changing...
                      </>
                    ) : (
                      "Change Password"
                    )}
                  </Button>
                </div>
              </div>
            </div>
          )}

          {/* Plan & Billing Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-gray-200 dark:border-slate-700 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-5 sm:mb-6">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <Crown className="w-4 h-4 sm:w-5 sm:h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Plan & Billing
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  Manage your subscription and billing
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
              <div className="flex items-center gap-3">
                <div
                  className={`w-12 h-12 rounded-xl flex items-center justify-center ${
                    currentPlan === "enterprise"
                      ? "bg-gradient-to-br from-purple-600 to-pink-500"
                      : currentPlan === "professional"
                        ? "bg-gradient-to-br from-blue-600 to-cyan-500"
                        : "bg-gradient-to-br from-slate-500 to-slate-600"
                  }`}
                >
                  {currentPlan === "enterprise" ? (
                    <Crown className="w-6 h-6 text-white" />
                  ) : currentPlan === "professional" ? (
                    <Rocket className="w-6 h-6 text-white" />
                  ) : (
                    <Zap className="w-6 h-6 text-white" />
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-semibold text-gray-900 dark:text-white">
                      {currentPlan === "enterprise"
                        ? "Enterprise Plan"
                        : currentPlan === "professional"
                          ? "Professional Plan"
                          : "Free Plan"}
                    </p>
                    {subscriptionStatus.isTrialing && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 rounded-full">
                        Trial
                      </span>
                    )}
                    {subscriptionStatus.cancelAtPeriodEnd && (
                      <span className="px-2 py-0.5 text-xs font-medium bg-orange-100 dark:bg-orange-900/30 text-orange-700 dark:text-orange-400 rounded-full">
                        Cancelling
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-500 dark:text-slate-400">
                    {currentPlan === "enterprise"
                      ? "Unlimited invoices & businesses"
                      : currentPlan === "professional"
                        ? "15 invoices/mo, 3 businesses"
                        : "2 invoices, 1 business"}
                  </p>
                </div>
              </div>
              <Link href="/upgrade">
                <Button
                  className={`w-full sm:w-auto ${
                    currentPlan === "enterprise"
                      ? "bg-slate-600 hover:bg-slate-500 text-white"
                      : "bg-blue-600 hover:bg-blue-500 text-white"
                  }`}
                >
                  {currentPlan === "enterprise"
                    ? "Manage Plan"
                    : "Upgrade Plan"}
                </Button>
              </Link>
            </div>

            {/* Subscription Details */}
            {currentPlan !== "free_user" && (
              <div className="mt-4 space-y-3">
                {/* Trial Status */}
                {subscriptionStatus.isTrialing &&
                  subscriptionStatus.trialEndsAt && (
                    <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                      <Clock className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-green-800 dark:text-green-300">
                          Free Trial Active
                        </p>
                        <p className="text-xs text-green-600 dark:text-green-400">
                          Your trial ends on{" "}
                          <span className="font-semibold">
                            {new Date(
                              subscriptionStatus.trialEndsAt
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                {/* Cancellation Scheduled */}
                {subscriptionStatus.cancelAtPeriodEnd &&
                  subscriptionStatus.periodEnd && (
                    <div className="flex items-center gap-3 p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg border border-orange-200 dark:border-orange-800">
                      <Calendar className="w-5 h-5 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-orange-800 dark:text-orange-300">
                          Cancellation Scheduled
                        </p>
                        <p className="text-xs text-orange-600 dark:text-orange-400">
                          Your plan will switch to Free on{" "}
                          <span className="font-semibold">
                            {new Date(
                              subscriptionStatus.periodEnd
                            ).toLocaleDateString("en-US", {
                              weekday: "long",
                              year: "numeric",
                              month: "long",
                              day: "numeric",
                            })}
                          </span>
                        </p>
                      </div>
                    </div>
                  )}

                {/* Active Subscription (not cancelling) */}
                {!subscriptionStatus.cancelAtPeriodEnd &&
                  !subscriptionStatus.isTrialing && (
                    <div className="flex items-center gap-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800">
                      <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-blue-800 dark:text-blue-300">
                          Active Subscription
                        </p>
                        <p className="text-xs text-blue-600 dark:text-blue-400">
                          Your subscription renews automatically each month
                        </p>
                      </div>
                    </div>
                  )}
              </div>
            )}

            {/* Free Plan - Show trial availability */}
            {currentPlan === "free_user" && (
              <div className="mt-4">
                {subscriptionStatus.hasUsedTrial ? (
                  <div className="flex items-center gap-3 p-3 bg-slate-50 dark:bg-slate-800/50 rounded-lg border border-slate-200 dark:border-slate-700">
                    <CreditCard className="w-5 h-5 text-slate-500 dark:text-slate-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                        Upgrade to unlock more features
                      </p>
                      <p className="text-xs text-slate-500 dark:text-slate-400">
                        You&apos;ve already used your free trial. Subscribe to
                        upgrade.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center gap-3 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg border border-green-200 dark:border-green-800">
                    <Rocket className="w-5 h-5 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div>
                      <p className="text-sm font-medium text-green-800 dark:text-green-300">
                        60-Day Free Trial Available!
                      </p>
                      <p className="text-xs text-green-600 dark:text-green-400">
                        Try Professional or Enterprise free for 60 days. No
                        charge until trial ends.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {currentPlan !== "free_user" && (
              <p className="text-xs text-gray-500 dark:text-slate-500 mt-3">
                To cancel or modify your subscription, visit the{" "}
                <Link
                  href="/upgrade"
                  className="text-blue-600 dark:text-blue-400 hover:underline"
                >
                  upgrade page
                </Link>{" "}
                or contact support.
              </p>
            )}
          </div>

          {/* Danger Zone */}
          <div className="bg-white dark:bg-slate-900 rounded-xl sm:rounded-2xl border border-red-200 dark:border-red-900/50 p-4 sm:p-6 shadow-sm">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-9 h-9 sm:w-10 sm:h-10 bg-red-100 dark:bg-red-900/30 rounded-lg sm:rounded-xl flex items-center justify-center">
                <AlertTriangle className="w-4 h-4 sm:w-5 sm:h-5 text-red-600 dark:text-red-400" />
              </div>
              <div>
                <h2 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white">
                  Danger Zone
                </h2>
                <p className="text-xs sm:text-sm text-gray-500 dark:text-slate-400">
                  Irreversible account actions
                </p>
              </div>
            </div>

            <p className="text-xs sm:text-sm text-gray-600 dark:text-slate-400 mb-4">
              Once you delete your account, there is no going back. Please be
              certain.
            </p>

            <Button
              variant="ghost"
              className="w-full sm:w-auto text-red-600 hover:text-red-700 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-900/20"
              onClick={() => setShowDeleteModal(true)}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </main>
    </div>
  );
}
