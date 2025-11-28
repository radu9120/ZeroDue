import { Skeleton } from "@/components/ui/skeleton";

export default function ClientsLoading() {
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
        <main className="flex-1 p-4 md:p-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Skeleton className="w-12 h-12 rounded-xl" />
              <div className="space-y-2">
                <Skeleton className="h-9 w-56" />
                <Skeleton className="h-4 w-72" />
              </div>
            </div>
          </div>

          {/* Actions Bar */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
            <Skeleton className="h-11 w-64 rounded-lg" />
            <Skeleton className="h-10 w-32 rounded-lg" />
          </div>

          {/* Client Cards Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6 mb-8">
            {[...Array(6)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800"
              >
                <div className="flex items-center gap-3 mb-4">
                  <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-full flex-shrink-0" />
                  <div className="flex-1 space-y-2 min-w-0">
                    <Skeleton className="h-5 w-28 md:w-32" />
                    <Skeleton className="h-3 w-32 md:w-40" />
                  </div>
                </div>
                <div className="space-y-2 mb-4">
                  <Skeleton className="h-3 w-full" />
                  <Skeleton className="h-3 w-3/4" />
                </div>
                <div className="flex gap-2 pt-4 border-t border-gray-100 dark:border-slate-800">
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                  <Skeleton className="h-9 flex-1 rounded-lg" />
                </div>
              </div>
            ))}
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 md:gap-6">
            {[...Array(4)].map((_, i) => (
              <div
                key={i}
                className="bg-white dark:bg-slate-900 rounded-xl p-4 md:p-6 border border-gray-200 dark:border-slate-800"
              >
                <div className="text-center">
                  <Skeleton className="h-10 w-10 md:h-12 md:w-12 rounded-xl mx-auto mb-2 md:mb-3" />
                  <Skeleton className="h-6 w-12 md:h-8 md:w-16 mx-auto mb-2" />
                  <Skeleton className="h-3 w-16 md:h-4 md:w-24 mx-auto" />
                </div>
              </div>
            ))}
          </div>
        </main>
      </div>
    </div>
  );
}
