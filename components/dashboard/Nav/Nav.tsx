import React from "react";
import MoblileNav from "./MoblileNav";
import Notifications from "./Notifications";
import UserProfile from "./UserProfile";

export default function Nav() {
  return (
    <div className="py-5 md:px-6 px-3 sticky bg-background z-50 top-0 /left-0 border-b w-full">
      <div className="flex items-center justify-between">
        <div className="">
          <MoblileNav />
        </div>
        <div className="flex items-center gap-x-2">
          <Notifications />
          <UserProfile />
        </div>
      </div>
    </div>
  );
}
