"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  FormControl,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import { Check, ChevronDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { Country } from "@/types/types";

type PhoneInputProps = {
  value: string;
  onChange: (value: string) => void;
  countriesList: Country[];
};

export const PhoneInput: React.FC<PhoneInputProps> = ({
  value,
  onChange,
  countriesList,
}) => {
  const [open, setOpen] = React.useState(false);

  return (
    <FormItem>
      <FormLabel>Phone Number</FormLabel>
      <FormControl>
        <div className="flex">
          <Popover open={open} onOpenChange={setOpen}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                role="combobox"
                className="w-[80px] justify-between"
              >
                {value.split(" ")[0] || "+234"}
                <ChevronDown className="ml-1 h-4 w-4 shrink-0 opacity-50" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[200px] p-0">
              <Command>
                <CommandInput placeholder="Search country code..." />
                <CommandList>
                  <CommandEmpty>No country code found.</CommandEmpty>
                  <CommandGroup>
                    {countriesList.map((country) => (
                      <CommandItem
                        key={country.id}
                        onSelect={() => {
                          onChange(
                            `+${country.phone_code} ${
                              value.split(" ")[1] || ""
                            }`
                          );
                          setOpen(false);
                        }}
                      >
                        <Check
                          className={cn(
                            "mr-2 h-4 w-4",
                            value.startsWith(`+${country.phone_code}`)
                              ? "opacity-100"
                              : "opacity-0"
                          )}
                        />
                        {country.emoji || ""} +{country.phone_code}
                      </CommandItem>
                    ))}
                  </CommandGroup>
                </CommandList>
              </Command>
            </PopoverContent>
          </Popover>
          <Input
            className="flex-1 ml-2"
            placeholder="Phone number"
            required
            type="tel"
            value={value.split(" ")[1] || ""}
            onChange={(e) => {
              const numericValue = e.target.value.replace(/\D/g, "");
              onChange(`${value.split(" ")[0]} ${numericValue}`);
            }}
          />
        </div>
      </FormControl>
      <FormMessage />
    </FormItem>
  );
};
