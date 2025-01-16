/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

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
// import { AccountType, IDType } from "@/types/types";

// type FormData = {
//   firstName: string;
//   lastName: string;
//   dob: Date | string;
//   gender?: "Male" | "Female";
//   email: string;
//   phone: string;
//   country: string;
//   maritalStatus: string;
//   alternatePhone?: string;
//   employmentStatus?: string;
//   occupation?: string;
//   tin: string;
//   state: string;
//   address: string;
//   idType?: IDType;
//   idNumber?: string;
//   idDocument?: File | string | null;
//   expiryDate: Date | string;
//   issuingAuthority: string;
//   idType2?: IDType;
//   idNumber2?: string;
//   idDocument2?: File | string | null;
//   proofOfAddress?: File | string | null;
//   dateOfIssue?: Date | string;
//   addressProofType?: string;
//   issuingAuthorityPOA?: string;
//   profileImage?: File | string | null;
//   branch?: string;
//   accountOfficer?: string;
//   desiredAccount?: AccountType;
//   employerAddress: string;
//   jobTitle: string;
//   startDate?: Date | string;
//   endDate?: Date | string;
//   employmentDocument: File | string | null;
//   guarantorFullName: string;
//   guarantorRelationship: string;
//   guarantorPhone: string;
//   guarantorEmail: string;
//   guarantorAddress: string;
//   guarantorId: File | string | null;
//   nextOfKinFullName: string;
//   nextOfKinPhone: string;
//   nextOfKinEmail: string;
//   nextOfKinAddress: string;
//   nextOfKinRelationship: string;
// };

export default function ConfirmDetails() {
  const { formData } = useFormContext();
  const [, setStep] = useQueryState("step", parseAsInteger);

  if (!formData) {
    return <div>Loading...</div>;
  }

  const handleMakeChanges = () => {
    setStep(1);
  };

  // const handlePrevious = () => {
  //   setStep(6);
  // };

  const handleConfirmAndSubmit = () => {
    console.log("Form submitted:", formData);
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

  const renderDate = (label: string, value: Date | string | undefined) => {
    if (!value) return null;
    return renderField(label, format(new Date(value), "MMMM d, yyyy"));
  };

  const renderImage = (
    label: string,
    src: any,
    alt: string,
    idType?: string
  ) => {
    if (!src || idType === "BVN") return null;
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
          Confirm Your Details
        </CardTitle>
      </CardHeader>
      <CardContent>
        <ScrollArea className="h-[60vh] pr-4">
          <div className="grid gap-6 md:grid-cols-1">
            {/* Personal Information Section */}
            {(formData.firstName ||
              formData.lastName ||
              formData.dob ||
              formData.gender ||
              formData.email ||
              formData.phone ||
              formData.maritalStatus ||
              formData.alternatePhone ||
              formData.employmentStatus ||
              formData.tin) && (
              <div className="space-y-4">
                <h3 className="text-lg font-semibold">Personal Information</h3>
                {renderField("First Name", formData.firstName)}
                {renderField("Last Name", formData.lastName)}
                {renderDate("Date of Birth", formData.dob)}
                {renderField("Gender", formData.gender)}
                {renderField("Email", formData.email)}
                {renderField("Phone", formData.phone)}
                {renderField("Marital Status", formData.maritalStatus)}
                {renderField("Alternate Phone", formData.alternatePhone)}
                {renderField("Employment Status", formData.employmentStatus)}
                {renderField("Tax Identification Number (TIN)", formData.tin)}
              </div>
            )}

            {/* Address Section */}
            {(formData.country || formData.state || formData.address) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Address</h3>
                  {renderField("Country", formData.country)}
                  {renderField("State", formData.state)}
                  {renderField("Address", formData.address)}
                </div>
              </>
            )}

            {/* Identification Section */}
            {(formData.idType ||
              formData.idNumber ||
              formData.idDocument ||
              formData.expiryDate ||
              formData.issuingAuthority ||
              formData.idType2 ||
              formData.idNumber2 ||
              formData.idDocument2) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Means Of Identification
                  </h3>
                  {renderField("ID Type", formData.idType)}
                  {renderField("ID Number", formData.idNumber)}
                  {renderDate("Expiry Date", formData.expiryDate)}
                  {renderField("Issuing Authority", formData.issuingAuthority)}
                  {renderImage(
                    `${formData.idType} ID File`,
                    formData.idDocument,
                    `${formData.idType} ID`,
                    formData.idType
                  )}
                </div>
              </>
            )}

            {/* Proof of Address Section */}
            {(formData.proofOfAddress ||
              formData.dateOfIssue ||
              formData.addressProofType ||
              formData.issuingAuthorityPOA) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Proof of Address</h3>
                  {renderField(
                    "Type of Address Proof",
                    formData.addressProofType
                  )}
                  {renderField(
                    "Issuing Authority",
                    formData.issuingAuthorityPOA
                  )}
                  {renderDate("Date of Issue", formData.dateOfIssue)}
                  {renderImage(
                    "Proof of Address Document",
                    formData.proofOfAddress,
                    "Proof of Address"
                  )}
                </div>
              </>
            )}

            {/* Employment Information Section */}
            {(formData.employerAddress ||
              formData.jobTitle ||
              formData.startDate ||
              formData.endDate ||
              formData.employmentDocument) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Employment Information
                  </h3>
                  {renderField("Employer Address", formData.employerAddress)}
                  {renderField("Job Title", formData.jobTitle)}
                  {renderDate("Start Date", formData.startDate)}
                  {renderDate("End Date", formData.endDate)}
                  {renderImage(
                    "Employment Document",
                    formData.employmentDocument,
                    "Employment Document"
                  )}
                </div>
              </>
            )}

            {/* Guarantor Information Section */}
            {(formData.guarantorFullName ||
              formData.guarantorRelationship ||
              formData.guarantorPhone ||
              formData.guarantorEmail ||
              formData.guarantorAddress ||
              formData.guarantorId ||
              formData.nextOfKinFullName ||
              formData.nextOfKinPhone ||
              formData.nextOfKinEmail ||
              formData.nextOfKinAddress ||
              formData.nextOfKinRelationship) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">
                    Guarantor & Next of Kin Information
                  </h3>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Guarantor Details</h4>
                    {renderField("Full Name", formData.guarantorFullName)}
                    {renderField(
                      "Relationship",
                      formData.guarantorRelationship
                    )}
                    {renderField("Phone Number", formData.guarantorPhone)}
                    {renderField("Email", formData.guarantorEmail)}
                    {renderField("Address", formData.guarantorAddress)}
                    {renderImage(
                      "Guarantor ID",
                      formData.guarantorId,
                      "Guarantor ID Document"
                    )}
                  </div>
                  <div className="space-y-4">
                    <h4 className="text-md font-medium">Next of Kin Details</h4>
                    {renderField("Full Name", formData.nextOfKinFullName)}
                    {renderField("Phone Number", formData.nextOfKinPhone)}
                    {renderField("Email", formData.nextOfKinEmail)}
                    {renderField("Address", formData.nextOfKinAddress)}
                    {renderField(
                      "Relationship",
                      formData.nextOfKinRelationship
                    )}
                  </div>
                </div>
              </>
            )}
            {/* Account Information Section */}
            {(formData.branch ||
              formData.accountOfficer ||
              formData.desiredAccount ||
              formData.profileImage) && (
              <>
                <Separator className="my-4" />
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold">Account Information</h3>
                  {renderField("Branch", formData.branch)}
                  {renderField("Account Officer", formData.accountOfficer)}
                  {renderField("Desired Account Type", formData.desiredAccount)}
                  {renderImage(
                    "Profile Image",
                    formData.profileImage,
                    "Profile"
                  )}
                </div>
              </>
            )}
          </div>
        </ScrollArea>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={handleMakeChanges}>
          Make Changes
        </Button>
        <div className="space-x-2">
          {/* <Button variant="outline">Make Changes</Button> */}
          <Button onClick={handleConfirmAndSubmit} className="text-white">
            Confirm & Submit
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
}
