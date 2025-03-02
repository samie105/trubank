import JournalEntries from "@/components/dashboard/financial-accounting/journel-entries";

export default function Page() {
  return (
    <div className="container mx-auto py-10 px-5">
      <h1 className="text-2xl font-bold mb-6">Journal Entries</h1>
      <JournalEntries />
    </div>
  );
}
