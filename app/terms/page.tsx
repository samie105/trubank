import Navbar from "@/components/main/Navbar"
import { Footer } from "@/components/main/Footer"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function TermsPage() {
  return (
    <div className="bg-white">
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
            Terms & Conditions
          </h1>
         
        </div>
      </section>

      <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        <Card className="bg-white border-gray-100">
          <CardContent className="p-6">
            <h1 className="text-3xl font-bold mb-2 text-gray-900">Terms &amp; Conditions</h1>
            <div className="text-sm text-gray-600 mb-4">Effective Date: 12th July 2025</div>
            <div className="text-sm text-gray-600 mb-6">Website: <a href="https://trubank.ng" className="underline text-primary" target="_blank" rel="noopener noreferrer">https://trubank.ng</a></div>
            <Separator className="mb-6" />
            <p className="mb-4 text-gray-700">These Terms and Conditions govern the use and licensing of the Trubank core banking platform to financial institutions, fintech companies, or banking partners (hereinafter referred to as &quot;Clients&quot;).</p>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">1. Nature of Service</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
              <li>Trubank provides a technology platform that enables licensed clients to:</li>
              <ul className="list-disc pl-6 mb-2">
                <li>Manage accounts, ledgers (GLs/SLs), and transactions</li>
                <li>Configure fees, interests, and posting rules</li>
                <li>Generate reports and audit trails</li>
              </ul>
              <li>Trubank does not offer banking or financial services directly to consumers.</li>
            </ul>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">2. Responsibilities of the Client</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
              <li>Ensure compliance with regulatory requirements (e.g., CBN, NDIC, NDPR).</li>
              <li>Handle all KYC/AML obligations for end users.</li>
              <li>Maintain security and access control on their deployed instance.</li>
              <li>Define and enforce all product configurations, including transaction flows and reporting.</li>
            </ul>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">3. Service Availability</h2>
            <p className="mb-4 text-gray-700">Trubank strives to offer platform uptime in line with SLAs agreed per contract. However, some features may depend on 3rd-party APIs (e.g., payment gateways) outside our control.</p>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">4. Liability</h2>
            <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
              <li>Trubank is not liable for:</li>
              <ul className="list-disc pl-6 mb-2">
                <li>Loss of data due to client-side misconfiguration</li>
                <li>End-user disputes or regulatory liabilities</li>
                <li>Any misuse of the platform by the client or its staff</li>
              </ul>
            </ul>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">5. Termination</h2>
            <p className="mb-4 text-gray-700">Licensing may be terminated if the client violates any of the contractual agreements, including misuse of the system, non-payment, or security breaches.</p>
            <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">6. Contact</h2>
            <p className="mb-2 text-gray-700">For legal inquiries, contact us at <a href="mailto:legal@trubank.ng" className="underline text-primary">legal@trubank.ng</a></p>
          </CardContent>
        </Card>
      </div>
      <Footer />
    </div>
  )
} 