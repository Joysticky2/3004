// src/app/page.tsx
import Link from "next/link";

export const metadata = {
  title: "AI Content Engine — Create on-brand content fast",
  description:
    "Generate on-brand blogs, social captions and emails for small businesses. Powered by OpenAI, running on Vercel + Supabase.",
};

export default function LandingPage() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-white">
      {/* Nav */}
      <header className="sticky top-0 z-20 backdrop-blur border-b border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-4 flex items-center justify-between">
          <Link href="/" className="font-semibold text-lg tracking-tight">
            <span className="text-indigo-400">AI</span> Content Engine
          </Link>
          <nav className="flex items-center gap-3">
            <Link
              href="/auth/login"
              className="px-4 py-2 rounded-lg border border-white/15 hover:border-white/30 transition"
            >
              Log in
            </Link>
            <Link
              href="/auth/register"
              className="px-4 py-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-black font-medium transition"
            >
              Register
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero */}
      <section className="relative">
        <div className="mx-auto max-w-7xl px-6 py-20 md:py-28 grid md:grid-cols-2 gap-10 items-center">
          <div>
            <h1 className="text-4xl md:text-6xl font-extrabold leading-tight">
              On-brand content for{" "}
              <span className="text-indigo-400">small businesses</span>, in minutes.
            </h1>
            <p className="mt-5 text-slate-300 text-lg md:text-xl">
              Generate blogs, social captions and emails that match your tone.
              Save drafts, analyze SEO & export—all on a simple, scalable stack.
            </p>

            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/auth/register"
                className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-medium transition"
              >
                Create a free account
              </Link>
              <Link
                href="/auth/login"
                className="px-6 py-3 rounded-xl border border-white/15 hover:border-white/30 transition"
              >
                I already have an account
              </Link>
            </div>

            <p className="mt-4 text-sm text-slate-400">
              No credit card required • Runs on Vercel + Supabase • OpenAI powered
            </p>
          </div>

          {/* Right: “device” mock */}
          <div className="relative">
            <div className="rounded-2xl border border-white/10 bg-slate-800/60 shadow-2xl p-5">
              <div className="flex gap-2 mb-4">
                <span className="h-3 w-3 rounded-full bg-red-400/80" />
                <span className="h-3 w-3 rounded-full bg-yellow-400/80" />
                <span className="h-3 w-3 rounded-full bg-green-400/80" />
              </div>
              <div className="rounded-xl bg-slate-900/60 p-4">
                <div className="text-xs uppercase tracking-wider text-slate-400 mb-2">
                  Preview
                </div>
                <div className="rounded-lg border border-white/10 bg-slate-900 p-4">
                  <div className="text-slate-300 text-sm">
                    “Write a friendly Instagram caption for a local café’s new
                    weekend brunch menu. Mention live music and kid-friendly
                    options.”
                  </div>
                </div>
                <div className="mt-4 rounded-lg border border-white/10 bg-slate-900 p-4">
                  <div className="text-indigo-300 text-xs mb-1">AI Draft</div>
                  <p className="text-slate-200 text-sm leading-relaxed">
                    Brunch plans? Sorted! 🥞🎶 Swing by this weekend for fluffy
                    pancakes, savoury specials & live tunes from 10am. Little foodies
                    welcome—kids’ menu included. See you at the café! ☕️
                  </p>
                </div>
              </div>
            </div>
            <div className="absolute -inset-2 -z-10 blur-3xl bg-indigo-500/10 rounded-3xl" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold">Built for busy owners</h2>
        <div className="mt-8 grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {[
            {
              title: "Brand voice profiles",
              desc: "Save tone, audience & products once—every draft adapts automatically.",
              icon: "🎙️",
            },
            {
              title: "Multi-format output",
              desc: "Blog posts, social captions & email drafts from one simple flow.",
              icon: "🧰",
            },
            {
              title: "SEO & tone analysis",
              desc: "Instant tips, keywords and a meta description under 160 chars.",
              icon: "🔎",
            },
            {
              title: "Draft history",
              desc: "Versioned drafts you can edit, duplicate and export anytime.",
              icon: "🗂️",
            },
            {
              title: "Export to TXT/PDF",
              desc: "One-click export for sharing or scheduling in your tools.",
              icon: "⬇️",
            },
            {
              title: "Low-cost, scalable",
              desc: "Vercel + Supabase infrastructure with pay-as-you-go AI usage.",
              icon: "⚡",
            },
          ].map((f) => (
            <div
              key={f.title}
              className="rounded-xl border border-white/10 bg-slate-900/60 p-5"
            >
              <div className="text-2xl">{f.icon}</div>
              <h3 className="mt-3 font-semibold">{f.title}</h3>
              <p className="mt-2 text-slate-300 text-sm">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How it works */}
      <section className="mx-auto max-w-7xl px-6 py-16 md:py-20">
        <h2 className="text-2xl md:text-3xl font-bold">How it works</h2>
        <ol className="mt-8 space-y-4">
          {[
            "Create an account and set your brand profile (tone, industry, audience).",
            "Pick a format: blog, social caption or email. Enter a topic and optional keywords.",
            "Generate, edit and run SEO analysis—then save the draft.",
            "Export as TXT or PDF, or return later from your history.",
          ].map((step, i) => (
            <li
              key={i}
              className="flex items-start gap-4 rounded-xl border border-white/10 bg-slate-900/60 p-4"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-indigo-500 text-black font-bold">
                {i + 1}
              </span>
              <p className="text-slate-200">{step}</p>
            </li>
          ))}
        </ol>
        <div className="mt-8">
          <Link
            href="/auth/register"
            className="px-6 py-3 rounded-xl bg-indigo-500 hover:bg-indigo-400 text-black font-medium transition"
          >
            Start now — it’s free
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-white/10">
        <div className="mx-auto max-w-7xl px-6 py-8 flex flex-col md:flex-row items-center justify-between gap-3 text-sm text-slate-400">
          <p>© {new Date().getFullYear()} AI Content Engine</p>
          <div className="flex gap-4">
            <Link href="/auth/login" className="hover:text-slate-200">
              Login
            </Link>
            <Link href="/auth/register" className="hover:text-slate-200">
              Register
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
