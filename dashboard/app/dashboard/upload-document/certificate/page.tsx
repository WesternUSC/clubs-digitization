"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
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

export default function CertificatePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  setIsSubmitting(true);

  const businessName = (document.getElementById("business-name") as HTMLInputElement).value;
  const businessName2 = (document.getElementById("business-name-2") as HTMLInputElement).value;
  const amount = (document.getElementById("amount") as HTMLInputElement).value;
  const issueDate = (document.getElementById("issue-date") as HTMLInputElement).value;
  const expiryDate = (document.getElementById("expiry-date") as HTMLInputElement).value;
  const notes = (document.getElementById("notes") as HTMLInputElement).value;

  const response = await fetch("/api/log-coi", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ businessName, businessName2, amount, issueDate, expiryDate, notes }),
  });

  if (response.ok) {
    alert("Event created successfully!");
  } else {
    alert("Failed to create event.");
  }

  setIsSubmitting(false);
  router.push(`/dashboard/upload-document/certificate/success`);
};


  return (
    <div className="space-y-6">
      {/* Breadcrumb */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Upload Document</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Certificate</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Certificate of Insurance</h1>
        <p className="text-muted-foreground">Upload a certificate document and fill in the required information</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="document-upload">Upload Certificate Document</Label>
              <Input id="document-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>

             {/* Recipient Name */}
                        <div className="space-y-2">
              <Label htmlFor="busienss-name">Business Name</Label>
              <Input id="business-name" type="text" required />
            </div>

            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="business-name-2">Business Name 2</Label>
              <Input id="business-name-2" type="text" />
            </div>

            {/* Amount */}
                        <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="1.0" min="0" required />
            </div>

             {/* Issue Date */}
                        <div className="space-y-2">
              <Label htmlFor="issue-date">Issue Date</Label>
              <Input id="issue-date" type="date" required />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input id="expiry-date" type="date" required />
            </div>

                        {/* Textarea */}
                        <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes"/>
            </div>


            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Submit Document"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

