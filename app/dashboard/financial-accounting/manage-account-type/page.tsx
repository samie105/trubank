import AccountTable from "@/components/dashboard/financial-accounting/manage-account-type";
import React from "react";

export default function page() {
  return (
    <div>
      <div className="px-5 py-3">Account Management</div>

      <div className="p-5">
        <AccountTable />
      </div>
    </div>
  );
}
