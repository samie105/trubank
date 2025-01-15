import { Button } from "@/components/ui/button";
import CustomRadio from "@/components/ui/custom-check-box";
import {
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalTitle,
} from "@/components/ui/dialog-2";
import { ArrowRight } from "lucide-react";
import {
  parseAsBoolean,
  parseAsInteger,
  parseAsString,
  useQueryState,
} from "nuqs";
import React from "react";
import BusinessFormController from "./business-form/BusinessFormController";
import ProfileForm from "./Individual-Form/ProfileForm";

export default function CustomerModalFormCreation() {
  const [type, setType] = useQueryState(
    "type",
    parseAsString.withDefault("individual")
  );
  const [step, setStep] = useQueryState("step", parseAsInteger.withDefault(1));
  const [creating, setCreating] = useQueryState(
    "creating",
    parseAsBoolean.withDefault(false)
  );
  const handleDetailCreation = () => {
    setCreating(true);
    setStep(1);
    console.log(step, creating);
  };

  return (
    <div>
      {!creating && (
        <>
          <ResponsiveModalTitle>Choose your customer type</ResponsiveModalTitle>
          <ResponsiveModalDescription>
            Select one of the customer types below
          </ResponsiveModalDescription>
          <CustomRadio type={type} setType={setType} />
          <ResponsiveModalFooter className="mt-2">
            {" "}
            <Button
              className="w-full text-white"
              onClick={handleDetailCreation}
            >
              Next Step <ArrowRight className="ml-2 size-4" />
            </Button>
          </ResponsiveModalFooter>
        </>
      )}
      {creating && type === "individual" && <ProfileForm />}
      {creating && type === "business" && (
        <BusinessFormController step={step} />
      )}
    </div>
  );
}
