import {
  DownloadIcon,
  EyeOffIcon,
  FilmIcon,
  GalleryHorizontalIcon,
  LinkIcon,
  UserRoundIcon,
} from "lucide-react";

import { Hero } from "@/components/hero";
import {
  Accordion,
  AccordionItem,
  AccordionPanel,
  AccordionTrigger,
} from "@/components/ui/accordion";

const STEPS = [
  {
    body: "A @username, a profile URL, or a link to any public post or reel.",
    icon: LinkIcon,
    title: "Paste a name or link",
  },
  {
    body: "We fetch the public page for you. No account, and the creator never sees you.",
    icon: EyeOffIcon,
    title: "Browse anonymously",
  },
  {
    body: "Download full-resolution photos and videos straight to your device.",
    icon: DownloadIcon,
    title: "Save what you like",
  },
];

const FEATURES = [
  {
    body: "Bio, follower counts and the latest posts in a clean grid.",
    icon: UserRoundIcon,
    title: "Profiles",
  },
  {
    body: "Swipe through every slide at full resolution with captions.",
    icon: GalleryHorizontalIcon,
    title: "Posts & carousels",
  },
  {
    body: "Play reels inline with sound, or download the original file.",
    icon: FilmIcon,
    title: "Reels",
  },
];

const FAQ = [
  {
    a: "No. Glimpse shows public profiles, posts and reels without signing in.",
    q: "Do I need an Instagram account?",
  },
  {
    a: "No. Requests come from our server, not from you, and Instagram doesn't notify creators about profile views anyway.",
    q: "Will the person know I viewed their profile?",
  },
  {
    a: "Only accounts you already follow. Connect your own Instagram session and Glimpse shows exactly what your account is allowed to see, nothing more.",
    q: "Can I see private accounts?",
  },
  {
    a: "Yes. Tap a highlight or a profile picture with a story ring to watch it. If they don't open, connect your account on the Private accounts page.",
    q: "What about stories and highlights?",
  },
  {
    a: "Instagram limits how often its public pages can be read. Wait a minute and try again.",
    q: "Why does a profile sometimes fail to load?",
  },
];

const SectionHeading = ({
  eyebrow,
  title,
}: {
  eyebrow: string;
  title: string;
}) => (
  <div className="text-center">
    <p className="text-flare-600 font-mono text-[12px] tracking-[0.08em] uppercase">
      {eyebrow}
    </p>
    <h2 className="mt-4 text-[clamp(30px,4vw,48px)] leading-[1.02] tracking-[-0.03em] text-balance">
      {title}
    </h2>
  </div>
);

const IconTile = ({
  icon: Icon,
}: {
  icon: React.ComponentType<{ className?: string }>;
}) => (
  <span className="bg-flare-50 text-flare-600 grid size-10 place-items-center rounded-xl shadow-[inset_0_0_0_1px_rgb(255_72_1/0.18)]">
    <Icon className="size-[18px]" />
  </span>
);

const Home = () => (
  <>
    <Hero />

    <section
      id="how"
      className="mx-auto max-w-6xl scroll-mt-20 px-5 py-24 lg:px-8"
    >
      <SectionHeading
        eyebrow="How it works"
        title="Three steps, zero sign-ups."
      />
      <ol className="mt-12 grid gap-4 md:grid-cols-3">
        {STEPS.map((step, i) => (
          <li
            key={step.title}
            className="border-line/70 rounded-2xl border bg-white p-6"
          >
            <div className="flex items-center justify-between">
              <IconTile icon={step.icon} />
              <span className="text-ink font-mono text-[12px] opacity-40">
                0{i + 1}
              </span>
            </div>
            <h3 className="mt-6 text-[16px] font-medium tracking-[-0.01em]">
              {step.title}
            </h3>
            <p className="text-ink mt-1.5 font-serif text-[16px] leading-[1.5] font-light opacity-65">
              {step.body}
            </p>
          </li>
        ))}
      </ol>
    </section>

    <section
      id="features"
      className="grain border-line bg-cream scroll-mt-20 border-y"
    >
      <div className="mx-auto max-w-6xl px-5 py-24 lg:px-8">
        <SectionHeading
          eyebrow="What you can view"
          title="Everything public, nothing more."
        />
        <div className="mt-12 grid gap-4 md:grid-cols-3">
          {FEATURES.map((f) => (
            <div
              key={f.title}
              className="border-line/70 rounded-2xl border bg-white p-6"
            >
              <IconTile icon={f.icon} />
              <h3 className="mt-6 text-[16px] font-medium tracking-[-0.01em]">
                {f.title}
              </h3>
              <p className="text-ink mt-1.5 font-serif text-[16px] leading-[1.5] font-light opacity-65">
                {f.body}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>

    <section id="faq" className="mx-auto max-w-3xl scroll-mt-20 px-5 py-24">
      <SectionHeading eyebrow="FAQ" title="Questions, answered." />
      <Accordion className="border-line/70 mt-10 rounded-2xl border bg-white px-6">
        {FAQ.map((item) => (
          <AccordionItem key={item.q} value={item.q}>
            <AccordionTrigger className="text-[15px]">
              {item.q}
            </AccordionTrigger>
            <AccordionPanel className="text-ink/55 text-[14px] leading-relaxed">
              {item.a}
            </AccordionPanel>
          </AccordionItem>
        ))}
      </Accordion>
    </section>
  </>
);

export default Home;
