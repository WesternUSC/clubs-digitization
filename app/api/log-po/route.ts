import { google } from "googleapis";
import { NextResponse } from "next/server";
import credentials from "@/google-service-account.json";
import { Readable } from "stream";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { format } from "date-fns";
import { PDFDocument } from 'pdf-lib';  // at top of file


export async function POST(request: NextResponse) {
  try {
    console.log("Received request to create event.");


    //Extracting information from the form
    const formData = await request.formData();

    const businessName = formData.get("businessName");
    const clubName = formData.get("clubName");
    const clubAccountNumber = formData.get("clubAccountNumber")
    const poNumber = formData.get("poNumber")
    const eventName = formData.get("eventName")
    const issueDate = formData.get("issueDate") as string;
    const eventDate = formData.get("eventDate") as string;
    const amount = formData.get("amount");
    const notes = formData.get("notes");
    const file: File | null = formData.get("file") as unknown as File;
    const calendarReminder = formData.get("calendarReminder") === "true";
    const logToSheets = formData.get("logToSheets") === "true";
    const uploadToDrive = formData.get("uploadToDrive") === "true";
    const documentCategory = formData.get("documentCategory");
    const submittedBy = formData.get("submittedBy")
    const invoiced = formData.get("invoiced");
    const paid = formData.get("paid")
    const invoiceFile: File | null = formData.get("invoiceFile") as unknown as File;


    const currentTime = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');

    //Generates random id for data entry
    const logId = Date.now().toString();


    let reminderDate = null;


    if (calendarReminder) {
      reminderDate = formData.get("reminderDate");
    }


    let driveFileUrl = "";
    let spreadsheetUrl = "";


    // Authenticate with Google API
    const auth = new google.auth.JWT({
      email: credentials.client_email,
      key: credentials.private_key,
      scopes: [
        "https://www.googleapis.com/auth/calendar",
        "https://www.googleapis.com/auth/spreadsheets",
        "https://www.googleapis.com/auth/drive",
      ],
    });

    const drive = google.drive({ version: "v3", auth });

    // For the year, extract it from the issueDate instead of the current date.
    const yearFromIssueDate = new Date(issueDate).getFullYear().toString();

    if (uploadToDrive) {

      // Merge only if invoiced === "yes" and we actually have an invoiceFile
      let mergedBuffer: Buffer;
      if (invoiced === "Yes" && invoiceFile) {
        const poBytes = await file.arrayBuffer();
        const invBytes = await invoiceFile.arrayBuffer();
        const poDoc = await PDFDocument.load(poBytes);
        const invDoc = await PDFDocument.load(invBytes);
        const newPdf = await PDFDocument.create();

        // copy PO pages first
        (await newPdf.copyPages(poDoc, poDoc.getPageIndices()))
          .forEach((p) => newPdf.addPage(p));
        // then invoice pages
        (await newPdf.copyPages(invDoc, invDoc.getPageIndices()))
          .forEach((p) => newPdf.addPage(p));

        const mergedBytes = await newPdf.save();
        mergedBuffer = Buffer.from(mergedBytes);
      } else {
        // fallback: just upload the PO PDF
        const arrayBuffer = await file.arrayBuffer();
        mergedBuffer = Buffer.from(arrayBuffer);
      }


      const readable = new Readable();
      readable.push(mergedBuffer);
      readable.push(null);    

      const driveFolderID = process.env.PO_DRIVE_FOLDER_ID as string

      // STEP 1: Find the document category folder (which is assumed to always exist)
      async function getDocumentCategoryFolder() {


        const res = await drive.files.list({
          q: `'${driveFolderID}' in parents and mimeType = 'application/vnd.google-apps.folder' and name = '${documentCategory}'`,
          fields: 'files(id, name)',
        });

        const categoryFolder = res.data.files?.[0];
        if (!categoryFolder) {
          console.error(`Document category folder (${documentCategory}) not found.`);
          return null;
        }
        return categoryFolder.id;
      }

      const categoryFolderID = await getDocumentCategoryFolder();
      if (!categoryFolderID) {
        console.error('Could not retrieve the document category folder.');
        return;
      }


      // Function to check if a folder with the current year exists
      async function getOrCreateYearFolder() {
        // List folders in the parent folder
        const res = await drive.files.list({
          q: `'${categoryFolderID}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
          fields: 'files(id, name)',
        });

        // Look for a folder with the current year
        const existingFolder = res.data.files?.find((folder) => folder.name === yearFromIssueDate);

        if (existingFolder) {
          // If the folder exists, return its ID
          return existingFolder.id;
        } else {
          // If the folder doesn't exist, create a new one
          const folderMetadata = {
            name: yearFromIssueDate,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [categoryFolderID as string], // Parent folder is the root folder
          };
          const folderRes = await drive.files.create({
            requestBody: folderMetadata,
          });

          return folderRes.data.id;
        }
      }

      // Get or create the folder for the current year
      const yearFolderID = await getOrCreateYearFolder();

      if (!yearFolderID) {
        console.error('Year folder creation or retrieval failed');
        return;
      }


      // Generate the new file name
      const fileName = `PO_${businessName}_${issueDate}_${logId}`;

      // Ensure that the folder ID and file name are correct and valid
      if (!fileName || !yearFolderID) {
        console.error('Invalid file name or folder ID');
        return;
      }

      try {
        // Upload the file to the year-specific folder
        const driveResponse = await drive.files.create({
          requestBody: {
            name: fileName, // New file name format
            parents: [yearFolderID], // Use the folder ID for the current year
          },
          media: {
            mimeType: file.type,
            body: readable,
          },
        });

        console.log("File uploaded to Google Drive with ID:", driveResponse.data.id);

        // Create the file URL
        driveFileUrl = `https://drive.google.com/file/d/${driveResponse.data.id}/view`;

        // Log or store the file URL if needed
        console.log("Drive file URL:", driveFileUrl);
      } catch (error) {
        console.error('Error uploading the file to Google Drive:', error);
      }



    }


    const sheets = google.sheets({ version: "v4", auth });
    const range = "Sheet1!A2:B";

    if (logToSheets) {

      // Google Sheets Integration

      const spreadsheetId = process.env.PO_SPREADSHEET_ID;
      const range = "Sheet1!A2:B";
      const getResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = getResponse.data.values || [];
      const nextRow = rows.length + 2;
      let values: unknown[][];
      
      if(invoiced === "Yes"){
        values = [[businessName, clubName, clubAccountNumber, poNumber, issueDate, eventDate, eventName, amount, notes, driveFileUrl, documentCategory, invoiced, paid, submittedBy, currentTime, logId, submittedBy, currentTime]];
      } else {
        values = [[businessName, clubName, clubAccountNumber, poNumber, issueDate, eventDate, eventName, amount, notes, driveFileUrl, documentCategory, invoiced, paid, submittedBy, currentTime, logId]];
      }

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `Sheet1!A${nextRow}:B${nextRow}`,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      console.log("Data logged successfully in Google Sheets.");

      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=0#gid=0&range=A${nextRow}`;

    }


    let reminderUrl = null;

    if (calendarReminder) {

      // Google Calendar Integration
      const calendar = google.calendar({ version: "v3", auth });
      const calendarId = process.env.CLUBS_CALENDAR_ID;
      const event = {
        summary: `Event Date: ${businessName as string}`,
        start: { date: reminderDate as string },
        end: { date: reminderDate as string },
        description: `Notes: ${notes}\n\nFile: ${driveFileUrl}\n\nView Full Details: ${spreadsheetUrl}\n\nLog ID: ${logId}`,
      };

      const response = await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      reminderUrl = response.data.htmlLink; // This is the URL to the calendar event


      console.log("Event created successfully in Calendar.");
      console.log("Calendar event link:", reminderUrl);
    }



    return NextResponse.json({
      googleDrive: driveFileUrl,
      googleCalendar: reminderUrl,
      googleSheets: spreadsheetUrl,
    });


  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}