"use client" // Enable React's client-side rendering mode

// Import React types and hooks from React and Next.js libraries
import type React from "react"

// Import React hooks and necessary components from various libraries and custom paths
import { useState, useEffect } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useSession } from "next-auth/react"
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

// Main functional component for the Certificate Page
export default function CertificatePage() {
  // Next.js router to navigate programmatically after form submission
  const router = useRouter()

  // State for handling submission loading indicator and selected file
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File>()
  // State to capture the certificate's expiry date
  const [expiryDate, setExpiryDate] = useState("")

  // State for other form inputs that were previously uncontrolled, now controlled components
  const [businessName, setBusinessName] = useState("")
  const [businessName2, setBusinessName2] = useState("")
  const [amount, setAmount] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [notes, setNotes] = useState("")

  // State for action checkboxes to determine which actions should be performed
  const [calendarReminder, setCalendarReminder] = useState(true)
  const [logToSheets, setLogToSheets] = useState(true)
  const [uploadToDrive, setUploadToDrive] = useState(true)
  const [sendEmail, setSendEmail] = useState(true)

  // State to manage document category selection from the dropdown
  const [documentCategory, setDocumentCategory] = useState<string>("")

  // Destructure the session from next-auth hook for user session details
  const { data: session } = useSession()

  // When the expiry date changes, update both email send date and calendar reminder date
  useEffect(() => {
    if (expiryDate) {
      setSendDate(expiryDate)
      setReminderDate(expiryDate)
    }
  }, [expiryDate])

  // State for calendar reminder date separate from expiry date
  const [reminderDate, setReminderDate] = useState("")

  // States for email details that will be used if sendEmail is enabled
  const [vendorEmail, setVendorEmail] = useState("")
  const [copyEmails, setCopyEmails] = useState("shari.bumpus@westernusc.ca")
  const [emailSubject, setEmailSubject] = useState("Lorem Ipsum")
  const [emailBody, setEmailBody] = useState(
    "Lorem ipsum dolor sit amet, consectetuer adipiscing elit. Aenean commodo ligula eget dolor. Aenean massa. Cum sociis natoque penatibus et magnis dis parturient montes, nascetur ridiculus mus.",
  )
  // State for send date for the email, initially updated from expiry date
  const [sendDate, setSendDate] = useState("")

  // Event handler for form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault() // Prevent page reload on form submission
    setIsSubmitting(true) // Start submission loading indicator

    // Ensure a file has been selected before proceeding
    if (!file) {
      alert("Please select a file to upload.")
      setIsSubmitting(false)
      return
    }

    // Create FormData object to collect all form inputs for sending in the HTTP request
    const formData = new FormData()

    // Append basic certificate information
    formData.append("businessName", businessName)
    formData.append("businessName2", businessName2)
    formData.append("amount", amount)
    formData.append("issueDate", issueDate)
    formData.append("expiryDate", expiryDate)
    formData.append("notes", notes)

    // Append the uploaded file
    formData.append("file", file)

    // Append checkbox state values indicating actions to perform
    formData.append("calendarReminder", calendarReminder.toString())
    formData.append("logToSheets", logToSheets.toString())
    formData.append("uploadToDrive", uploadToDrive.toString())
    formData.append("sendEmail", sendEmail.toString())
    formData.append("documentCategory", documentCategory)

    // Append email-related fields if sendEmail action is enabled
    if (sendEmail) {
      formData.append("vendorEmail", vendorEmail)
      formData.append("copyEmails", copyEmails)
      formData.append("emailSubject", emailSubject)
      formData.append("emailBody", emailBody)
      formData.append("sendDate", sendDate)
    }

    // Append reminder date if calendar reminder is enabled
    if (calendarReminder) {
      formData.append("reminderDate", reminderDate)
    }

    // Append the name of the logged-in user if available from the session
    if (session?.user?.name) {
      formData.append("submittedBy", session.user.name)
    }

    // Send the form data using a POST request to the specified API endpoint
    const response = await fetch("/api/log-coi", {
      method: "POST",
      // Note: FormData automatically sets the headers so explicit "Content-Type" is not required.
      body: formData,
    })

    if (response.ok) {
      const data = await response.json();
    
      // Save the flag and links in sessionStorage
      sessionStorage.setItem("fromUpload", "true");
      sessionStorage.setItem("externalLinks", JSON.stringify(data));
    
      // Now stop the loading
      setIsSubmitting(false);
    
      // Redirect to success page
      router.push(`/dashboard/upload-document/certificate/general/success`);
    } else {
      setIsSubmitting(false); // Only stop loading here if it failed
      alert("Failed to create event.");
    }
  }

  // Return the JSX structure for the certificate upload page
  return (
    <div className="space-y-6">
      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Upload Document</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard/upload-document/certificate">Certificate of Insurance</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>General</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload General COI</h1>
        <p className="text-muted-foreground">
          Upload a certificate document and fill in the required information
        </p>
      </div>

      {/* Card container for the certificate details form */}
      <Card>
        <CardHeader>
          <CardTitle>Certificate Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Form section, with onSubmit triggering the handleSubmit function */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="document-upload">Upload Certificate Document</Label>
              <Input
                id="document-upload"
                type="file"
                onChange={(e) => setFile(e.target.files?.[0])}
                required
              />
              {/* Display selected file name if available */}
              {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
            </div>

            {/* Document Category Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Category</label>
              <Select value={documentCategory} onValueChange={setDocumentCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Catering/Hospitality">Catering/Hospitality</SelectItem>
                  <SelectItem value="Venue">Venue</SelectItem>
                  <SelectItem value="Transportation">Transportation</SelectItem>
                  <SelectItem value="Other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {/* Business Name Input Field */}
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

            {/* Secondary Business Name Input Field */}
            <div className="space-y-2">
              <Label htmlFor="business-name-2">Business Name 2</Label>
              <Input
                id="business-name-2"
                type="text"
                value={businessName2}
                onChange={(e) => setBusinessName2(e.target.value)}
              />
            </div>

            {/* Amount Input with Dollar Sign Prefixed */}
            <div className="space-y-2">
              <Label htmlFor="amount">Amount</Label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
                <Input
                  id="amount"
                  type="text"
                  inputMode="decimal"
                  pattern="^\d*\.?\d*$"
                  required
                  className="pl-7" // Add left padding for the dollar sign
                  value={amount}
                  onChange={(e) => {
                    const val = e.target.value;
                    // Only update state if input matches a valid decimal pattern
                    if (/^\d*\.?\d*$/.test(val)) {
                      setAmount(val);
                    }
                  }}
                />
              </div>
            </div>

            {/* Issue Date Input */}
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

            {/* Expiry Date Input */}
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

            {/* Notes Input Area */}
            <div className="space-y-2">
              <Label htmlFor="notes">Notes</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
              />
            </div>

            {/* Actions Section - Grouping checkboxes and conditional fields */}
            <div className="space-y-4 border rounded-md p-4 bg-muted/20">
              <h3 className="font-medium text-lg">Actions:</h3>

              <div className="space-y-3">
                {/* Google Calendar Reminder Checkbox */}
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

                {/* Conditional fields for calendar reminder */}
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

                {/* Google Sheets Action Checkbox */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="log-sheets"
                    checked={true}
                    // The logToSheets state is commented out, always checked by default in current code
                    // checked={logToSheets}
                    // onCheckedChange={(checked) => setLogToSheets(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="log-sheets">Log COI details in Google Sheets.</Label>
                  </div>
                </div>

                {/* Google Drive Upload Action Checkbox */}
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

                {/* Gmail Email Action Checkbox */}
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

                {/* Conditionally render email fields if sendEmail is enabled */}
                {sendEmail && (
                  <div className="ml-6 mt-2 space-y-3 border-l-2 pl-4 border-primary/30">
                    {/* Vendor Email Field */}
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

                    {/* Copy Emails Field */}
                    <div className="space-y-2">
                      <Label htmlFor="copy-emails">Copy Emails</Label>
                      <Input
                        id="copy-emails"
                        type="text"
                        value={copyEmails}
                        onChange={(e) => setCopyEmails(e.target.value)}
                      />
                    </div>

                    {/* Email Subject Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email-subject">Subject</Label>
                      <Input
                        id="email-subject"
                        type="text"
                        value={emailSubject}
                        onChange={(e) => setEmailSubject(e.target.value)}
                      />
                    </div>

                    {/* Email Body Field */}
                    <div className="space-y-2">
                      <Label htmlFor="email-body">Body</Label>
                      <Textarea
                        id="email-body"
                        rows={4}
                        value={emailBody}
                        onChange={(e) => setEmailBody(e.target.value)}
                      />
                    </div>

                    {/* Send Date Field */}
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

            {/* Submit Button to trigger form submission */}
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
