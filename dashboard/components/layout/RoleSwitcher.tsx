"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, Check, Loader2 } from "lucide-react"
import { useUsers } from "@/features/users/hooks/use-users"
import { Card } from "@/components/ui/card"

export function RoleSwitcher() {
    const { data: usersData, isLoading } = useUsers()
    const [isOpen, setIsOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState("")

    useEffect(() => {
        const storedId = localStorage.getItem('userId') || '0282ddf2-e676-492d-a89c-89fd57ace2a9'
        setCurrentUserId(storedId)
    }, [])

    useEffect(() => {
        if (usersData && usersData.length > 0) {
            const storedId = localStorage.getItem('userId')
            if (storedId && !usersData.find((u: any) => u.id === storedId)) {
                // If currentId is not in the list (stale or filtered out), we don't necessarily reset, 
                // but we show the current one if it's there. 
                // For the switcher, we only show what the API returns (which is already filtered by hierarchy).
            }
        }
    }, [usersData])

    const handleSwitch = (userId: string) => {
        localStorage.setItem('userId', userId)
        setCurrentUserId(userId)
        window.location.reload()
    }

    const users = usersData || []

    return (
        <div className="fixed bottom-4 right-4 z-[9999]">
            <Button 
                onClick={() => setIsOpen(!isOpen)}
                className="rounded-full shadow-2xl h-12 w-12 p-0 flex items-center justify-center bg-primary hover:bg-primary/90"
            >
                <Users className="w-6 h-6 text-white" />
            </Button>

            {isOpen && (
                <Card className="absolute bottom-16 right-0 w-64 max-h-[400px] overflow-y-auto p-2 bg-background border border-border shadow-2xl">
                    <div className="px-3 py-2 border-b border-border mb-2 flex items-center justify-between">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Switch Officer Role</p>
                        {isLoading && <Loader2 className="w-3 h-3 animate-spin text-primary" />}
                    </div>
                    <div className="space-y-1">
                        {users.length === 0 && !isLoading && (
                            <p className="text-[10px] text-center p-4 text-muted-foreground italic">No reachable users in your hierarchy</p>
                        )}
                        {users.map((user: any) => (
                            <button
                                key={user.id}
                                onClick={() => handleSwitch(user.id)}
                                className={`w-full flex items-center justify-between p-3 rounded-lg text-left transition-colors ${
                                    user.id === currentUserId ? 'bg-primary/10 text-primary' : 'hover:bg-secondary/50'
                                }`}
                            >
                                <div className="flex-1 min-w-0">
                                    <p className="text-sm font-semibold truncate">{user.fullName || user.username}</p>
                                    <p className="text-[10px] text-muted-foreground truncate italic">
                                        {user.roleName} • {user.regionName || 'Global'}
                                    </p>
                                </div>
                                {user.id === currentUserId && <Check className="w-4 h-4 ml-2" />}
                            </button>
                        ))}
                    </div>
                </Card>
            )}
        </div>
    )
}
