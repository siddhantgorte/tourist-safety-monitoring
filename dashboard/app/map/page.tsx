import DashboardLayout from "@/components/layout/dashboard-layout"
import { MapView } from "@/features/map/components/map-view"
import { Suspense } from "react"
import { Loader2 } from "lucide-react"

export default function MapPage() {
    return (
        <DashboardLayout>
            <Suspense fallback={
                <div className="flex items-center justify-center p-12 w-full h-[500px]">
                    <Loader2 className="w-8 h-8 animate-spin text-primary" />
                </div>
            }>
                <MapView />
            </Suspense>
        </DashboardLayout>
    )
}
