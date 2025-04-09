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


  // Action checkboxes state
  const [calendarReminder, setCalendarReminder] = useState(true)
  const [logToSheets, setLogToSheets] = useState(true)
  const [uploadToDrive, setUploadToDrive] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)

  // Update send date when expiry date changes
  useEffect(() => {
    if (expiryDate) {
      setSendDate(expiryDate)
    }
  }, [expiryDate])

  // Email fields state
  const [vendorEmail, setVendorEmail] = useState("")
  const [copyEmails, setCopyEmails] = useState("anna.pavicic@westernusc.ca")
  const [emailSubject, setEmailSubject] = useState("Lorem Ipsum")
  const [emailBody, setEmailBody] = useState(
    "This is an automated reminder that your certificate is about to expire. Please contact us to renew your certificate before the expiration date to avoid any service interruptions.",
  )
  const [sendDate, setSendDate] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {

    e.preventDefault();
    setIsSubmitting(true);

    if (!file) {
      alert("Please select a file to upload.");
      setIsSubmitting(false);
      return;
    }

    const businessName = (document.getElementById("business-name") as HTMLInputElement).value;
    const businessName2 = (document.getElementById("business-name-2") as HTMLInputElement).value;
    const amount = (document.getElementById("amount") as HTMLInputElement).value;
    const issueDate = (document.getElementById("issue-date") as HTMLInputElement).value;
    const expiryDate = (document.getElementById("expiry-date") as HTMLInputElement).value;
    const notes = (document.getElementById("notes") as HTMLInputElement).value;




    const formData = new FormData();

    formData.append("businessName", businessName);
    formData.append("businessName2", businessName2);
    formData.append("amount", amount);
    formData.append("issueDate", issueDate);
    formData.append("expiryDate", expiryDate);
    formData.append("notes", notes);

    formData.append("file", file);

    // Append the checkbox states to the form data
    formData.append("calendarReminder", calendarReminder.toString());
    formData.append("logToSheets", logToSheets.toString());
    formData.append("uploadToDrive", uploadToDrive.toString());
    formData.append("sendEmail", sendEmail.toString());

    if(sendEmail){
      const vendorEmail = (document.getElementById("vendor-email") as HTMLInputElement).value;
      const copyEmails = (document.getElementById("copy-emails") as HTMLInputElement).value;
      const emailSubject = (document.getElementById("email-subject") as HTMLInputElement).value;
      const emailBody = (document.getElementById("email-body") as HTMLInputElement).value;
      const sendDate = (document.getElementById("send-date") as HTMLInputElement).value;

      formData.append("vendorEmail", vendorEmail.toString());
      formData.append("copyEmails", copyEmails.toString());
      formData.append("emailSubject", emailSubject.toString());
      formData.append("emailBody", emailBody.toString());
      formData.append("sendDate", sendDate.toString());
    }


    const response = await fetch("/api/log-coi", {
      method: "POST",
      //headers: { "Content-Type": "application/json" },
      body: formData,
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
              <Input id="document-upload" type="file" onChange={(e) => setFile(e.target.files?.[0])} required />
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
              <Input
                id="expiry-date"
                type="date"
                required
                value={expiryDate}
                onChange={(e) => setExpiryDate(e.target.value)}
              />
            </div>

            {/* Textarea */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea id="notes" />
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
                    <Label htmlFor="calendar-reminder">Set Google Calendar reminder for COI expiry.</Label>
                  </div>
                </div>

                {/* Google Sheets */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="log-sheets"
                    checked={logToSheets}
                    onCheckedChange={(checked) => setLogToSheets(checked as boolean)}
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
                    <Label htmlFor="send-email">Automatically send email to vendor on COI expiry date via Gmail.</Label>
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
                "Submit Document"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}

