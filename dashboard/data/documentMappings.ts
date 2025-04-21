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
        { key: 'club-name', column: 'C', dataType: 'string' },
        { key: 'amount', column: 'D', dataType: 'number' },
        { key: 'issue-date', column: 'E', dataType: 'date' },
        { key: 'expiry-date', column: 'F', dataType: 'date' },
        { key: 'notes', column: 'G', dataType: 'string' },
        { key: 'logged-by', column: 'I', dataType: 'string' },
        { key: 'logged-time', column: 'J', dataType: 'date' },
        { key: 'log-id', column: 'K', dataType: 'string' },
      ],
      driveLinkColumn: 'H',
    }, 
    charityLetter: {
        sheetId: process.env.CHARITY_LETTER_SPREADSHEET_ID!,
        fields: [
          { key: 'charity-name', column: 'A', dataType: 'string' },
          { key: 'charity-number', column: 'B', dataType: 'number' },
          { key: 'club-name', column: 'C', dataType: 'string' },
          { key: 'event-name', column: 'D', dataType: 'string' },
          { key: 'amount', column: 'E', dataType: 'number' },
          { key: 'issue-date', column: 'F', dataType: 'date' },
          { key: 'notes', column: 'G', dataType: 'string' },
          { key: 'logged-by', column: 'I', dataType: 'string' },
          { key: 'logged-time', column: 'J', dataType: 'date' },
          { key: 'log-id', column: 'K', dataType: 'string' },
        ],
        driveLinkColumn: 'H',
      }, 

};