// components/FindDocument.tsx
"use client";

import { useState } from 'react';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';         // for currency label
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Loader2, ListFilter } from 'lucide-react';
import { searchCriteriaOptions, type DocType, type SearchCriteriaOption } from '@/data/searchCriteriaOptions';

interface FindDocumentProps {
    documentType: DocType;
    title: string;
    subtitle: string;
}

export default function FindDocument({ documentType, title, subtitle }: FindDocumentProps) {
    const [searchCriteria, setSearchCriteria] = useState<string>('');
    const [searchQuery, setSearchQuery] = useState<string>('');
    const [isSearching, setIsSearching] = useState<boolean>(false);
    const [tableHeaders, setTableHeaders] = useState<string[]>([]);
    const [searchResults, setSearchResults] = useState<string[][]>([]);

    // look up metadata for the selected field
    const selectedOption: SearchCriteriaOption | undefined =
        searchCriteria
            ? searchCriteriaOptions[documentType]
                .find(o => o.value === searchCriteria)
            : undefined;

    // generic placeholder if you still want one
    const placeholder = selectedOption
        ? `Enter ${selectedOption.label.toLowerCase()}`
        : 'Enter search term';

    async function handleSearch() {
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
        } catch (error) {
            console.error(error);
        } finally {
            setIsSearching(false);
        }
    }


    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
                <p className="text-muted-foreground">{subtitle}</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Search Criteria</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {/* 1) Selector of which field to search */}
                        <Select value={searchCriteria} onValueChange={setSearchCriteria}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select search criteria" />
                            </SelectTrigger>
                            <SelectContent>
                                {searchCriteriaOptions[documentType].map(opt => (
                                    <SelectItem key={opt.value} value={opt.value}>
                                        {opt.label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>

                        {/* 2) Based on selected dataType, render the right input */}
                        {selectedOption && (
                            <>
                                {selectedOption.dataType === 'string' && (
                                    <Input
                                        placeholder={placeholder}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                )}

                                {selectedOption.dataType === 'date' && (
                                    <Input
                                        type="date"
                                        placeholder={placeholder}
                                        value={searchQuery}
                                        onChange={e => setSearchQuery(e.target.value)}
                                    />
                                )}

                                {selectedOption.dataType === 'currency' && (
                                    <div className="space-y-2">
                                        <Label htmlFor="searchQuery">{selectedOption.label}</Label>
                                        <div className="relative">
                                            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">
                                                $
                                            </span>
                                            <Input
                                                id="searchQuery"
                                                type="text"
                                                inputMode="decimal"
                                                pattern="^\\d*\\.?\\d*$"
                                                className="pl-7"
                                                placeholder="Enter amount"
                                                value={searchQuery}
                                                onChange={e => {
                                                    if (/^\d*\.?\d*$/.test(e.target.value)) {
                                                        setSearchQuery(e.target.value);
                                                    }
                                                }}
                                            />
                                        </div>
                                    </div>
                                )}

                                {/* 3) Submit button */}
                                <Button
                                    onClick={handleSearch}
                                    disabled={!searchQuery || isSearching}
                                    className="w-full"
                                >
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
                                                <th key={i} className="px-4 py-3 text-left font-medium whitespace-nowrap">
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
                                                                    <Link href={cell} target="_blank" rel="noopener noreferrer">
                                                                        View Doc
                                                                    </Link>
                                                                </Button>
                                                            ) : (
                                                                <span>No document</span>
                                                            )}
                                                        </td>
                                                    ) : (
                                                        <td key={c} className="px-4 py-3">{cell}</td>
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
