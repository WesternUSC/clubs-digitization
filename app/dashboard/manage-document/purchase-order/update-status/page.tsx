"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"
import { Loader2 } from "lucide-react"

export default function SetPOPaymentStatusPage() {
    const router = useRouter()
    const [logId, setLogId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [poHeaders, setPoHeaders] = useState<string[]>([])
    const [poValues, setPoValues] = useState<string[]>([])
    const [originalPaid, setOriginalPaid] = useState<string>("")
    const [isPaid, setIsPaid] = useState("No")
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Allow only numbers
    const handleLogIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const v = e.target.value
        if (v === "" || /^[0-9]+$/.test(v)) setLogId(v)
    }

    // Load PO details
    async function handleLoadPO(e: React.FormEvent) {
        e.preventDefault()
        if (!logId) return

        setIsLoading(true)
        setPoHeaders([])
        setPoValues([])

        try {
            const formData = new FormData()
            formData.append("documentType", "purchaseOrder")
            formData.append("searchCriteria", "log-id")
            formData.append("searchQuery", logId)

            const res = await fetch("/api/find-doc", { method: "POST", body: formData })
            const data = await res.json()

            if (!data.headers || !data.results?.length) {
                alert("No matching purchase order found.")
                return
            }

            const headers = data.headers as string[]
            const row = data.results[0] as string[] // [viewLink, ...cells]

            // find invoiced status
            const invIdx = headers.findIndex(h => h.toLowerCase() === "invoiced")
            const invoiced = row[invIdx]?.toLowerCase() === "yes"
            if (!invoiced) {
                alert("This purchase order hasn't been invoiced yet.")
                return
            }

            // capture original paid
            const paidIdx = headers.findIndex(h => h.toLowerCase() === "paid")
            const paidVal = row[paidIdx] || "No"
            setOriginalPaid(paidVal)
            setIsPaid(paidVal)

            // stash log id for later
            const logIdx = headers.findIndex(h => h.toLowerCase() === "log id")
            const origLogId = row[logIdx] || ""

            // render
            setPoHeaders(headers)
            setPoValues([...row, origLogId]) // optionally stash at end
        } catch (err) {
            console.error(err)
            alert("Error loading PO.")
        } finally {
            setIsLoading(false)
        }
    }

    // Set payment status
    async function handleSetPaymentStatus(e: React.FormEvent) {
        e.preventDefault()
        if (!logId || isPaid === originalPaid) return

        setIsSubmitting(true)
        try {
            const formData = new FormData()
            formData.append("logId", logId)
            formData.append("paid", isPaid)

            const res = await fetch("/api/update-status", { method: "POST", body: formData })
            if (res.ok) {
                const data = await res.json();
    
                // Save the flag and links in sessionStorage
                sessionStorage.setItem("fromUpload", "true");
                sessionStorage.setItem("externalLinks", JSON.stringify(data));
    
                // Now stop the loading
                setIsSubmitting(false);
    
                // Redirect to success page
                router.push(`/dashboard/manage-document/success`);
            } else {
                setIsSubmitting(false); // Only stop loading here if it failed
                alert("Failed to create event.");
            }
        } catch (e: any) {
            console.error(e)
            alert("Failed to set payment status: " + e.message)
        } finally {
            setIsSubmitting(false)
        }
    }

    // Filter out display
    const displayFields = poHeaders
        .map((header, i) => ({ header, value: poValues[i] }))
        .filter(({ header }) => {
            const l = header.toLowerCase()
            return l !== "paid" && l !== "invoiced" && l !== "log id"
        })

    return (
        <div className="space-y-6">
            {/* Breadcrumb */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard">Manage Documents</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <Link href="/dashboard/manage-document/purchase-order">Purchase Order</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Set Payment Status</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Header */}
            <div>
                <h1 className="text-3xl font-bold">Set PO Payment Status</h1>
                <p className="text-muted-foreground">Update the paid status of an invoiced purchase order</p>
            </div>

            {/* Lookup Form */}
            <Card>
                <CardHeader><CardTitle>Lookup by Log ID</CardTitle></CardHeader>
                <CardContent>
                    <form onSubmit={handleLoadPO} className="space-y-4">
                        <Input
                            id="log-id"
                            type="text"
                            placeholder="PO Log ID"
                            value={logId}
                            onChange={handleLogIdChange}
                            required
                        />
                        <Button type="submit" disabled={!logId || isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : "Load PO"}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* PO Details & Payment Form */}
            {displayFields.length > 0 && (
                <Card>
                    <CardHeader><CardTitle>Purchase Order Details</CardTitle></CardHeader>
                    <CardContent className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {displayFields.map(({ header, value }) =>
                                header.toLowerCase() === "view document" ? (
                                    <div key={header}>
                                        <Button variant="outline" size="sm" asChild>
                                            <Link href={value} target="_blank" rel="noopener noreferrer">
                                                View Document
                                            </Link>
                                        </Button>
                                    </div>
                                ) : (
                                    <div key={header}>
                                        <p className="text-sm font-medium text-muted-foreground">{header}</p>
                                        <p className="font-medium">{value}</p>
                                    </div>
                                )
                            )}
                        </div>

                        <form onSubmit={handleSetPaymentStatus} className="space-y-4 pt-4 border-t">
                            <Label>Paid?</Label>
                            <RadioGroup value={isPaid} onValueChange={setIsPaid}>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="Yes" id="paid-yes" />
                                    <Label htmlFor="paid-yes">Yes</Label>
                                </div>
                                <div className="flex items-center space-x-2">
                                    <RadioGroupItem value="No" id="paid-no" />
                                    <Label htmlFor="paid-no">No</Label>
                                </div>
                            </RadioGroup>
                            <Button
                                type="submit"
                                className="w-full"
                                disabled={isSubmitting || isPaid === originalPaid}
                            >
                                {isSubmitting ? <Loader2 className="animate-spin" /> : "Set Payment Status"}
                            </Button>
                        </form>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}