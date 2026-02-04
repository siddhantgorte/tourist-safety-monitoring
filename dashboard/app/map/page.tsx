import DashboardLayout from "@/components/layout/dashboard-layout"
import { MapView } from "@/features/map/components/map-view"

export default function MapPage() {
    return (
        <DashboardLayout>
            <MapView />
        </DashboardLayout>
    )
}
