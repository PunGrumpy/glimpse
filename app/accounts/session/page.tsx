import { ShieldAlertIcon } from "lucide-react";
import type { Metadata } from "next";
import Image from "next/image";

import { SessionForm } from "@/components/session-form";
import { getConnectedAccount } from "@/lib/instagram";
import type { ConnectedAccount } from "@/lib/instagram";
import { getVisitor } from "@/lib/viewer";

import { disconnectSession } from "./actions";

export const metadata: Metadata = {
  description:
    "Connect your own Instagram session to see private accounts you follow.",
  title: "Connect your account",
};

const STEPS = [
  "Open instagram.com in this browser and log in (a secondary account is safest).",
  "Open DevTools (F12) → Application → Cookies → https://www.instagram.com.",
  "Copy the value of the cookie named sessionid and paste it below.",
];

const loadAccount = async (): Promise<ConnectedAccount | null> => {
  const visitor = await getVisitor();
  if (!visitor) {
    return null;
  }
  try {
    return await getConnectedAccount(visitor);
  } catch {
    return null;
  }
};

const ConnectedCard = ({ account }: { account: ConnectedAccount }) => (
  <div className="border-line/70 flex items-center gap-4 rounded-2xl border bg-white p-5">
    <Image
      src={account.avatar}
      alt=""
      width={48}
      height={48}
      className="img-outline bg-sand-100 size-12 rounded-full object-cover"
    />
    <div className="min-w-0 flex-1">
      <p className="text-ink/55 text-[13px]">Connected as</p>
      <p className="truncate text-[16px] font-semibold">@{account.username}</p>
    </div>
    <form action={disconnectSession}>
      <button
        type="submit"
        className="pressable border-line-strong hover:bg-sand-50 inline-flex h-9 items-center rounded-[10px] border bg-white px-4 text-[14px] font-medium"
      >
        Disconnect
      </button>
    </form>
  </div>
);

const SessionPage = async () => {
  const account = await loadAccount();

  return (
    <div className="mx-auto flex max-w-xl flex-col gap-8 px-5 py-14 sm:py-20">
      <header className="flex flex-col gap-3">
        <p className="text-flare-600 font-mono text-[12px] tracking-[0.08em] uppercase">
          Private accounts
        </p>
        <h1 className="text-[clamp(30px,5vw,44px)] leading-[1.02] tracking-[-0.03em] text-balance">
          See what your own account can see.
        </h1>
        <p className="text-ink/75 font-serif text-[17px] leading-[1.5] font-light">
          Connect your Instagram session to view private accounts you follow,
          plus stories and highlights. Glimpse never shows anything your account
          isn&apos;t already allowed to see.
        </p>
      </header>

      {account ? (
        <ConnectedCard account={account} />
      ) : (
        <>
          <ol className="border-line/70 flex flex-col gap-3 rounded-2xl border bg-white p-5">
            {STEPS.map((step, index) => (
              <li key={step} className="flex gap-3 text-[14px] leading-relaxed">
                <span className="text-ink font-mono text-[12px] leading-6 opacity-40">
                  0{index + 1}
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
          <SessionForm />
        </>
      )}

      <aside className="bg-flare-50 flex gap-3 rounded-2xl p-5 text-[14px] leading-relaxed">
        <ShieldAlertIcon
          className="text-flare-600 mt-0.5 size-5 shrink-0"
          aria-hidden="true"
        />
        <div className="flex flex-col gap-2">
          <p className="font-medium">A sessionid is a key to your account.</p>
          <p className="text-ink/75">
            Anyone holding it can act as you until you log out. Glimpse keeps it
            only in an httpOnly cookie in this browser, sends it to Instagram
            for your requests, and never stores or logs it. Disconnect removes
            it from Glimpse; to revoke it everywhere, log out of that session on
            Instagram. Automated access is against Instagram&apos;s terms, so
            use a secondary account.
          </p>
        </div>
      </aside>
    </div>
  );
};

export default SessionPage;
