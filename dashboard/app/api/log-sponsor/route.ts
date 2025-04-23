import { google } from "googleapis";
import { NextResponse } from "next/server";
import credentials from "@/google-service-account.json";
import { Readable } from "stream";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { format } from "date-fns";
import { PDFDocument } from 'pdf-lib';  // at top of file
import { documentMappings } from "@/data/documentMappings";



export async function POST(request: NextResponse) {
    try {
        console.log("Received request to create event.");


        //Extracting information from the form
        const formData = await request.formData();

        const sponsorName = formData.get("sponsorName");
        const clubName = formData.get("clubName");
        const issueDate = formData.get("issueDate") as string;
        const amount = formData.get("amount");
        const methodOfPayment = formData.get("methodOfPayment");
        const notes = formData.get("notes");
        const file: File | null = formData.get("file") as unknown as File;
        const logToSheets = formData.get("logToSheets") === "true";
        const uploadToDrive = formData.get("uploadToDrive") === "true";
        const documentCategory = formData.get("documentCategory");
        const submittedBy = formData.get("submittedBy")
        const rawContract = formData.get("contractFile");
        const contractFile = rawContract instanceof File && rawContract.size > 0
          ? rawContract
          : undefined;
        
        const rawFinance = formData.get("financeFile");
        const financeFile = rawFinance instanceof File && rawFinance.size > 0
          ? rawFinance
          : undefined;
        const mapping = documentMappings.sponsorship;


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
        const yearFromIssueDate = new Date(issueDate).getFullYear().toString();

        if (uploadToDrive) {




            // 1) Load primary PDF
            const primaryBytes = await file.arrayBuffer();
            const primaryDoc = await PDFDocument.load(primaryBytes);

            // 2) Create a new PDF and copy primary pages
            const mergedDoc = await PDFDocument.create();
            const primaryPages = await mergedDoc.copyPages(
                primaryDoc,
                primaryDoc.getPageIndices()
            );
            primaryPages.forEach((p) => mergedDoc.addPage(p));

            // 3) If a contract PDF was provided, append its pages
            if (contractFile) {
                const contractBytes = await contractFile.arrayBuffer();
                const contractDoc = await PDFDocument.load(contractBytes);
                const contractPages = await mergedDoc.copyPages(
                    contractDoc,
                    contractDoc.getPageIndices()
                );
                contractPages.forEach((p) => mergedDoc.addPage(p));
            }

            // 4) If a finance PDF was provided, append its pages
            if (financeFile) {
                const financeBytes = await financeFile.arrayBuffer();
                const financeDoc = await PDFDocument.load(financeBytes);
                const financePages = await mergedDoc.copyPages(
                    financeDoc,
                    financeDoc.getPageIndices()
                );
                financePages.forEach((p) => mergedDoc.addPage(p));
            }

            // 5) Serialize to a single Buffer
            const mergedBytes = await mergedDoc.save();
            const mergedBuffer = Buffer.from(mergedBytes);

            // 6) Push into Readable as before
            const readable = new Readable();
            readable.push(mergedBuffer);
            readable.push(null);



            const driveFolderID = process.env.SPONSORSHIP_DRIVE_FOLDER_ID as string

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
            const fileName = `SPO_${sponsorName}_${issueDate}_${logId}`;

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

            const spreadsheetId = process.env.SPONSORSHIP_SPREADSHEET_ID;
            const range = "Sheet1!A2:B";
            const getResponse = await sheets.spreadsheets.values.get({ spreadsheetId, range });
            const rows = getResponse.data.values || [];
            const nextRow = rows.length + 2;
            const values = [[sponsorName, clubName, issueDate, amount, methodOfPayment, notes, driveFileUrl, documentCategory, submittedBy, currentTime, logId]];

            await sheets.spreadsheets.values.append({
                spreadsheetId,
                range: `Sheet1!A${nextRow}:B${nextRow}`,
                valueInputOption: "RAW",
                requestBody: { values },
            });

            if (contractFile) {

                const contractUploadedByCol = mapping.fields.find(f => f.key === "contract-uploaded-by")!.column;
                const contractUploadTime = mapping.fields.find(f => f.key === "contract-upload-time")!.column;

                await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: spreadsheetId,
                    requestBody: {
                        valueInputOption: 'RAW',
                        data: [
                            {
                                range: `Sheet1!${contractUploadedByCol}${nextRow}`,
                                values: [[submittedBy]],
                            },
                            {
                                range: `Sheet1!${contractUploadTime}${nextRow}`,
                                values: [[currentTime]],
                            },
                        ],
                    },
                });

            }

            if (financeFile) {

                const financeUploadedByCol = mapping.fields.find(f => f.key === "finance-uploaded-by")!.column;
                const financeUploadTime = mapping.fields.find(f => f.key === "finance-upload-time")!.column;

                await sheets.spreadsheets.values.batchUpdate({
                    spreadsheetId: spreadsheetId,
                    requestBody: {
                        valueInputOption: 'RAW',
                        data: [
                            {
                                range: `Sheet1!${financeUploadedByCol}${nextRow}`,
                                values: [[submittedBy]],
                            },
                            {
                                range: `Sheet1!${financeUploadTime}${nextRow}`,
                                values: [[currentTime]],
                            },
                        ],
                    },
                });

            }

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