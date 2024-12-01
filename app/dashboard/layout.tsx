import Nav from "@/components/dashboard/Nav/Nav";
import SidebarComp from "@/components/dashboard/sidebar";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="md:grid md:grid-cols-12  w-screen h-screen overflow-hidden">
      <div className="lg:col-span-3 md:col-span-4 hidden md:block relative">
        <SidebarComp />
      </div>
      <div className="lg:col-span-9 md:col-span-8 w-full h-screen overflow-scroll ">
        {" "}
        <Nav />
        {children}
      </div>
    </div>
  );
}
