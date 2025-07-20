"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Star } from "lucide-react"
import { translations, type Language } from "@/lib/translations"

interface TestimonialsProps {
  language: Language
}

export default function Testimonials({ language }: TestimonialsProps) {
  const t = translations[language]

  const testimonials = [
    {
      content: t.testimonial1,
      user: t.user1,
      title: t.user1Title,
    },
    {
      content: t.testimonial2,
      user: t.user2,
      title: t.user2Title,
    },
    {
      content: t.testimonial3,
      user: t.user3,
      title: t.user3Title,
    },
  ]

  return (
    <section className="py-20 px-4 relative overflow-hidden" style={{
      backgroundImage: 'url(/bg_Testimonials.png)',
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundRepeat: 'no-repeat'
    }}>
      {/* Background overlay for better readability */}
      <div className="absolute inset-0 bg-black/30"></div>
      <div className="max-w-6xl mx-auto relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6 drop-shadow-lg">
            {t.testimonialsTitle}
          </h2>
          <p className="text-xl text-gray-200 max-w-3xl mx-auto">
            {t.testimonialsDescription}
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {testimonials.map((testimonial, index) => (
            <Card key={index} className="border-0 shadow-lg hover:shadow-xl transition-shadow bg-white/95 backdrop-blur-sm border border-white/20">
              <CardContent className="p-6">
                <div className="flex mb-4">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 text-yellow-400 fill-current" />
                  ))}
                </div>
                <p className="text-gray-700 mb-6 leading-relaxed">
                  &ldquo;{testimonial.content}&rdquo;
                </p>
                <div className="border-t pt-4">
                  <p className="font-semibold text-gray-900">{testimonial.user}</p>
                  <p className="text-sm text-gray-600">{testimonial.title}</p>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
} 