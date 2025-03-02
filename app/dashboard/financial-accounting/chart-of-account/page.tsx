import AccountTable from "@/components/dashboard/financial-accounting/chart-of-account";

export default function Page() {
  return (
    <div className="container mx-auto px-4 py-10">
      <h1 className="text-2xl font-bold mb-6">Account Management</h1>
      <div className="">
        <AccountTable />
      </div>
    </div>
  );
}
