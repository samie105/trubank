import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Users,
  Activity,
  Settings,
  RefreshCcw,
  BarChart2,
  Shield,
  Smartphone,
  PaintbrushIcon as PaintBrush,
  Plus,
  Globe,
  Cog,
  CheckCircle2,
  Airplay,
  Lock,
  Clock,
  ArrowLeftRight,
  Bell,
} from "lucide-react";
import TitleHero from "./Title-Hero";

// Admin Dashboard Features
const adminFeatures = [
  {
    icon: Users,
    title: "Customer Management",
    description:
      "View and manage customer profiles, including KYC compliance and account status.",
    description2: "Approve or restrict access based on predefined criteria.",
  },
  {
    icon: Activity,
    title: "Transaction Oversight",
    description: "Monitor and manage customer transactions in real time.",
    description2:
      "Flag and investigate suspicious activities to ensure compliance and security.",
  },
  {
    icon: Settings,
    title: "Service Configuration",
    description:
      "Manage and configure features for your institution, such as savings products, loan offerings, or overdraft settings.",
    description2:
      "Enable or disable specific services for select customer groups.",
  },
  {
    icon: RefreshCcw,
    title: "Third-Party Switching",
    description:
      "Connect seamlessly to third-party services for additional functionality, such as: ",
    description2:
      "b. API integrations for advanced features like fraud detection, forex trading, or remittances.",
    description3:
      "a. Payment switching for processing transactions through external networks.",
  },
  {
    icon: BarChart2,
    title: "Advanced Reporting and Analytics",
    description:
      "Generate detailed reports on customer behavior, transaction trends, and operational performance.",
    description2:
      "Gain insights into key performance indicators (KPIs) to drive strategic decisions.",
  },
  {
    icon: Shield,
    title: "User Roles And Permissions",
    description:
      "Define granular access controls for internal users, ensuring secure and efficient management of the platform.",
  },
  {
    icon: Bell,
    title: "Custom Alerts And Notifications",
    description:
      "Configure notifications for critical events, such as large transactions, login attempts, or compliance violations.",
  },
];

// Overview Features
const overviewFeatures = {
  description:
    "TruBank's MobileWeb Banking App is a comprehensive white-label digital banking solution that empowers financial institutions to deliver cutting-edge mobile and web experiences to their customers. The app is built with scalability, security, and flexibility in mind, making it ideal for banks and fintech looking to offer personalized services while maintaining their unique branding. Our solution adapts to your institution's needs, features a robust admin interface, and fully customizes app to the institution's convenience, ensuring it integrates smoothly with their existing infrastructure.",
  features: [
    {
      icon: PaintBrush,
      title: "Branding",
      description:
        "Incorporate your logo, color scheme, fonts, and overall design aesthetics to reflect your institution's identity.",
      description2:
        "Deliver a consistent and personalized user experience across all platforms.",
    },
    {
      icon: Plus,
      title: "Feature Additions",
      description:
        "Add unique functionalities tailored to your operational needs or customer demands.",
      description2:
        "Examples include loyalty programs, advanced analytics, or localized payment options.",
    },
    {
      icon: Globe,
      title: "Localization",
      description:
        "Adapt the app to support regional languages, currencies, and compliance requirements.",
    },
    {
      icon: Cog,
      title: "System Integrations",
      description:
        "Seamlessly integrate with your institution’s existing systems or third-party solutions, such as KYC providers, fraud detection tools, and payment gateways.",
    },
  ],
};

// Deployment Process
const deploymentSteps = [
  {
    icon: CheckCircle2,
    title: "Discovery And Customization",
    description:
      "Trubank works closely with your institution to understand your specific needs.",
    description2:
      "Features and branding elements are customized to match your vision.",
  },
  {
    icon: Smartphone,
    title: "Integration And Testing",
    description:
      "The app is integrated with your existing infrastructure or cloud environment",
    description2:
      "Comprehensive testing ensures all features function seamlessly.",
  },
  {
    icon: Activity,
    title: "Deployment",
    description:
      "The customized app is redeployed to your institution’s environment.",
    description2:
      "Full ownership of the operational app is transferred to you, along with ongoing support.",
  },
];

// Why Choose TruBank
const benefits = [
  {
    icon: Airplay,
    title: "Tailored To Your Needs",
    description:
      "Adapt the app’s features and branding to reflect your institution’s unique identity.",
  },
  {
    icon: Shield,
    title: "Scalability & Security",
    description:
      "Enjoy a solution designed to grow with your institution while adhering to the highest security standards.",
  },
  {
    icon: Lock,
    title: "Robust Admin Control",
    description:
      "Manage every aspect of your banking operations with an intuitive, customizable admin dashboard.",
  },
  {
    icon: ArrowLeftRight,
    title: "Seamless Third-Party Switching",
    description:
      "Enable rapid connectivity with external services, enhancing your product offerings.",
  },
  {
    icon: Clock,
    title: "Faster Time-To-Market",
    description:
      "Reduce development and operational delays with a ready-to-deploy, customizable solution.",
  },
];

export default function MobileBanking() {
  return (
    <div className="min-h-screen bg-white">
      <TitleHero title={"Mobile / Web Banking App"} />

      {/* Overview Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8 ">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-2xl md:text-3xl font-bold mb-6 text-gray-800">
              Overview
            </h2>
            <p className="text-muted-foreground text-gray-500 max-w-4xl mx-auto mb-12 text-base leading-relaxed">
              {overviewFeatures.description}
            </p>
          </div>

          <div className=" mb-8">
            {" "}
            <h3 className="text-xl font-semibold text-center text-gray-800">
              <span className="text-primary">Customizable</span> Features &
              Branding
            </h3>
            <p className="text-muted-foreground mt-3 text-gray-500 text-center">
              Upon request, Trubank adapts the app to meet your institution’s
              unique requirements, including:
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {overviewFeatures.features.map((feature, index) => (
              <Card key={index} className="border border-gray-100 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-700 gap-2 text-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-gray-500 text-sm text-muted-foreground">
                    {feature.description}
                    {feature.description2 && (
                      <Separator className="w-3 my-2 bg-gray-200" />
                    )}
                    {feature.description2}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-gray-200" />
      {/* Admin Dashboard Section */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-2xl md:text-3xl text-gray-700 lg:text-4xl font-bold mb-4">
              <span className="text-primary">Admin Dashboard:</span> The Command
              Center For Your Institution
            </h1>
            <p className="text-muted-foreground text-gray-500 max-w-3xl mx-auto">
              {"TruBank's"} unified dashboard provides a comprehensive,
              custom-branded admin dashboard designed to give your team complete
              control over your mobile banking platform.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {adminFeatures.map((feature, index) => (
              <Card key={index} className="border border-gray-100 bg-white">
                <CardHeader>
                  <CardTitle className="flex items-center text-gray-700 gap-2 text-lg">
                    <feature.icon className="h-5 w-5 text-primary" />
                    {feature.title}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-muted-foreground text-gray-500 text-sm">
                    {feature.description}
                    <br className="my-2" />
                    {feature.description3}
                    {feature.description2 && (
                      <Separator className="w-3 my-2 bg-gray-200" />
                    )}
                    {feature.description2}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Separator className="bg-gray-200" />

      {/* Deployment Process */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-x mb-12">
            <h2 className="text-2xl text-center md:text-3xl text-gray-700 font-bold mb-8">
              <span className="text-primary">Deployment</span> Process
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
              {deploymentSteps.map((step, index) => (
                <div
                  key={index}
                  className="text- border border-gray-100 p-8 rounded-md shadow-md shadow-gray-50"
                >
                  <div className="mb-4 flex justify-start gap-x-2 items-center">
                    <div className="">
                      <step.icon className="h-6 w-6 text-primary" />
                    </div>{" "}
                    <h3 className="font-semibold text-gray-700 mb-2/">
                      {step.title}
                    </h3>
                  </div>

                  <p className="text-muted-foreground text-gray-500 text-sm">
                    {step.description}
                    {step.description2 && (
                      <Separator className="w-3 my-2 bg-gray-400" />
                    )}
                    {step.description2}
                  </p>
                </div>
              ))}
            </div>
          </div>

          <div className="text-">
            <h2 className="text-2xl text-center text-gray-700 md:text-3xl font-bold mb-8">
              Why Choose {"TruBank's"} Mobile Web Banking App?
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {benefits.map((benefit, index) => (
                <Card key={index} className="border border-gray-100 bg-white">
                  <CardHeader>
                    <CardTitle className="flex items-center text-gray-700 gap-2 text-lg">
                      <benefit.icon className="h-5 w-5 text-primary" />
                      {benefit.title}
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-muted-foreground text-gray-500 text-sm">
                      {benefit.description}
                    </p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
