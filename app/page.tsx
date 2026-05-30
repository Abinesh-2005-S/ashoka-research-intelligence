import Link from "next/link";
import { ArrowRight, BarChart3, Building2, BookOpen, MapPin, Phone, Mail, Globe } from "lucide-react";

const portals = [
  {
    href: "/intelligence",
    icon: BarChart3,
    title: "Intelligence Platform",
    audience: "Ranking Teams · Analysts · Research Office",
    description:
      "Searchable publications feed, faculty directory, discipline distribution, open-access breakdown, and international collaboration data.",
    cta: "Access Platform",
  },
  {
    href: "/executive",
    icon: Building2,
    title: "Executive Dashboard",
    audience: "Vice Chancellor · Dean Research · Leadership",
    description:
      "High-level KPIs, year-on-year research velocity, SDG alignment grid, and top-researcher leaderboard for strategic decision-making.",
    cta: "View Dashboard",
  },
  {
    href: "/storytelling",
    icon: BookOpen,
    title: "Research Storytelling",
    audience: "Industry Partners · Prospective Faculty & PhDs",
    description:
      "Narrative-led exploration of breakthroughs, faculty voices, global impact, and our open-science pledge.",
    cta: "Explore Stories",
  },
];

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-slate-200">
        {/* Background image — visible with a light translucent overlay */}
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop')" }}
          />
          {/* Very light overlay so the image is clearly visible */}
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="relative container mx-auto px-6 py-24 md:py-32 flex flex-col items-center text-center">
          {/* Logo + Portal Label */}
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.svg" alt="Ashoka University" className="h-14 w-auto drop-shadow-md" />
            <div className="w-px h-10 bg-slate-400/50" />
            <div className="text-left">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest leading-tight">Research Intelligence Portal</div>
              <div className="text-xs text-slate-600 mt-0.5">Powered by OpenAlex Live Data</div>
            </div>
          </div>

          {/* Main Heading */}
          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-3 drop-shadow-sm">
            Ashoka University
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-blue-700 leading-tight mb-6 drop-shadow-sm">
            Research Intelligence
          </h2>

          {/* Description */}
          <p className="text-lg text-slate-700 max-w-2xl leading-relaxed mb-10">
            A comprehensive portal for understanding our research performance, scholarly output, and global impact — built for every stakeholder.
          </p>

          {/* CTA Buttons */}
          <div className="flex items-center gap-4 flex-wrap justify-center">
            <Link
              href="/executive"
              className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-6 py-3 rounded-lg hover:bg-slate-800 transition-colors shadow-md"
            >
              Executive Dashboard <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/intelligence"
              className="inline-flex items-center gap-2 bg-white/80 backdrop-blur text-slate-800 text-sm font-semibold px-6 py-3 rounded-lg border border-slate-300 hover:bg-white transition-colors shadow-sm"
            >
              Intelligence Platform
            </Link>
          </div>
        </div>
      </section>

      {/* ── PORTAL SELECTION ── */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="mb-10">
            <p className="section-label mb-2">Choose Your View</p>
            <h2 className="text-2xl font-bold text-slate-900">Three Lenses Into Our Research</h2>
            <p className="text-slate-500 mt-2 max-w-xl">Each portal is designed for a specific audience and purpose. Select the one that fits your needs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {portals.map((p) => (
              <Link key={p.href} href={p.href} className="group block bg-white border border-slate-200 rounded-xl p-6 hover:border-blue-300 hover:shadow-md transition-all">
                <div className="flex items-center justify-between mb-5">
                  <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center">
                    <p.icon className="w-5 h-5 text-blue-700" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-bold text-slate-900 text-lg mb-1">{p.title}</h3>
                <p className="text-xs text-blue-600 font-semibold mb-3">{p.audience}</p>
                <p className="text-sm text-slate-600 leading-relaxed mb-5">{p.description}</p>
                <span className="text-sm font-semibold text-slate-900 group-hover:text-blue-700 transition-colors">
                  {p.cta} →
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* ── ABOUT & CONTACT ── */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <p className="section-label mb-2">About the Institution</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-5">About Ashoka University</h2>
              <div className="space-y-4 text-slate-600 leading-relaxed">
                <p>
                  Ashoka University is a pioneer in liberal education in India, helping students become well-rounded individuals who think critically, communicate effectively, and lead with a commitment to public service.
                </p>
                <p>
                  Research at Ashoka spans social sciences, natural sciences, humanities, and interdisciplinary domains — producing work of national and global significance that informs policy, practice, and public discourse.
                </p>
                <p>
                  This portal aggregates institutional research data in real-time from OpenAlex, providing transparent, verifiable performance metrics for all stakeholders.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-slate-50 py-6">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} Ashoka University Research Intelligence Portal</span>
          <span className="text-xs text-slate-400">Data sourced from <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAlex</a></span>
        </div>
      </footer>
    </div>
  );
}
