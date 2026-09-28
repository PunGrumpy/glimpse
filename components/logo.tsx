import Link from "next/link";

export const Logo = () => (
  <Link
    href="/"
    className="focus-visible:ring-flare flex items-center gap-2 rounded-md outline-none focus-visible:ring-2 focus-visible:ring-offset-2"
  >
    <span
      aria-hidden="true"
      className="border-flare size-[22px] rounded-full border-[3.5px] bg-white shadow-[inset_0_1px_2px_rgb(255_72_1/0.3),0_1px_2px_rgb(255_72_1/0.25)]"
    />
    <span className="text-[21px] font-semibold tracking-[-0.03em]">Peek</span>
  </Link>
);
