"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import { Inter } from "next/font/google"

const inter = Inter({ subsets: ["latin"] })

// Google Apps Script Web App URL
const WEB_APP_URL = 'https://script.google.com/macros/s/AKfycbySdPwMX0EpbQOIgUwrFLlGkvm-YuYrU0f7QFacOLgRZhoGgfFZfozLQ_evWDkzkjXNWw/exec'

export default function WaitlistPage() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
  })
  const [errors, setErrors] = useState({
    name: "",
    email: "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState("")
  const [messageType, setMessageType] = useState<"success" | "error" | "">("")
  const [currentYear, setCurrentYear] = useState("")

  useEffect(() => {
    setCurrentYear(new Date().getFullYear().toString())
  }, [])

  const validateField = (name: string, value: string) => {
    let error = ""

    if (name === "name" && !value.trim()) {
      error = "This field is required."
    } else if (name === "email") {
      if (!value.trim()) {
        error = "This field is required."
      } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) {
        error = "Please enter a valid email address."
      }
    }

    setErrors((prev) => ({ ...prev, [name]: error }))
    return !error
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))

    // Clear errors when user types
    if (errors[name as keyof typeof errors]) {
      setErrors((prev) => ({ ...prev, [name]: "" }))
    }
  }

  const handleInputBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    validateField(name, value)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // Clear previous messages
    setMessage("")
    setMessageType("")

    // Validate all fields
    const isNameValid = validateField("name", formData.name)
    const isEmailValid = validateField("email", formData.email)

    if (!isNameValid || !isEmailValid) {
      setMessage("Please correct the errors in the form.")
      setMessageType("error")
      return
    }

    setIsLoading(true)

    try {
      const formDataToSend = new FormData()
      formDataToSend.append('name', formData.name)
      formDataToSend.append('email', formData.email)

      const response = await fetch(WEB_APP_URL, {
        method: 'POST',
        body: formDataToSend
      })

      const result = await response.json()

      if (result.status === 'success') {
        setMessage("✅ Success! You've joined the future of banking. We're thrilled to have you on our exclusive waitlist. Keep an eye on your inbox – we'll send you updates as we get closer to launch!")
        setMessageType("success")
        setFormData({ name: "", email: "" })
      } else {
        setMessage(result.message || "An unknown error occurred.")
        setMessageType("error")
      }
    } catch (error) {
      console.error('Fetch error:', error)
      setMessage("A network error occurred. Please try again.")
      setMessageType("error")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className={`min-h-screen ${inter.className}`}>
      {/* Header */}
      <header className="bg-slate-700 py-6 shadow-lg">
        <div className="container mx-auto px-8 flex justify-center items-center">
          <div className="bg-white p-4 rounded-lg shadow-lg">
            <Image src="/assets/logo-white.png" alt="TruBank Logo" width={190} height={31} className="h-12 w-auto" />
          </div>
        </div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-slate-900/95 to-slate-700/95 text-white py-32 min-h-[85vh] flex items-center justify-center overflow-hidden">
          {/* Background Pattern */}
          <div className="absolute inset-0 bg-[url('data:image/svg+xml,%3Csvg width=&quot;60&quot; height=&quot;60&quot; viewBox=&quot;0 0 60 60&quot; xmlns=&quot;http://www.w3.org/2000/svg&quot;%3E%3Cg fill=&quot;none&quot; fillRule=&quot;evenodd&quot;%3E%3Cg fill=&quot;%23EC9006&quot; fillOpacity=&quot;0.05&quot;%3E%3Ccircle cx=&quot;30&quot; cy=&quot;30&quot; r=&quot;2&quot;/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')] opacity-30"></div>

          <div className="container mx-auto px-8 relative z-10">
            <div className="flex flex-col lg:flex-row items-center gap-24 max-w-7xl mx-auto">
              {/* Hero Text */}
              <div className="flex-1 max-w-3xl text-center lg:text-left">
                <h1 className="text-5xl lg:text-6xl font-bold mb-8 leading-tight text-orange-400 animate-fade-in-up">
                  Experience the Future of CoreBanking
                </h1>
                <p className="text-xl lg:text-2xl mb-12 max-w-3xl opacity-90 animate-fade-in-up animation-delay-200">
                  Join our exclusive waitlist to be among the first to access our innovative banking solution. Secure,
                  smart, and designed for your financial growth.
                </p>
                <ul className="grid grid-cols-1 md:grid-cols-2 gap-6 text-lg animate-fade-in-up animation-delay-400">
                  {["Seamless Transactions", "Advanced Security", "Personalized Insights", "24/7 Support"].map(
                    (feature, index) => (
                      <li key={index} className="flex items-center gap-4">
                        <span className="text-orange-400 text-2xl">✔</span>
                        <span>{feature}</span>
                      </li>
                    ),
                  )}
                </ul>
              </div>

              {/* Hero Image */}
              <div className="flex-1 relative max-w-2xl">
                <div className="relative">
                  <Image
                    src="/hero-placeholder.png"
                    alt="Modern Banking Application Interface"
                    width={600}
                    height={400}
                    className="w-full rounded-xl shadow-2xl animate-zoom-in animation-delay-600"
                  />

                  {/* Floating Elements */}
                  <div className="absolute -top-4 -left-4 w-32 h-32 bg-orange-400/20 rounded-full blur-2xl animate-float"></div>
                  <div className="absolute -bottom-6 -right-6 w-48 h-48 bg-orange-400/15 rounded-full blur-3xl animate-float-reverse"></div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Waitlist Section */}
        <section className="py-32 bg-white">
          <div className="container mx-auto px-8">
            <div className="text-center mb-16">
              <h2 className="text-5xl font-bold text-orange-500 mb-6 animate-fade-in-up">Get Early Access</h2>
              <p className="text-xl text-gray-600 max-w-4xl mx-auto animate-fade-in-up animation-delay-200">
                Sign up now and we&apos;ll notify you as soon as we launch. Don&apos;t miss out on smarter banking.
              </p>
            </div>

            <form
              id="waitlistForm"
              onSubmit={handleSubmit}
              className="max-w-2xl mx-auto bg-gray-50 p-20 rounded-xl shadow-xl animate-fade-in-up animation-delay-400"
            >
              {/* Name Field */}
              <div className="relative mb-14">
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder=" "
                  required
                  className={`w-full px-6 py-7 text-lg border-2 rounded-lg bg-transparent transition-all duration-300 relative z-20 ${
                    errors.name ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                  } focus:outline-none focus:shadow-lg focus:shadow-orange-500/25`}
                />
                <label
                  htmlFor="name"
                  className={`absolute left-6 px-2 text-lg text-gray-500 pointer-events-none transition-all duration-300 bg-gray-50 z-10 ${
                    formData.name ? "-top-3 text-sm text-orange-500" : "top-7"
                  }`}
                >
                  Your Name
                </label>
                <small className="error-message block text-red-500 text-sm mt-2 pl-2">{errors.name}</small>
              </div>

              {/* Email Field */}
              <div className="relative mb-14">
                <input
                  type="email"
                  id="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  onBlur={handleInputBlur}
                  placeholder=" "
                  required
                  className={`w-full px-6 py-7 text-lg border-2 rounded-lg bg-transparent transition-all duration-300 relative z-20 ${
                    errors.email ? "border-red-500" : "border-gray-300 focus:border-orange-500"
                  } focus:outline-none focus:shadow-lg focus:shadow-orange-500/25`}
                />
                <label
                  htmlFor="email"
                  className={`absolute left-6 px-2 text-lg text-gray-500 pointer-events-none transition-all duration-300 bg-gray-50 z-10 ${
                    formData.email ? "-top-3 text-sm text-orange-500" : "top-7"
                  }`}
                >
                  Your Email
                </label>
                <small className="error-message block text-red-500 text-sm mt-2 pl-2">{errors.email}</small>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="submit-btn w-full py-7 px-12 bg-orange-500 text-white text-xl font-semibold rounded-lg transition-all duration-300 flex items-center justify-center gap-6 shadow-lg hover:bg-orange-600 hover:-translate-y-1 hover:shadow-xl disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <div className="spinner w-6 h-6 border-4 border-white/30 border-t-white rounded-full animate-spin"></div>
                    <span className="button-text opacity-0 w-0 overflow-hidden transition-all duration-300">Submitting...</span>
                  </>
                ) : (
                  <span className="button-text">Join Waitlist</span>
                )}
              </button>

              {/* Message */}
              {message && (
                <div
                  id="formMessage"
                  className={`mt-12 p-7 rounded-lg text-lg text-center transition-all duration-400 ${
                    messageType === "success"
                      ? "bg-green-50 text-green-700 border border-green-200 show success"
                      : "bg-red-50 text-red-700 border border-red-200 show error"
                  }`}
                >
                  {message}
                </div>
              )}
            </form>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="bg-slate-700 text-white py-12 text-center">
        <div className="container mx-auto px-8">
          <p className="text-lg mb-6">&copy; <span id="current-year">{currentYear}</span> Trubank. All rights reserved.</p>
          <div className="flex justify-center gap-12">
            <a href="#" className="text-white hover:text-orange-400 transition-colors duration-300">
              Privacy Policy
            </a>
            <a href="#" className="text-white hover:text-orange-400 transition-colors duration-300">
              Terms of Service
            </a>
          </div>
        </div>
      </footer>
    </div>
  )
} 