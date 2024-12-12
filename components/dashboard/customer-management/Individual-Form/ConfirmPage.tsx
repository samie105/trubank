/* eslint-disable @typescript-eslint/no-unused-vars */
"use client";

import { useEffect, useState } from "react";
import { parseAsInteger, useQueryState } from "nuqs";
import { format } from "date-fns";
import Image from "next/image";
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
import { useFormContext } from "@/contexts/FormContext";
import { cn } from "@/lib/utils";

type FormData = {
  firstName: string;
  lastName: string;
  dob: Date;
  gender: string | undefined;
  email: string;
  phone: string;
  country: string;
  state: string;
  address: string;
  idType: string | undefined;
  idNumber: string;
  idDocument: string | null;
  idType2: string | undefined;
  idNumber2: string;
  idDocument2: string | null;
  proofOfAddress: string | null;
  profileImage: string | null;
  branch: string | undefined;
  accountOfficer: string;
  desiredAccount: string | undefined;
};

export default function ConfirmDetails() {
  const { formData } = useFormContext();
  const [, setStep] = useQueryState("step", parseAsInteger);
  const [data, setData] = useState<FormData | null>(null);

  useEffect(() => {
    const savedData = localStorage.getItem("customerForm");
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
    setStep(5);
  };

  const handleConfirmAndSubmit = () => {
    // Implement your submission logic here
    console.log("Form submitted:", data);
    // Navigate to a success page or the next step
    setStep(7);
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

  const renderImage = (
    label: string,
    src: string | null,
    alt: string,
    idType?: string
  ) => {
    if (!src || idType === "BVN") return null;
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
          Confirm Your Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-6 md:grid-cols-1">
            {(data.firstName ||
              data.lastName ||
              data.dob ||
              data.gender ||
              data.email ||
              data.phone) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                {renderField("First Name", data.firstName)}
                {renderField("Last Name", data.lastName)}
                {renderField(
                  "Date of Birth",
                  data.dob
                    ? format(new Date(data.dob), "MMMM d, yyyy")
                    : undefined
                )}
                {renderField("Gender", data.gender)}
                {renderField("Email", data.email)}
                {renderField("Phone", data.phone)}
              </div>
            )}
            {(data.country || data.state || data.address) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  {renderField("Country", data.country)}
                  {renderField("State", data.state)}
                  {renderField("Address", data.address)}
                </div>
              </>
            )}
            {(data.idType ||
              data.idNumber ||
              data.idDocument ||
              data.idType2 ||
              data.idNumber2 ||
              data.idDocument2 ||
              data.proofOfAddress) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Identification</h3>
                  {renderField("ID Type", data.idType)}
                  {renderField("ID Number", data.idNumber)}
                  {renderImage(
                    `${data.idType} ID File`,
                    data.idDocument,
                    `${data.idType} ID`,
                    data.idType
                  )}
                  {data.idType2 && (
                    <>
                      {renderField("ID Type 2", data.idType2)}
                      {renderField("ID Number 2", data.idNumber2)}
                      {renderImage(
                        `${data.idType2} ID File`,
                        data.idDocument2,
                        `${data.idType2} ID`,
                        data.idType2
                      )}
                    </>
                  )}
                  {renderImage(
                    "Proof of Address",
                    data.proofOfAddress,
                    "Proof of Address"
                  )}
                </div>
              </>
            )}
            {(data.branch ||
              data.accountOfficer ||
              data.desiredAccount ||
              data.profileImage) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  {renderField("Branch", data.branch)}
                  {renderField("Account Officer", data.accountOfficer)}
                  {renderField("Desired Account Type", data.desiredAccount)}
                  {renderImage("Profile Image", data.profileImage, "Profile")}
                </div>
              </>
            )}
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
