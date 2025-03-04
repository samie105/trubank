import BankReconciliationTable from "@/components/dashboard/financial-accounting/reconciliation/bank-statement";

export default function Page() {
  return (
    <div className="container mx-auto px-5 py-10">
      <h1 className="text-2xl font-bold mb-6">Reconciliation</h1>
      <BankReconciliationTable />
    </div>
  );
}
