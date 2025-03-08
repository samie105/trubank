import ProductTable from "@/components/dashboard/financial-accounting/manage-product/manage-product-table";
import React from "react";

export default function page() {
  return (
    <div className="px-5 py-3">
      <div>Manage Products</div>
      <div>
        <ProductTable />
      </div>
    </div>
  );
}
