export default function LoginLoading() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-[#F9FAFB] dark:bg-[#111827]">
      <div className="max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-8 dark:border-[#374151] dark:bg-[#1F2937]">
        {/* Logo skeleton */}
        <div className="mx-auto h-8 w-36 rounded-full bg-[#F3F4F6] dark:bg-[#374151]" />
        <div className="mt-6 space-y-4">
          <div className="h-10 rounded-[8px] bg-[#F3F4F6] dark:bg-[#374151]" />
          <div className="h-10 rounded-[8px] bg-[#F3F4F6] dark:bg-[#374151]" />
        </div>
      </div>
    </div>
  )
}