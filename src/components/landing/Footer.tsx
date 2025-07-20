"use client"

import { translations, type Language } from "@/lib/translations"

interface FooterProps {
  language: Language
}

export default function Footer({ language }: FooterProps) {
  const t = translations[language]

  return (
    <footer className="bg-gray-900 text-white py-12 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-4 gap-8">
          <div className="md:col-span-2">
            <h3 className="text-2xl font-bold mb-4">{t.productName}</h3>
            <p className="text-gray-400 mb-6">
              {t.footerDescription}
            </p>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.product}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t.features}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.pricing}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.howToUse}</a></li>
            </ul>
          </div>
          
          <div>
            <h4 className="font-semibold mb-4">{t.footerSupport}</h4>
            <ul className="space-y-2 text-gray-400">
              <li><a href="#" className="hover:text-white transition-colors">{t.support}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.termsOfService}</a></li>
              <li><a href="#" className="hover:text-white transition-colors">{t.privacyPolicy}</a></li>
            </ul>
          </div>
        </div>
        
        <div className="border-t border-gray-800 mt-8 pt-8 text-center text-gray-400">
          <p>{t.copyright}</p>
        </div>
      </div>
    </footer>
  )
} 