//ONLY IMPORT IN SERVER CODE
//includes environment variables

import type { DocumentMapping } from '@/types/document';

// Mapping for each document type
export const documentMappings: Record<string, DocumentMapping> = {
    generalCOI: {
        sheetId: process.env.COI_GENERAL_SPREADSHEET_ID!,
        fields: [
            { key: 'log-id', column: 'K', dataType: 'string', display: true },
            { key: 'business-name', column: 'A', dataType: 'string' },
            { key: 'business-name-2', column: 'B', dataType: 'string' },
            { key: 'amount', column: 'C', dataType: 'number' },
            { key: 'issue-date', column: 'D', dataType: 'date' },
            { key: 'expiry-date', column: 'E', dataType: 'date' },
            { key: 'category', column: 'H', dataType: 'string' },
            { key: 'notes', column: 'F', dataType: 'string' },
            { key: 'logged-by', column: 'I', dataType: 'string' },
            { key: 'logged-time', column: 'J', dataType: 'date' },
        ],
        driveLinkColumn: 'G',
    },
    additionallyInsuredCOI: {
        sheetId: process.env.COI_AI_SPREADSHEET_ID!,
        fields: [
            { key: 'log-id', column: 'K', dataType: 'string' },
            { key: 'business-name', column: 'A', dataType: 'string' },
            { key: 'business-name-2', column: 'B', dataType: 'string' },
            { key: 'club-name', column: 'C', dataType: 'string' },
            { key: 'amount', column: 'D', dataType: 'number' },
            { key: 'issue-date', column: 'E', dataType: 'date' },
            { key: 'expiry-date', column: 'F', dataType: 'date' },
            { key: 'notes', column: 'G', dataType: 'string' },
            { key: 'logged-by', column: 'I', dataType: 'string' },
            { key: 'logged-time', column: 'J', dataType: 'date' },
        ],
        driveLinkColumn: 'H',
    },
    charityLetter: {
        sheetId: process.env.CHARITY_LETTER_SPREADSHEET_ID!,
        fields: [
            { key: 'log-id', column: 'K', dataType: 'string' },
            { key: 'charity-name', column: 'A', dataType: 'string' },
            { key: 'charity-number', column: 'B', dataType: 'number' },
            { key: 'club-name', column: 'C', dataType: 'string' },
            { key: 'event-name', column: 'D', dataType: 'string' },
            { key: 'amount', column: 'E', dataType: 'number' },
            { key: 'issue-date', column: 'F', dataType: 'date' },
            { key: 'notes', column: 'G', dataType: 'string' },
            { key: 'logged-by', column: 'I', dataType: 'string' },
            { key: 'logged-time', column: 'J', dataType: 'date' },
        ],
        driveLinkColumn: 'H',
    },
    contract: {
        sheetId: process.env.CONTRACT_SPREADSHEET_ID!,
        fields: [
            { key: 'log-id', column: 'J', dataType: 'string' },
            { key: 'contract-party', column: 'A', dataType: 'string' },
            { key: 'club-name', column: 'B', dataType: 'string' },
            { key: 'contract-date', column: 'C', dataType: 'date' },
            { key: 'event-action-date', column: 'D', dataType: 'date' },
            { key: 'amount', column: 'E', dataType: 'number' },
            { key: 'notes', column: 'F', dataType: 'string' },
            { key: 'logged-by', column: 'H', dataType: 'string' },
            { key: 'logged-time', column: 'I', dataType: 'date' },
        ],
        driveLinkColumn: 'G',
    },
    purchaseOrder: {
        sheetId: process.env.PO_SPREADSHEET_ID!,
        fields: [
            { key: 'log-id', column: 'P', dataType: 'string' },
            { key: 'business-name', column: 'A', dataType: 'string' },
            { key: 'club-name', column: 'B', dataType: 'string' },
            { key: 'club-account-number', column: 'C', dataType: 'number' },
            { key: 'po-number', column: 'D', dataType: 'number' },
            { key: 'issue-date', column: 'E', dataType: 'date' },
            { key: 'event-date', column: 'F', dataType: 'date' },
            { key: 'event-name', column: 'G', dataType: 'string' },
            { key: 'amount', column: 'H', dataType: 'number' },
            { key: 'notes', column: 'I', dataType: 'string' },
            { key: 'category', column: 'K', dataType: 'string' },
            { key: 'invoiced', column: 'L', dataType: 'string' },
            { key: 'paid', column: 'M', dataType: 'string' },
            { key: 'logged-by', column: 'N', dataType: 'string' },
            { key: 'logged-time', column: 'O', dataType: 'date' },
            { key: 'invoice-uploaded-by', column: 'Q', dataType: 'string', display: false },
            { key: 'invoice-upload-time', column: 'R', dataType: 'string', display: false },
        ],
        driveLinkColumn: 'J',
    },

    sponsorship: {
        sheetId: process.env.SPONSORSHIP_SPREADSHEET_ID!,
        fields: [
            { key: 'log-id', column: 'K', dataType: 'string' },
            { key: 'sponsor-name', column: 'A', dataType: 'string' },
            { key: 'club-name', column: 'B', dataType: 'string' },
            { key: 'issue-date', column: 'C', dataType: 'date' },
            { key: 'amount', column: 'D', dataType: 'number' },
            { key: 'method-of-payment', column: 'E', dataType: 'string' },
            { key: 'notes', column: 'F', dataType: 'string' },
            { key: 'category', column: 'H', dataType: 'string' },
            { key: 'logged-by', column: 'I', dataType: 'string' },
            { key: 'logged-time', column: 'J', dataType: 'date' },
            { key: 'contract-uploaded-by', column: 'L', dataType: 'string', display: false },
            { key: 'contract-upload-time', column: 'M', dataType: 'string', display: false },
            { key: 'finance-uploaded-by', column: 'N', dataType: 'string', display: false },
            { key: 'finance-upload-time', column: 'O', dataType: 'string', display: false },

        ],
        driveLinkColumn: 'G',
    },


};