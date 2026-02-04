import DashboardLayout from "@/components/layout/dashboard-layout"
import { IDVerificationView } from "@/features/id-verification/components/id-verification-view"

export default function IDVerificationPage() {
    return (
        <DashboardLayout>
            <IDVerificationView />
        </DashboardLayout>
    )
}
