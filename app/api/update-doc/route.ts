import { NextResponse } from 'next/server';
import { google } from 'googleapis';
import { documentMappings } from '@/data/documentMappings';

const credentialsUpdate = JSON.parse(
  Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64!, 'base64').toString('utf-8')
);

interface UpdateField {
  header: string;
  value: string;
}

interface UpdateRequest {
  documentType: string;
  fields: UpdateField[];
}

export async function POST(request: Request) {
  try {
    const { documentType, fields }: UpdateRequest = await request.json();

    if (!documentType || !Array.isArray(fields)) {
      return NextResponse.json({ error: 'Missing documentType or fields' }, { status: 400 });
    }

    const mapping = documentMappings[documentType];
    if (!mapping) {
      return NextResponse.json({ error: 'Invalid documentType' }, { status: 400 });
    }

    const logField = mapping.fields.find(f => f.key === 'log-id');
    if (!logField) {
      return NextResponse.json({ error: 'Mapping missing log-id field' }, { status: 500 });
    }

    const auth = new google.auth.JWT(
      credentialsUpdate.client_email,
      undefined,
      credentialsUpdate.private_key,
      ['https://www.googleapis.com/auth/spreadsheets']
    );
    await auth.authorize();
    const sheets = google.sheets({ version: 'v4', auth });

    // locate row via log-id
    const logRange = `Sheet1!${logField.column}:${logField.column}`;
    const colRes = await sheets.spreadsheets.values.get({ spreadsheetId: mapping.sheetId, range: logRange });
    const colValues: string[][] = colRes.data.values || [];

    const logEntry = fields.find(f => f.header.toLowerCase() === 'log id');
    if (!logEntry) {
      return NextResponse.json({ error: 'Log ID not provided' }, { status: 400 });
    }
    const logIdVal = logEntry.value;

    let targetRow: number | null = null;
    colValues.slice(1).forEach((cell, idx) => {
      if (cell[0] === logIdVal) {
        targetRow = idx + 2;
      }
    });
    if (!targetRow) {
      return NextResponse.json({ error: 'Log ID not found' }, { status: 404 });
    }

    const updates: Array<{ range: string; values: string[][] }> = [];
    for (const { header, value } of fields) {
      const lower = header.toLowerCase();
      if (lower === 'log id' || lower === 'view document') continue;

      // convert header back to mapping key
      const key = header
        .split(' ')
        .map((w: string) => w.toLowerCase())
        .join('-');
      const fieldDef = mapping.fields.find(f => f.key === key);
      if (!fieldDef) continue;

      const range = `Sheet1!${fieldDef.column}${targetRow}`;
      updates.push({ range, values: [[value]] });
    }

    if (updates.length === 0) {
      return NextResponse.json({ error: 'No updatable fields provided' }, { status: 400 });
    }

    await sheets.spreadsheets.values.batchUpdate({
      spreadsheetId: mapping.sheetId,
      requestBody: { valueInputOption: 'USER_ENTERED', data: updates }
    });

    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Update error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}