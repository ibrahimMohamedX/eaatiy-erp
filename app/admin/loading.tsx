export default function AdminLoading() {
  return (
    <div className="flex h-screen bg-[#F9FAFB] dark:bg-[#111827]">
      {/* Skeleton sidebar */}
      <div className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="flex-1 px-3 py-2">
          <div className="mb-2 h-3 w-12 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
          <div className="space-y-2">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-9 rounded-[8px] bg-[#F3F4F6] dark:bg-[#374151]" />
            ))}
          </div>
        </div>
      </div>

      {/* Main area */}
      <div className="flex min-w-0 flex-1 flex-col overflow-hidden">
        <div className="flex h-16 items-center justify-between gap-4 border-b border-[#E5E7EB] bg-white px-6 dark:border-[#374151] dark:bg-[#1F2937]">
          <div className="h-6 w-40 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
          <div className="flex items-center gap-1.5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-8 w-16 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
            ))}
          </div>
        </div>
        <div className="flex-1 p-6">
          {/* KPI skeletons */}
          <div className="grid grid-cols-6 gap-4 mb-6">
            {[1, 2, 3, 4, 5, 6].map((n) => (
              <div key={n} className="h-28 rounded-xl border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
            ))}
          </div>
          {/* Charts + audit skeletons */}
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="aspect-[4/3] rounded-xl border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
            <div className="aspect-[4/3] rounded-xl border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
          </div>
          <div className="h-96 rounded-xl border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]" />
        </div>
      </div>
    </div>
  )
}