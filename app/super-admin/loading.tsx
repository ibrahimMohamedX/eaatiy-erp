export default function SuperAdminLoading() {
  return (
    <div className="flex min-h-screen flex-col bg-[#F9FAFB] dark:bg-[#111827]">
      {/* Top bar skeleton */}
      <div className="flex h-16 items-center justify-between border-b border-[#E5E7EB] bg-white px-6 dark:border-[#374151] dark:bg-[#1F2937]">
        <div className="flex items-center gap-3">
          <div className="h-5 w-32 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
          <div className="flex gap-1">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-8 w-20 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
            ))}
          </div>
        </div>
        <div className="h-9 w-40 rounded-[8px] bg-[#F3F4F6] dark:bg-[#374151]" />
      </div>

      {/* Main skeleton */}
      <div className="flex-1 p-6">
        <div className="rounded-[12px] border border-[#E5E7EB] bg-white dark:border-[#374151] dark:bg-[#1F2937]">
          {/* Table header */}
          <div className="flex items-center gap-4 border-b border-[#E5E7EB] p-4 dark:border-[#374151]">
            {[1, 2, 3, 4, 5, 6, 7].map((n) => (
              <div key={n} className="h-4 w-16 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
            ))}
          </div>
          {/* Table rows */}
          {[1, 2, 3, 4, 5].map((n) => (
            <div key={n} className="flex items-center gap-4 border-b border-[#E5E7EB] p-4 dark:border-[#374151]">
              {[1, 2, 3, 4, 5, 6, 7].map((col) => (
                <div key={col} className="h-4 w-20 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}