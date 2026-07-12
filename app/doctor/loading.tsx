export default function DoctorLoading() {
  return (
    <div className="flex h-screen w-full overflow-hidden bg-[#F9FAFB]">
      {/* Skeleton left sidebar */}
      <div className="flex h-screen w-[260px] shrink-0 flex-col border-r border-[#E5E7EB] bg-white">
        <div className="flex-1 px-3 py-2">
          <div className="mb-2 h-3 w-16 rounded-full bg-[#F3F4F6]" />
          <div className="space-y-2">
            {[1, 2, 3].map((n) => (
              <div key={n} className="h-9 rounded-[8px] bg-[#F3F4F6]" />
            ))}
          </div>
        </div>
      </div>

      {/* Split-screen skeleton */}
      <main className="flex flex-1 overflow-hidden">
        {/* Left queue rail */}
        <div className="h-full w-[28%] shrink-0 bg-white border-r border-[#E5E7EB] p-4">
          <div className="space-y-3">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-16 rounded-[8px] bg-[#F3F4F6]" />
            ))}
          </div>
        </div>
        {/* Right workspace */}
        <div className="h-full min-w-0 flex-1 p-6">
          <div className="h-24 rounded-xl border border-[#E5E7EB] bg-white mb-3" />
          <div className="h-14 rounded-xl border border-[#E5E7EB] bg-white mb-3" />
          <div className="rounded-xl border border-[#E5E7EB] bg-white" style={{ height: "calc(100% - 10rem)" }}>
            <div className="border-b border-[#E5E7EB] p-3">
              <div className="flex gap-1">
                {[1, 2, 3, 4].map((n) => (
                  <div key={n} className="h-8 w-24 rounded-[8px] bg-[#F3F4F6]" />
                ))}
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}