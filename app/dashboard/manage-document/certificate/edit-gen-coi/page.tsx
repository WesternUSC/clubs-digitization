import { DocumentEditor } from '@/components/DocumentEditor';
import Link from 'next/link';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
  } from '@/components/ui/breadcrumb';

export default function SponsorshipPage() {
  return (
    <div className="space-y-6">
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
          <Link href="/dashboard/manage-document/certificate">Certificate of Insurance</Link>
        </BreadcrumbLink>
      </BreadcrumbItem>
      <BreadcrumbSeparator />
      <BreadcrumbItem>
        <BreadcrumbPage>Edit General COI</BreadcrumbPage>
      </BreadcrumbItem>
    </BreadcrumbList>
  </Breadcrumb>

    <DocumentEditor
      documentType="generalCOI"
      title="Edit General COI"
      subtitle="Lorem ipsum dolor sit amet"
    //   filterFields={['Category',]}
    />
    </div>
  );
}
