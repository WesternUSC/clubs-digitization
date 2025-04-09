"use client"

import { useState } from "react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { ChevronDown, ChevronRight, FileText, LogOut, Menu, Settings, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { useSession, signOut } from "next-auth/react"
// import { SessionProvider } from "next-auth/react";

interface SidebarProps {
  open: boolean
  setOpen: (open: boolean) => void
}

export function Sidebar({ open, setOpen }: SidebarProps) {

  const { data: session } = useSession()
  const user = session?.user

  const initials = user
    ? user.name
      ?.split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
    : 'JD'

  const pathname = usePathname()
  const router = useRouter()
  const [documentsOpen, setDocumentsOpen] = useState(true)

  const documentTypes = [
    { name: "Certificate of Insurance", path: "/dashboard/upload-document/certificate" },
    { name: "Purchase Order", path: "/dashboard/upload-document/purchase-order" },
    { name: "Sponsorship", path: "/dashboard/upload-document/contract" },
    { name: "Charity Letter", path: "/dashboard/upload-document/report" },
  ]

  const handleUploadDocumentClick = () => {
    router.push("/dashboard")
  }

  const logout = () => {
    signOut({ callbackUrl: '/' });
  }

  return (


    <>
      {/* Mobile sidebar overlay */}
      {open && (
        <div
          className="fixed inset-0 z-40 bg-background/80 backdrop-blur-sm md:hidden"
          onClick={() => setOpen(false)}
        />
      )}

      {/* Sidebar */}
      <div
        className={cn(
          "fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground transition-transform duration-300 ease-in-out md:relative md:z-0",
          open ? "translate-x-0" : "-translate-x-full md:translate-x-0 md:w-20",
        )}
      >
        {/* Sidebar header */}
        <div className="flex h-16 items-center justify-between px-4">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary">
              <span className="text-primary-foreground font-bold">USC</span>
            </div>
            {open && <span className="font-semibold">Clubs Docs</span>}
          </div>
          <Button variant="ghost" size="icon" onClick={() => setOpen(!open)} className="md:flex hidden">
            <Menu className="h-5 w-5" />
            <span className="sr-only">Toggle sidebar</span>
          </Button>
          <Button variant="ghost" size="icon" onClick={() => setOpen(false)} className="md:hidden flex">
            <X className="h-5 w-5" />
            <span className="sr-only">Close sidebar</span>
          </Button>
        </div>

        <Separator className="bg-sidebar-border" />

        {/* Sidebar content */}
        <div className="flex-1 overflow-y-auto py-4">
          <nav className="space-y-1 px-2">
            {/* Upload Document with submenu */}
            <div>
              <div className="flex flex-col">
                <button
                  className={cn(
                    "flex w-full items-center justify-between gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                    pathname === "/dashboard" || pathname.includes("/dashboard/upload-document")
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                  onClick={() => {
                    handleUploadDocumentClick()
                    setDocumentsOpen(!documentsOpen)
                  }}
                >
                  <div className="flex items-center gap-3">
                    <FileText className="h-5 w-5" />
                    {open && <span>Upload Document</span>}
                  </div>
                  {open && (documentsOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />)}
                </button>

                {/* Direct link to dashboard */}
                <Link
                  href="/dashboard"
                  className={cn(
                    "hidden", // Hide this visually but keep for accessibility
                    pathname === "/dashboard"
                      ? "bg-sidebar-accent text-sidebar-accent-foreground"
                      : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                  )}
                >
                  <span className="sr-only">Upload Document Dashboard</span>
                </Link>
              </div>

              {/* Document submenu */}
              {open && documentsOpen && (
                <div className="mt-1 ml-4 pl-4 border-l border-sidebar-border">
                  {documentTypes.map((doc) => (
                    <Link
                      key={doc.path}
                      href={doc.path}
                      className={cn(
                        "flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors",
                        pathname === doc.path
                          ? "bg-sidebar-accent/70 text-sidebar-accent-foreground font-medium"
                          : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
                      )}
                    >
                      {doc.name}
                    </Link>
                  ))}
                </div>
              )}
            </div>

            <Link
              href="/dashboard/settings"
              className={cn(
                "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors",
                pathname === "/dashboard/settings"
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground",
              )}
            >
              <Settings className="h-5 w-5" />
              {open && <span>Settings</span>}
            </Link>
          </nav>
        </div>

        {/* Sidebar footer */}
        <div className="border-t border-sidebar-border p-4 space-y-4">
          {/* Logout button */}
          <button
            onClick={logout}
            className={cn(
              "flex items-center gap-3 rounded-md px-3 py-2 text-sm font-medium transition-colors w-full",
              "hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
            )}
          >
            <LogOut className="h-5 w-5" />
            {open && <span>Logout</span>}
          </button>
          <div className="flex items-center gap-3">
            {user?.image ? (
              <img
                src={user.image}
                alt={user.name || "Profile"}
                className="h-8 w-8 rounded-full object-cover"
              />
            ) : (
              <div className="h-8 w-8 rounded-full bg-sidebar-accent flex items-center justify-center">
                <span className="text-xs font-medium">{initials}</span>
              </div>
            )}
            {open && (
              <div className="overflow-hidden">
                <p className="text-sm font-medium truncate">{user?.name || "John Doe"}</p>
                <p className="text-xs text-sidebar-foreground/70 truncate">{user?.email || "john@example.com"}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Mobile toggle button */}
      <Button
        variant="outline"
        size="icon"
        className="fixed bottom-4 right-4 z-40 rounded-full shadow-lg md:hidden"
        onClick={() => setOpen(true)}
      >
        <Menu className="h-5 w-5" />
        <span className="sr-only">Open sidebar</span>
      </Button>
    </>

  )
}

