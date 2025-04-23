"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CheckCircle, FileText, Calendar, Table, Mail } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

// This interface defines the structure for external links
interface ExternalLinks {
  googleDrive?: string;
  googleCalendar?: string;
  googleSheets?: string;
  scheduledEmail?: string;
}

export default function SuccessPage() {
  const router = useRouter();
  const [externalLinks, setExternalLinks] = useState<ExternalLinks | null>(null);
  const didCheck = useRef(false);

  useEffect(() => {
    // Ensure this check only runs once
    if (didCheck.current) return;
    didCheck.current = true;

    const fromUpload = sessionStorage.getItem("fromUpload");
    const links = sessionStorage.getItem("externalLinks");

    // If the user didn't come from the upload (or the data isn't there) redirect away
    if (!fromUpload || !links) {
      router.replace("/dashboard");
      return;
    }

    // Parse and set the external links state
    const parsedLinks: ExternalLinks = JSON.parse(links);
    setExternalLinks(parsedLinks);

    // Remove the flag once you've read it (optional: you might keep the links if you want persistence on refresh)
    sessionStorage.removeItem("fromUpload");
  }, [router]);

  // If the data isn't loaded, show a simple loading message.
  if (!externalLinks) return <div>Loading...</div>;

  return (
    <div className="flex flex-col min-h-[80vh] items-center justify-center py-12">
      <div className="text-center space-y-6 max-w-3xl">
        <div className="flex justify-center">
          <CheckCircle className="h-24 w-24 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Document Uploaded Successfully!</h1>
        <p className="text-muted-foreground text-lg">
          Your document has been successfully uploaded and processed.
        </p>

        {/* External Links Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-8">
          {externalLinks.googleDrive && (
            <Link
              href={externalLinks.googleDrive}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all hover:scale-105"
            >
              <Card className="hover:shadow-md hover:border-primary/50 transition-all h-full">
                <CardContent className="p-4 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <FileText className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">View File in Google Drive</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {externalLinks.googleCalendar && (
            <Link
              href={externalLinks.googleCalendar}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all hover:scale-105"
            >
              <Card className="hover:shadow-md hover:border-primary/50 transition-all h-full">
                <CardContent className="p-4 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Calendar className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">View Reminder in Google Calendar</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {externalLinks.googleSheets && (
            <Link
              href={externalLinks.googleSheets}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all hover:scale-105"
            >
              <Card className="hover:shadow-md hover:border-primary/50 transition-all h-full">
                <CardContent className="p-4 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Table className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">View Log in Google Sheets</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}

          {externalLinks.scheduledEmail && (
            <Link
              href={externalLinks.scheduledEmail}
              target="_blank"
              rel="noopener noreferrer"
              className="block transition-all hover:scale-105"
            >
              <Card className="hover:shadow-md hover:border-primary/50 transition-all h-full">
                <CardContent className="p-4 flex items-center">
                  <div className="flex items-center space-x-3">
                    <div className="bg-primary/10 p-2 rounded-full">
                      <Mail className="h-5 w-5 text-primary" />
                    </div>
                    <span className="font-medium">View Scheduled Email</span>
                  </div>
                </CardContent>
              </Card>
            </Link>
          )}
        </div>

        <Button asChild size="lg">
          <Link href="/dashboard">Back to Upload Document</Link>
        </Button>
      </div>
    </div>
  );
}
