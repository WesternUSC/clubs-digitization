"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, ListFilter } from "lucide-react";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

// Define search criteria options for certificates.
const searchCriteriaOptions = {
  certificate: [
    { value: "business-name", label: "Business Name" },
    { value: "business-name-2", label: "Business Name 2" },
    { value: "amount", label: "Amount" },
    { value: "issue-date", label: "Issue Date" },
    { value: "expiry-date", label: "Expiry Date" },
  ],
};

export default function FindDocumentPage() {
  // documentType is fixed to "certificate" on this page.
  const [documentType] = useState<string>("certificate");
  const [searchCriteria, setSearchCriteria] = useState<string>("");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<any[] | null>(null);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);

  const getSearchPlaceholder = () => {
    if (!searchCriteria) return "Enter search term";
    const selectedOption = searchCriteriaOptions[documentType as keyof typeof searchCriteriaOptions]?.find(
      (option) => option.value === searchCriteria,
    );
    return `Enter ${selectedOption?.label.toLowerCase()}`;
  };

  const handleSearch = async () => {
    if (!documentType || !searchCriteria || !searchQuery) return;

    setIsSearching(true);
    setSearchResults(null);
    setTableHeaders([]);

    try {
      const formData = new FormData();
      formData.append("documentType", documentType);
      formData.append("searchCriteria", searchCriteria);
      formData.append("searchQuery", searchQuery);

      const response = await fetch("/api/find-doc", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      console.log("Received data:", data);

      // Expecting the response to include { results, headers }
      setSearchResults(data.results || []);
      setTableHeaders(data.headers || []);
    } catch (error) {
      console.error("Search failed", error);
    } finally {
      setIsSearching(false);
    }
  };

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
              <Link href="/dashboard/manage-document/certificate">Certificate of Insurance</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbPage>Find COI</BreadcrumbPage>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>

      <div>
        <h1 className="text-3xl font-bold tracking-tight">Find Document</h1>
        <p className="text-muted-foreground">Search for certificates in the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Search Criteria</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {/* Document type selection is removed since it’s fixed to "certificate". */}
            <div className="space-y-4">
              <h3 className="font-medium">Search By</h3>
              <div className="space-y-4">
                <Select value={searchCriteria} onValueChange={setSearchCriteria}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select search criteria" />
                  </SelectTrigger>
                  <SelectContent>
                    {searchCriteriaOptions.certificate.map((option) => (
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
          </div>
        </CardContent>
      </Card>

      {searchResults && (
        <Card>
          <CardHeader>
            <CardTitle>Search Results</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="rounded-md border overflow-hidden">
              <div className="overflow-x-auto">
              <table className="w-full table-auto text-sm">
                <thead>
                  <tr className="border-b bg-muted/50">
                    {tableHeaders.map((header, idx) => (
                      <th key={idx} className="px-4 py-3 text-left font-medium whitespace-nowrap">
                        {header}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((result, resultIndex) => (
                    <tr key={resultIndex} className="border-b">
                      {result.map((cell: string, cellIdx: number) => {
                        // Assume the last cell is the drive link (actions) column.
                        if (cellIdx === result.length - 1) return null;
                        return (
                          <td key={cellIdx} className="px-4 py-3">
                            {cell}
                          </td>
                        );
                      })}
                      <td className="px-4 py-3 text-justify">
                        {result[result.length - 1] ? (
                          <Button variant="outline" size="sm" asChild>
                            <Link href={result[result.length - 1]} target="_blank" rel="noopener noreferrer">
                              View Doc
                            </Link>
                          </Button>
                        ) : (
                          <span>No document</span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
