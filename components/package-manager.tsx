"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Badge } from "@/components/ui/badge"
import { Package, Plus, Trash2, Search } from "lucide-react"
import { Card } from "@/components/ui/card"

interface PackageManagerProps {
  packages: Record<string, string>
  onInstall: (packageName: string, isDev: boolean) => void
  onUninstall: (packageName: string) => void
}

export function PackageManager({ packages, onInstall, onUninstall }: PackageManagerProps) {
  const [searchTerm, setSearchTerm] = useState("")
  const [newPackage, setNewPackage] = useState("")
  const [isDev, setIsDev] = useState(false)

  const filteredPackages = Object.entries(packages).filter(([name]) =>
    name.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleInstall = () => {
    if (newPackage.trim()) {
      onInstall(newPackage.trim(), isDev)
      setNewPackage("")
      setIsDev(false)
    }
  }

  return (
    <div className="h-full flex flex-col bg-background">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-card">
        <div className="flex items-center gap-2">
          <Package className="w-4 h-4 text-primary" />
          <span className="text-sm font-semibold">Dependencies</span>
          <Badge variant="secondary" className="text-xs">
            {Object.keys(packages).length}
          </Badge>
        </div>
      </div>

      {/* Add Package */}
      <div className="p-4 border-b border-border bg-card space-y-2">
        <div className="flex gap-2">
          <Input
            value={newPackage}
            onChange={(e) => setNewPackage(e.target.value)}
            placeholder="package-name"
            className="text-sm"
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                handleInstall()
              }
            }}
          />
          <Button onClick={handleInstall} size="sm" disabled={!newPackage.trim()}>
            <Plus className="w-4 h-4" />
          </Button>
        </div>
        <label className="flex items-center gap-2 text-xs text-muted-foreground cursor-pointer">
          <input type="checkbox" checked={isDev} onChange={(e) => setIsDev(e.target.checked)} className="rounded" />
          Install as dev dependency
        </label>
      </div>

      {/* Search */}
      <div className="p-4 border-b border-border">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search packages..."
            className="pl-9 text-sm"
          />
        </div>
      </div>

      {/* Package List */}
      <ScrollArea className="flex-1">
        <div className="p-4 space-y-2">
          {filteredPackages.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground text-sm">
              {searchTerm ? "No packages found" : "No packages installed yet"}
            </div>
          ) : (
            filteredPackages.map(([name, version]) => (
              <Card key={name} className="p-3">
                <div className="flex items-center justify-between">
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">{name}</div>
                    <div className="text-xs text-muted-foreground">{version}</div>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => onUninstall(name)} className="text-destructive">
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>
      </ScrollArea>
    </div>
  )
}
