"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { translations, type Language } from "@/lib/translations"

interface CTAProps {
  language: Language
}

export default function CTA({ language }: CTAProps) {
  const t = translations[language]
  const [email, setEmail] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [submitStatus, setSubmitStatus] = useState<"idle" | "success" | "error">("idle")
  const [errorMessage, setErrorMessage] = useState("")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!email.trim()) {
      setErrorMessage(t.enterEmail)
      setSubmitStatus("error")
      return
    }

    setIsSubmitting(true)
    setSubmitStatus("idle")
    setErrorMessage("")

    try {
      const response = await fetch(`https://api.funsoccer.app/subscription/subscribe`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email: email.trim() }),
      })

      const data = await response.json()

      if (data.status === "success") {
        setSubmitStatus("success")
        setEmail("")
        setTimeout(() => setSubmitStatus("idle"), 3000)
      } else {
        setSubmitStatus("error")
        setErrorMessage(data.message || t.networkError)
      }
    } catch {
      setSubmitStatus("error")
      setErrorMessage(t.networkError)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <section id="cta-section" className="py-20 px-4 bg-blue-600">
      <div className="max-w-4xl mx-auto text-center">
        <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
          {t.ctaTitle}
        </h2>
        <p className="text-xl text-blue-100 mb-12 max-w-3xl mx-auto">
          {t.ctaDescription}
        </p>
        
        <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 justify-center items-center max-w-md mx-auto">
          <Input 
            type="email" 
            placeholder={t.emailPlaceholder}
            className="flex-1 text-gray-900"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
          />
          <Button 
            type="submit"
            size="lg" 
            className="bg-white text-blue-600 hover:bg-gray-100 disabled:opacity-50"
            disabled={isSubmitting}
          >
            {isSubmitting ? t.submitting : t.startFreeTrial}
          </Button>
        </form>
        
        {/* 状态消息 */}
        {submitStatus === "success" && (
          <p className="text-green-200 text-sm mt-4">
            订阅成功！我们会通过邮件通知您新功能。
          </p>
        )}
        
        {submitStatus === "error" && (
          <p className="text-red-200 text-sm mt-4">
            {errorMessage}
          </p>
        )}
        
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