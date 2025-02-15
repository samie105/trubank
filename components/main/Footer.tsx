import Link from "next/link";
import { Youtube, Twitter, Instagram, Linkedin } from "lucide-react";

const navigation = {
  home: [
    { name: "Features", href: "/features" },
    { name: "Partners", href: "/partners" },
    { name: "Testimonies", href: "/testimonies" },
    { name: "How it works", href: "/how-it-works" },
  ],
  about: [
    { name: "Mission", href: "/about/mission" },
    { name: "Vision", href: "/about/vision" },
    { name: "Who We Are", href: "/about/who-we-are" },
    { name: "Core Values", href: "/about/core-values" },
  ],
  solutions: [
    { name: "Our Solutions", href: "/solutions" },
    { name: "Features", href: "/features" },
    { name: "Get Started", href: "/get-started" },
    { name: "Contact", href: "/contact" },
  ],
  resources: [
    { name: "Blog", href: "/blog" },
    { name: "Case Study", href: "/case-study" },
    { name: "Documentation", href: "/docs" },
    { name: "Contact", href: "/contact" },
  ],
  others: [
    { name: "Privacy Policy", href: "/privacy-policy" },
    { name: "Terms & Condition", href: "/terms" },
    { name: "Cookie Policy", href: "/cookie-policy" },
    { name: "Whistleblowing Policy", href: "/whistleblowing" },
  ],
  social: [
    {
      name: "LinkedIn",
      href: "#",
      icon: Linkedin,
    },
    {
      name: "Twitter",
      href: "#",
      icon: Twitter,
    },
    {
      name: "Instagram",
      href: "#",
      icon: Instagram,
    },
    {
      name: "YouTube",
      href: "#",
      icon: Youtube,
    },
  ],
};

export function Footer() {
  return (
    <footer className="bg-white">
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-6">
          {/* Logo and Social Links */}
          <div className="lg:col-span-1">
            <Link href="/" className="flex items-center">
              <span className="text-2xl font-bold text-gray-900">
                Tru<span className="text-primary">Bank</span>
              </span>
            </Link>
            <div className="mt-4">
              <p className="text-sm font-medium text-gray-900">
                Connect with us
              </p>
              <p className="mt-1 text-sm text-gray-600">info@trubank.com</p>
              <div className="mt-4 flex space-x-4">
                {navigation.social.map((item) => (
                  <Link
                    key={item.name}
                    href={item.href}
                    className="text-primary hover:text-primary/80 size-7 rounded-full flex justify-center items-center bg-primary/10 p-1"
                  >
                    <item.icon className="h-5 w-5" />
                    <span className="sr-only">{item.name}</span>
                  </Link>
                ))}
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:grid-cols-5 lg:col-span-5">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Home</h3>
              <ul role="list" className="mt-4 space-y-2">
                {navigation.home.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">About us</h3>
              <ul role="list" className="mt-4 space-y-2">
                {navigation.about.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Solutions</h3>
              <ul role="list" className="mt-4 space-y-2">
                {navigation.solutions.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Resources</h3>
              <ul role="list" className="mt-4 space-y-2">
                {navigation.resources.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Others</h3>
              <ul role="list" className="mt-4 space-y-2">
                {navigation.others.map((item) => (
                  <li key={item.name}>
                    <Link
                      href={item.href}
                      className="text-sm text-gray-600 hover:text-gray-900"
                    >
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 border-t border-gray-200 pt-8">
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-2">
            <p className="text-xs text-gray-600">
              Copyright &copy; {new Date().getFullYear()}, Trubank
            </p>
            <div className="flex justify-start lg:justify-end space-x-2">
              <Link
                href="/cookie-policy"
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Cookie Policy
              </Link>
              <Link
                href="/privacy-policy"
                className="text-xs text-gray-600 hover:text-gray-900"
              >
                Privacy Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
      <div className="text-xs px-5 md:px-8 pb-4 text-gray-600 w-full">
        {" "}
        © 2024, Trubank is a bank with its services provided by Trubank MFB
        Limited and duly licensed by the Central Bank of Nigeria. Unauthorised
        reproduction or redistribution of copyrighted materials on this website
        and {"TruBank's"} digital media pages is strictly prohibited. By
        clicking on some of the links above, you will leave {"TruBank's"}{" "}
        website and be directed to a third-party website. The privacy practices
        of those third parties may differ from those of Trubank. We recommend
        you review the privacy statements of those third-party websites, as
        Trubank is not responsible for those third {"parties'"} privacy or
        security practices. Additional disclosures can be found in the resources
        section of our website.
      </div>
    </footer>
  );
}
