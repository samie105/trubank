"use client";

import * as React from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import logowhite from "@/public/assets/logo-white.png";
import logodark from "@/public/assets/logo-dark.png";
import { ChevronDown, Settings, UserCircle } from "lucide-react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { Bank, Coin, Element3, LockSlash } from "iconsax-react";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubButton,
  SidebarMenuSubItem,
  SidebarProvider,
} from "@/components/ui/sidebar";
import Image from "next/image";
import {
  ResponsiveModal,
  ResponsiveModalTrigger,
  ResponsiveModalClose,
  ResponsiveModalContent,
  ResponsiveModalTitle,
  ResponsiveModalDescription,
  ResponsiveModalFooter,
} from "../ui/dialog";
import { Button } from "../ui/button";
import ThemeSwitch from "./Theme-switch";

const menuItems = [
  {
    name: "Overview",
    icon: <Element3 color="#EC9006" />,
    path: "/dashboard/overview",
  },
  {
    name: "Branch Management",
    icon: <Bank color="#EC9006" />,
    path: "/dashboard/branch-management",
  },
  {
    name: "Customer Management",
    icon: <UserCircle size={20} color="#EC9006" />,
    path: "/dashboard/customer-management",
  },
];

const financialAccountingItems = [
  {
    name: "Manage Account Type",
    path: "/dashboard/financial-accounting/manage-account-type",
  },
  {
    name: "Chart of Account",
    path: "/dashboard/financial-accounting/chart-of-account",
  },
  {
    name: "Reconciliation",
    path: "/dashboard/financial-accounting/reconciliation",
    subItems: [
      {
        name: "Bank Reconciliation",
        path: "/dashboard/financial-accounting/reconciliation/bank",
      },
      {
        name: "Internal Ledger Reconciliation",
        path: "/dashboard/financial-accounting/reconciliation/internal-ledger",
      },
      {
        name: "Third Party Reconciliation",
        path: "/dashboard/financial-accounting/reconciliation/third-party",
      },
    ],
  },
  {
    name: "Journal Entries",
    path: "/dashboard/financial-accounting/journal-entries",
  },
  {
    name: "Generate Financial Report",
    path: "/dashboard/financial-accounting/generate-financial-report",
  },
  {
    name: "Manage Product",
    path: "/dashboard/financial-accounting/manage-product",
  },
];

const roleAndAccessItems = [
  { name: "Department", path: "/dashboard/role-and-access/department" },
  { name: "Teams", path: "/dashboard/role-and-access/teams" },
  { name: "Manage Admin", path: "/dashboard/role-and-access/manage-admin" },
  {
    name: "Role Management",
    path: "/dashboard/role-and-access/role-management",
  },
  { name: "Request Log", path: "/dashboard/role-and-access/request-log" },
  { name: "Audit Log", path: "/dashboard/role-and-access/audit-log" },
];

export default function SidebarComp() {
  const [openItems, setOpenItems] = React.useState<string[]>([]);
  const pathname = usePathname();

  const toggleItem = (itemName: string) => {
    setOpenItems((prev) =>
      prev.includes(itemName)
        ? prev.filter((item) => item !== itemName)
        : [...prev, itemName]
    );
  };

  const isActive = (path: string) => pathname.startsWith(path);

  return (
    <SidebarProvider className="relative">
      <Sidebar className="w-full h-screen bg-secondary border-r bg-backg/round">
        <SidebarHeader className="p-4">
          <div className="image-cont w-4/6 mx-auto">
            <Image alt="trubank-logo" src={logowhite} className="dark:hidden" />
            <Image
              alt="trubank-logo"
              src={logodark}
              className="dark:block hidden"
            />
          </div>
        </SidebarHeader>
        <SidebarContent className="px-3 mt-10 text-foreground">
          <SidebarMenu>
            {menuItems.map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive(item.path)
                      ? "bg-primary/5 hover:bg-primary/5 hover:text-primary text-primary py-5"
                      : " py-5 text-muted-foreground"
                  }
                >
                  <Link href={item.path}>
                    {item.icon}
                    {item.name}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
            <Collapsible
              open={
                openItems.includes("Financial Accounting") ||
                isActive("/dashboard/financial-accounting")
              }
              onOpenChange={() => toggleItem("Financial Accounting")}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={`w-full px-1.5 justify-between ${
                      isActive("/dashboard/financial-accounting")
                        ? "bg-primary/5 hover:bg-primary/5 hover:text-primary text-primary py-5"
                        : "py-5 text-muted-foreground"
                    }`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <Coin size={20} color="#EC9006" />
                      Financial Accounting
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openItems.includes("Financial Accounting") ||
                        isActive("/dashboard/financial-accounting")
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {financialAccountingItems.map((item) =>
                    typeof item.subItems === "undefined" ? (
                      <SidebarMenuSubItem key={item.name}>
                        <SidebarMenuSubButton
                          asChild
                          className={`${
                            item.name.includes("Generate Financial Report")
                              ? "py-5"
                              : ""
                          } ${
                            isActive(item.path)
                              ? "bg-primary/5 text-primary"
                              : " text-muted-foreground"
                          }`}
                        >
                          <Link href={item.path}>{item.name}</Link>
                        </SidebarMenuSubButton>
                      </SidebarMenuSubItem>
                    ) : (
                      <Collapsible
                        key={item.name}
                        open={
                          openItems.includes(item.name) || isActive(item.path)
                        }
                        onOpenChange={() => toggleItem(item.name)}
                      >
                        <CollapsibleTrigger asChild>
                          <SidebarMenuSubItem>
                            <SidebarMenuSubButton
                              className={`w-full justify-between ${
                                isActive(item.path)
                                  ? "bg-primary/5 text-primary"
                                  : " text-muted-foreground"
                              }`}
                            >
                              {item.name}
                              <ChevronDown
                                className={`h-4 w-4 transition-transform duration-200 ${
                                  openItems.includes(item.name) ||
                                  isActive(item.path)
                                    ? "rotate-180"
                                    : ""
                                }`}
                              />
                            </SidebarMenuSubButton>
                          </SidebarMenuSubItem>
                        </CollapsibleTrigger>
                        <CollapsibleContent>
                          <SidebarMenuSub className="pl-4">
                            {item.subItems.map((subItem) => (
                              <SidebarMenuSubItem
                                key={subItem.name}
                                className=""
                              >
                                <SidebarMenuSubButton
                                  asChild
                                  className={
                                    isActive(subItem.path)
                                      ? "bg-primary/5 text-primary py-5"
                                      : "py-5 text-muted-foreground"
                                  }
                                >
                                  <Link href={subItem.path} className="">
                                    {subItem.name}
                                  </Link>
                                </SidebarMenuSubButton>
                              </SidebarMenuSubItem>
                            ))}
                          </SidebarMenuSub>
                        </CollapsibleContent>
                      </Collapsible>
                    )
                  )}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
            <Collapsible
              open={
                openItems.includes("Role & Access") ||
                isActive("/dashboard/role-and-access")
              }
              onOpenChange={() => toggleItem("Role & Access")}
            >
              <CollapsibleTrigger asChild>
                <SidebarMenuItem>
                  <SidebarMenuButton
                    className={`w-full justify-between ${
                      isActive("/dashboard/role-and-access")
                        ? "bg-primary/5 text-primary py-5"
                        : " py-5 text-muted-foreground"
                    }`}
                  >
                    <div className="flex gap-x-2 items-center">
                      <LockSlash size="18" color="#EC9006" />
                      Role & Access
                    </div>
                    <ChevronDown
                      className={`h-4 w-4 transition-transform duration-200 ${
                        openItems.includes("Role & Access") ||
                        isActive("/dashboard/role-and-access")
                          ? "rotate-180"
                          : ""
                      }`}
                    />
                  </SidebarMenuButton>
                </SidebarMenuItem>
              </CollapsibleTrigger>
              <CollapsibleContent>
                <SidebarMenuSub>
                  {roleAndAccessItems.map((item) => (
                    <SidebarMenuSubItem key={item.name}>
                      <SidebarMenuSubButton
                        asChild
                        className={
                          isActive(item.path)
                            ? "bg-primary/5 text-primary"
                            : " text-muted-foreground"
                        }
                      >
                        <Link href={item.path}>{item.name}</Link>
                      </SidebarMenuSubButton>
                    </SidebarMenuSubItem>
                  ))}
                </SidebarMenuSub>
              </CollapsibleContent>
            </Collapsible>
          </SidebarMenu>
        </SidebarContent>
        <div className="mt-auto border-t p-4 pb-8">
          <SidebarMenu>
            {[
              { name: "Settings", icon: Settings, path: "/dashboard/settings" },
            ].map((item) => (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton
                  asChild
                  className={
                    isActive(item.path) ? "bg-primary/5 text-primary " : "py-4"
                  }
                >
                  <Link href={item.path} className="text-foreground py-5 flex">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                      strokeWidth={1.5}
                      stroke="currentColor"
                      className="size-6 text-foreground"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.325.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 0 1 1.37.49l1.296 2.247a1.125 1.125 0 0 1-.26 1.431l-1.003.827c-.293.241-.438.613-.43.992a7.723 7.723 0 0 1 0 .255c-.008.378.137.75.43.991l1.004.827c.424.35.534.955.26 1.43l-1.298 2.247a1.125 1.125 0 0 1-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.47 6.47 0 0 1-.22.128c-.331.183-.581.495-.644.869l-.213 1.281c-.09.543-.56.94-1.11.94h-2.594c-.55 0-1.019-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 0 1-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 0 1-1.369-.49l-1.297-2.247a1.125 1.125 0 0 1 .26-1.431l1.004-.827c.292-.24.437-.613.43-.991a6.932 6.932 0 0 1 0-.255c.007-.38-.138-.751-.43-.992l-1.004-.827a1.125 1.125 0 0 1-.26-1.43l1.297-2.247a1.125 1.125 0 0 1 1.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.086.22-.128.332-.183.582-.495.644-.869l.214-1.28Z"
                      />
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                      />
                    </svg>

                    <div>{item.name}</div>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            ))}
          </SidebarMenu>
          <SidebarMenu>
            <ResponsiveModal>
              <SidebarMenuButton asChild>
                <div className="flex items-center py-5 mt-1 justify-between">
                  {" "}
                  <ResponsiveModalTrigger className="py-5">
                    <div className="flex items-center gap-x-2  text-foreground">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4 -rotate-90"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <p>Logout</p>
                    </div>
                  </ResponsiveModalTrigger>
                  <div className="mt- flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ThemeSwitch />
                    </div>
                  </div>
                </div>
              </SidebarMenuButton>
              <ResponsiveModalContent>
                <ResponsiveModalTitle>Confirm Logout</ResponsiveModalTitle>
                <ResponsiveModalDescription>
                  Confirm you want to logout
                </ResponsiveModalDescription>
                <ResponsiveModalFooter className="w-full mt-2">
                  <div className="flex w-full justify-between">
                    <ResponsiveModalClose asChild>
                      <Button variant={"secondary"}> Cancel</Button>
                    </ResponsiveModalClose>
                    <Button
                      variant={"default"}
                      className="flex items-center text-white gap-x-2"
                    >
                      {" "}
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                        strokeWidth={1.5}
                        stroke="currentColor"
                        className="size-4 -rotate-90"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
                        />
                      </svg>
                      <p>Logout</p>
                    </Button>
                  </div>
                </ResponsiveModalFooter>
              </ResponsiveModalContent>
            </ResponsiveModal>
          </SidebarMenu>
        </div>
      </Sidebar>
    </SidebarProvider>
  );
}
