import { Logo } from "@/components/logo";

export const SiteFooter = () => (
  <footer className="border-line/70 bg-sand-50 border-t">
    <div className="text-ink/55 mx-auto flex max-w-6xl flex-col gap-4 px-5 py-10 text-[13px] sm:flex-row sm:items-center sm:justify-between lg:px-8">
      <div className="flex items-center gap-4">
        <Logo />
        <span>Nothing you view is stored.</span>
      </div>
      <p className="max-w-md sm:text-right">
        Not affiliated with Instagram or Meta. All content belongs to its
        creators.
      </p>
    </div>
  </footer>
);
