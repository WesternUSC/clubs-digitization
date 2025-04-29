import { NextResponse } from "next/server";
import { google } from "googleapis";
import { documentMappings } from "@/data/documentMappings";
import { PDFDocument } from "pdf-lib";
import { format } from "date-fns";

const credentials = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, "base64").toString("utf-8")
);

// convert A → 0, B → 1, etc.
function colToIdx(letter: string): number {
  return letter.toUpperCase().charCodeAt(0) - 65;
}

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const file = form.get("invoiceFile") as File | null;
    const paid = form.get("paid")?.toString();
    const logId = form.get("logId")?.toString();
    const submittedBy = form.get("submittedBy")?.toString();

    if (!file || !paid || !logId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
    }

    const mapping = documentMappings.purchaseOrder;
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });
    await auth.authorize();

    const sheets = google.sheets({ version: "v4", auth });
    const drive = google.drive({ version: "v3", auth });

    // 1) find the PO row by logId
    const logCol = mapping.fields.find(f => f.key === "log-id")!.column;
    const colRes = await sheets.spreadsheets.values.get({
      spreadsheetId: mapping.sheetId,
      range: `Sheet1!${logCol}:${logCol}`,
    });
    const vals: string[][] = colRes.data.values || [];
    let rowNum: number | null = null;
    vals.slice(1).forEach((r, i) => {
      if (r[0]?.toString() === logId) rowNum = i + 2;
    });
    if (!rowNum) {
      return NextResponse.json({ error: "Log ID not found" }, { status: 404 });
    }

    // 2) pull out the Drive link
    const dlCol = mapping.driveLinkColumn;
    const dlRes = await sheets.spreadsheets.values.get({
      spreadsheetId: mapping.sheetId,
      range: `Sheet1!${dlCol}${rowNum}`,
    });
    const driveLink = dlRes.data.values?.[0]?.[0] || "";
    if (!driveLink) {
      return NextResponse.json({ error: "No Drive link found" }, { status: 404 });
    }

    // 3) extract file ID
    let fileId = "";
    if (driveLink.includes("/d/")) {
      const match = driveLink.match(/\/d\/([^/]+)/);
      if (!match) throw new Error("Failed to parse file ID");
      fileId = match[1];
    } else {
      const url = new URL(driveLink);
      fileId = url.searchParams.get("id") || "";
    }
    if (!fileId) {
      return NextResponse.json({ error: "Cannot parse file ID" }, { status: 500 });
    }

    // 4) download original PDF
    const orig = await drive.files.get(
      { fileId, alt: "media" },
      { responseType: "arraybuffer" }
    );
    const origBuf = new Uint8Array(orig.data as ArrayBuffer);

    // 5) read uploaded PDF
    const uploadedBuf = new Uint8Array(await file.arrayBuffer());

    // 6) attempt to load and merge PDFs (no ignoreEncryption)
    let mergedBytes: Uint8Array;
    try {
      const origPdf = await PDFDocument.load(origBuf);
      const invPdf = await PDFDocument.load(uploadedBuf);
      const invPages = await origPdf.copyPages(invPdf, invPdf.getPageIndices());
      invPages.forEach(p => origPdf.addPage(p));
      mergedBytes = await origPdf.save();
    } catch (err: any) {
      if (/encrypted/i.test(err.message)) {
        return NextResponse.json({ error: "Invoice PDF is encrypted. Please upload an unencrypted PDF." }, { status: 400 });
      }
      throw err;
    }

    // 7) upload merged PDF
    await drive.files.update({
      fileId,
      media: { mimeType: "application/pdf", body: Buffer.from(mergedBytes) },
    });

    // 8) update spreadsheet now that upload succeeded
    const invoicedCol = mapping.fields.find(f => f.key === "invoiced")!.column;
    const paidCol = mapping.fields.find(f => f.key === "paid")!.column;
    const invoiceUploadedByCol = mapping.fields.find(f => f.key === "invoice-uploaded-by")!.column;
    const invoiceUploadTimeCol = mapping.fields.find(f => f.key === "invoice-upload-time")!.column;
    const currentTime = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: mapping.sheetId,
      requestBody: {
        valueInputOption: 'RAW',
        data: [
          { range: `Sheet1!${invoicedCol}${rowNum}`,          values: [['Yes']] },
          { range: `Sheet1!${paidCol}${rowNum}`,              values: [[paid]] },
          { range: `Sheet1!${invoiceUploadedByCol}${rowNum}`, values: [[submittedBy]] },
          { range: `Sheet1!${invoiceUploadTimeCol}${rowNum}`, values: [[currentTime]] },
        ],
      },
    });

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${mapping.sheetId}/edit#gid=0&range=A${rowNum}`;
    return NextResponse.json({ googleDrive: driveLink, googleSheets: spreadsheetUrl });
  } catch (e: any) {
    console.error(e);
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
  }
}
