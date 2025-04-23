// types/document.ts

export interface FieldDef {
    key: string;
    column: string;
    dataType: 'string' | 'number' | 'date';
    display?: boolean;
  }
  
  export interface DocumentMapping {
    sheetId: string;
    fields: FieldDef[];
    driveLinkColumn: string;
  }
  