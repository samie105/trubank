import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Cog,
  CheckCircle2,
  VerifiedIcon,
  PlayCircleIcon,
  ChartBar,
  ChartBarStacked,
} from "lucide-react";
import TitleHero from "./Title-Hero";

// Admin Dashboard Features

// Overview Features
const overviewFeatures = {
  description:
    "Trubank’s KYC/AML (Know Your Customer/Anti-Money Laundering) compliance module ensures regulatory adherence while providing a smooth onboarding experience. It automates verification processes to mitigate risks and ensure the integrity of financial operations.",
  features: [
    {
      icon: VerifiedIcon,
      title: "Automated KYC Verification",
      description:
        "Validate customer identity using integration with government and third-party verification databases.",
      description2:
        "Digitally store identification documents for easy retrieval and auditing.",
    },
    {
      icon: Activity,
      title: "AML Risk Assessment",
      description:
        "Screen customers against watchlists and monitor for suspicious activity in real-time.",
      description2:
        "Enable risk scoring to identify high-risk customers and flag unusual transactions.",
    },
    {
      icon: ChartBarStacked,
      title: "Regulatory Reporting",
      description:
        "Automatically generate reports for compliance audits and regulatory submissions.",
      description2:
        "Maintain accurate logs of all verifications and flagged activities.",
    },
    {
      icon: Cog,
      title: "Seamless Integration",
      description:
        "Connect with external systems for enhanced fraud detection and regulatory updates.",
    },
  ],
};

// Deployment Process
const deploymentSteps = [
  {
    icon: PlayCircleIcon,
    title: "Compliance Assurance",
    description:
      "Design account types that align with your institution’s offerings and customer expectations.",
  },

  {
    icon: ChartBar,
    title: "Risk Mitigation",
    description:
      "Proactively identify and address potential threats to financial integrity.",
  },
  {
    icon: CheckCircle2,
    title: "Operational Efficiency",
    description:
      "Automate time-consuming processes, reducing manual effort and errors.",
  },
];

// Why Choose TruBank

export default function KYCCompliance() {
  return (
    <div className="min-h-screen bg-white">
      <TitleHero title={"KYC/AML Compliance"} />

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
              <span className="text-primary">Key</span> Features
            </h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8">
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

      {/* Deployment Process */}
      <section className="py-16 px-4 md:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="text-x mb-12">
            <h2 className="text-2xl text-center md:text-3xl text-gray-700 font-bold mb-8">
              Benefits
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
                  </p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
