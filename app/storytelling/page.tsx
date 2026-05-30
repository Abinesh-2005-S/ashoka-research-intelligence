import {
  getInstitutionSummary, getTopAuthors, getOpenAccessBreakdown,
  getCountryCollaborations, getRecentPublications,
} from "@/services/openalex/api";
import { ExternalLink, Globe, Unlock, ArrowRight, MapPin, Mail, Phone, BookOpen, Users } from "lucide-react";
import Link from "next/link";

const SDG_STORIES = [
  { id: 3,  icon: "❤️", title: "Good Health & Well-Being",          desc: "Epidemiology, public health, and behavioral medicine research at Ashoka is shaping evidence-based health policy across India." },
  { id: 4,  icon: "📚", title: "Quality Education",                 desc: "From curriculum reform to large-scale learning outcome studies, our scholars are redefining how India learns." },
  { id: 13, icon: "🌍", title: "Climate Action",                    desc: "Environmental economics, climate modelling, and biodiversity research advance both scientific understanding and policy advocacy." },
  { id: 10, icon: "🤝", title: "Reduced Inequalities",              desc: "Rigorous work on caste, gender, and economic inclusion drives systemic conversations about equity in South Asia." },
  { id: 16, icon: "🕊️", title: "Peace, Justice & Institutions",    desc: "Legal scholars, political scientists, and sociologists collaborate on governance and democratic institution research." },
  { id: 9,  icon: "🏭", title: "Industry, Innovation & Infrastructure", desc: "Computer science and data research drives innovation in AI, computational biology, and digital economics." },
];

export default async function StorytellingProfile() {
  const [summary, authors, oaBreakdown, countryCollabs, publications] = await Promise.all([
    getInstitutionSummary(), getTopAuthors(), getOpenAccessBreakdown(),
    getCountryCollaborations(), getRecentPublications(undefined, 1, 6, "cited_by_count:desc"),
  ]);

  const totalWorks = summary.works_count;
  const totalCitations = summary.cited_by_count;
  const hIndex = summary.summary_stats.h_index;
  const totalOA = oaBreakdown.filter((o: any) => o.key !== "closed").reduce((s: number, o: any) => s + o.count, 0);
  const oaPercent = Math.round((totalOA / totalWorks) * 100);
  const partnerCountries = countryCollabs.filter((c: any) => c.key !== "IN").length;
  const topPartners = countryCollabs.filter((c: any) => c.key !== "IN").slice(0, 8);
  const topPubs = (publications?.results ?? []).slice(0, 3);

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* ── HERO ── */}
      <section className="relative border-b border-slate-200 overflow-hidden">
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop')" }} />
          <div className="absolute inset-0 bg-slate-900/75" />
        </div>
        <div className="relative container mx-auto px-6 py-24">
          <div className="max-w-2xl">
            <p className="text-xs font-bold text-blue-300 uppercase tracking-widest mb-4">Research Impact · Public Profile</p>
            <h1 className="text-4xl md:text-5xl font-bold text-white leading-tight mb-5">
              The Research Story of<br />{summary.display_name}
            </h1>
            <p className="text-lg text-slate-300 leading-relaxed mb-8">
              Explore how Ashoka's scholars are addressing the world's most pressing challenges — through evidence, inquiry, and open knowledge.
            </p>
            <div className="flex gap-3 flex-wrap">
              <Link href="/intelligence" className="inline-flex items-center gap-2 bg-white text-slate-900 text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-100 transition-colors">
                Research Analytics <ArrowRight className="w-4 h-4" />
              </Link>
              <Link href="/executive" className="inline-flex items-center gap-2 bg-white/10 border border-white/30 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-white/20 transition-colors">
                Executive Dashboard
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 divide-x divide-slate-200">
            {[
              { value: totalWorks.toLocaleString(), label: "Publications", sub: "Peer-reviewed research outputs", icon: BookOpen },
              { value: totalCitations.toLocaleString(), label: "Total Citations", sub: "Referenced globally", icon: ArrowRight },
              { value: `${oaPercent}%`, label: "Open Access", sub: "Freely available worldwide", icon: Unlock },
              { value: `${partnerCountries}+`, label: "Partner Countries", sub: "International collaborations", icon: Globe },
            ].map(stat => (
              <div key={stat.label} className="px-4 first:pl-0">
                <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
                <div className="text-sm font-semibold text-slate-700 mb-0.5">{stat.label}</div>
                <div className="text-xs text-slate-400">{stat.sub}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURED PUBLICATIONS ── */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6">
          <p className="section-label mb-2">Most Cited Research</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Highest-Impact Publications</h2>
          <p className="text-slate-500 mb-10 max-w-xl">Research that the global academic community returns to most frequently.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {topPubs.map((pub: any) => (
              <div key={pub.id} className="pro-card p-5 hover:shadow-md transition-shadow flex flex-col">
                <div className="flex items-center gap-2 mb-3 flex-wrap">
                  <span className="badge-neutral">{pub.type?.replace(/_/g, " ") ?? "Article"}</span>
                  <span className="text-xs text-slate-400">{pub.publication_year}</span>
                  {pub.open_access?.is_oa && <span className="badge-success">Open Access</span>}
                </div>
                <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-3 flex-1">
                  {pub.title ?? "Untitled"}
                </h3>
                <p className="text-xs text-slate-400 line-clamp-1 mb-4">
                  {pub.authorships?.slice(0, 2).map((a: any) => a.author.display_name).join(", ")}
                </p>
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <div>
                    <span className="text-xl font-bold text-slate-900">{(pub.cited_by_count ?? 0).toLocaleString()}</span>
                    <span className="text-xs text-slate-400 ml-1">citations</span>
                  </div>
                  {pub.doi && (
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                      Read <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FACULTY VOICES ── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <p className="section-label mb-2">The Scholars</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Faculty Voices</h2>
          <p className="text-slate-500 mb-10 max-w-xl">Researchers driving Ashoka's global scholarly impact.</p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {authors.slice(0, 3).map((author: any) => (
              <div key={author.id} className="pro-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg shrink-0">
                    {author.display_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 leading-tight">{author.display_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Ashoka University</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { l: "Works", v: author.works_count },
                    { l: "Citations", v: (author.cited_by_count ?? 0).toLocaleString() },
                    { l: "h-index", v: author.summary_stats?.h_index ?? "–" },
                  ].map(m => (
                    <div key={m.l} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                      <div className="font-bold text-slate-900 text-sm">{m.v}</div>
                      <div className="text-xs text-slate-400">{m.l}</div>
                    </div>
                  ))}
                </div>
                {author.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {author.topics.slice(0, 3).map((t: any) => (
                      <span key={t.display_name} className="badge-accent">{t.display_name}</span>
                    ))}
                  </div>
                )}
                <a href={`https://openalex.org/authors/${author.id?.split("/").pop()}`}
                  target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline mt-1">
                  OpenAlex Profile <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── SDG MISSION ── */}
      <section className="py-16 bg-slate-50 border-b border-slate-200">
        <div className="container mx-auto px-6">
          <p className="section-label mb-2">Global Impact</p>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Research Serving the World</h2>
          <p className="text-slate-500 mb-10 max-w-xl">Our scholars actively contribute to the United Nations Sustainable Development Goals.</p>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {SDG_STORIES.map(sdg => (
              <div key={sdg.id} className="pro-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start gap-3 mb-3">
                  <span className="text-2xl shrink-0">{sdg.icon}</span>
                  <div>
                    <div className="text-xs font-bold text-blue-600 uppercase tracking-wide mb-0.5">SDG {sdg.id}</div>
                    <h3 className="font-bold text-slate-900 text-sm leading-snug">{sdg.title}</h3>
                  </div>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed">{sdg.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── GLOBAL REACH ── */}
      <section className="py-16 bg-white border-b border-slate-200">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12 items-start">
            <div>
              <p className="section-label mb-2">International Reach</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">A Global Research Community</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Ashoka researchers co-publish with scholars from {partnerCountries}+ countries, reflecting our commitment to producing internationally relevant knowledge.
              </p>
              <div className="flex flex-wrap gap-2">
                {topPartners.map((c: any) => (
                  <span key={c.key} className="badge-neutral">{c.key_display_name} · {c.count}</span>
                ))}
                {partnerCountries > 8 && (
                  <span className="badge-neutral">+{partnerCountries - 8} more</span>
                )}
              </div>
            </div>
            <div className="pro-card p-6">
              <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <Unlock className="w-5 h-5 text-blue-700" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Open Science Pledge</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-slate-900">{oaPercent}%</span>
                <span className="text-slate-500 text-sm">of publications are Open Access</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {totalOA.toLocaleString()} out of {totalWorks.toLocaleString()} publications are freely available — ensuring knowledge reaches researchers, policymakers, and citizens worldwide.
              </p>
              <div className="data-bar-track h-3">
                <div className="data-bar-fill bg-emerald-600 h-full" style={{ width: `${oaPercent}%` }} />
              </div>
              <div className="flex justify-between text-xs text-slate-400 mt-1.5">
                <span>0%</span>
                <span>{oaPercent}% Open Access</span>
                <span>100%</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── CONTACT & CTA ── */}
      <section className="py-16 bg-slate-50">
        <div className="container mx-auto px-6">
          <div className="grid md:grid-cols-2 gap-12">
            <div>
              <p className="section-label mb-2">Work With Us</p>
              <h2 className="text-2xl font-bold text-slate-900 mb-3">Join Our Research Ecosystem</h2>
              <p className="text-slate-600 leading-relaxed mb-6">
                Whether you are a prospective faculty member, industry partner, or PhD candidate — there is a place for you in the Ashoka research community.
              </p>
              <div className="flex gap-3 flex-wrap">
                <Link href="/intelligence" className="inline-flex items-center gap-2 bg-slate-900 text-white text-sm font-semibold px-5 py-2.5 rounded-lg hover:bg-slate-800 transition-colors">
                  Research Data <ArrowRight className="w-4 h-4" />
                </Link>
                <Link href="/executive" className="inline-flex items-center gap-2 bg-white text-slate-700 text-sm font-semibold px-5 py-2.5 rounded-lg border border-slate-300 hover:bg-slate-50 transition-colors">
                  Executive View
                </Link>
              </div>
            </div>
            <div>
              <p className="section-label mb-4">Contact</p>
              <ul className="space-y-4">
                {[
                  { icon: MapPin, label: "Address", val: "Plot No. 2, Rajiv Gandhi Education City, Sonepat, Haryana – 131029, India" },
                  { icon: Phone, label: "Phone", val: "+91 0130 230 0000" },
                  { icon: Mail, label: "Email", val: "research@ashoka.edu.in" },
                  { icon: Globe, label: "Website", val: "www.ashoka.edu.in" },
                ].map(c => (
                  <li key={c.label} className="flex items-start gap-3">
                    <div className="w-8 h-8 bg-white border border-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
                      <c.icon className="w-4 h-4 text-slate-500" />
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-500 mb-0.5">{c.label}</div>
                      <div className="text-sm text-slate-700">{c.val}</div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className="border-t border-slate-200 bg-white py-6">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} Ashoka University Research Intelligence</span>
          <span className="text-xs text-slate-400">Data from <a href="https://openalex.org" target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">OpenAlex</a></span>
        </div>
      </footer>
    </div>
  );
}
