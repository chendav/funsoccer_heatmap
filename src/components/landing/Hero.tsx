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
    <section className="py-20 px-4 relative overflow-hidden" style={{
      backgroundImage: 'url(/bg_Hero.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-6 leading-tight drop-shadow-lg">
            {t.heroTitle}
          </h1>
          <p className="text-xl md:text-2xl text-gray-200 mb-8 max-w-3xl mx-auto leading-relaxed">
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

          <div className="flex flex-col sm:flex-row gap-6 justify-center text-sm text-gray-200">
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-medium text-white">{t.freeToUse}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-medium text-white">{t.noCreditCard}</span>
            </div>
            <div className="flex items-center gap-2 bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 border border-white/30">
              <Check className="h-5 w-5 text-green-400" />
              <span className="font-medium text-white">{t.upgradeAnytime}</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
} 