"use client";

import { useEffect, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

type BusinessFormData = {
  // Business Profile Details
  businessName: string;
  registrationNumber: string;
  tin: string;
  natureOfBusiness: string;
  businessType: string;
  businessAddress: string;
  phoneNumber: string;
  email: string;
  website: string;

  // Business Registration Documents
  businessIncorporationCertificate: string | null;
  memorandumArticles: string | null;
  businessLicense: string | null;

  // Proof of Address
  utilityBillType: string;
  utilityBillIssuer: string;
  issueDateOfBill: string; // Changed from Date to string for easier rendering
  utilityBill: string | null;

  // Account Information (kept from previous version)
  branch: string;
  desiredAccount: string;
  accountOfficer: string;
};

export default function BusinessConfirmationPage() {
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [data, setData] = useState<BusinessFormData | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("CustomerBusinessForm");
    if (savedData) {
      setData(JSON.parse(savedData));
    }
  }, []);

  if (!data) {
    return <div>Loading...</div>;
  }

  const handlePrevious = () => {
    setStep(1);
  };

  const handleConfirmAndSubmit = () => {
    console.log("Form submitted:", data);
    //setStep(6);
  };

  const renderField = (label: string, value: string | undefined) => {
    if (!value) return null;
    return (
      <div className="flex flex-col py-2">
        <span className="font-medium text-muted-foreground">{label}:</span>
        <span className="font-semibold pt-2">{value}</span>
      </div>
    );
  };

  const renderImage = (label: string, src: string | null, alt: string) => {
    if (!src) return null;
    return (
      <div className="flex flex-col items-center gap-2 py-4">
        <span className="font-medium text-muted-foreground">{label}</span>
        <Image
          src={src || "/placeholder.svg"}
          alt={alt}
          width={200}
          height={200}
          className="rounded-lg object-cover"
        />
      </div>
    );
  };

  return (
    <Card className="w-full border-none max-w-4xl">
      <CardHeader>
        <CardTitle className="text-2xl font-bold">
          Confirm Business Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-6 md:grid-cols-1">
            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Business Profile Details
              </h3>
              {renderField("Business Name", data.businessName)}
              {renderField("Registration Number", data.registrationNumber)}
              {renderField("TIN", data.tin)}
              {renderField("Nature of Business", data.natureOfBusiness)}
              {renderField("Business Type", data.businessType)}
              {renderField("Business Address", data.businessAddress)}
              {renderField("Phone Number", data.phoneNumber)}
              {renderField("Email", data.email)}
              {renderField("Website", data.website)}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">
                Business Registration Documents
              </h3>
              {renderImage(
                "Business Incorporation Certificate",
                data.businessIncorporationCertificate,
                "Business Incorporation Certificate"
              )}
              {renderImage(
                "Memorandum and Articles of Association",
                data.memorandumArticles,
                "Memorandum and Articles of Association"
              )}
              {renderImage(
                "Business License",
                data.businessLicense,
                "Business License"
              )}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Proof of Address</h3>
              {renderField("Utility Bill Type", data.utilityBillType)}
              {renderField("Utility Bill Issuer", data.utilityBillIssuer)}
              {renderField("Issue Date of Bill", data.issueDateOfBill)}
              {renderImage("Utility Bill", data.utilityBill, "Utility Bill")}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Account Information</h3>
              {renderField("Branch", data.branch)}
              {renderField("Desired Account Type", data.desiredAccount)}
              {renderField("Account Officer", data.accountOfficer)}
            </div>
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handlePrevious}>
          Make Changes
        </Button>
        <Button onClick={handleConfirmAndSubmit} className="text-white">
          Confirm & Submit
        </Button>
      </CardFooter>
    </Card>
  );
}
