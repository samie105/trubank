/* eslint-disable @typescript-eslint/no-unused-vars */
import ProductDetailPage from "@/components/dashboard/financial-accounting/manage-product/product-details";
import React from "react";

export default async function page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  return (
    <div>
      <ProductDetailPage />
    </div>
  );
}
