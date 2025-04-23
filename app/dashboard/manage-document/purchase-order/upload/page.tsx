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
  const [invoiceFile, setInvoiceFile] = useState<File>()


  // State for other form inputs that were previously uncontrolled, now controlled components
  const [businessName, setBusinessName] = useState("")
  const [clubName, setClubName] = useState("")
  const [clubAccountNumber, setClubAccountNumber] = useState("")
  const [poNumber, setPoNumber] = useState("")
  const [eventName, setEventName] = useState("")
  const [issueDate, setIssueDate] = useState("")
  const [eventDate, setEventDate] = useState("")
  const [amount, setAmount] = useState("")
  const [notes, setNotes] = useState("")

  // State for action checkboxes to determine which actions should be performed
  const [calendarReminder, setCalendarReminder] = useState(true)
  const [logToSheets, setLogToSheets] = useState(true)
  const [uploadToDrive, setUploadToDrive] = useState(true)

  // State to manage document category selection from the dropdown
  const [documentCategory, setDocumentCategory] = useState<string>("")

  // New Invoice & Paid Radio states
  const [invoiced, setInvoiced] = useState<'Yes' | 'No'>('No')
  const [paid, setPaid] = useState<'Yes' | 'No'>('No')

  // Destructure the session from next-auth hook for user session details
  const { data: session } = useSession()

  // When the expiry date changes, update both email send date and calendar reminder date
  useEffect(() => {
    if (eventDate) {
      setReminderDate(eventDate)
    }
  }, [eventDate])

  useEffect(() => {
    if (invoiced === 'Yes' && paid === 'Yes') {
      setCalendarReminder(false)
    }
  }, [invoiced, paid])

  // State for calendar reminder date separate from expiry date
  const [reminderDate, setReminderDate] = useState("")


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
    formData.append("clubName", clubName)
    formData.append("clubAccountNumber", clubAccountNumber)
    formData.append("poNumber", poNumber)
    formData.append("eventName", eventName)
    formData.append("issueDate", issueDate)
    formData.append("eventDate", eventDate)
    formData.append("amount", amount)
    formData.append("notes", notes)

    // Append the uploaded file
    formData.append("file", file)

    if (invoiced === 'Yes' && invoiceFile) {
      formData.append("invoiceFile", invoiceFile)
    }

    formData.append("invoiced", invoiced)
    formData.append("paid", paid)


    // Append checkbox state values indicating actions to perform
    formData.append("calendarReminder", calendarReminder.toString())
    formData.append("logToSheets", logToSheets.toString())
    formData.append("uploadToDrive", uploadToDrive.toString())
    formData.append("documentCategory", documentCategory)

    // Append reminder date if calendar reminder is enabled
    if (calendarReminder) {
      formData.append("reminderDate", reminderDate)
    }

    // Append the name of the logged-in user if available from the session
    if (session?.user?.name) {
      formData.append("submittedBy", session.user.name)
    }

    // Send the form data using a POST request to the specified API endpoint
    const response = await fetch("/api/log-po", {
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
      router.push(`/dashboard/manage-document/success`);
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
            <BreadcrumbPage>Upload Purchase Order</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      {/* Page Header Section */}
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Purchase Order</h1>
        <p className="text-muted-foreground">
          Upload a certificate document and fill in the required information
        </p>
      </div>

      {/* Card container for the certificate details form */}
      <Card>
        <CardHeader>
          <CardTitle>PO Details</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Form section, with onSubmit triggering the handleSubmit function */}
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* File Upload Section */}
            <div className="space-y-2">
              <Label htmlFor="document-upload">Upload PO Document</Label>
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
                  <SelectItem value="Western">Western</SelectItem>
                  <SelectItem value="External">External</SelectItem>
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

            {/* Club Name Input Field */}
            <div className="space-y-2">
              <Label htmlFor="club-name">Club Name</Label>
              <Input
                id="club-name"
                type="text"
                value={clubName}
                onChange={(e) => setClubName(e.target.value)}
              />
            </div>

            {/* Club Account Number Field */}
            <div className="space-y-2">
              <Label htmlFor="club-account-number">Club Account Number</Label>
              <Input
                id="club-account-number"
                type="text"
                inputMode="decimal"
                pattern="^\d*\.?\d*$"
                required
                value={clubAccountNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  // Only update state if input matches a valid decimal pattern
                  if (/^\d*\.?\d*$/.test(val)) {
                    setClubAccountNumber(val);
                  }
                }}
              />
            </div>

            {/* PO Number Field */}
            <div className="space-y-2">
              <Label htmlFor="po-number">PO Number</Label>
              <Input
                id="po-number"
                type="text"
                inputMode="decimal"
                pattern="^\d*\.?\d*$"
                required
                value={poNumber}
                onChange={(e) => {
                  const val = e.target.value;
                  // Only update state if input matches a valid decimal pattern
                  if (/^\d*\.?\d*$/.test(val)) {
                    setPoNumber(val);
                  }
                }}
              />
            </div>

            {/* Event Name Input Field */}
            <div className="space-y-2">
              <Label htmlFor="event-name">Event Name</Label>
              <Input
                id="event-name"
                type="text"
                value={eventName}
                onChange={(e) => setEventName(e.target.value)}
              />
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
              <Label htmlFor="expiry-date">Event Date</Label>
              <Input
                id="event-date"
                type="date"
                required
                value={eventDate}
                onChange={(e) => setEventDate(e.target.value)}
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

            {/* Invoiced? Radio Group */}
            <div className="space-y-2">
              <Label>Invoiced?</Label>
              <RadioGroup
                value={invoiced}
                onValueChange={(val) => setInvoiced(val as 'Yes' | 'No')}
                className="flex space-x-4"
              >
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="Yes" id="invoiced-yes" />
                  <Label htmlFor="invoiced-yes">Yes</Label>
                </div>
                <div className="flex items-center space-x-1">
                  <RadioGroupItem value="No" id="invoiced-no" />
                  <Label htmlFor="invoiced-no">No</Label>
                </div>
              </RadioGroup>
            </div>

            {/* Conditional Invoice Upload & Paid? */}
            {invoiced === 'Yes' && (
              <div className="space-y-4 border rounded-md p-4 bg-muted/10">
                {/* Invoice File Upload */}
                <div className="space-y-2">
                  <Label htmlFor="invoice-upload">Upload Invoice</Label>
                  <Input
                    id="invoice-upload"
                    type="file"
                    onChange={(e) => setInvoiceFile(e.target.files?.[0])}
                    required={invoiced === 'Yes'}
                  />
                  {invoiceFile && (
                    <p className="text-sm text-muted-foreground">Selected invoice: {invoiceFile.name}</p>
                  )}
                </div>

                {/* Paid? Radio Group */}
                <div className="space-y-2">
                  <Label>Paid?</Label>
                  <RadioGroup
                    value={paid}
                    onValueChange={(val) => setPaid(val as 'Yes' | 'No')}
                    className="flex space-x-4"
                  >
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="Yes" id="paid-yes" />
                      <Label htmlFor="paid-yes">Yes</Label>
                    </div>
                    <div className="flex items-center space-x-1">
                      <RadioGroupItem value="No" id="paid-no" />
                      <Label htmlFor="paid-no">No</Label>
                    </div>
                  </RadioGroup>
                </div>
              </div>
            )}


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
                      Set Google Calendar reminder for event date.
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
                    <Label htmlFor="log-sheets">Log purchase order details in Google Sheets.</Label>
                  </div>
                </div>

                {/* Google Drive Upload Action Checkbox */}
                <div className="flex items-start space-x-2">
                  <Checkbox
                    id="upload-drive"
                    checked={true}
                    // commented it out because google drive upload is mandatory
                    // onCheckedChange={(checked) => setUploadToDrive(checked as boolean)}
                  />
                  <div className="grid gap-1.5 leading-none">
                    <Label htmlFor="upload-drive">Upload purchase order to Google Drive.</Label>
                  </div>
                </div>

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
