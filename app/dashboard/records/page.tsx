import Link from "next/link"
import { FileText, FileSpreadsheet, Sheet, FolderOpen, FileCheck, Edit, Search, Upload, FileCheckIcon as FileCertificate } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb"

export default function CertifcateDashboardPage() {

    const genCoiSheetId = process.env.COI_GENERAL_SPREADSHEET_ID
    const aiCoiSheetId = process.env.COI_AI_SPREADSHEET_ID
    const poSheetId = process.env.PO_SPREADSHEET_ID
    const sponsorSheetId = process.env.SPONSORSHIP_SPREADSHEET_ID
    const clSheetId = process.env.CHARITY_LETTER_SPREADSHEET_ID
    const contractSheetId = process.env.CONTRACT_SPREADSHEET_ID
    const autoEmailSheetId = process.env.AUTO_EMAIL_SPREADSHEET_ID
    const mainFolderId = process.env.MAIN_DRIVE_FOLDER_ID


    const documentTypes = [
        // New card for Finding a COI:
        {
            title: "All Uploads",
            description: "Search for an existing certificate of insurance",
            icon: FolderOpen, // imported from lucide-react
            href: `https://drive.google.com/drive/folders/${mainFolderId}`,
            bgColor: "bg-amber-100",
            iconColor: "text-amber-600",
        },
        {
            title: "General COI Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${genCoiSheetId}`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Additionally Insured COI Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${aiCoiSheetId}`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Purchase Order Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${poSheetId}/edit`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Sponsorship Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${sponsorSheetId}/edit`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Charity Letter Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${clSheetId}/edit`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Contract Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${contractSheetId}/edit`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },
        {
            title: "Auto Send Email Log",
            description: "Search for an existing certificate of insurance",
            icon: Sheet, // imported from lucide-react
            href: `https://docs.google.com/spreadsheets/d/${autoEmailSheetId}/edit`,
            bgColor: "bg-green-100",
            iconColor: "text-green-600",
        },

    ]

    return (
        <div className="space-y-6">

            {/* Breadcrumb Navigation */}
            <Breadcrumb className="mb-6">
                <BreadcrumbList>
                    <BreadcrumbItem>
                        <BreadcrumbLink asChild>
                            <BreadcrumbPage>Records & Logs</BreadcrumbPage>
                        </BreadcrumbLink>
                    </BreadcrumbItem>
                </BreadcrumbList>
            </Breadcrumb>


            <div>
                <h1 className="text-3xl font-bold tracking-tight">Records & Logs</h1>
                <p className="text-muted-foreground">Select a document type to upload and process</p>
            </div>

            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                {documentTypes.map((doc) => (
                    <Link key={doc.href} href={doc.href} target="_blank" rel="noopener noreferrer">
                        <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
                            <CardHeader className="pb-2">
                                <div className={`w-12 h-12 rounded-full ${doc.bgColor} flex items-center justify-center mb-2`}>
                                    <doc.icon className={`h-6 w-6 ${doc.iconColor}`} />
                                </div>
                                <CardTitle className="text-xl">{doc.title}</CardTitle>
                                {/* <CardDescription>{doc.description}</CardDescription> */}
                            </CardHeader>
                            <CardContent>
                                <p className="text-sm text-muted-foreground">
                                    Click to upload and process {doc.title.toLowerCase()} documents
                                </p>
                            </CardContent>
                        </Card>
                    </Link>
                ))}
            </div>
        </div>
    )
}



