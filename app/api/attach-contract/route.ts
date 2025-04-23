import { NextResponse } from "next/server";
import { google } from "googleapis";
import credentials from "@/google-service-account.json";
import { documentMappings } from "@/data/documentMappings";
import { PDFDocument } from "pdf-lib";
import { format } from "date-fns";

// convert A → 0, B → 1, etc.
function colToIdx(letter: string) {
    return letter.toUpperCase().charCodeAt(0) - 65;
}

export async function POST(request: Request) {
    try {
        const form = await request.formData();
        const file = form.get("contractFile") as File;
        const logId = form.get("logId")?.toString();
        const submittedBy = form.get("submittedBy")


        if (!file || !logId) {
            return NextResponse.json({ error: "Missing parameters" }, { status: 400 });
        }

        const mapping = documentMappings.sponsorship;
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

        // 1) find the PO row by logId (column P)
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

        // 2) pull out the Drive link (column J)
        const dlCol = mapping.driveLinkColumn;
        const dlRes = await sheets.spreadsheets.values.get({
            spreadsheetId: mapping.sheetId,
            range: `Sheet1!${dlCol}${rowNum}`,
        });
        const driveLink = dlRes.data.values?.[0]?.[0] || "";
        if (!driveLink) {
            return NextResponse.json({ error: "No Drive link found" }, { status: 404 });
        }

        // 3) update “Invoiced” (L) → "Yes" and “Paid” (M) → paid
        const contractUploadedByCol = mapping.fields.find(f => f.key === "contract-uploaded-by")!.column;
        const contractUploadTimeCol = mapping.fields.find(f => f.key === "contract-upload-time")!.column;

        const currentTime = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');

        await sheets.spreadsheets.values.batchUpdate({
            spreadsheetId: mapping.sheetId,
            requestBody: {
                valueInputOption: 'RAW',
                data: [
                    {
                        range: `Sheet1!${contractUploadedByCol}${rowNum}`,
                        values: [[submittedBy]],
                    },
                    {
                        range: `Sheet1!${contractUploadTimeCol}${rowNum}`,
                        values: [[currentTime]],
                    },
                ],
            },
        });


        // 4) extract file ID from the Drive link
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

        // 5) download original PDF
        const orig = await drive.files.get(
            { fileId, alt: "media" },
            { responseType: "arraybuffer" }
        );
        const origBuf = Buffer.from(orig.data as ArrayBuffer);

        // 6) load & merge with uploaded invoice
        const uploadedBuf = Buffer.from(await file.arrayBuffer());
        const origPdf = await PDFDocument.load(origBuf);
        const invPdf = await PDFDocument.load(uploadedBuf);
        const invPages = await origPdf.copyPages(invPdf, invPdf.getPageIndices());
        invPages.forEach(p => origPdf.addPage(p));
        const merged = await origPdf.save();

        // 7) re-upload merged PDF (same fileId)
        await drive.files.update({
            fileId,
            media: {
                mimeType: "application/pdf",
                body: Buffer.from(merged),
            },
        });

        const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${mapping.sheetId}/edit#gid=0&range=A${rowNum}`;


        return NextResponse.json({
            googleDrive: driveLink,
            googleSheets: spreadsheetUrl,
          });
    } catch (e: any) {
        console.error(e);
        return NextResponse.json({ error: e.message || "Server error" }, { status: 500 });
    }
}
