"use client"

import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface HeroProps {
  language: Language
}

export default function Hero({ language }: HeroProps) {
  const t = translations[language]

  return (
    <section className="py-20 px-4 bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-100/20 to-indigo-100/20"></div>
      <div className="absolute top-0 left-0 w-72 h-72 bg-blue-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob"></div>
      <div className="absolute top-0 right-0 w-72 h-72 bg-purple-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-2000"></div>
      <div className="absolute -bottom-8 left-20 w-72 h-72 bg-indigo-200 rounded-full mix-blend-multiply filter blur-xl opacity-70 animate-blob animation-delay-4000"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6 leading-tight">
            {t.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto leading-relaxed">
            {t.heroDescription}
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button size="lg" className="text-lg px-8 py-4 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-lg">
              {t.startFree}
            </Button>
            <Button variant="outline" size="lg" className="text-lg px-8 py-4 border-2 hover:bg-gray-50">
              {t.findFields}
            </Button>
          </div>

          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-gray-600">
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium">{t.freeToUse}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium">{t.noCreditCard}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/50 backdrop-blur-sm rounded-full px-4 py-2">
              <Check className="h-5 w-5 text-green-600" />
              <span className="font-medium">{t.upgradeAnytime}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 