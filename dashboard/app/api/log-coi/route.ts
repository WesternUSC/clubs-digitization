import { google } from "googleapis";
import { NextResponse } from "next/server";  // Use NextResponse instead of NextApiRequest, NextApiResponse
import credentials from "@/google-service-account.json"; // Path to your service account JSON

export async function POST(req: Request) {
  try {
    console.log("Received request to create event.");

    const { businessName, businessName2, amount, issueDate, expiryDate, notes } = await req.json();
    console.log("Parsed body:", { businessName, expiryDate, notes });

    // Authenticate with Google API using the service account
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: ["https://www.googleapis.com/auth/calendar", "https://www.googleapis.com/auth/spreadsheets"],
    });

    console.log("Google auth initialized.");

    const calendar = google.calendar({ version: "v3", auth });
    const sheets = google.sheets({ version: "v4", auth });

    // Define the Google Sheets spreadsheet ID
    const spreadsheetId = "1qJcSr8UXIM-v0cD5N_TAd6WqsrbLrlG4lO_A3ddiRFk"; // Your provided spreadsheet ID


    // Check for the next empty row (starting from row 2 to skip header)
    const range = "Sheet1!A2:B";  // Adjust the sheet and range as needed
    const getResponse = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    // Get the number of existing rows (to avoid overwriting)
    const rows = getResponse.data.values || [];
    const nextRow = rows.length + 2;  // Add 2 to account for the header row and 1-based index

    // Prepare the data to log (company name and expiry date)
    const values = [[businessName, businessName2, amount, issueDate, expiryDate, notes]];

    // Write to the sheet using 'requestBody' instead of 'resource'
    const requestBody = {
      values,
    };

    console.log(`Appending data to row ${nextRow} in Google Sheets.`);
    await sheets.spreadsheets.values.append({
      spreadsheetId,
      range: `Sheet1!A${nextRow}:B${nextRow}`,  // Define the range to insert data
      valueInputOption: "RAW",  // Insert as raw data
      requestBody,  // Use requestBody here instead of 'resource'
    });

    console.log("Data logged successfully in Google Sheets.");

    const spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=0#gid=0&range=A${nextRow}`


    // Define the Google Calendar event
    const event = {
      summary: businessName,
      start: { date: expiryDate }, // All-day event
      end: { date: expiryDate },   // Same day
      description: `Notes: ${notes}\n\nView Full Details: ${spreadsheetUrl}`,
    };

    // Replace with your actual calendar ID
    const calendarId = "c_139d8a65f27083351fec6a5c9d7bbf14dcff778de349e0fbab22c142f42e6258@group.calendar.google.com";

    // Create the Google Calendar event
    console.log("Inserting event into calendar.");
    await calendar.events.insert({
      calendarId,
      requestBody: event,
    });

    console.log("Event created successfully in Calendar.");



    return NextResponse.json({ message: "Event created and logged successfully!" });
  } catch (error) {
    console.error("Error creating event and logging to Google Sheets:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
