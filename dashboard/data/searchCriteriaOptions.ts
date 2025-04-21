// data/searchCriteriaOptions.ts

// 1) Define a richer option type
export interface SearchCriteriaOption {
    value: string;
    label: string;
    dataType: 'string' | 'date' | 'currency' | 'number';
}

// 2) Your doc‑type keys
export type DocType = 'generalCOI' | 'additionallyInsuredCOI'| 'charityLetter'; // keep this in sync

// 3) Export your map with dataType on each entry
export const searchCriteriaOptions: Record<DocType, SearchCriteriaOption[]> = {
    generalCOI: [
        { value: 'business-name', label: 'Business Name', dataType: 'string' },
        { value: 'business-name-2', label: 'Business Name 2', dataType: 'string' },
        { value: 'amount', label: 'Amount', dataType: 'currency' },
        { value: 'issue-date', label: 'Issue Date', dataType: 'date' },
        { value: 'expiry-date', label: 'Expiry Date', dataType: 'date' },
        { value: 'category', label: 'Category', dataType: 'string' },
        { value: 'log-id', label: 'Log ID', dataType: 'number' },

    ],
    additionallyInsuredCOI: [
        { value: 'business-name', label: 'Business Name', dataType: 'string' },
        { value: 'business-name-2', label: 'Business Name 2', dataType: 'string' },
        { value: 'club-name', label: 'Club Name', dataType: 'string' },
        { value: 'amount', label: 'Amount', dataType: 'currency' },
        { value: 'issue-date', label: 'Issue Date', dataType: 'date' },
        { value: 'expiry-date', label: 'Expiry Date', dataType: 'date' },
        { value: 'category', label: 'Category', dataType: 'string' },
    ],
    charityLetter: [
        { value: 'charity-name', label: 'Charity Name', dataType: 'string' },
        { value: 'charity-number', label: 'Charity Number', dataType: 'number' },
        { value: 'club-name', label: 'Club Name', dataType: 'string' },
        { value: 'event-name', label: 'Event Name', dataType: 'string' },
        { value: 'amount', label: 'Amount', dataType: 'currency' },
        { value: 'issue-date', label: 'Issue Date', dataType: 'date' },
        { value: 'log-id', label: 'Log ID', dataType: 'number' },

    ],
};
