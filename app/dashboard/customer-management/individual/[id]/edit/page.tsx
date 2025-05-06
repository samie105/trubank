import { FormProvider } from "@/contexts/FormContext";
import CustomerEditor from "./customerEditor";

export default async function EditIndividualCustomerPage({ params }: { params: Promise<{ id: string }> }) {
  const {id} = await params;
  return (
    <FormProvider>
      <CustomerEditor id={id} />
    </FormProvider>
  )
} 