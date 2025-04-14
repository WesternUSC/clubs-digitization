// File: /app/api/find-doc/route.ts
import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import credentials from '@/google-service-account.json';

interface Criterion {
  column: string;
  dataType: string;
}

interface DocumentMapping {
  sheetId: string | undefined;
  criteria: {
    [key: string]: Criterion;
  };
}

// Mapping: for each document type, include its spreadsheet ID (via env variables)
// and a sub-mapping for allowed search criteria.
const searchMappings: { [key: string]: DocumentMapping } = {
  certificate: {
    sheetId: process.env.COI_SPREADSHEET_ID,
    criteria: {
      "business-name": { column: "A", dataType: "string" },
      "business-name-2": { column: "B", dataType: "string" },
      "amount": { column: "C", dataType: "number" },
      "issue-date": { column: "D", dataType: "date" },
      "expiry-date": { column: "E", dataType: "date" },
    },
  },
  invoice: {
    sheetId: process.env.INVOICE_SPREADSHEET_ID,
    criteria: {
      "invoice-number": { column: "A", dataType: "string" },
      "vendor": { column: "B", dataType: "string" },
      "amount": { column: "C", dataType: "number" },
      "date": { column: "D", dataType: "date" },
    },
  },
  contract: {
    sheetId: process.env.CONTRACT_SPREADSHEET_ID,
    criteria: {
      "contract-id": { column: "A", dataType: "string" },
      "party-name": { column: "B", dataType: "string" },
      "start-date": { column: "C", dataType: "date" },
      "end-date": { column: "D", dataType: "date" },
    },
  },
  report: {
    sheetId: process.env.REPORT_SPREADSHEET_ID,
    criteria: {
      "report-title": { column: "A", dataType: "string" },
      "author": { column: "B", dataType: "string" },
      "department": { column: "C", dataType: "string" },
      "date": { column: "D", dataType: "date" },
    },
  },
};

export async function POST(request: Request) {
  try {
    // Unpack incoming form data
    const formData = await request.formData();
    const documentType = formData.get("documentType")?.toString();
    const searchCriteria = formData.get("searchCriteria")?.toString();
    const searchQuery = formData.get("searchQuery")?.toString();

    if (!documentType || !searchCriteria || !searchQuery) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Look up the mapping based on document type and allowed criteria.
    const mapping = searchMappings[documentType];
    if (!mapping) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    
    // Use a type assertion to access the criterion.
    const criteriaMapping = mapping.criteria[searchCriteria as keyof typeof mapping.criteria];
    if (!criteriaMapping) {
      return NextResponse.json({ error: "Invalid search criteria" }, { status: 400 });
    }

    const spreadsheetId = mapping.sheetId;
    if (!spreadsheetId) {
      return NextResponse.json({ error: "Spreadsheet ID not found" }, { status: 500 });
    }

    // Authenticate using your Google service account credentials.
    const auth = new google.auth.JWT(
      credentials.client_email,
      undefined,
      credentials.private_key,
      ["https://www.googleapis.com/auth/spreadsheets.readonly"]
    );
    await auth.authorize();

    const sheets = google.sheets({ version: "v4", auth });

    // Retrieve the target column’s data from “Sheet1” (adjust if needed).
    const columnRange = `Sheet1!${criteriaMapping.column}:${criteriaMapping.column}`;
    const columnResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: columnRange,
    });

    const columnValues: string[][] = columnResponse.data.values || [];

    // Assume first row is a header, so data starts at row 2.
    const dataRows = columnValues.slice(1);
    const matchRowNumbers: number[] = [];

    dataRows.forEach((row, index) => {
      const cellValue = row[0];
      // Check for a match (case-insensitive)
      if (cellValue && cellValue.toString().toLowerCase() === searchQuery.toLowerCase()) {
        // Add 2: one for header offset and for zero-based index.
        matchRowNumbers.push(index + 2);
      }
    });

    console.log("Matches found in rows:", matchRowNumbers);

    let fullRows: any[] = [];
    if (matchRowNumbers.length > 0) {
      // Assume full rows span columns A to Z. Adjust if necessary.
      const rowRanges = matchRowNumbers.map((rowNumber) => `Sheet1!A${rowNumber}:Z${rowNumber}`);
      const batchResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: rowRanges,
      });
      fullRows = batchResponse.data.valueRanges?.map((range) => range.values?.[0]) || [];
    }

    console.log("Full row data for matches:", fullRows);

    // Remove the "Notes" column (6th element; index 5) from each row.
    const processedRows = fullRows.map((row) => {
      if (row.length > 5) {
        return [...row.slice(0, 5), ...row.slice(6)];
      }
      return row;
    });
    
    console.log("Processed row data (notes removed):", processedRows);

    // Return the processed rows under "results".
    return NextResponse.json({
      results: processedRows,
    });
  } catch (error) {
    console.error("Error processing search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
