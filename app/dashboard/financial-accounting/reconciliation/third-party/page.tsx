import ReconciliationTable from "@/components/dashboard/financial-accounting/reconciliation/third-party";

export default function Page() {
  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-6">Reconciliation</h1>
      <ReconciliationTable />
    </div>
  );
}
