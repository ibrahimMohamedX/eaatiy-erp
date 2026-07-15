export default function ReceptionistLoading() {
  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-[#111827]">
      {/* Skeleton sidebar */}
      <div className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="flex-1 px-4 py-6 space-y-6">
          {[1, 2, 3].map((g) => (
            <div key={g}>
              <div className="mb-2 h-3 w-16 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
              <div className="space-y-2">
                {Array.from({ length: g === 1 ? 2 : g === 2 ? 4 : 2 }).map((_, i) => (
                  <div key={i} className="h-9 rounded-[8px] bg-[#F3F4F6] dark:bg-[#374151]" />
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main area skeleton */}
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="flex h-16 items-center gap-4 border-b border-[#E5E7EB] bg-white px-6 dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="h-10 w-80 rounded-[8px] bg-[#F3F4F6] dark:bg-[#374151]" />
        </div>
        <main className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Hero skeleton */}
          <div className="h-20 rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
          {/* KPI row skeleton */}
          <div className="grid grid-cols-5 gap-4">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-24 rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
            ))}
          </div>
          {/* Table + cards split skeleton */}
          <div className="grid grid-cols-[65%_35%] gap-6">
            <div className="h-96 rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
            <div className="space-y-6">
              <div className="h-64 rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
              <div className="h-72 rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}