import Link from "next/link"
import { FileText, FileSpreadsheet, FileCheck, FileCheckIcon as FileCertificate } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

export default function DashboardPage() {
  const documentTypes = [
    {
      title: "Certificate of Insurance",
      description: "Upload and verify certificate documents",
      icon: FileCertificate,
      href: "/dashboard/upload-document/certificate",
    },
    {
      title: "Purchase Order",
      description: "Upload and process invoice documents",
      icon: FileText,
      href: "/dashboard/upload-document/purchase-order",
    },
    {
      title: "Sponsorship",
      description: "Upload and manage contract documents",
      icon: FileSpreadsheet,
      href: "/dashboard/upload-document/contract",
    },
    {
      title: "Charity Letter",
      description: "Upload and analyze report documents",
      icon: FileCheck,
      href: "/dashboard/upload-document/report",
    },
  ]

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Upload Document</h1>
        <p className="text-muted-foreground">Select a document type to upload and process</p>
      </div>

      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {documentTypes.map((doc) => (
          <Link key={doc.href} href={doc.href}>
            <Card className="h-full transition-all hover:shadow-md hover:border-primary/50">
              <CardHeader className="pb-2">
                <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mb-2">
                  <doc.icon className="h-6 w-6 text-primary" />
                </div>
                <CardTitle className="text-xl">{doc.title}</CardTitle>
                <CardDescription>{doc.description}</CardDescription>
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

