"use client"

import { useEffect } from "react"

import { useT } from "@/lib/i18n/use-t"
import { BusPaths } from "@/components/archai/bus-paths"

export default function DoctorError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  const { t } = useT()
  useEffect(() => {
    console.error("Doctor error boundary caught:", error)
  }, [error])

  return (
    <div className="relative flex h-screen items-center justify-center overflow-hidden bg-background">
      <BusPaths active={false} />
      <div className="relative max-w-md rounded-2xl border border-err/30 bg-card p-8 text-center">
        <h2 className="font-display text-2xl font-bold text-foreground">{t.errors.doctorTitle}</h2>
        <div
          className="mt-4 flex items-center justify-center gap-2.5 rounded-lg bg-err/10 px-4 py-3 text-sm font-medium text-err"
          role="alert"
        >
          <span className="size-2 shrink-0 rounded-full bg-err" />
          <span>{t.errors.doctorDesc}</span>
        </div>
        <button
          onClick={reset}
          className="mt-6 inline-flex h-10 items-center justify-center rounded-lg border border-line px-6 text-sm font-medium text-silver transition-colors duration-200 hover:border-mist hover:text-foreground"
        >
          {t.common.retry}
        </button>
      </div>
    </div>
  )
}
