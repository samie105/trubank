import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  ChartBarStacked,
  DatabaseIcon,
  Smartphone,
  PlugZapIcon,
  Cog,
} from "lucide-react";
import TitleHero from "./Title-Hero";

// Admin Dashboard Features

// Overview Features
const overviewFeatures = {
  description:
    "Trubank’s Reporting & Analytics module provides actionable insights into financial operations through real-time dashboards and customizable reports. Financial institutions can leverage this feature to monitor performance, identify trends, and make data-driven decisions.",
  features: [
    {
      icon: Smartphone,
      title: "Customizable Dashboards",
      description:
        "Display critical KPIs such as account balances, transaction volumes, and customer acquisition rates.",
      description2:
        "Allow staff to customize dashboards based on their specific roles and requirements.",
    },
    {
      icon: Activity,
      title: "Real-Time Reporting",
      description:
        "Generate reports on demand, covering areas such as revenue, expenses, and customer behavior.",
      description2: "Automate recurring reports for efficiency and accuracy.",
    },
    {
      icon: ChartBarStacked,
      title: "Advanced Analytics",
      description:
        "Use predictive analytics to forecast trends and plan strategic initiatives.",
      description2: "Identify areas of improvement using comparative analysis.",
    },
  ],
};

// Deployment Process
const deploymentSteps = [
  {
    icon: PlugZapIcon,
    title: "Improved Decision-Making",
    description: "Access accurate data for informed strategic planning.",
  },

  {
    icon: DatabaseIcon,
    title: "Operational Visibility",
    description:
      "Gain a clear picture of institutional performance at any time.",
  },
  {
    icon: Cog,
    title: "Scalability",
    description: "Adapt reports to meet the growing needs of your institution.",
  },
];

// Why Choose TruBank

export default function ReportingAnalytics() {
  return (
    <div className="min-h-screen bg-white">
      <TitleHero title={"Reporting Analytics"} />

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

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
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
