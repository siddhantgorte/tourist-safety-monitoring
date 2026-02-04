"use client"

import { useState } from "react"
import { useIdVerification } from "../hooks/use-id-verification"
import { Card } from "@/components/ui/card"
import { Shield, CheckCircle2, AlertCircle, QrCode, Search, Loader2, Clock, MapPin } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"

export function IDVerificationView() {
  const [searchId, setSearchId] = useState("");
  const [activeId, setActiveId] = useState("");
  const { data: verificationData, isLoading, error } = useIdVerification(activeId);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setActiveId(searchId);
  }

  const [selectedID, setSelectedID] = useState<number | null>(null)

  const idleIDs = [
    { id: 1, name: "Maria Garcia", nationality: "Spain", status: "ACTIVE" },
    { id: 2, name: "John Smith", nationality: "USA", status: "ACTIVE" },
  ]

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Digital ID Verification</h1>
        <p className="text-muted-foreground mt-1">Blockchain-based ID verification system</p>
      </div>

      <Card className="bg-card border-border p-6 shadow-xl shadow-primary/5">
        <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Enter Tourist ID (e.g., TID-8899)..."
              className="pl-10 h-12 bg-secondary/30 border-primary/20 focus:border-primary"
              value={searchId}
              onChange={(e) => setSearchId(e.target.value)}
            />
          </div>
          <button type="submit" className="h-12 px-8 rounded-lg bg-primary text-primary-foreground font-semibold hover:bg-primary/90 transition-all flex items-center justify-center gap-2">
            Verify Credentials
          </button>
        </form>
      </Card>

      {isLoading && (
        <div className="flex items-center justify-center p-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      )}

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 rounded-lg flex items-center gap-3">
          <AlertCircle className="w-5 h-5" />
          <span>Identity verification failed. Please check the ID and try again.</span>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* ID List or Result */}
        <div className="lg:col-span-2 space-y-4">
          {verificationData ? (
            <Card className="bg-card border-primary p-6 border shadow-2xl shadow-primary/10">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <p className="text-sm text-muted-foreground">Verification Result for</p>
                  <h2 className="text-2xl font-bold text-foreground">{verificationData.id}</h2>
                </div>
                <Badge className="bg-green-500/20 text-green-400 border-green-500/20 px-4 py-1.5 text-sm font-bold">
                  {verificationData.status}
                </Badge>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
                <div className="space-y-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Valid From - To</p>
                      <p className="text-sm font-medium">{verificationData.validity.from} to {verificationData.validity.to}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <MapPin className="w-5 h-5 text-primary" />
                    <div>
                      <p className="text-xs text-muted-foreground">Entry Point</p>
                      <p className="text-sm font-medium">{verificationData.entryPoint}</p>
                    </div>
                  </div>
                </div>
                <div className="p-4 bg-secondary/30 rounded-lg border border-border">
                  <p className="text-xs text-muted-foreground mb-2 uppercase font-bold tracking-tighter">Blockchain Security Hash</p>
                  <p className="text-xs font-mono text-primary break-all leading-relaxed">
                    {verificationData.securityHash}
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                <h4 className="text-sm font-bold text-foreground uppercase tracking-wider">Verification Audit Log</h4>
                {verificationData.verificationHistory.map((log: any, i: number) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-secondary/20 rounded-lg border border-border/50">
                    <div className="flex items-center gap-3">
                      <CheckCircle2 className="w-4 h-4 text-green-400" />
                      <span className="text-sm font-medium">{log.officer}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{log.location} • {new Date(log.time).toLocaleDateString()}</span>
                  </div>
                ))}
              </div>
            </Card>
          ) : (
            idleIDs.map((idRecord) => (
              <Card
                key={idRecord.id}
                className="bg-card border border-border p-4 hover:border-primary/50 transition-all cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="font-semibold text-foreground">{idRecord.name}</h3>
                    <p className="text-xs text-muted-foreground">{idRecord.nationality}</p>
                  </div>
                  <Badge variant="outline">{idRecord.status}</Badge>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Verification Panel */}
        <div className="space-y-4">
          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">QR Scanner</h2>
            <div className="w-full aspect-square rounded-lg bg-secondary/50 border border-border flex items-center justify-center">
              <QrCode className="w-12 h-12 text-muted-foreground" />
            </div>
            <button className="w-full mt-4 px-4 py-3 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors">
              Scan ID
            </button>
          </Card>

          <Card className="bg-card border-border p-6">
            <h2 className="text-lg font-bold text-foreground mb-4">Stats</h2>
            <div className="space-y-3">
              <div>
                <p className="text-xs text-muted-foreground mb-1">Verified IDs</p>
                <p className="text-2xl font-bold text-green-400">2/4</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Pending</p>
                <p className="text-2xl font-bold text-yellow-400">1</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-1">Expired</p>
                <p className="text-2xl font-bold text-red-400">1</p>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  )
}
