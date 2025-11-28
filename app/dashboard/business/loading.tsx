import { Skeleton } from "@/components/ui/skeleton";

export default function BusinessDashboardLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex w-64 h-screen flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          {/* Logo */}
          <div className="flex items-center gap-2 px-2 mb-10">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="h-6 w-32" />
          </div>

          {/* Nav Items */}
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>

          {/* Plan Status */}
          <div className="mt-auto">
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 md:mb-8">
            <div className="flex items-center gap-3 md:gap-4">
              <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-xl flex-shrink-0" />
              <div className="space-y-2">
                <Skeleton className="h-6 w-32 md:h-8 md:w-48" />
                <Skeleton className="h-3 w-24 md:h-4 md:w-32" />
              </div>
            </div>
            <div className="flex gap-2 md:gap-3">
              <Skeleton className="h-9 w-28 md:h-10 md:w-32 rounded-lg" />
              <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-lg" />
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6 mb-6 md:mb-8">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <Skeleton className="h-8 w-8 md:h-12 md:w-12 rounded-xl" />
                  <Skeleton className="h-5 w-12 md:h-6 md:w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-16 md:h-4 md:w-24 mb-2" />
                <Skeleton className="h-6 w-14 md:h-8 md:w-20" />
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 md:gap-6 mb-6 md:mb-8">
            <div className="lg:col-span-2 bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800">
              <Skeleton className="h-5 w-32 md:h-6 md:w-40 mb-4" />
              <Skeleton className="h-48 md:h-64 w-full rounded-lg" />
            </div>
            <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800">
              <Skeleton className="h-5 w-28 md:h-6 md:w-32 mb-4" />
              <div className="space-y-3 md:space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-full flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-3 w-20 md:w-24" />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Table Section */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4 md:mb-6">
              <Skeleton className="h-5 w-24 md:h-6 md:w-32" />
              <Skeleton className="h-8 w-20 md:h-9 md:w-24 rounded-lg" />
            </div>
            <div className="space-y-3 md:space-y-4">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4 py-3 border-b border-gray-100 dark:border-slate-800 last:border-0"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-9 w-9 md:h-10 md:w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Skeleton className="h-4 w-32 md:w-48" />
                      <Skeleton className="h-3 w-24 md:w-32" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3">
                    <Skeleton className="h-5 w-16 md:h-6 md:w-20 rounded-full" />
                    <Skeleton className="h-7 w-20 md:h-8 md:w-24" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
