// app/api/find-doc/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import credentials from '@/google-service-account.json';

interface FieldDef {
  key: string;      // e.g. "business-name"
  column: string;   // e.g. "A"
  dataType: string; // e.g. "string" | "number" | "date"
}

interface DocumentMapping {
  sheetId: string;
  fields: FieldDef[];      // columns to return, in order
  driveLinkColumn: string; // letter of the drive link column
}

// Mapping for each document type
const searchMappings: Record<string, DocumentMapping> = {
  certificate: {
    sheetId: process.env.COI_GENERAL_SPREADSHEET_ID!,
    fields: [
      { key: 'business-name', column: 'A', dataType: 'string' },
      { key: 'business-name-2', column: 'B', dataType: 'string' },
      { key: 'amount', column: 'C', dataType: 'number' },
      { key: 'issue-date', column: 'D', dataType: 'date' },
      { key: 'expiry-date', column: 'E', dataType: 'date' },
      { key: 'category', column: 'H', dataType: 'string' },
      { key: 'notes', column: 'F', dataType: 'string' },
      { key: 'logged-by', column: 'I', dataType: 'string' },
      { key: 'logged-time', column: 'J', dataType: 'date' },
      { key: 'log-id', column: 'K', dataType: 'string' },
    ],
    driveLinkColumn: 'G',
  },
  // add other doc types here...
};

// Helper: convert A -> 0, B -> 1, etc.
function columnLetterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 'A'.charCodeAt(0);
}

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const documentType = formData.get('documentType')?.toString();
    const searchCriteria = formData.get('searchCriteria')?.toString();
    const searchQuery = formData.get('searchQuery')?.toString();

    if (!documentType || !searchCriteria || !searchQuery) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    const mapping = searchMappings[documentType];
    if (!mapping) {
      return NextResponse.json({ error: 'Invalid document type' }, { status: 400 });
    }
    
    // locate which FieldDef corresponds to the selected criteria
    const criteriaField = mapping.fields.find(f => f.key === searchCriteria);
    if (!criteriaField) {
      return NextResponse.json({ error: 'Invalid search criteria' }, { status: 400 });
    }

    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ['https://www.googleapis.com/auth/spreadsheets.readonly']
    );
    await auth.authorize();

    const sheets = google.sheets({ version: 'v4', auth });

    // 1) Find matching rows by search column
    const range = `Sheet1!${criteriaField.column}:${criteriaField.column}`;
    const colRes = await sheets.spreadsheets.values.get({ spreadsheetId: mapping.sheetId, range });
    const colValues: string[][] = colRes.data.values || [];
    const rowNums: number[] = [];
    colValues.slice(1).forEach((r, i) => {
      if (r[0]?.toString().toLowerCase() === searchQuery.toLowerCase()) {
        rowNums.push(i + 2);
      }
    });

    // 2) Fetch full rows if matches found
    let fullRows: any[] = [];
    if (rowNums.length) {
      const ranges = rowNums.map(r => `Sheet1!A${r}:Z${r}`);
      const batch = await sheets.spreadsheets.values.batchGet({ spreadsheetId: mapping.sheetId, ranges });
      fullRows = batch.data.valueRanges?.map(v => v.values?.[0] ?? []) || [];
    }

    // 3) Build headers: humanize each key, then "View Document"
    const headers = mapping.fields.map(f =>
      f.key.split('-').map(w => w[0].toUpperCase()+w.slice(1)).join(' ')
    );
    headers.unshift('View Document'); // always first

    // 4) Process rows: extract each field in order, then link, but output link first
    const results = fullRows.map(row => {
      const cells = mapping.fields.map(f => row[columnLetterToIndex(f.column)] || '');
      const driveLink = row[columnLetterToIndex(mapping.driveLinkColumn)] || '';
      return [driveLink, ...cells];
    });

    return NextResponse.json({ headers, results });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
