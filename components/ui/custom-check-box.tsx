"use client";

import { Label } from "@/components/ui/label";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { User, Briefcase } from "lucide-react";

export default function CustomRadio({
  setType,
  type,
}: {
  setType: (value: string) => void;
  type: string | null;
}) {
  return (
    <RadioGroup
      className="gap-2 mt-3"
      defaultValue="individual"
      value={type || "individual"}
      onValueChange={(value) => setType(value)}
    >
      {/* Radio card #1 */}
      <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-primary">
        <RadioGroupItem
          value="individual"
          id="individual"
          aria-describedby="individual-description"
          className="order-1 after:absolute after:inset-0"
        />
        <div className="flex grow items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <User className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grow gap-2">
            <Label htmlFor="individual">Individual</Label>
            <p
              id="individual-description"
              className="text-xs text-muted-foreground"
            >
              Select to create an Individual customer account
            </p>
          </div>
        </div>
      </div>
      {/* Radio card #2 */}
      <div className="relative flex w-full items-start gap-2 rounded-lg border border-input p-4 shadow-sm shadow-black/5 has-[[data-state=checked]]:border-primary">
        <RadioGroupItem
          value="business"
          id="business"
          aria-describedby="business-description"
          className="order-1 after:absolute after:inset-0"
        />
        <div className="flex grow items-start gap-3">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-primary/10">
            <Briefcase className="h-5 w-5 text-primary" />
          </div>
          <div className="grid grow gap-2">
            <Label htmlFor="business">Business</Label>
            <p
              id="business-description"
              className="text-xs text-muted-foreground"
            >
              Select to create a Business customer account
            </p>
          </div>
        </div>
      </div>
    </RadioGroup>
  );
}
