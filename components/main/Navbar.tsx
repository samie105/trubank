"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Book, FileText, Menu, MessageSquare, PanelBottom } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import Image from "next/image";

const navigation = [
  { name: "Home", href: "/" },
  { name: "About Us", href: "/about-us" },
  { name: "Products & Solutions", href: "/products-solutions" },
  {
    name: "Resources",
    href: "/resources",
    children: [
      { name: "Blog", href: "/resources/blog", icon: MessageSquare },
      {
        name: "Whitepapers & Case Studies",
        href: "/resources/whitepapers",
        icon: FileText,
      },
      {
        name: "Product Documentation",
        href: "/resources/documentation",
        icon: Book,
      },
    ],
  },
  { name: "Careers", href: "/careers" },
  { name: "Contact", href: "/contact" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="sticky top-0 z-50 w-full bg-none px-3 md:px-12 py-3">
      <div className="mx-auto flex max-w-7xl items-center">
        {/* Logo - Fixed width */}
        <div className="w-[200px]">
          <Link href="/" className="text-2xl font-bold text-white">
            <Image
              src={"/assets/logo-white.png"}
              alt="logo"
              width={1000}
              height={1000}
              className="h-8"
            />
          </Link>
        </div>

        {/* Desktop Navigation - Centered */}
        <div className="flex-1">
          <div className="hidden  justify-center lg:flex ">
            <div className=" py-1 px-1.5 bg-white rounded-full gap-x-2">
              {navigation.map((item) => {
                if (item.children) {
                  return (
                    <DropdownMenu key={item.name}>
                      <DropdownMenuTrigger asChild>
                        <Button
                          variant="ghost"
                          className={`h-10 px-4 rounded-full text-black/50 hover:bg-neutral-100 hover:text-black/50 ${
                            pathname.startsWith(item.href)
                              ? "bg-white text-primary hover:bg-white hover:text-primary"
                              : ""
                          }`}
                        >
                          {item.name} <PanelBottom />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent
                        align="start"
                        className="w-[240px] bg-white"
                      >
                        {item.children.map((child) => (
                          <DropdownMenuItem
                            key={child.name}
                            asChild
                            className="focus:bg-primary cursor-pointer "
                          >
                            <Link
                              href={child.href}
                              className="flex py-2 items-center gap-2 bg-white  text-black/70"
                            >
                              <child.icon className="h-4 w-4" />
                              {child.name}
                            </Link>
                          </DropdownMenuItem>
                        ))}
                      </DropdownMenuContent>
                    </DropdownMenu>
                  );
                }

                return (
                  <Button
                    key={item.name}
                    variant="ghost"
                    asChild
                    className={`h-10 rounded-full px-4 text-black/50 transition- hover:text-black/50 hover:bg-neutral-100 ${
                      pathname === item.href
                        ? "bg-primary text-white hover:bg-primary hover:text-white"
                        : ""
                    }`}
                  >
                    <Link href={item.href}>{item.name}</Link>
                  </Button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Actions - Fixed width */}
        <div className="w-[200px] flex justify-end">
          <div className="flex items-center gap-4">
            <Button className="hidden rounded-full hover:bg-white bg-white text-primary lg:inline-flex">
              Request Demo
            </Button>

            {/* Mobile Navigation */}
            <Sheet>
              <SheetTrigger asChild>
                <Button variant="ghost" size="icon" className="lg:hidden">
                  <Menu className="h-6 w-6 text-white" />
                  <span className="sr-only">Toggle navigation menu</span>
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-80 bg-white">
                <div className="mt-6 flex flex-col gap-4">
                  <Link href="/" className="text-2xl pb-8 font-bold text-white">
                    <Image
                      src={"/assets/logo-white.png"}
                      alt="logo"
                      width={1000}
                      height={1000}
                      className="h-8 w-48"
                    />
                  </Link>
                  {navigation.map((item) => {
                    if (item.children) {
                      return (
                        <div key={item.name} className="flex flex-col gap-2">
                          <div className="px-2 text-sm font-medium text-black/40">
                            {item.name}
                          </div>
                          {item.children.map((child) => (
                            <Button
                              key={child.name}
                              variant="ghost"
                              asChild
                              className={`justify-start ${
                                pathname === child.href
                                  ? "bg-primary"
                                  : "text-black/40"
                              }`}
                            >
                              <Link
                                href={child.href}
                                className="flex items-center hover:bg-neutral-100 hover:text-black gap-2"
                              >
                                <child.icon className="h-4 w-4" />
                                {child.name}
                              </Link>
                            </Button>
                          ))}
                        </div>
                      );
                    }

                    return (
                      <Button
                        key={item.name}
                        variant="ghost"
                        asChild
                        className={`justify-start ${
                          pathname === item.href
                            ? "bg-primary hover:bg-primary"
                            : "text-black/40 hover:bg-neutral-100 hover:text-black/90"
                        }`}
                      >
                        <Link href={item.href}>{item.name}</Link>
                      </Button>
                    );
                  })}
                  <Button className="mt-4 bg-primary text-white hover:bg-primary/90">
                    Request Demo
                  </Button>
                </div>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </nav>
  );
}
