import { Footer } from "@/components/main/Footer"
import Navbar from "@/components/main/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function CookiesPolicyPage() {
  return (<div className="bg-white">
    <Navbar />
    <section className="relative h-[50vh] overflow-hidden">
        {/* Background Pattern */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: "url(/assets/howitworksbgpattern.png)",
          }}
        />
        {/* Overlay */}
        <div className="absolute inset-0 z-10 bg-primary/90" />

        {/* Content */}
        <div className="relative z-20 mx-auto flex h-full max-w-7xl flex-col items-center justify-center px-4 text-center text-white sm:px-6 lg:px-8">
          <h1 className="text-4xl font-bold tracking-tight sm:text-5xl">
            Cookies Policy
          </h1>
         
        </div>
      </section>
    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white border-gray-100">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Cookies Policy</h1>
          <div className="text-sm text-gray-600 mb-4">Effective Date: 12th July 2025</div>
          <div className="text-sm text-gray-600 mb-6">Website: <a href="https://trubank.ng" className="underline text-primary" target="_blank" rel="noopener noreferrer">https://trubank.ng</a></div>
          <Separator className="mb-6" />
          <p className="mb-4 text-gray-700">Trubank uses cookies on its website and platform to improve user experience, secure access, and analyze traffic. This policy applies only to visitors of our corporate website, not the deployed core banking instances operated by our clients.</p>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">1. What Cookies We Use</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><span className="font-medium text-gray-900">Essential Cookies:</span> For secure login to Trubank dashboard (if applicable).</li>
            <li><span className="font-medium text-gray-900">Analytics Cookies:</span> Monitor site visits and traffic patterns.</li>
            <li><span className="font-medium text-gray-900">Preference Cookies:</span> Remember language or layout settings.</li>
          </ul>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">2. What We Don&apos;t Do</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>We do not use cookies for advertising or third-party tracking.</li>
            <li>We do not inject or use cookies within our clients&apos; hosted banking environments.</li>
          </ul>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">3. Your Control</h2>
          <p className="mb-4 text-gray-700">You can disable cookies in your browser. However, doing so may affect how parts of the website function.</p>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">4. Contact</h2>
          <p className="mb-2 text-gray-700">For cookies-related inquiries, contact us at <a href="mailto:cookies@trubank.ng" className="underline text-primary">cookies@trubank.ng</a></p>
        </CardContent>
      </Card>
    </div>
    <Footer />
    </div>
  )
} 