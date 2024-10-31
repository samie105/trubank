import SidebarComp from "@/components/dashboard/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:grid md:grid-cols-12 hidden">
      <div className="col-span-2 relative">
        <SidebarComp />
      </div>
      <div className="col-span-10 /bg-blue-300"> {children}</div>
    </div>
  );
}
