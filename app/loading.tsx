export default function RootLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="flex flex-col items-center gap-4">
        {/* Spinner */}
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-[#E5E7EB] border-t-[#0F766E]" />
        <p className="text-sm text-[#6B7280]">Loading Clinic Management…</p>
      </div>
    </div>
  )
}