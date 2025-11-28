import { Skeleton } from "@/components/ui/skeleton";

export default function InvoicesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      <div className="flex">
        {/* Sidebar Skeleton */}
        <aside className="hidden md:flex w-64 h-screen flex-col border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-950 p-4">
          <div className="flex items-center gap-2 px-2 mb-10">
            <Skeleton className="w-8 h-8 rounded-xl" />
            <Skeleton className="h-6 w-32" />
          </div>
          <div className="space-y-2">
            {[...Array(5)].map((_, i) => (
              <Skeleton key={i} className="h-10 w-full rounded-lg" />
            ))}
          </div>
          <div className="mt-auto">
            <Skeleton className="h-24 w-full rounded-xl" />
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 p-4 md:p-8 space-y-6">
          {/* Header */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Skeleton className="h-12 w-12 rounded-2xl" />
              <div className="space-y-2">
                <Skeleton className="h-8 w-32" />
                <Skeleton className="h-4 w-64" />
              </div>
            </div>
            <Skeleton className="h-10 w-36 rounded-lg" />
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800"
              >
                <div className="flex items-center justify-between mb-3 md:mb-4">
                  <Skeleton className="h-8 w-8 md:h-12 md:w-12 rounded-xl" />
                  <Skeleton className="h-5 w-12 md:h-6 md:w-16 rounded-full" />
                </div>
                <Skeleton className="h-3 w-20 md:h-4 md:w-28 mb-2" />
                <Skeleton className="h-7 w-14 md:h-9 md:w-16" />
              </div>
            ))}
          </div>

          {/* Filters Card */}
          <div className="bg-white dark:bg-slate-900 rounded-xl p-6 border border-gray-200 dark:border-slate-800">
            <div className="flex flex-col sm:flex-row gap-4">
              <Skeleton className="h-11 flex-1 rounded-xl" />
              <Skeleton className="h-11 w-48 rounded-xl" />
              <Skeleton className="h-11 w-32 rounded-xl" />
            </div>
          </div>

          {/* Invoice List */}
          <div className="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800">
            <div className="p-6 border-b border-gray-100 dark:border-slate-800">
              <Skeleton className="h-6 w-40" />
            </div>
            <div className="divide-y divide-gray-100 dark:divide-slate-800">
              {[...Array(6)].map((_, i) => (
                <div
                  key={i}
                  className="p-3 md:p-4 flex flex-col sm:flex-row sm:items-center gap-3 md:gap-4"
                >
                  <div className="flex items-center gap-3 flex-1">
                    <Skeleton className="h-10 w-10 rounded-lg flex-shrink-0" />
                    <div className="flex-1 space-y-2 min-w-0">
                      <Skeleton className="h-4 w-24 md:w-32" />
                      <Skeleton className="h-3 w-32 md:w-48" />
                    </div>
                  </div>
                  <div className="flex items-center justify-between sm:justify-end gap-3 md:gap-4">
                    <Skeleton className="h-6 w-16 md:w-20 rounded-full" />
                    <Skeleton className="h-4 w-20 md:w-24 hidden sm:block" />
                    <Skeleton className="h-8 w-8 rounded-lg" />
                  </div>
                </div>
              ))}
            </div>
            {/* Pagination */}
            <div className="p-4 border-t border-gray-100 dark:border-slate-800 flex justify-center gap-2">
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
              <Skeleton className="h-9 w-9 rounded-lg" />
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
