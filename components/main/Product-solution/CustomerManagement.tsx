import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Activity,
  CheckCircle2,
  ChartBarStacked,
  MessagesSquareIcon,
  ChartBarIncreasing,
  LockKeyhole,
  DatabaseIcon,
} from "lucide-react";
import TitleHero from "./Title-Hero";

// Admin Dashboard Features

// Overview Features
const overviewFeatures = {
  description:
    "Trubank’s Customer Management module provides a comprehensive solution for storing, accessing, and managing customer information. With centralized data management, financial institutions can deliver personalized services, enhance customer relationships, and streamline operational workflows.",
  features: [
    {
      icon: ChartBarIncreasing,
      title: "Comprehensive Customer Profiles",
      description:
        "Centralized repository for all customer data, including contact information, financial activities, and preferences.",
      description2:
        "Easily retrieve and update customer records for seamless service delivery.",
    },
    {
      icon: Activity,
      title: "Customer Interaction Logs",
      description:
        "Track all interactions with customers, providing insights to improve engagement and resolve issues faster.",
      description2:
        "Access historical logs for customer behavior analysis and future service planning.",
    },
    {
      icon: ChartBarStacked,
      title: "Customer Segmentation",
      description:
        "Categorize customers based on demographics, financial activities, or behavior to deliver tailored services.",
      description2:
        "Enable targeted marketing campaigns and personalized product offerings.",
    },
    {
      icon: MessagesSquareIcon,
      title: "Feedback and Complaint Tracking",
      description:
        "Manage customer feedback and complaints with a structured tracking system.",
      description2:
        "Ensure swift resolution and maintain records for auditing and service improvement.",
    },
  ],
};

// Deployment Process
const deploymentSteps = [
  {
    icon: LockKeyhole,
    title: "Enhanced Service Delivery",
    description:
      "Understand customer needs and preferences to deliver personalized experiences.",
  },

  {
    icon: DatabaseIcon,
    title: "Improved Data Management",
    description:
      "Maintain secure and easily accessible records for better operational efficiency.",
  },
  {
    icon: CheckCircle2,
    title: "Increased Customer Satisfaction",
    description:
      "Proactively manage customer feedback and resolve issues promptly.",
  },
];

// Why Choose TruBank

export default function CustomerMangament() {
  return (
    <div className="min-h-screen bg-white">
      <TitleHero title={"Customer Management"} />

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
