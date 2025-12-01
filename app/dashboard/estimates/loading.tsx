export default function EstimatesLoading() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-[#0B1120]">
      <div className="flex">
        {/* Sidebar skeleton */}
        <div className="hidden lg:flex lg:w-64 lg:flex-col lg:fixed lg:inset-y-0">
          <div className="flex flex-col flex-grow bg-white dark:bg-slate-900 border-r border-slate-200 dark:border-slate-800 pt-5 pb-4 overflow-y-auto">
            <div className="flex items-center flex-shrink-0 px-4">
              <div className="h-8 w-32 bg-slate-200 dark:bg-slate-700 rounded animate-pulse" />
            </div>
            <div className="mt-8 flex-grow flex flex-col">
              <nav className="flex-1 px-2 space-y-2">
                {[...Array(7)].map((_, i) => (
                  <div
                    key={i}
                    className="h-10 bg-slate-100 dark:bg-slate-800 rounded-lg animate-pulse"
                  />
                ))}
              </nav>
            </div>
          </div>
        </div>

        {/* Main content */}
        <div className="lg:pl-64 flex flex-col flex-1">
          <main className="flex-1">
            <div className="py-6 px-4 sm:px-6 lg:px-8">
              {/* Header skeleton */}
              <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-cyan-200 dark:bg-cyan-900/30 rounded-xl animate-pulse" />
                  <div>
                    <div className="h-8 w-48 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-4 w-64 bg-slate-100 dark:bg-slate-800 rounded animate-pulse" />
                  </div>
                </div>
                <div className="h-10 w-36 bg-cyan-200 dark:bg-cyan-900/30 rounded-lg animate-pulse" />
              </div>

              {/* Stats skeleton */}
              <div className="grid grid-cols-1 sm:grid-cols-4 gap-4 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className="bg-white/60 dark:bg-slate-900/60 rounded-xl p-4 border border-slate-200/50 dark:border-slate-800/50"
                  >
                    <div className="h-4 w-24 bg-slate-200 dark:bg-slate-700 rounded animate-pulse mb-2" />
                    <div className="h-8 w-16 bg-slate-300 dark:bg-slate-600 rounded animate-pulse" />
                  </div>
                ))}
              </div>

              {/* Table skeleton */}
              <div className="bg-white/60 dark:bg-slate-900/60 rounded-2xl border border-slate-200/50 dark:border-slate-800/50 overflow-hidden">
                <div className="hidden md:grid grid-cols-6 gap-4 px-6 py-3 bg-slate-50/50 dark:bg-slate-800/30 border-b">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-4 bg-slate-200 dark:bg-slate-700 rounded animate-pulse"
                    />
                  ))}
                </div>
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="grid grid-cols-6 gap-4 p-4 md:px-6 md:py-4 border-b border-slate-200/50 dark:border-slate-800/50"
                  >
                    {[...Array(6)].map((_, j) => (
                      <div
                        key={j}
                        className="h-6 bg-slate-100 dark:bg-slate-800 rounded animate-pulse"
                      />
                    ))}
                  </div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
