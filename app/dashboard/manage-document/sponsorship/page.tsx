import Link from "next/link"
import { FileText, FileSpreadsheet, FileCheck, Edit, FilePlus2, DollarSign, Search, Upload, FileCheckIcon as FileCertificate } from "lucide-react"
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


  const documentTypes = [
    // New card for Finding a COI:
    {
      title: "Find Sponsorship",
      description: "Search for an existing certificate of insurance",
      icon: Search, // imported from lucide-react
      href: "/dashboard/manage-document/sponsorship/find",
      bgColor: "bg-blue-100",
      iconColor: "text-blue-600",
    },
    {
      title: "Upload Sponsorship",
      description: "Upload and verify certificate documents",
      icon: Upload,
      href: "/dashboard/manage-document/sponsorship/upload",
      bgColor: "bg-green-100",  // background color for upload card
      iconColor: "text-green-600", // icon color for upload card
    },
    {
      title: "Attach Contract to Sponorship",
      description: "Upload and verify certificate documents",
      icon: FilePlus2,
      href: "/dashboard/manage-document/sponsorship/attach-contract",
      bgColor: "bg-orange-100",  // background color for upload card
      iconColor: "text-orange-600", // icon color for upload card
    },
    {
      title: "Attach Finance Doc to Sponorship",
      description: "Upload and verify certificate documents",
      icon: FilePlus2,
      href: "/dashboard/manage-document/sponsorship/attach-finance",
      bgColor: "bg-orange-100",  // background color for upload card
      iconColor: "text-orange-600", // icon color for upload card
    },

    // New card for Editing a COI:
    // {
    //     title: "Edit COI",
    //     description: "Modify an existing certificate of insurance",
    //     icon: Edit, // imported from lucide-react
    //     href: "/dashboard/manage-document",
    //     bgColor: "bg-amber-100",
    //     iconColor: "text-amber-600",
    // },
  ]



  return (
    <div className="space-y-6">

      {/* Breadcrumb Navigation */}
      <Breadcrumb className="mb-6">
        <BreadcrumbList>
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <Link href="/dashboard">Manage Documents</Link>
            </BreadcrumbLink>
          </BreadcrumbItem>
          <BreadcrumbSeparator />
          <BreadcrumbItem>
            <BreadcrumbLink asChild>
              <BreadcrumbPage>Sponsorship</BreadcrumbPage>
            </BreadcrumbLink>
          </BreadcrumbItem>
        </BreadcrumbList>
      </Breadcrumb>


      <div>
        <h1 className="text-3xl font-bold tracking-tight">Sponsorship</h1>
        <p className="text-muted-foreground">Select a document type to upload and process</p>
      </div>
      <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {documentTypes.map((doc) => (
          <Link key={doc.href} href={doc.href}>
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



