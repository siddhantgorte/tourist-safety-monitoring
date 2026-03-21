"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Users, ChevronRight, Check } from "lucide-react"
import api from "@/lib/api"
import { Card } from "@/components/ui/card"

export function RoleSwitcher() {
    const [users, setUsers] = useState<any[]>([])
    const [isOpen, setIsOpen] = useState(false)
    const [currentUserId, setCurrentUserId] = useState("")

    useEffect(() => {
        const storedId = localStorage.getItem('userId') || '0282ddf2-e676-492d-a89c-89fd57ace2a9'
        setCurrentUserId(storedId)
        
        api.get('/users').then(res => {
            const fetchedUsers = res.data.data
            setUsers(fetchedUsers)
            
            // If currentId is not in the list (stale), switch to the first user (usually L4)
            if (fetchedUsers.length > 0 && !fetchedUsers.find((u: any) => u.id === storedId)) {
                console.log("Stale userId detected, resetting to default L4")
                const l4User = fetchedUsers.find((u: any) => u.roleName === 'L4')
                if (l4User) {
                    localStorage.setItem('userId', l4User.id)
                    setCurrentUserId(l4User.id)
                }
            }
        })
    }, [])

    const handleSwitch = (userId: string) => {
        localStorage.setItem('userId', userId)
        window.location.reload()
    }

    const currentUser = users.find(u => u.id === currentUserId)

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
                    <div className="px-3 py-2 border-b border-border mb-2">
                        <p className="text-xs font-bold text-muted-foreground uppercase">Switch Officer Role</p>
                    </div>
                    <div className="space-y-1">
                        {users.map((user) => (
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
