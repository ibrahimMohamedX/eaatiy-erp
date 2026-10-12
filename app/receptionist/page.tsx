import type { Metadata } from "next"
import { ReceptionistPageShell } from "./receptionist-page-shell"
import { getTodayQueueData } from "@/lib/actions/receptionist/get-today-queue"
import type { TodayQueueData } from "@/lib/actions/receptionist/get-today-queue"

export const metadata: Metadata = {
  title: "Receptionist Dashboard — Clinic Management",
  description: "Front-desk operations console for clinic reception staff",
}

/**
 * Receptionist route — fetches initial queue data on the server and passes it to
 * the client shell so the live queue renders immediately (no 15s polling gap).
 */
export default async function ReceptionistPage() {
  let initialData: TodayQueueData | null = null
  const result = await getTodayQueueData()
  if (result.success) {
    initialData = result.data
  }

  return <ReceptionistPageShell initialData={initialData} />
}