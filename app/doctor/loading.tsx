export default function DoctorLoading() {
  return (
    <div className="min-h-screen bg-background p-6">
      <div className="animate-archai-fade-up">
        {/* Greeting bar */}
        <div className="h-20 rounded-2xl bg-steel animate-pulse" />
        {/* KPI row */}
        <div className="mt-6 animate-archai-fade-up [animation-delay:120ms]">
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3 lg:grid-cols-5">
            {[1, 2, 3, 4, 5].map((n) => (
              <div key={n} className="h-28 rounded-2xl bg-steel animate-pulse" />
            ))}
          </div>
        </div>
        {/* Main area */}
        <div className="mt-6 animate-archai-fade-up [animation-delay:240ms]">
          <div className="h-[420px] rounded-2xl bg-steel animate-pulse" />
        </div>
      </div>
    </div>
  )
}
