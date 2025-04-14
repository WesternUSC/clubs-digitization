"use client"

import type React from "react"

import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
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
  const [file, setFile] = useState<File>()
  const [expiryDate, setExpiryDate] = useState("")

  // New state for uncontrolled inputs converted to controlled
  const [businessName, setBusinessName] = useState("")
  const [businessName2, setBusinessName2] = useState("")
  const [amount, setAmount] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [notes, setNotes] = useState("")

  // Action checkboxes state
  const [calendarReminder, setCalendarReminder] = useState(true)
  const [logToSheets, setLogToSheets] = useState(true)
  const [uploadToDrive, setUploadToDrive] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)

  // Update send date when expiry date changes
  useEffect(() => {
    if (expiryDate) {
      setSendDate(expiryDate)
      setReminderDate(expiryDate)
    }
  }, [expiryDate])

  // Calendar reminder states
  const [reminderDate, setReminderDate] = useState("")

  // Email fields state
  const [vendorEmail, setVendorEmail] = useState("")
  const [copyEmails, setCopyEmails] = useState("shari.bumpus@westernusc.ca")
  const [emailSubject, setEmailSubject] = useState("Lorem Ipsum")
  const [emailBody, setEmailBody] = useState(
    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
  )
  const [sendDate, setSendDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    if (!file) {
      alert("Please select a file to upload.")
      setIsSubmitting(false)
      return
    }

    // Use state values instead of document.getElementById
    const formData = new FormData()

    formData.append("businessName", businessName)
    formData.append("businessName2", businessName2)
    formData.append("amount", amount)
    formData.append("issueDate", issueDate)
    formData.append("expiryDate", expiryDate)
    formData.append("notes", notes)

    formData.append("file", file)

    // Append the checkbox states to the form data
    formData.append("calendarReminder", calendarReminder.toString())
    formData.append("logToSheets", logToSheets.toString())
    formData.append("uploadToDrive", uploadToDrive.toString())
    formData.append("sendEmail", sendEmail.toString())

    if (sendEmail) {
      formData.append("vendorEmail", vendorEmail)
      formData.append("copyEmails", copyEmails)
      formData.append("emailSubject", emailSubject)
      formData.append("emailBody", emailBody)
      formData.append("sendDate", sendDate)
    }

    if (calendarReminder) {
      formData.append("reminderDate", reminderDate)
    }

    const response = await fetch("/api/log-coi", {
      method: "POST",
      //headers: { "Content-Type": "application/json" },
      body: formData,
    })

    if (response.ok) {
      alert("Event created successfully!")
    } else {
      alert("Failed to create event.")
    }

    setIsSubmitting(false)
    router.push(`/dashboard/upload-document/certificate/success`)
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
            <BreadcrumbPage>Certificate</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Certificate of Insurance</h1>
        <p className="text-muted-foreground">
          Upload a certificate document and fill in the required information
        </p>
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
              <Input
                id="document-upload"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                required
              />
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>

            {/* Recipient Name */}
            <div className="space-y-2">
              <Label htmlFor="business-name">Business Name</Label>
              <Input
                id="business-name"
                type="text"
                required
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
              />
            </div>

            {/* Recipient Name 2 */}
            <div className="space-y-2">
              <Label htmlFor="business-name-2">Business Name 2</Label>
              <Input
                id="business-name-2"
                type="text"
                value={businessName2}
                onChange={(e) => setBusinessName2(e.target.value)}
              />
            </div>

            {/* Amount */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <Input
                id="amount"
                type="number"
                step="1.0"
                min="0"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
              />
            </div>

            {/* Issue Date */}
            <div className="space-y-2">
              <Label htmlFor="issue-date">Issue Date</Label>
              <Input
                id="issue-date"
                type="date"
                required
                value={issueDate}
                onChange={(e) => setIssueDate(e.target.value)}
              />
            </div>

            {/* Expiry Date */}
            <div className="space-y-2">
              <Label htmlFor="expiry-date">Expiry Date</Label>
              <Input
                id="expiry-date"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Actions Section */}
            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
              <h3 className="font-medium text-lg">Actions:</h3>

              <div className="space-y-3">
                {/* Calendar Reminder */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="calendar-reminder"
                    checked={calendarReminder}
                    onCheckedChange={(checked) => setCalendarReminder(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="calendar-reminder">
                      Set Google Calendar reminder for COI expiry.
                    </Label>
                  </div>
                </div>

                {/* Conditional Calendar Reminder Fields */}
                {calendarReminder && (
                  <div className="ml-6 mt-2 space-y-3 border-l-2 pl-4 border-primary/30">
                    <div className="space-y-2">
                      <Label htmlFor="reminder-date">Reminder Date</Label>
                      <Input
                        id="reminder-date"
                        type="date"
                        value={reminderDate}
                        onChange={(e) => setReminderDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}

                {/* Google Sheets */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="log-sheets"
                    checked={true}
                  // checked={logToSheets}
                  // onCheckedChange={(checked) => setLogToSheets(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="log-sheets">Log COI details in Google Sheets.</Label>
                  </div>
                </div>

                {/* Google Drive */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="upload-drive"
                    checked={uploadToDrive}
                    onCheckedChange={(checked) => setUploadToDrive(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="upload-drive">Upload COI to Google Drive.</Label>
                  </div>
                </div>

                {/* Gmail */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="send-email"
                    checked={sendEmail}
                    onCheckedChange={(checked) => setSendEmail(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="send-email">
                      Automatically send email to vendor on COI expiry date via Gmail.
                    </Label>
                  </div>
                </div>

                {/* Conditional Email Fields */}
                {sendEmail && (
                  <div className="ml-6 mt-2 space-y-3 border-l-2 pl-4 border-primary/30">
                    <div className="space-y-2">
                      <Label htmlFor="vendor-email">Send to (Vendor Email)</Label>
                      <Input
                        id="vendor-email"
                        type="email"
                        value={vendorEmail}
                        onChange={(e) => setVendorEmail(e.target.value)}
                        placeholder="vendor@example.com"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="copy-emails">Copy Emails</Label>
                      <Input
                        id="copy-emails"
                        type="text"
                        value={copyEmails}
                        onChange={(e) => setCopyEmails(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email-body">Body</Label>
                      <Textarea
                        id="email-body"
                        rows={4}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="send-date">Send Date</Label>
                      <Input
                        id="send-date"
                        type="date"
                        value={sendDate}
                        onChange={(e) => setSendDate(e.target.value)}
                      />
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <Button type="submit" className="w-full" disabled={isSubmitting}>
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Processing...
                </>
              ) : (
                "Upload Document"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
