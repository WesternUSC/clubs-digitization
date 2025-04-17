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

export default function InvoicePage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    router.push(`/dashboard/upload-document/purchase-order/success`)
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
            <BreadcrumbPage>Invoice</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Purchase Order</h1>
        <p className="text-muted-foreground">Upload a purchase order document and fill in the required information</p>
      </div>

      {/* Form Card */}
      <Card>
        <CardHeader>
          <CardTitle>Purchase Order Details</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload */}
            <div className="space-y-2">
              <Label htmlFor="document-upload">Upload Invoice Document</Label>
              <Input id="document-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>

            {/* Invoice Number */}
            <div className="space-y-2">
              <Label htmlFor="invoice-number">Invoice Number</Label>
              <Input id="invoice-number" type="text" required />
            </div>

            {/* Invoice Date */}
            <div className="space-y-2">
              <Label htmlFor="invoice-date">Invoice Date</Label>
              <Input id="invoice-date" type="date" required />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input id="amount" type="number" step="0.01" required />
            </div>

            {/* Currency */}
            <div className="space-y-2">
              <Label htmlFor="currency">Currency</Label>
              <Input id="currency" type="text" placeholder="USD" required />
            </div>

            {/* Vendor Name */}
            <div className="space-y-2">
              <Label htmlFor="vendor-name">Vendor Name</Label>
              <Input id="vendor-name" type="text" required />
            </div>

            {/* Payment Status */}
            <div className="space-y-2">
              <Label>Payment Status</Label>
              <RadioGroup defaultValue="unpaid">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="paid" id="paid" />
                  <Label htmlFor="paid">Paid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="unpaid" id="unpaid" />
                  <Label htmlFor="unpaid">Unpaid</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="partial" id="partial" />
                  <Label htmlFor="partial">Partial</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Payment Method */}
            <div className="space-y-2">
              <Label>Payment Method</Label>
              <RadioGroup defaultValue="credit-card">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="credit-card" id="credit-card" />
                  <Label htmlFor="credit-card">Credit Card</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="bank-transfer" id="bank-transfer" />
                  <Label htmlFor="bank-transfer">Bank Transfer</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="cash" id="cash" />
                  <Label htmlFor="cash">Cash</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="other" id="other" />
                  <Label htmlFor="other">Other</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Due Date */}
            <div className="space-y-2">
              <Label htmlFor="due-date">Due Date</Label>
              <Input id="due-date" type="date" required />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Input id="notes" type="text" />
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

