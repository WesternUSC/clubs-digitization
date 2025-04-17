// components/FindDocumentPage.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ListFilter } from 'lucide-react';
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from '@/components/ui/breadcrumb';

// Define search criteria options for certificates.
const searchCriteriaOptions = {
  certificate: [
    { value: 'business-name', label: 'Business Name' },
    { value: 'business-name-2', label: 'Business Name 2' },
    { value: 'amount', label: 'Amount' },
    { value: 'issue-date', label: 'Issue Date' },
    { value: 'expiry-date', label: 'Expiry Date' },
    { value: 'category', label: "Category" },
  ],
};

type DocType = keyof typeof searchCriteriaOptions;

export default function FindDocumentPage() {
  const [documentType] = useState<DocType>('certificate');
  const [searchCriteria, setSearchCriteria] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSearching, setIsSearching] = useState<boolean>(false);
  const [tableHeaders, setTableHeaders] = useState<string[]>([]);
  const [searchResults, setSearchResults] = useState<string[][]>([]);

  // Determine placeholder text safely
  const selectedOption =
    searchCriteria
      ? searchCriteriaOptions[documentType].find(o => o.value === searchCriteria)
      : null;
  const placeholder = selectedOption
    ? `Enter ${selectedOption.label.toLowerCase()}`
    : 'Enter search term';

  const handleSearch = async () => {
    if (!searchCriteria || !searchQuery) return;
    setIsSearching(true);
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('searchCriteria', searchCriteria);
      formData.append('searchQuery', searchQuery);

      const res = await fetch('/api/find-doc', { method: 'POST', body: formData });
      const data = await res.json();
      setTableHeaders(data.headers || []);
      setSearchResults(data.results || []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsSearching(false);
    }
  };

  return (
    <div className="space-y-6">
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
          <div className="space-y-4">
            <Select value={searchCriteria} onValueChange={setSearchCriteria}>
              <SelectTrigger>
                <SelectValue placeholder="Select search criteria" />
              </SelectTrigger>
              <SelectContent>
                {searchCriteriaOptions.certificate.map(opt => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {searchCriteria && (
              <>
                <Input
                  placeholder={placeholder}
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                />
                <Button onClick={handleSearch} disabled={!searchQuery || isSearching} className="w-full">
                  {isSearching ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Searching...
                    </>
                  ) : (
                    <>
                      <ListFilter className="mr-2 h-4 w-4" /> Find Document
                    </>
                  )}
                </Button>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {searchResults.length > 0 && (
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
                    {tableHeaders.map((h, i) => (
                      <th
                        key={i}
                        className="px-4 py-3 text-left font-medium whitespace-nowrap"
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {searchResults.map((row, r) => (
                    <tr key={r} className="border-b">
                      {row.map((cell, c) => (
                        c === 0 ? (
                          <td key={c} className="px-4 py-3 whitespace-nowrap">
                            {cell ? (
                              <Button variant="outline" size="sm" asChild>
                                <Link
                                  href={cell}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                >
                                  View Doc
                                </Link>
                              </Button>
                            ) : (
                              <span>No document</span>
                            )}
                          </td>
                        ) : (
                          <td key={c} className="px-4 py-3">
                            {cell}
                          </td>
                        )
                      ))}
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
