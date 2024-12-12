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
  businessName: string;
  businessType: string;
  industrySector: string;
  businessAddress: string;
  email: string;
  phoneNumber: string;
  rcNumber: string;
  cacDocument: string | null;
  ownerFirstName: string;
  ownerLastName: string;
  ownerPhoneNumber: string;
  ownerEmail: string;
  ownerTitle: string;
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

  const handleMakeChanges = () => {
    setStep(1);
  };

  const handlePrevious = () => {
    setStep(4);
  };

  const handleConfirmAndSubmit = () => {
    // Implement your submission logic here
    console.log("Form submittedrrd:", data);
    // Navigate to a success page or the next step
    setStep(6);
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
          src={src}
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
              <h3 className="text-lg font-semibold">Business Information</h3>
              {renderField("Business Name", data.businessName)}
              {renderField("Business Type", data.businessType)}
              {renderField("Industry/Sector", data.industrySector)}
              {renderField("Business Address", data.businessAddress)}
              {renderField("Email", data.email)}
              {renderField("Phone Number", data.phoneNumber)}
              {renderField("RC Number", data.rcNumber)}
              {renderImage("CAC Document", data.cacDocument, "CAC Document")}
            </div>

            <Separator className="my-4" />

            <div className="space-y-4">
              <h3 className="text-lg font-semibold">Owner Information</h3>
              {renderField("First Name", data.ownerFirstName)}
              {renderField("Last Name", data.ownerLastName)}
              {renderField("Phone Number", data.ownerPhoneNumber)}
              {renderField("Email", data.ownerEmail)}
              {renderField("Title", data.ownerTitle)}
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
          Previous
        </Button>
        <div className="space-x-2">
          <Button variant="outline" onClick={handleMakeChanges}>
            Make Changes
          </Button>
          <Button onClick={handleConfirmAndSubmit} className="text-white">
            Confirm & Submit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
