"use client"

import React, { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useSession } from "next-auth/react"
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

export default function AttachInvoiceToPOPage() {
    const router = useRouter()
    const [logId, setLogId] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [poHeaders, setPoHeaders] = useState<string[]>([])
    const [poValues, setPoValues] = useState<string[]>([])
    const [contractFile, setContractFile] = useState<File | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)

    // Handle log ID input - only allow numbers
    const handleLogIdChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value
        if (value === "" || /^[0-9]+$/.test(value)) {
            setLogId(value)
        }
    }

    const [originalLogId, setOriginalLogId] = useState<string>("");

    // Destructure the session from next-auth hook for user session details
    const { data: session } = useSession()


    async function handleLoadPO(e: React.FormEvent) {
        e.preventDefault();
        if (!logId) return;

        setIsLoading(true);
        setPoHeaders([]);
        setPoValues([]);

        try {
            const formData = new FormData();
            formData.append("documentType", "sponsorship");
            formData.append("searchCriteria", "log-id");
            formData.append("searchQuery", logId);

            const res = await fetch("/api/find-doc", { method: "POST", body: formData });
            const data = await res.json();
            if (!data.headers || !data.results?.length) {
                alert("No matching purchase order found.");
                return;
            }

            const row = data.results[0];      // [driveLink, …cells]
            const headers = data.headers as string[];  // ["View Document", "Business Name", …, "Invoiced", "Paid", "Log Id"]


            // 2) stash logId
            const logIdIndex = headers.findIndex(h => h.toLowerCase() === "log id");
            setOriginalLogId(row[logIdIndex] as string);

            // 3) render
            setPoHeaders(headers);
            setPoValues(row);
        } catch (err) {
            console.error(err);
            alert("Error loading PO.");
        } finally {
            setIsLoading(false);
        }
    }

    // Handle invoice attachment submission
    async function handleAttachContract(e: React.FormEvent) {
        e.preventDefault();
        if (!contractFile || !originalLogId) return;

        setIsSubmitting(true);
        try {
            const formData = new FormData();
            formData.append("contractFile", contractFile);
            formData.append("logId", originalLogId);

            // Append the name of the logged-in user if available from the session
            if (session?.user?.name) {
                formData.append("submittedBy", session.user.name)
            }

            const res = await fetch("/api/attach-contract", { method: "POST", body: formData });
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
        } catch (err: any) {
            console.error(err);
            alert("Failed to attach invoice: " + err.message);
        } finally {
            setIsSubmitting(false);
        }
    }

    // Filter out 'Paid', 'Invoiced', and 'Log Id' fields
    const displayFields = poHeaders
        .map((header, i) => ({ header, value: poValues[i] }))
        .filter(({ header }) => {
            const lower = header.toLowerCase()
            return lower !== "log id"
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
                            <Link href="/dashboard/manage-document/sponsorship">Sponsorship</Link>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                    <BreadcrumbItem>
                        <BreadcrumbPage>Attach Contract to Sponsorship</BreadcrumbPage>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>

            {/* Page Header */}
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Attach Contract to Sponsorship</h1>
                <p className="text-muted-foreground">Link invoice documents to existing purchase orders</p>
            </div>

            {/* PO Lookup Form */}
            <Card>
                <CardHeader>
                    <CardTitle>Sponsorship Lookup</CardTitle>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLoadPO} className="space-y-4">
                        <div className="space-y-2">
                            <Label htmlFor="log-id">Enter Sponsorship Log ID:</Label>
                            <Input
                                id="log-id"
                                type="text"
                                value={logId}
                                onChange={handleLogIdChange}
                                placeholder="Enter PO Log ID (numbers only)"
                                required
                            />
                        </div>
                        <Button type="submit" disabled={!logId || isLoading}>
                            {isLoading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Loading PO Data...
                                </>
                            ) : (
                                "Load Purchase Order"
                            )}
                        </Button>
                    </form>
                </CardContent>
            </Card>

            {/* PO Data Display */}
            {displayFields.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle>Sponsorship Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            {/* Dynamic PO Summary */}
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

                            {/* Contract Upload Form */}
                            <form onSubmit={handleAttachContract} className="space-y-6 pt-4 border-t">
                                <div className="space-y-2">
                                    <Label htmlFor="contract-upload">Upload Contract</Label>
                                    <Input
                                        id="contract-upload"
                                        type="file"
                                        onChange={(e) => setContractFile(e.target.files?.[0] || null)}
                                        required
                                    />
                                    {contractFile && <p className="text-sm text-muted-foreground">Selected file: {contractFile.name}</p>}
                                </div>
                                <Button type="submit" className="w-full" disabled={!contractFile || isSubmitting}>
                                    {isSubmitting ? (
                                        <>
                                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                            Attaching Contract...
                                        </>
                                    ) : (
                                        "Attach Contract"
                                    )}
                                </Button>
                            </form>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    )
}
