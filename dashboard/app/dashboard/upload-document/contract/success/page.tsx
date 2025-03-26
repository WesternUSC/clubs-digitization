import Link from "next/link"
import { CheckCircle } from "lucide-react"
import { Button } from "@/components/ui/button"

export default function SuccessPage() {
  return (
    <div className="flex h-[80vh] items-center justify-center">
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <CheckCircle className="h-24 w-24 text-primary" />
        </div>
        <h1 className="text-3xl font-bold tracking-tight">Document Uploaded Successfully!</h1>
        <p className="text-muted-foreground text-lg">Your Contract has been successfully uploaded and processed.</p>
        <Button asChild size="lg">
          <Link href="/dashboard">Back to Upload Document</Link>
        </Button>
      </div>
    </div>
  )
}

