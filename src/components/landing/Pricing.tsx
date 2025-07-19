"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface PricingProps {
  language: Language
}

export default function Pricing({ language }: PricingProps) {
  const t = translations[language]

  const plans = [
    {
      name: t.freeVersion,
      description: t.freeVersionDesc,
      price: "¥0",
      features: [
        t.basicData,
        t.speedStats,
        t.simpleHeatmap,
        t.socialShare,
      ],
      buttonText: t.useNow,
      popular: false,
    },
    {
      name: t.proVersion,
      description: t.proVersionDesc,
      price: "¥10",
      features: [
        t.allFreeFeatures,
        t.detailedAnalysis,
        t.historyComparison,
        t.progressReport,
        t.prioritySupport,
      ],
      buttonText: t.subscribe,
      popular: true,
    },
    {
      name: t.teamVersion,
      description: t.teamVersionDesc,
      price: "¥299",
      features: [
        t.allProFeatures,
        t.teamAnalysis,
        t.tacticalAnalysis,
        t.customReports,
        t.dedicatedSupport,
      ],
      buttonText: t.contactUs,
      popular: false,
    },
  ]

  return (
    <section className="py-20 px-4 bg-gray-50">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-gray-900 mb-6">
            {t.pricingTitle}
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            {t.pricingDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {plans.map((plan, index) => (
            <Card 
              key={index} 
              className={`border-0 shadow-lg hover:shadow-xl transition-shadow relative ${
                plan.popular ? 'ring-2 ring-blue-500' : ''
              }`}
            >
              {plan.popular && (
                <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white">
                  {t.mostPopular}
                </Badge>
              )}
              <CardHeader className="text-center pb-4">
                <CardTitle className="text-2xl font-bold text-gray-900">
                  {plan.name}
                </CardTitle>
                <CardDescription className="text-gray-600">
                  {plan.description}
                </CardDescription>
                <div className="mt-4">
                  <span className="text-4xl font-bold text-gray-900">{plan.price}</span>
                  {plan.price !== "¥0" && (
                    <span className="text-gray-600">/月</span>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                <ul className="space-y-3 mb-8">
                  {plan.features.map((feature, featureIndex) => (
                    <li key={featureIndex} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-green-600 flex-shrink-0" />
                      <span className="text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>
                <Button 
                  className={`w-full ${
                    plan.popular 
                      ? 'bg-blue-600 hover:bg-blue-700' 
                      : 'bg-gray-900 hover:bg-gray-800'
                  }`}
                >
                  {plan.buttonText}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 