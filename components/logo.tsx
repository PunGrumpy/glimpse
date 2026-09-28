import Link from "next/link";

import { BrandMark } from "@/components/brand-mark";

export const Logo = () => (
  <Link
    href="/"
    className="focus-visible:ring-flare flex items-center gap-1.5 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <BrandMark size={30} className="shrink-0" />
    <span className="text-[21px] font-semibold tracking-[-0.03em]">
      Glimpse
    </span>
  </Link>
);
