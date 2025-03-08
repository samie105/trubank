import ProductDetailPage from "@/components/dashboard/financial-accounting/manage-product/product-details";
import React from "react";

export default function page({ params }: { params: { id: string } }) {
  return (
    <div>
      <ProductDetailPage params={params} />
    </div>
  );
}
