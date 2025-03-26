"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { DatePicker } from "@/components/ui/date-picker"
import { Loader2 } from "lucide-react"

interface DocumentFormProps {
  documentType: string
  fields: {
    id: string
    label: string
    type: "text" | "number" | "date" | "radio" | "file"
    options?: string[]
    required?: boolean
  }[]
}

export function DocumentForm({ documentType, fields }: DocumentFormProps) {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [file, setFile] = useState<File | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 2000))

    router.push(`/dashboard/upload-document/${documentType.toLowerCase()}/success`)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="document-upload">Upload {documentType}</Label>
          <Input id="document-upload" type="file" onChange={(e) => setFile(e.target.files?.[0] || null)} required />
          {file && <p className="text-sm text-muted-foreground">Selected file: {file.name}</p>}
        </div>

        {fields.map((field) => (
          <div key={field.id} className="space-y-2">
            <Label htmlFor={field.id}>{field.label}</Label>

            {field.type === "text" && <Input id={field.id} type="text" required={field.required} />}

            {field.type === "number" && <Input id={field.id} type="number" required={field.required} />}

            {field.type === "date" && <DatePicker />}

            {field.type === "radio" && field.options && (
              <RadioGroup defaultValue={field.options[0]}>
                {field.options.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={`${field.id}-${option}`} />
                    <Label htmlFor={`${field.id}-${option}`}>{option}</Label>
                  </div>
                ))}
              </RadioGroup>
            )}
          </div>
        ))}
      </div>

      <Button type="submit" className="w-full" disabled={isSubmitting}>
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          "Submit Document"
        )}
      </Button>
    </form>
  )
}

