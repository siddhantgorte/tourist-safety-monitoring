"use client"

import { useUsers, useCreateUser, useUpdateUser, useDeleteUser, User as UserType } from "../hooks/use-users"
import { Card } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { User, Mail, Phone, Shield, Loader2, Edit2, Trash2, Plus } from "lucide-react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"

export function UsersView() {
  const [selectedUser, setSelectedUser] = useState<string | null>(null)
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [editingUser, setEditingUser] = useState<UserType | null>(null)

  const { data: userData, isLoading, error } = useUsers();
  const createUser = useCreateUser();
  const updateUser = useUpdateUser();
  const deleteUser = useDeleteUser();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full p-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  const users = userData || [];
  const teamStats = {
    total: users.length,
    online: users.filter((u: UserType) => u.isOnline).length,
    onDuty: users.filter((u: UserType) => u.isOnDuty).length
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "L4":
        return "bg-red-500/20 text-red-400 border-red-500/50"
      case "L3":
        return "bg-orange-500/20 text-orange-400 border-orange-500/50"
      case "L2":
        return "bg-blue-500/20 text-blue-400 border-blue-500/50"
      default:
        return "bg-green-500/20 text-green-400 border-green-500/50"
    }
  }

  const handleAddUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const data = {
      fullName: formData.get('name') as string,
      username: (formData.get('name') as string).toLowerCase().replace(/\s/g, '_'),
      roleId: formData.get('roleId') as string,
      regionId: formData.get('regionId') as string,
    };
    await createUser.mutateAsync(data as any);
    setIsAddModalOpen(false);
  }

  const handleEditUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!editingUser) return;
    const formData = new FormData(e.currentTarget);
    const data = {
      id: editingUser.id,
      name: formData.get('name') as string,
      email: formData.get('email') as string,
      phone: formData.get('phone') as string,
      role: formData.get('role') as string,
      zone: formData.get('zone') as string,
    };
    await updateUser.mutateAsync(data);
    setIsEditModalOpen(false);
    setEditingUser(null);
  }

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (confirm('Are you sure you want to delete this officer?')) {
      await deleteUser.mutateAsync(id);
      if (selectedUser === id) setSelectedUser(null);
    }
  }

  const openEdit = (user: UserType, e: React.MouseEvent) => {
    e.stopPropagation();
    setEditingUser(user);
    setIsEditModalOpen(true);
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">User Management</h1>
          <p className="text-muted-foreground mt-1">Manage officers and access levels</p>
        </div>

        <Dialog open={isAddModalOpen} onOpenChange={setIsAddModalOpen}>
          <DialogTrigger asChild>
            <Button className="gap-2">
              <Plus className="w-4 h-4" />
              Add Officer
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add New Officer</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleAddUser} className="space-y-4 py-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input id="name" name="name" placeholder="e.g. Rahul Patil" required />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="roleId">Role ID</Label>
                  <Input id="roleId" name="roleId" placeholder="L1, L2, L3, L4" required />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="regionId">Region ID</Label>
                  <Input id="regionId" name="regionId" placeholder="ID of the region" required />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsAddModalOpen(false)}>Cancel</Button>
                <Button type="submit">Create Account</Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Users List */}
        <div className="lg:col-span-2 space-y-3">
          {users.map((user: UserType) => (
            <Card
              key={user.id}
              onClick={() => setSelectedUser(selectedUser === user.id ? null : user.id)}
              className={`bg-card border cursor-pointer transition-all ${selectedUser === user.id ? "border-primary shadow-lg" : "border-border hover:border-primary/50"
                }`}
            >
              <div className="p-4">
                <div className="flex items-start justify-between gap-4 mb-3">
                  <div className="flex items-center gap-3 flex-1">
                    <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center">
                      <User className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <h3 className="font-semibold text-foreground">{user.fullName || user.username}</h3>
                      <p className="text-xs text-muted-foreground">{user.regionName || 'Global'}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-xs ${getRoleColor(user.roleName)}`}>
                        Role {user.roleName}
                      </Badge>
                      {user.isOnDuty && <div className="w-2 h-2 rounded-full bg-green-400 animate-pulse"></div>}
                    </div>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" onClick={(e) => openEdit(user, e)} className="h-8 w-8 text-muted-foreground hover:text-primary">
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={(e) => handleDelete(user.id, e)} className="h-8 w-8 text-muted-foreground hover:text-destructive">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                </div>

                {selectedUser === user.id && (
                  <div className="mt-4 pt-4 border-t border-border/50 space-y-3">
                    <div className="flex items-center gap-2">
                      <Shield className="w-4 h-4 text-accent" />
                      <span className="text-sm text-foreground">Status: <span className={user.isOnline ? 'text-green-400' : 'text-muted-foreground'}>{user.isOnline ? 'Online' : 'Offline'}</span> ({user.isOnDuty ? 'On Duty' : 'Off Duty'})</span>
                    </div>
                  </div>
                )}
              </div>
            </Card>
          ))}
        </div>

        {/* Summary */}
        <Card className="bg-card border-border p-6 h-fit">
          <h2 className="text-lg font-bold text-foreground mb-4">Team Summary</h2>
          <div className="space-y-3">
            <div>
              <p className="text-xs text-muted-foreground mb-1">Total Officers</p>
              <p className="text-2xl font-bold text-foreground">{teamStats.total}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">On Duty</p>
              <p className="text-2xl font-bold text-green-400">{teamStats.onDuty}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground mb-1">Online Now</p>
              <p className="text-2xl font-bold text-blue-400">{teamStats.online}</p>
            </div>

            <Button className="w-full mt-4" variant="secondary">
              View Permissions
            </Button>
          </div>
        </Card>
      </div>

      {/* Edit Modal */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Edit Officer Profile</DialogTitle>
          </DialogHeader>
          <form onSubmit={handleEditUser} className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Full Name</Label>
              <Input id="edit-name" name="name" defaultValue={editingUser?.fullName || ''} required />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Role Name</Label>
                <Input id="edit-role" name="role" defaultValue={editingUser?.roleName} readOnly />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-region">Region</Label>
                <Input id="edit-region" name="region" defaultValue={editingUser?.regionName || ''} readOnly />
              </div>
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" onClick={() => setIsEditModalOpen(false)}>Cancel</Button>
              <Button type="submit">Save Changes</Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  )
}
