"use client"

import { useEffect } from "react"

export default function AdminError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error("Admin error boundary caught:", error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-[#F9FAFB]">
      <div className="max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-8 text-center">
        <h2 className="text-lg font-semibold text-[#111827]">Analytics Panel Error</h2>
        <p className="mt-2 text-sm text-[#6B7280]">
          The admin analytics panel encountered an error. Please refresh to recover.
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-[8px] bg-[#0F766E] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          Retry
        </button>
      </div>
    </div>
  )
}