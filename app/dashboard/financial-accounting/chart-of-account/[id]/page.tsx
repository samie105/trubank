import AccountDetailsPage from "@/components/dashboard/financial-accounting/account-details";

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AccountDetails({ params }: PageProps) {
  const { id } = await params;
  return <AccountDetailsPage accountId={id} />;
}
