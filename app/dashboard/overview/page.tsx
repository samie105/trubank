import { Suspense } from "react"
import { DashboardOverviewSkeleton } from "@/components/dashboard/overview/dashboard-overview-skeleton"
import DashboardOverview from "@/components/dashboard/overview/overview"

export default function OverviewPage() {
  return (
    <div className="container p-4">
      {/* <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1> */}
      <Suspense fallback={<DashboardOverviewSkeleton />}>
        <DashboardOverview />
      </Suspense>
    </div>
  )
}
