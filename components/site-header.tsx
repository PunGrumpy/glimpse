import Link from "next/link";

import { Logo } from "@/components/logo";

const NAV = [
  { href: "/#how", label: "How it works" },
  { href: "/#features", label: "Features" },
  { href: "/#faq", label: "FAQ" },
  { href: "/accounts/session", label: "Private accounts" },
];

export const SiteHeader = () => (
  <header className="sticky top-0 z-50 bg-white">
    <div className="mx-auto flex h-[68px] items-center justify-between gap-4 px-5 lg:h-[76px] lg:px-8">
      <div className="flex items-center gap-3 xl:gap-6">
        <Logo />
        <nav className="hidden items-center gap-0.5 md:flex">
          {NAV.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="text-ink/85 hover:bg-sand-100 hover:text-ink rounded-md px-2.5 py-2 text-[14.5px] font-medium xl:px-3 xl:text-[15.5px]"
            >
              {item.label}
            </Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-2">
        <Link
          href="/#faq"
          className="pressable border-ink hover:bg-sand-100 hidden h-[42px] items-center rounded-[10px] border px-4 text-[14.5px] font-medium sm:inline-flex xl:px-5 xl:text-[15.5px]"
        >
          Is it anonymous?
        </Link>
        <Link
          href="/#search"
          className="pressable bg-ink inline-flex h-[42px] items-center rounded-[10px] px-4 text-[14.5px] font-medium text-white hover:bg-[#2a2a2a] xl:px-5 xl:text-[15.5px]"
        >
          View a profile
        </Link>
      </div>
    </div>
  </header>
);
