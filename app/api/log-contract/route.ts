import { google } from "googleapis";
import { NextResponse } from "next/server";
import { Readable } from "stream";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { format } from "date-fns";

let credentials: Record<string, any>;

if (process.env.GOOGLE_CREDENTIALS_BASE64) {
  credentials = JSON.parse(
    Buffer.from(process.env.GOOGLE_CREDENTIALS_BASE64, "base64").toString("utf-8")
  );
} else {
  credentials = require("@/google-service-account.json");
}

export async function POST(request: NextResponse) {
  try {
    console.log("Received request to create event.");


    //Extracting information from the form
    const formData = await request.formData();

    const contractParty = formData.get("contractParty");
    const clubName = formData.get("clubName");
    const contractDate = formData.get("contractDate") as string;
    const eventActionDate = formData.get("eventActionDate") as string;
    const amount = formData.get("amount");
    const notes = formData.get("notes");
    const file: File | null = formData.get("file") as unknown as File;
    const logToSheets = formData.get("logToSheets") === "true";
    const uploadToDrive = formData.get("uploadToDrive") === "true";
    const submittedBy = formData.get("submittedBy")

    const currentTime = format(new Date(), 'MMMM dd, yyyy HH:mm:ss');

    //Generates random id for data entry
    const logId = Date.now().toString();


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
    const yearFromIssueDate = new Date(contractDate).getFullYear().toString();

    if (uploadToDrive) {

      // Google Drive Integration
      //converting the file to a buffer: 
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const readable = new Readable();
      readable.push(buffer);
      readable.push(null);

      const driveFolderID = process.env.CONTRACT_DRIVE_FOLDER_ID as string

      // Function to check if a folder with the current year exists
      async function getOrCreateYearFolder() {
        // List folders in the parent folder
        const res = await drive.files.list({
          q: `'${driveFolderID}' in parents and mimeType = 'application/vnd.google-apps.folder'`,
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
            parents: [driveFolderID as string], // Parent folder is the root folder
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
      const fileName = `CON_${contractParty}_${contractDate}_${logId}`;

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

      const spreadsheetId = process.env.CONTRACT_SPREADSHEET_ID;
      const range = "Sheet1!A2:B";
      const getResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
      const rows = getResponse.data.values || [];
      const nextRow = rows.length + 2;
      const values = [[contractParty, clubName, contractDate, eventActionDate, amount, notes, driveFileUrl, submittedBy, currentTime, logId]];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range: `Sheet1!A${nextRow}:B${nextRow}`,
        valueInputOption: "RAW",
        requestBody: { values },
      });

      console.log("Data logged successfully in Google Sheets.");

      spreadsheetUrl = `https://docs.google.com/spreadsheets/d/${spreadsheetId}/edit?gid=0#gid=0&range=A${nextRow}`;

    }



    return NextResponse.json({
      googleDrive: driveFileUrl,
      googleSheets: spreadsheetUrl,
    });


  } catch (error) {
    console.error("Error handling request:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}