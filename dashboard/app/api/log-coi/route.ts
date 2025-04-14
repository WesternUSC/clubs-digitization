import { google } from "googleapis";
import { NextResponse } from "next/server";
import credentials from "@/google-service-account.json";
import { Readable } from "stream";
import { writeFile, mkdir } from "fs/promises";
import path from "path";


export async function POST(request: NextResponse) {
  try {
    console.log("Received request to create event.");


    //Extracting information from the form
    const formData = await request.formData();

    const businessName = formData.get("businessName");
    const businessName2 = formData.get("businessName2");
    const amount = formData.get("amount");
    const issueDate = formData.get("issueDate");
    const expiryDate = formData.get("expiryDate");
    const notes = formData.get("notes");
    const file: File | null = formData.get("file") as unknown as File;
    const calendarReminder = formData.get("calendarReminder") === "true";
    const logToSheets = formData.get("logToSheets") === "true";
    const uploadToDrive = formData.get("uploadToDrive") === "true";
    const sendEmail = formData.get("sendEmail") === "true";

    let vendorEmail = null;
    let copyEmails = null;
    let emailSubject = null;
    let emailBody = null;
    let sendDate = null;
    let reminderDate = null;


    if (sendEmail) {
      vendorEmail = formData.get("vendorEmail");
      copyEmails = formData.get("copyEmails");
      emailSubject = formData.get("vendorEmail");
      emailBody = formData.get("emailBody");
      sendDate = formData.get("sendDate");
    }

    if (calendarReminder){
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
        "https://www.googleapis.com/auth/drive.file",
      ],
    });

    const drive = google.drive({ version: "v3", auth });


    if (uploadToDrive) {

      // Get the current year
      const currentYear = new Date().getFullYear().toString();

      // Google Drive Integration
      //converting the file to a buffer: 
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);

      const driveFolderID = process.env.COI_DRIVE_FOLDER_ID as string

      // Function to check if a folder with the current year exists
      async function getOrCreateYearFolder() {
        // List folders in the parent folder
        const res = await drive.files.list({
          q: `'${driveFolderID}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
          fields: 'files(id, name)',
        });

        // Look for a folder with the current year
        const existingFolder = res.data.files?.find((folder) => folder.name === currentYear);

        if (existingFolder) {
          // If the folder exists, return its ID
          return existingFolder.id;
        } else {
          // If the folder doesn't exist, create a new one
          const folderMetadata = {
            name: currentYear,
            mimeType: 'application/vnd.google-apps.folder',
            parents: [driveFolderID], // Parent folder is the root folder
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
      const fileName = `COI_${businessName}_${issueDate}`;

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

      const spreadsheetId = process.env.COI_SPREADSHEET_ID;
      const range = "Sheet1!A2:B";
      const getResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = getResponse.data.values || [];
      const nextRow = rows.length + 2;
      const values = [[businessName, businessName2, amount, issueDate, expiryDate, notes, driveFileUrl]];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `Sheet1!A${nextRow}:B${nextRow}`,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      console.log("Data logged successfully in Google Sheets.");

      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=0#gid=0&range=A${nextRow}`;

    }



    if (calendarReminder) {

      // Google Calendar Integration
      const calendar = google.calendar({ version: "v3", auth });
      const calendarId = process.env.CLUBS_CALENDAR_ID;
      const event = {
        summary: `COI Expiring: ${businessName as string}`,
        start: { date: reminderDate as string },
        end: { date: reminderDate as string },
        description: `Notes: ${notes}\n\nFile: ${driveFileUrl}\n\nView Full Details: ${spreadsheetUrl}`,
      };

      await calendar.events.insert({
        calendarId,
        requestBody: event,
      });

      console.log("Event created successfully in Calendar.");
    }


    if (sendEmail) {

      const spreadsheetId = process.env.AUTO_EMAIL_SPREADSHEET_ID

      const range = "Sheet1!A2:B";
      const getResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = getResponse.data.values || [];
      const nextRow = rows.length + 2;
      const values = [[sendDate, vendorEmail, copyEmails, emailSubject, emailBody]];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `Sheet1!A${nextRow}:B${nextRow}`,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      console.log("Data logged successfully in Google Sheets.");
    }


    return NextResponse.json({
      message: "Event created, file uploaded, and logged successfully!",
      fileUrl: driveFileUrl,
    });


  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}