import {
  LayoutGrid,
  Building2,
  Users,
  Wallet,
  UserCheck,
  Settings,
  LogOut,
} from "lucide-react";

export const sidebarData = [
  {
    name: "Overview",
    icon: LayoutGrid,
    path: "/overview",
  },
  {
    name: "Branch Management",
    icon: Building2,
    path: "/branch-management",
  },
  {
    name: "Customer Management",
    icon: Users,
    path: "/customer-management",
  },
  {
    name: "Financial Accounting",
    icon: Wallet,
    path: "/financial-accounting",
    subPaths: [
      {
        name: "Manage Account Type",
        path: "/financial-accounting/manage-account-type",
      },
      {
        name: "Chart of Account",
        path: "/financial-accounting/chart-of-account",
      },
      {
        name: "Reconciliation",
        path: "/financial-accounting/reconciliation",
        subPaths: [
          {
            name: "Bank Reconciliation",
            path: "/financial-accounting/reconciliation/bank",
          },
          {
            name: "Internal Ledger Reconciliation",
            path: "/financial-accounting/reconciliation/internal-ledger",
          },
          {
            name: "Third Party Reconciliation",
            path: "/financial-accounting/reconciliation/third-party",
          },
        ],
      },
      {
        name: "Journal Entries",
        path: "/financial-accounting/journal-entries",
      },
      {
        name: "Generate Financial Report",
        path: "/financial-accounting/generate-financial-report",
      },
      {
        name: "Manage Product",
        path: "/financial-accounting/manage-product",
      },
    ],
  },
  {
    name: "Role & Access",
    icon: UserCheck,
    path: "/role-and-access",
  },
  {
    name: "Settings",
    icon: Settings,
    path: "/settings",
  },
  {
    name: "Logout",
    icon: LogOut,
    path: "/logout",
  },
];
