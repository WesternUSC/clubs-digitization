'use client';
import React, { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Loader2 } from 'lucide-react';

interface DocumentEditorProps {
  documentType: string;
  filterFields?: string[];
  title: string;
  subtitle: string;
}

interface FieldItem {
  header: string;
  value: string;
  type?: string;
}

interface ApiResponse {
  headers: string[];
  results: string[][];
  dataTypes?: string[];
}

export const DocumentEditor: React.FC<DocumentEditorProps> = ({ title, subtitle, documentType, filterFields = [] }) => {
  const [logId, setLogId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [fields, setFields] = useState<FieldItem[]>([]);

  const combinedFilters = useMemo(
    () => [...filterFields.map(f => f.toLowerCase()), 'logged by', 'logged time'],
    [filterFields]
  );

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!logId) return;
    setIsLoading(true);
    try {
      const formData = new FormData();
      formData.append('documentType', documentType);
      formData.append('searchCriteria', 'log-id');
      formData.append('searchQuery', logId);
      formData.append('returnDataType', 'true');

      const res = await fetch('/api/find-doc', { method: 'POST', body: formData });
      const data: ApiResponse = await res.json();
      const rawHeaders = data.headers;
      const rawValues = data.results[0];
      const rawTypes = data.dataTypes || [];

      const filtered = rawHeaders.map((h, i) => ({ header: h, value: rawValues[i], type: rawTypes[i] }))
        .filter(f => !combinedFilters.includes(f.header.toLowerCase()));

      setFields(filtered);
    } catch (err) {
      console.error(err);
      alert('Error loading document.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFieldChange = (idx: number, newValue: string) => {
    setFields(prev => prev.map((f, i) => i === idx ? { ...f, value: newValue } : f));
  };

  const handleUpdate = async () => {
    setIsUpdating(true);
    try {
      const payload = { documentType, fields };
      const res = await fetch('/api/update-doc', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const result = await res.json();
      if (!result.success) {
        throw new Error(result.error || 'Update failed');
      }
      alert('Document updated successfully!');
    } catch (err: any) {
      console.error(err);
      alert(`Error updating document: ${err.message}`);
    } finally {
      setIsUpdating(false);
    }
  };

  const renderField = (f: FieldItem, idx: number) => {
    const id = `field-${idx}`;
    const isLogId = f.header.toLowerCase() === 'log id';
    if (f.header.toLowerCase() === 'view document') {
      return (
        <div key={idx}>
          <Button variant="outline" size="sm" asChild>
            <a href={f.value} target="_blank" rel="noopener noreferrer">View Document</a>
          </Button>
        </div>
      );
    }
    let inputType = 'text';
    if (f.type === 'date') inputType = 'date';
    if (f.type === 'number') inputType = 'number';

    return (
      <div key={idx} className="space-y-2 relative">
        <Label htmlFor={id}>{f.header}</Label>
        {f.type === 'currency' && (
          <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500">$</span>
        )}
        <Input
          id={id}
          type={inputType}
          value={f.value}
          onChange={e => handleFieldChange(idx, e.target.value)}
          disabled={isLogId}
          className={f.type === 'currency' ? 'pl-7' : ''}
        />
      </div>
    );
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
        <p className="text-muted-foreground">{subtitle}</p>
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Find Document</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSearch} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="log-id-input">Enter Log ID</Label>
              <Input
                id="log-id-input"
                type="text"
                value={logId}
                onChange={e => setLogId(e.target.value)}
                required
              />
            </div>
            <Button type="submit" disabled={!logId || isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Search'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {fields.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Document Details</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {fields.map((f, idx) => renderField(f, idx))}
            <Button onClick={handleUpdate} className="w-full" disabled={isUpdating}>
              {isUpdating ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : 'Update'}
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
