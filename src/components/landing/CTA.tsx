"use client"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { translations, type Language } from "@/lib/translations"

interface CTAProps {
  language: Language
}

export default function CTA({ language }: CTAProps) {
  const t = translations[language]

  return (
    <section className="py-20 px-4 bg-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {t.ctaTitle}
        </h2>
        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
          {t.ctaDescription}
        </p>
        
        <div className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder={t.emailPlaceholder}
            className="flex-1 text-gray-900"
          />
          <Button size="lg" className="bg-white text-blue-600 hover:bg-gray-100">
            {t.startFreeTrial}
          </Button>
        </div>
        
        <p className="text-blue-200 text-sm mt-4">
          {t.freeTrialNote}
        </p>
        
        <p className="text-blue-200 text-xs mt-8">
          {t.termsConditions}
        </p>
      </div>
    </section>
  )
} 