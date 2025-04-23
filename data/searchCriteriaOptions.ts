// data/searchCriteriaOptions.ts

// 1) Define a richer option type
export interface SearchCriteriaOption {
    value: string;
    label: string;
    dataType: 'string' | 'date' | 'currency' | 'number';
}

// 2) Your doc‑type keys
export type DocType = 'generalCOI' | 'additionallyInsuredCOI'| 'charityLetter' | 'contract' | 'purchaseOrder' | 'sponsorship'; // keep this in sync

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
    contract: [
        { value: 'contract-party', label: 'Contract Party', dataType: 'string' },
        { value: 'club-name', label: 'Club Name', dataType: 'string' },
        { value: 'contract-date', label: 'Contract Date', dataType: 'date' },
        { value: 'event-action-date', label: 'Event/Action Date', dataType: 'date' },
        { value: 'amount', label: 'Amount', dataType: 'currency' },
        { value: 'log-id', label: 'Log ID', dataType: 'number' },

    ],
    purchaseOrder: [
        { value: 'category', label: 'Category', dataType: 'string' },
        { value: 'business-name', label: 'Business Name', dataType: 'string' },
        { value: 'club-name', label: 'Club Name', dataType: 'string' },
        { value: 'club-account-number', label: 'Club Account Number', dataType: 'number' },
        { value: 'po-number', label: 'PO Number', dataType: 'number' },
        { value: 'issue-date', label: 'Issue Date', dataType: 'date' },
        { value: 'event-date', label: 'Event Date', dataType: 'date' },
        { value: 'amount', label: 'Amount', dataType: 'currency' },
        { value: 'invoiced', label: 'Invoiced?', dataType: 'string' },
        { value: 'paid', label: 'Paid?', dataType: 'string' },
        { value: 'log-id', label: 'Log ID', dataType: 'number' },

    ],
    sponsorship: [
        { value: 'sponsor-name', label: 'Sponsor Name', dataType: 'string' },
        { value: 'club-name', label: 'Club Name', dataType: 'string' },
        { value: 'issue-date', label: 'Issue Date', dataType: 'date' },
        { value: 'amount', label: 'Amount', dataType: 'currency' },
        { value: 'method-of-payment', label: 'Method of Payment', dataType: 'string' },
        { value: 'category', label: 'Category', dataType: 'string' },
        { value: 'log-id', label: 'Log ID', dataType: 'number' },

    ],
};
