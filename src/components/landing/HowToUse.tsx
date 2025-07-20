"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { MapPin, Smartphone, Activity, BarChart3 } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface HowToUseProps {
  language: Language
}

export default function HowToUse({ language }: HowToUseProps) {
  const t = translations[language]

  const steps = [
    {
      icon: MapPin,
      title: t.step1Title,
      description: t.step1Desc,
    },
    {
      icon: Smartphone,
      title: t.step2Title,
      description: t.step2Desc,
    },
    {
      icon: Activity,
      title: t.step3Title,
      description: t.step3Desc,
    },
    {
      icon: BarChart3,
      title: t.step4Title,
      description: t.step4Desc,
    },
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      backgroundImage: 'url(/bg_How to Use.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            {t.howToUseTitle}
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {t.howToUseDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {steps.map((step, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/95 backdrop-blur-sm border border-white/20 group">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg group-hover:scale-110 transition-transform duration-300">
                  <step.icon className="h-6 w-6 text-white" />
                </div>
                <div className="flex items-center justify-center mb-2">
                  <div className="w-8 h-8 bg-gradient-to-br from-blue-600 to-blue-700 text-white rounded-full flex items-center justify-center text-sm font-bold shadow-md">
                    {index + 1}
                  </div>
                </div>
                <CardTitle className="text-lg font-semibold text-gray-900">
                  {step.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-sm leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 