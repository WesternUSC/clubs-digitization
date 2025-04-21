//ONLY IMPORT IN SERVER CODE
//includes environment variables

import type { DocumentMapping } from '@/types/document';

// Mapping for each document type
export const documentMappings: Record<string, DocumentMapping> = {
    generalCOI: {
      sheetId: process.env.COI_GENERAL_SPREADSHEET_ID!,
      fields: [
        { key: 'business-name', column: 'A', dataType: 'string' },
        { key: 'business-name-2', column: 'B', dataType: 'string' },
        { key: 'amount', column: 'C', dataType: 'number' },
        { key: 'issue-date', column: 'D', dataType: 'date' },
        { key: 'expiry-date', column: 'E', dataType: 'date' },
        { key: 'category', column: 'H', dataType: 'string' },
        { key: 'notes', column: 'F', dataType: 'string' },
        { key: 'logged-by', column: 'I', dataType: 'string' },
        { key: 'logged-time', column: 'J', dataType: 'date' },
        { key: 'log-id', column: 'K', dataType: 'string' },
      ],
      driveLinkColumn: 'G',
    }, 
    additionallyInsuredCOI: {
      sheetId: process.env.COI_AI_SPREADSHEET_ID!,
      fields: [
        { key: 'business-name', column: 'A', dataType: 'string' },
        { key: 'business-name-2', column: 'B', dataType: 'string' },
        { key: 'amount', column: 'C', dataType: 'number' },
        { key: 'issue-date', column: 'D', dataType: 'date' },
        { key: 'expiry-date', column: 'E', dataType: 'date' },
        { key: 'category', column: 'H', dataType: 'string' },
        { key: 'notes', column: 'F', dataType: 'string' },
        { key: 'logged-by', column: 'I', dataType: 'string' },
        { key: 'logged-time', column: 'J', dataType: 'date' },
        { key: 'log-id', column: 'K', dataType: 'string' },
      ],
      driveLinkColumn: 'G',
    }, 

};