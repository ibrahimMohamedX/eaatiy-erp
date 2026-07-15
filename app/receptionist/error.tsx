"use client"

import { useEffect } from "react"

import { useT } from "@/lib/i18n/use-t"

export default function ReceptionistError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useT()
  useEffect(() => {
    console.error("Receptionist error boundary caught:", error)
  }, [error])

  return (
    <div className="flex h-screen items-center justify-center bg-[#F9FAFB] dark:bg-[#111827]">
      <div className="max-w-md rounded-[12px] border border-[#E5E7EB] bg-white p-8 text-center dark:border-[#374151] dark:bg-[#1F2937]">
        <h2 className="text-lg font-semibold text-[#111827] dark:text-[#F9FAFB]">{t.errors.receptionistTitle}</h2>
        <p className="mt-2 text-sm text-[#6B7280] dark:text-[#9CA3AF]">
          {t.errors.receptionistDesc}
        </p>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-[8px] bg-[#0F766E] px-6 text-sm font-medium text-white transition-opacity hover:opacity-90"
        >
          {t.common.retry}
        </button>
      </div>
    </div>
  )
}