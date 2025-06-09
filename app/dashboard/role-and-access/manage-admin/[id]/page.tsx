import { AdminProfile } from "@/components/dashboard/role-and-access/manage-admin";

interface AdminProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function AdminProfilePage({ params }: AdminProfilePageProps) {
  const { id } = await params;
  return <AdminProfile adminId={id} />;
} 