"use client";

import { KeyRoundIcon } from "lucide-react";
import { useActionState } from "react";

import { connectSession } from "@/app/accounts/session/actions";
import type { ConnectState } from "@/app/accounts/session/actions";

const INITIAL: ConnectState = { status: "idle" };

export const SessionForm = () => {
  const [state, action, pending] = useActionState(connectSession, INITIAL);
  const error = state.status === "error" ? state.message : null;

  return (
    <form action={action} className="flex flex-col gap-3">
      <label htmlFor="sessionid" className="text-[14px] font-medium">
        Your Instagram sessionid
      </label>
      <div className="border-line focus-within:border-flare-300 flex flex-col gap-1.5 rounded-[18px] border bg-white p-1.5 sm:flex-row">
        <div className="flex h-12 min-w-0 flex-1 items-center gap-2.5 px-3.5">
          <KeyRoundIcon
            className="text-ink size-[18px] shrink-0 opacity-40"
            aria-hidden="true"
          />
          <input
            id="sessionid"
            name="sessionid"
            type="password"
            required
            autoComplete="off"
            spellCheck={false}
            aria-invalid={error ? true : undefined}
            aria-describedby={error ? "session-error" : "session-hint"}
            placeholder="1234567890%3AAbCd…"
            className="text-ink placeholder:text-ink/40 h-full min-w-0 flex-1 bg-transparent font-mono text-[15px] outline-none"
          />
        </div>
        <button
          type="submit"
          disabled={pending}
          className="btn-primary pressable inline-flex h-12 shrink-0 items-center justify-center rounded-[12px] px-6 text-[16px] font-medium disabled:opacity-70"
        >
          {pending ? "Connecting…" : "Connect"}
        </button>
      </div>
      <p id="session-hint" className="text-ink/55 text-[13px]">
        Stored only as an httpOnly cookie in this browser for 30 days.
      </p>
      <p
        id="session-error"
        role="alert"
        className="min-h-5 text-[13px] text-red-600"
      >
        {error}
      </p>
    </form>
  );
};
