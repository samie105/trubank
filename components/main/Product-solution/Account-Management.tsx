import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  Cog,
  CheckCircle2,
  PenTool,
  UploadCloud,
  ArrowUpCircle,
  BookDashed,
} from "lucide-react";
import TitleHero from "./Title-Hero";

// Admin Dashboard Features

// Overview Features
const overviewFeatures = {
  description:
    "Trubank’s Account Management module empowers financial institutions to create, manage, and maintain customer accounts efficiently. This feature is highly customizable, allowing institutions to define account structures and features based on their unique requirements.",
  features: [
    {
      icon: PenTool,
      title: "Custom Account Creation",
      description:
        "Create accounts with unique naming conventions and configurations tailored to customer needs.",
      description2:
        "Enable institutions to define account parameters such as interest rates, limits, and fees.",
    },
    {
      icon: UploadCloud,
      title: "Account Maintenance and Updates",
      description:
        "Allow seamless updates to account details, including changes in ownership, linked services, or product upgrades",
      description2:
        "Automate routine processes such as balance updates and service renewals.",
    },
    {
      icon: ArrowUpCircle,
      title: "Lifecycle Management",
      description:
        "Manage the complete lifecycle of an account, from activation to closure.",
      description2:
        "Provide a guided workflow for closing accounts while ensuring proper authorization and auditing",
    },
    {
      icon: Cog,
      title: "Audit and Compliance",
      description:
        "Maintain accurate logs for all account activities, ensuring compliance with financial regulations",
    },
  ],
};

// Deployment Process
const deploymentSteps = [
  {
    icon: Activity,
    title: "Flexibility",
    description:
      "Design account types that align with your institution’s offerings and customer expectations.",
  },

  {
    icon: BookDashed,
    title: "Streamlined Operations",
    description:
      "Automate routine account tasks, reducing operational overhead.",
  },
  {
    icon: CheckCircle2,
    title: "Improved Customer Experience",
    description:
      "Provide customers with tailored accounts that meet their financial needs.",
  },
];

// Why Choose TruBank

export default function AccountManagement() {
  return (
    <div className="min-h-screen bg-white">
      <TitleHero title={"Account Management"} />

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
