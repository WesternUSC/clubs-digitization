import { NextResponse } from "next/server"
import { google } from "googleapis"
import credentials from "@/google-service-account.json"
import { documentMappings } from "@/data/documentMappings"

export async function POST(request: Request) {
  try {
    const form = await request.formData()
    const paid = form.get("paid")?.toString()
    const logId = form.get("logId")?.toString()
    if (!paid || !logId) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const mapping = documentMappings.purchaseOrder
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/spreadsheets"]
    })
    await auth.authorize()

    const sheets = google.sheets({ version: "v4", auth })

    // find row by log-id
    const logField = mapping.fields.find(f => f.key === "log-id")!
    const colRes = await sheets.spreadsheets.values.get({
      spreadsheetId: mapping.sheetId,
      range: `Sheet1!${logField.column}:${logField.column}`
    })
    const vals = colRes.data.values || []
    let rowNum: number | null = null
    vals.slice(1).forEach((r, i) => {
      if (r[0]?.toString() === logId) rowNum = i + 2
    })
    if (!rowNum) {
      return NextResponse.json({ error: "Log ID not found" }, { status: 404 })
    }

    // update paid column
    const paidField = mapping.fields.find(f => f.key === "paid")!
    await sheets.spreadsheets.values.update({
      spreadsheetId: mapping.sheetId,
      range: `Sheet1!${paidField.column}${rowNum}`,
      valueInputOption: "RAW",
      requestBody: { values: [[paid]] }
    })
    
    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${mapping.sheetId}/edit#gid=0&range=A${rowNum}`;


    return NextResponse.json({
        googleSheets: spreadsheetUrl,
      });
  } catch (e: any) {
    console.error(e)
    return NextResponse.json({ error: e.message || "Server error" }, { status: 500 })
  }
}
