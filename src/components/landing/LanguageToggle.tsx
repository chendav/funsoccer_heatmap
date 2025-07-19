"use client"

import { Button } from "@/components/ui/button"
import { Globe } from "lucide-react"

interface LanguageToggleProps {
  language: "zh" | "en"
  onToggle: () => void
}

export default function LanguageToggle({ language, onToggle }: LanguageToggleProps) {
  return (
    <Button 
      variant="ghost" 
      size="sm" 
      className="flex items-center gap-2 hover:bg-gray-100 transition-colors" 
      onClick={onToggle}
    >
      <Globe className="h-4 w-4" />
      <span className="font-medium">{language === "zh" ? "EN" : "中文"}</span>
    </Button>
  )
} 