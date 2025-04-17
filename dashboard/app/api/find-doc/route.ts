import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import credentials from '@/google-service-account.json';

interface Criterion {
  column: string;
  dataType: string;
  provide: boolean; // Whether to include this column in the response
}

interface DocumentMapping {
  sheetId: string | undefined;
  criteria: {
    [key: string]: Criterion;
  };
  criteriaOrder: string[]; // Order in which the columns appear in the row
  driveLinkColumn: string; // Specify the column letter that contains the drive link
}

// Mapping for each document type, including the driveLinkColumn.
// For certificates, suppose the drive link is in column G.
const searchMappings: { [key: string]: DocumentMapping } = {
  certificate: {
    sheetId: process.env.COI_GENERAL_SPREADSHEET_ID,
    criteria: {
      "business-name": { column: "A", dataType: "string", provide: true },
      "business-name-2": { column: "B", dataType: "string", provide: true },
      "amount": { column: "C", dataType: "number", provide: true },
      "issue-date": { column: "D", dataType: "date", provide: true },
      "expiry-date": { column: "E", dataType: "date", provide: true },
      "category": { column: "H", dataType: "string", provide: true },
      "notes": { column: "F", dataType: "string", provide: true },
      "logged-by":{ column: "I", dataType: "string", provide: true },
      "logged-time":{ column: "J", dataType: "date", provide: true },
    },
    criteriaOrder: ["business-name", "business-name-2", "amount", "issue-date", "expiry-date", "category", "notes", "logged-by", "logged-time"],
    driveLinkColumn: "G", // For certificates, assume the drive link is in column G.
  },
  // You can add other document mappings here with their own driveLinkColumn.
};

// Helper: Converts a column letter (like "A", "G", etc.) to a zero-based index.
function columnLetterToIndex(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - "A".charCodeAt(0);
}

export async function POST(request: Request) {
  try {
    // Unpack incoming form data.
    const formData = await request.formData();
    const documentType = formData.get("documentType")?.toString();
    const searchCriteria = formData.get("searchCriteria")?.toString();
    const searchQuery = formData.get("searchQuery")?.toString();

    if (!documentType || !searchCriteria || !searchQuery) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    // Look up the mapping based on document type.
    const mapping = searchMappings[documentType];
    if (!mapping) {
      return NextResponse.json({ error: "Invalid document type" }, { status: 400 });
    }
    
    // Access the specific criterion.
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

    // Retrieve data for the column that is being searched.
    const columnRange = `Sheet1!${criteriaMapping.column}:${criteriaMapping.column}`;
    const columnResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range: columnRange,
    });
    const columnValues: string[][] = columnResponse.data.values || [];

    // Assume first row is a header; data starts at row 2.
    const dataRows = columnValues.slice(1);
    const matchRowNumbers: number[] = [];
    dataRows.forEach((row, index) => {
      const cellValue = row[0];
      if (cellValue && cellValue.toString().toLowerCase() === searchQuery.toLowerCase()) {
        matchRowNumbers.push(index + 2);
      }
    });

    console.log("Matches found in rows:", matchRowNumbers);

    let fullRows: any[] = [];
    if (matchRowNumbers.length > 0) {
      // Fetch a wide range. Adjust the range as needed.
      const rowRanges = matchRowNumbers.map(
        (rowNumber) => `Sheet1!A${rowNumber}:Z${rowNumber}`
      );
      const batchResponse = await sheets.spreadsheets.values.batchGet({
        spreadsheetId,
        ranges: rowRanges,
      });
      fullRows = batchResponse.data.valueRanges?.map((range) => range.values?.[0]) || [];
    }

    console.log("Full row data for matches:", fullRows);

    // Build dynamic headers based on mapping.
    const dynamicHeaders = mapping.criteriaOrder.reduce((acc: string[], key) => {
      if (mapping.criteria[key]?.provide) {
        // Transform the key into a title: e.g., "business-name" => "Business Name".
        const header = key
          .split("-")
          .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
          .join(" ");
        acc.push(header);
      }
      return acc;
    }, []);
    // Append a header for the drive link (or "Actions").
    dynamicHeaders.push("Actions");

    // Process each row.
    const processedRows = fullRows.map((row) => {
      const newRow: any[] = [];
      // For each key in criteriaOrder that has provide: true, extract the corresponding cell.
      mapping.criteriaOrder.forEach((key) => {
        if (mapping.criteria[key]?.provide) {
          const cellIndex = columnLetterToIndex(mapping.criteria[key].column);
          newRow.push(row[cellIndex] || "");
        }
      });
      // Extract the drive link from the specified driveLinkColumn.
      const driveIdx = columnLetterToIndex(mapping.driveLinkColumn);
      const driveLinkValue = row[driveIdx] || "";
      // Append the drive link value.
      newRow.push(driveLinkValue);
      return newRow;
    });

    console.log("Processed row data (filtered by mapping):", processedRows);

    return NextResponse.json({
      results: processedRows,
      headers: dynamicHeaders,
    });
  } catch (error) {
    console.error("Error processing search:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
