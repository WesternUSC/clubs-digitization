"use client"

import type React from "react"

import { useState } from "react"
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

export default function ContractPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    router.push(`/dashboard/upload-document/contract/success`)
  }

  return (
    <div className="space-y-6 h-screen">
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
            <BreadcrumbPage>Contract</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Contract</h1>
        <p className="text-muted-foreground">Upload a contract document and fill in the required information</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Contract Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="document-upload">Upload Contract Document</Label>
              <Input id="document-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>

            {/* Contract Title */}
            <div className="space-y-2">
              <Label htmlFor="contract-title">Contract Title</Label>
              <Input id="contract-title" type="text" required />
            </div>

            {/* Contract Type */}
            <div className="space-y-2">
              <Label>Contract Type</Label>
              <RadioGroup defaultValue="employment">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="employment" id="employment" />
                  <Label htmlFor="employment">Employment</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="service" id="service" />
                  <Label htmlFor="service">Service</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="lease" id="lease" />
                  <Label htmlFor="lease">Lease</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="sale" id="sale" />
                  <Label htmlFor="sale">Sale</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other-type" />
                  <Label htmlFor="other-type">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Start Date */}
            <div className="space-y-2">
              <Label htmlFor="start-date">Start Date</Label>
              <Input id="start-date" type="date" required />
            </div>

            {/* End Date */}
            <div className="space-y-2">
              <Label htmlFor="end-date">End Date</Label>
              <Input id="end-date" type="date" required />
            </div>

            {/* Party Name */}
            <div className="space-y-2">
              <Label htmlFor="party-name">Party Name</Label>
              <Input id="party-name" type="text" required />
            </div>

            {/* Party Address */}
            <div className="space-y-2">
              <Label htmlFor="party-address">Party Address</Label>
              <Input id="party-address" type="text" required />
            </div>

            {/* Contract Value */}
            <div className="space-y-2">
              <Label htmlFor="contract-value">Contract Value</Label>
              <Input id="contract-value" type="number" step="0.01" required />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" type="text" placeholder="USD" required />
            </div>

            {/* Status */}
            <div className="space-y-2">
              <Label>Status</Label>
              <RadioGroup defaultValue="active">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="draft" id="draft" />
                  <Label htmlFor="draft">Draft</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="active" id="active" />
                  <Label htmlFor="active">Active</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="expired" id="expired" />
                  <Label htmlFor="expired">Expired</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="terminated" id="terminated" />
                  <Label htmlFor="terminated">Terminated</Label>
                </div>
              </RadioGroup>
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

