import { Footer } from "@/components/main/Footer"
import Navbar from "@/components/main/Navbar"
import { Card, CardContent } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"

export default function PrivacyPolicyPage() {
  return (<div className="bg-white">
  <Navbar />
    {/* Hero Section */}
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
          Privacy Policy
        </h1>
       
      </div>
    </section>

    <div className="max-w-2xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
      <Card className="bg-white border-gray-100">
        <CardContent className="p-6">
          <h1 className="text-3xl font-bold mb-2 text-gray-900">Privacy Policy</h1>
          <div className="text-sm text-gray-600 mb-4">Effective Date: 12th July 2025</div>
          <div className="text-sm text-gray-600 mb-6">Website: <a href="https://trubank.ng" className="underline text-primary" target="_blank" rel="noopener noreferrer">https://trubank.ng</a></div>
          <Separator className="mb-6" />
          <p className="mb-4 text-gray-700">At Trubank, we respect the privacy of all individuals and institutions who interact with our platform. However, please note that Trubank does not directly serve individual banking customers. Instead, we license and deploy our core banking software to regulated financial institutions, fintechs, and neobanks.</p>
          <p className="mb-4 text-gray-700">This policy explains how we collect and use data related to our B2B clients (e.g., banks, fintech operators) and platform usage, not the end users of those institutions.</p>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">1. Information We Collect</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li><span className="font-medium text-gray-900">Client Information:</span> Company name, registration documents, team contacts, technical environment details.</li>
            <li><span className="font-medium text-gray-900">Usage Data:</span> Logs, API usage, system metrics, and feature adoption.</li>
            <li><span className="font-medium text-gray-900">Support Records:</span> Tickets, feedback, chat logs during onboarding or support.</li>
          </ul>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">2. Purpose of Collection</h2>
          <ul className="list-disc pl-6 mb-4 space-y-1 text-gray-700">
            <li>To deploy and maintain the core banking platform.</li>
            <li>To ensure compliance with infrastructure and security policies.</li>
            <li>To provide client support, monitoring, and debugging.</li>
            <li>To improve the platform over time.</li>
          </ul>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">3. End-User Data Handling</h2>
          <p className="mb-4 text-gray-700">Trubank does not directly collect, access, or process end-user data belonging to the customers of our clients. All user data collected within the core banking environment is the sole responsibility of the client financial institution.</p>
          <p className="mb-4 text-gray-700">If you are a customer of one of our clients (e.g., a user of a digital bank), please refer to that institution&apos;s own Privacy Policy.</p>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">4. Data Security</h2>
          <p className="mb-4 text-gray-700">Trubank implements encryption, role-based access control, and server-level protections to secure hosted environments.</p>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">5. Data Retention</h2>
          <p className="mb-4 text-gray-700">Client-level configuration and logs are retained in accordance with support and compliance requirements. End-user data is retained solely by the client institution.</p>
          <h2 className="text-lg font-semibold mt-8 mb-2 text-gray-900">6. Contact</h2>
          <p className="mb-2 text-gray-700">For privacy-related inquiries, contact us at <a href="mailto:privacy@trubank.ng" className="underline text-primary">privacy@trubank.ng</a></p>
        </CardContent>
      </Card>
    </div>
    <Footer />
    </div>
  )
} 