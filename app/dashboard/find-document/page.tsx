"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Loader2, ListFilter } from "lucide-react"

// Define search criteria options for each document type
const searchCriteriaOptions = {
  certificate: [
    { value: "business-name", label: "Business Name" },
    { value: "business-name-2", label: "Business Name 2" },
    { value: "amount", label: "Amount" },
    { value: "issue-date", label: "Issue Date" },
    { value: "expiry-date", label: "Expiry Date" },
  ],
  invoice: [
    { value: "invoice-number", label: "Invoice Number" },
    { value: "vendor", label: "Vendor" },
    { value: "amount", label: "Amount" },
    { value: "date", label: "Date" },
  ],
  contract: [
    { value: "contract-id", label: "Contract ID" },
    { value: "party-name", label: "Party Name" },
    { value: "start-date", label: "Start Date" },
    { value: "end-date", label: "End Date" },
  ],
  report: [
    { value: "report-title", label: "Report Title" },
    { value: "author", label: "Author" },
    { value: "department", label: "Department" },
    { value: "date", label: "Date" },
  ],
}

// Define a mapping for the table column headers (excluding the "Notes" column).
// We assume the drive link is not displayed as a normal column but used in an action.
const documentColumnsMapping: { [key: string]: string[] } = {
  certificate: ["Business Name", "Business Name 2", "Amount", "Issue Date", "Expiry Date"],
  invoice: ["Invoice Number", "Vendor", "Amount", "Date"],
  contract: ["Contract ID", "Party Name", "Start Date", "End Date"],
  report: ["Report Title", "Author", "Department", "Date"],
}

export default function FindDocumentPage() {
  const [documentType, setDocumentType] = useState<string>("")
  const [searchCriteria, setSearchCriteria] = useState<string>("")
  const [searchQuery, setSearchQuery] = useState<string>("")
  const [isSearching, setIsSearching] = useState(false)
  const [searchResults, setSearchResults] = useState<any[] | null>(null)

  // Handle document type change
  const handleDocumentTypeChange = (value: string) => {
    setDocumentType(value)
    setSearchCriteria("")
    setSearchQuery("")
    setSearchResults(null)
  }

  // Get placeholder text for the search input based on the selected criteria
  const getSearchPlaceholder = () => {
    if (!searchCriteria) return "Enter search term"
    const selectedOption = searchCriteriaOptions[documentType as keyof typeof searchCriteriaOptions]?.find(
      (option) => option.value === searchCriteria,
    )
    return `Enter ${selectedOption?.label.toLowerCase()}`
  }

  // Handle search: sends form data to the backend and updates state with results
  const handleSearch = async () => {
    if (!documentType || !searchCriteria || !searchQuery) return
  
    setIsSearching(true)
    setSearchResults(null)
  
    try {
      const formData = new FormData()
      formData.append("documentType", documentType)
      formData.append("searchCriteria", searchCriteria)
      formData.append("searchQuery", searchQuery)
  
      const response = await fetch("/api/find-doc", {
        method: "POST",
        body: formData,
      })
  
      const data = await response.json()
      console.log("Received data:", data)
  
      // Expecting backend to return { results: processedRows }
      setSearchResults(data.results || [])
    } catch (error) {
      console.error("Search failed", error)
    } finally {
      setIsSearching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Document</h1>
        <p className="text-muted-foreground">Search for documents in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Document Type Selection */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Document Type</label>
              <Select value={documentType} onValueChange={handleDocumentTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Select document type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="certificate">Certificate</SelectItem>
                  <SelectItem value="invoice">Invoice</SelectItem>
                  <SelectItem value="contract">Contract</SelectItem>
                  <SelectItem value="report">Report</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {documentType && (
              <div className="space-y-4">
                <h3 className="font-medium">Search By</h3>
                <div className="space-y-4">
                  <Select value={searchCriteria} onValueChange={setSearchCriteria}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select search criteria" />
                    </SelectTrigger>
                    <SelectContent>
                      {searchCriteriaOptions[documentType as keyof typeof searchCriteriaOptions]?.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>

                  {searchCriteria && (
                    <div className="space-y-4">
                      <Input
                        placeholder={getSearchPlaceholder()}
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                      />

                      <Button onClick={handleSearch} disabled={!searchQuery || isSearching} className="w-full">
                        {isSearching ? (
                          <>
                            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            Searching...
                          </>
                        ) : (
                          <>
                            <ListFilter className="mr-2 h-4 w-4" />
                            Find Document
                          </>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {/* Create table headers dynamically based on selected document type */}
                    {documentType &&
                      documentColumnsMapping[documentType as keyof typeof documentColumnsMapping]?.map((header, idx) => (
                        <th key={idx} className="px-4 py-3 text-left font-medium">
                          {header}
                        </th>
                      ))}
                    <th className="px-4 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, resultIndex) => {
                    // Expect result to be an array where the last element is the drive link.
                    // The data cells correspond to the mapping in documentColumnsMapping.
                    const driveLink = result[result.length - 1];
                    // The data to display are all cells except the drive link.
                    const displayCells = result.slice(0, result.length - 1);
                    return (
                      <tr key={resultIndex} className="border-b">
                        {displayCells.map((cell: string, cellIdx: number) => (
                          <td key={cellIdx} className="px-4 py-3">
                            {cell}
                          </td>
                        ))}
                        <td className="px-4 py-3 text-right">
                          {driveLink ? (
                            <Button variant="outline" size="sm" asChild>
                              <Link href={driveLink} target="_blank" rel="noopener noreferrer">
                                View Doc
                              </Link>
                            </Button>
                          ) : (
                            <span>No document</span>
                          )}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
