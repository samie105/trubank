"use client";

import React from "react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button } from "@/components/ui/button";
// import { SettingsIcon } from "lucide-react";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalContent,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
  ResponsiveModalClose,
} from "@/components/ui/dialog-2";
import ThemeSwitch from "../Theme-switch";

export default function Component() {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="shine" className="relative size-10 rounded-full">
          <Avatar className="size-10 bg-transparent">
            <AvatarImage src="/placeholder.svg" alt="User avatar" />
            <AvatarFallback className="bg-transparent text-foreground">
              MG
            </AvatarFallback>
          </Avatar>
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0" align="end">
        <div className="flex items-center gap-4 p-4">
          <Avatar className="h-16 w-16 ">
            <AvatarImage src="/placeholder.svg" alt="User avatar" />
            <AvatarFallback className="animate-shine">MG</AvatarFallback>
          </Avatar>
          <div className="space-y-1">
            <h4 className="text-sm font-semibold">Mike Godwin</h4>
            <p className="text-sm text-muted-foreground">mikegodwin@mail.com</p>
            <p className="text-xs text-primary">System Administrator</p>
          </div>
        </div>
        {/* <div className="border-t px-2  py-2">
          <Button
            variant="ghost"
            className="w-full justify-start gap-2 px-4 py-2 text-sm font-normal"
          >
            <SettingsIcon className="h-4 w-4" />
            Settings
          </Button>
        </div> */}
        <div className="border-t  p-2">
          <ResponsiveModal>
            <Button variant={"ghost"} className="w-full" asChild>
              <div className="flex items-center py-5 mt-1 justify-between">
                {" "}
                <ResponsiveModalTrigger className="py-5">
                  <div className="flex items-center gap-x-2  text-foreground">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 -rotate-90"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p>Logout</p>
                  </div>
                </ResponsiveModalTrigger>
                <div className="mt- flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <ThemeSwitch />
                  </div>
                </div>
              </div>
            </Button>
            <ResponsiveModalContent>
              <ResponsiveModalTitle>Confirm Logout</ResponsiveModalTitle>
              <ResponsiveModalDescription>
                Confirm you want to logout
              </ResponsiveModalDescription>
              <ResponsiveModalFooter className="w-full mt-2">
                <div className="flex w-full justify-between">
                  <ResponsiveModalClose asChild>
                    <Button variant={"secondary"}> Cancel</Button>
                  </ResponsiveModalClose>
                  <Button
                    variant={"default"}
                    className="flex items-center text-white gap-x-2"
                  >
                    {" "}
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-4 -rotate-90"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                      />
                    </svg>
                    <p>Logout</p>
                  </Button>
                </div>
              </ResponsiveModalFooter>
            </ResponsiveModalContent>
          </ResponsiveModal>
        </div>
      </PopoverContent>
    </Popover>
  );
}
