import { BusinessFormProvider } from "@/contexts/BusinessFormContext";
import BusinessEditor from "../../businessEditor";

// Main Page Component with BusinessFormProvider
export default async function EditBusinessCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params
  return (
    <BusinessFormProvider>
      <BusinessEditor id={id} />
    </BusinessFormProvider>
  )
} 