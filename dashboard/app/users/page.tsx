import DashboardLayout from "@/components/layout/dashboard-layout"
import { UsersView } from "@/features/users/components/users-view"

export default function UsersPage() {
    return (
        <DashboardLayout>
            <UsersView />
        </DashboardLayout>
    )
}
