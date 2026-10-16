export default function SupervisorLoading() {
  return (
    <div className="flex h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-3 rounded-xl border border-line bg-card px-6 py-4">
        <span className="size-2.5 animate-pulse rounded-full bg-arc" />
        <span className="text-sm font-medium text-muted-foreground">Supervisor Portal…</span>
      </div>
    </div>
  )
}
