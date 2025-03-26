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

export default function ReportPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    router.push(`/dashboard/upload-document/report/success`)
  }

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
            <BreadcrumbPage>Report</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Report</h1>
        <p className="text-muted-foreground">Upload a report document and fill in the required information</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Report Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="document-upload">Upload Report Document</Label>
              <Input id="document-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>

            {/* Report Title */}
            <div className="space-y-2">
              <Label htmlFor="report-title">Report Title</Label>
              <Input id="report-title" type="text" required />
            </div>

            {/* Report Type */}
            <div className="space-y-2">
              <Label>Report Type</Label>
              <RadioGroup defaultValue="financial">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="financial" id="financial" />
                  <Label htmlFor="financial">Financial</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="technical" id="technical" />
                  <Label htmlFor="technical">Technical</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="progress" id="progress" />
                  <Label htmlFor="progress">Progress</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="audit" id="audit" />
                  <Label htmlFor="audit">Audit</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other-type" />
                  <Label htmlFor="other-type">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Report Date */}
            <div className="space-y-2">
              <Label htmlFor="report-date">Report Date</Label>
              <Input id="report-date" type="date" required />
            </div>

            {/* Author */}
            <div className="space-y-2">
              <Label htmlFor="author">Author</Label>
              <Input id="author" type="text" required />
            </div>

            {/* Department */}
            <div className="space-y-2">
              <Label htmlFor="department">Department</Label>
              <Input id="department" type="text" required />
            </div>

            {/* Period Start */}
            <div className="space-y-2">
              <Label htmlFor="period-start">Period Start</Label>
              <Input id="period-start" type="date" required />
            </div>

            {/* Period End */}
            <div className="space-y-2">
              <Label htmlFor="period-end">Period End</Label>
              <Input id="period-end" type="date" required />
            </div>

            {/* Confidentiality */}
            <div className="space-y-2">
              <Label>Confidentiality Level</Label>
              <RadioGroup defaultValue="internal">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="public" id="public" />
                  <Label htmlFor="public">Public</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="internal" id="internal" />
                  <Label htmlFor="internal">Internal</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="confidential" id="confidential" />
                  <Label htmlFor="confidential">Confidential</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="restricted" id="restricted" />
                  <Label htmlFor="restricted">Restricted</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Version */}
            <div className="space-y-2">
              <Label htmlFor="version">Version Number</Label>
              <Input id="version" type="number" step="0.1" required />
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

