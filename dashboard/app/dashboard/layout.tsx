"use client"

import type React from "react"

import { useState } from "react"
import { Sidebar } from "@/components/sidebar"

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [sidebarOpen, setSidebarOpen] = useState(true)

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} setOpen={setSidebarOpen} />
      <main className="flex-1 overflow-y-auto bg-muted/40 p-4">
        <div className="mx-auto max-w-6xl">{children}</div>
      </main>
    </div>
  )
}

