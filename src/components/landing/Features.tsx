"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Activity, MapPin, Smartphone } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface FeaturesProps {
  language: Language
}

export default function Features({ language }: FeaturesProps) {
  const t = translations[language]

  const features = [
    {
      icon: MapPin,
      title: t.smartCoverage,
      description: t.smartCoverageDesc,
    },
    {
      icon: Activity,
      title: t.freeAnalysis,
      description: t.freeAnalysisDesc,
    },
    {
      icon: Smartphone,
      title: t.socialFeatures,
      description: t.socialFeaturesDesc,
    },
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      backgroundImage: 'url(/bg_Features.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/20"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            {t.featuresTitle}
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {t.featuresDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl hover:-translate-y-1 transition-all duration-300 bg-white/95 backdrop-blur-sm border border-white/20">
              <CardHeader className="text-center pb-4">
                <div className="mx-auto mb-4 w-12 h-12 bg-gradient-to-br from-blue-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg">
                  <feature.icon className="h-6 w-6 text-white" />
                </div>
                <CardTitle className="text-xl font-semibold text-gray-900">
                  {feature.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-600 text-base leading-relaxed">
                  {feature.description}
                </CardDescription>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 