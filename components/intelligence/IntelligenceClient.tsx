"use client";

import { useState } from "react";
import { BookOpen, Users, BarChart3, Globe, Unlock, TrendingUp, Award, ExternalLink, Filter } from "lucide-react";

interface Props {
  summary: any;
  authors: any[];
  trends: any[];
  publications: any;
  oaBreakdown: any[];
  worksByType: any[];
  countryCollabs: any[];
}

const TABS = [
  { id: "publications", label: "Publications Feed", icon: BookOpen },
  { id: "faculty", label: "Faculty Directory", icon: Users },
  { id: "disciplines", label: "Disciplines", icon: BarChart3 },
  { id: "openscience", label: "Open Science", icon: Unlock },
  { id: "collaborations", label: "Collaborations", icon: Globe },
];

const OA_LABEL: Record<string, string> = {
  gold: "Gold OA", green: "Green OA", hybrid: "Hybrid OA",
  bronze: "Bronze OA", closed: "Closed Access", diamond: "Diamond OA",
};

const COUNTRY_FLAGS: Record<string, string> = {
  US: "🇺🇸", IN: "🇮🇳", GB: "🇬🇧", DE: "🇩🇪", FR: "🇫🇷",
  CN: "🇨🇳", CA: "🇨🇦", AU: "🇦🇺", NL: "🇳🇱", SG: "🇸🇬",
  JP: "🇯🇵", IT: "🇮🇹", BR: "🇧🇷", CH: "🇨🇭", SE: "🇸🇪",
  ES: "🇪🇸", KR: "🇰🇷", IL: "🇮🇱", ZA: "🇿🇦", NG: "🇳🇬",
};

export function IntelligenceClient({
  summary, authors, trends, publications, oaBreakdown, worksByType, countryCollabs,
}: Props) {
  const [activeTab, setActiveTab] = useState("publications");
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState<"citations" | "newest">("citations");

  const pubs: any[] = publications?.results ?? [];
  const totalWorks = summary?.works_count ?? 0;
  const totalCitations = summary?.cited_by_count ?? 0;
  const hIndex = summary?.summary_stats?.h_index ?? 0;
  const totalOA = oaBreakdown.filter((o: any) => o.key !== "closed").reduce((s: number, o: any) => s + o.count, 0);
  const oaPercent = totalWorks > 0 ? Math.round((totalOA / totalWorks) * 100) : 0;

  const topTypes = [...worksByType].sort((a, b) => b.count - a.count).slice(0, 7);
  const maxTypeCount = topTypes[0]?.count ?? 1;
  const topOATypes = [...oaBreakdown].sort((a, b) => b.count - a.count).slice(0, 5);
  const topCountries = [...countryCollabs].filter(c => c.key !== "IN").sort((a, b) => b.count - a.count).slice(0, 12);
  const maxCollabCount = topCountries[0]?.count ?? 1;
  const topTopics = (summary?.topics ?? []).slice(0, 12);
  const maxTopicCount = topTopics[0]?.count ?? 1;

  const trendYears = [...(trends as any[])]
    .filter((t: any) => Number(t.key) >= 2015)
    .sort((a: any, b: any) => Number(a.key) - Number(b.key))
    .slice(-10);
  const maxPubYear = Math.max(...trendYears.map((t: any) => t.count));

  const filteredPubs = pubs
    .filter(p => !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()))
    .sort((a, b) => sortBy === "citations"
      ? (b.cited_by_count ?? 0) - (a.cited_by_count ?? 0)
      : (b.publication_year ?? 0) - (a.publication_year ?? 0));

  const filteredAuthors = authors.filter(a =>
    !searchQuery || a.display_name.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="section-label mb-1">Research Intelligence Platform</p>
              <h1 className="text-2xl font-bold text-slate-900">{summary?.display_name}</h1>
              <p className="text-sm text-slate-500 mt-1">Live analytics powered by OpenAlex</p>
            </div>
            {/* KPI Strip */}
            <div className="flex items-center gap-6 flex-wrap">
              {[
                { label: "Publications", value: totalWorks.toLocaleString(), icon: BookOpen },
                { label: "Citations", value: totalCitations.toLocaleString(), icon: TrendingUp },
                { label: "h-index", value: hIndex, icon: Award },
                { label: "Open Access", value: `${oaPercent}%`, icon: Unlock },
              ].map(kpi => (
                <div key={kpi.label} className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                    <kpi.icon className="w-4 h-4 text-blue-700" />
                  </div>
                  <div>
                    <div className="text-lg font-bold text-slate-900 leading-none">{kpi.value}</div>
                    <div className="text-xs text-slate-500">{kpi.label}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-6">
          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(""); }}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-blue-600 text-blue-700"
                    : "border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8">

        {/* Search (publications + faculty) */}
        {(activeTab === "publications" || activeTab === "faculty") && (
          <div className="relative mb-6">
            <Filter className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text" value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              placeholder={activeTab === "publications" ? "Filter publications by title…" : "Filter faculty by name…"}
              className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-200 shadow-sm"
            />
          </div>
        )}

        {/* ── PUBLICATIONS ── */}
        {activeTab === "publications" && (
          <div className="space-y-3">
            <div className="flex items-center justify-between mb-4 flex-wrap gap-3">
              <span className="text-sm text-slate-500">{filteredPubs.length} publications</span>
              <div className="flex gap-2">
                {[["citations", "Most Cited"], ["newest", "Newest First"]].map(([val, label]) => (
                  <button key={val} onClick={() => setSortBy(val as any)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                      sortBy === val ? "bg-slate-900 text-white border-slate-900" : "bg-white text-slate-600 border-slate-200 hover:bg-slate-50"
                    }`}>{label}</button>
                ))}
              </div>
            </div>

            {filteredPubs.map((pub: any) => (
              <div key={pub.id} className="pro-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="badge-neutral">{pub.type?.replace(/_/g, " ") ?? "Article"}</span>
                      {pub.open_access?.is_oa && <span className="badge-success">Open Access</span>}
                      <span className="text-xs text-slate-400">{pub.publication_year}</span>
                    </div>
                    <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">{pub.title ?? "Untitled"}</h3>
                    <p className="text-xs text-slate-500 line-clamp-1">
                      {pub.authorships?.slice(0, 3).map((a: any) => a.author.display_name).join(", ")}
                      {pub.authorships?.length > 3 ? ` +${pub.authorships.length - 3} more` : ""}
                    </p>
                    {pub.primary_location?.source?.display_name && (
                      <p className="text-xs text-slate-400 mt-0.5 italic">{pub.primary_location.source.display_name}</p>
                    )}
                  </div>
                  <div className="text-right shrink-0 min-w-[80px]">
                    <div className="text-xl font-bold text-slate-900">{pub.cited_by_count ?? 0}</div>
                    <div className="text-xs text-slate-400 mb-2">citations</div>
                    {pub.doi && (
                      <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        DOI <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── FACULTY ── */}
        {activeTab === "faculty" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredAuthors.map((author: any, i) => (
              <div key={author.id} className="pro-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                    {author.display_name?.charAt(0)}
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 text-sm leading-snug">{author.display_name}</div>
                    <div className="text-xs text-slate-400 mt-0.5">Ashoka University</div>
                  </div>
                </div>
                <div className="grid grid-cols-3 gap-2 mb-4">
                  {[
                    { label: "Works", val: author.works_count ?? 0 },
                    { label: "Citations", val: (author.cited_by_count ?? 0).toLocaleString() },
                    { label: "h-index", val: author.summary_stats?.h_index ?? "–" },
                  ].map(m => (
                    <div key={m.label} className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                      <div className="font-bold text-slate-900 text-sm">{m.val}</div>
                      <div className="text-xs text-slate-400">{m.label}</div>
                    </div>
                  ))}
                </div>
                {author.topics?.length > 0 && (
                  <div className="flex flex-wrap gap-1 mb-3">
                    {author.topics.slice(0, 3).map((t: any) => (
                      <span key={t.display_name} className="badge-accent text-xs">{t.display_name}</span>
                    ))}
                  </div>
                )}
                <div className="flex items-center justify-between pt-3 border-t border-slate-100">
                  <span className="text-xs text-slate-400">#{i + 1} by citations</span>
                  <a href={`https://openalex.org/authors/${author.id?.split("/").pop()}`} target="_blank" rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                    OpenAlex <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ── DISCIPLINES ── */}
        {activeTab === "disciplines" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* Research Areas */}
            <div className="pro-card p-6">
              <h2 className="font-bold text-slate-900 mb-1">Research Areas</h2>
              <p className="text-sm text-slate-500 mb-6">Ranked by publication count</p>
              <div className="space-y-4">
                {topTopics.map((t: any) => (
                  <div key={t.id}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-700 font-medium truncate pr-2">{t.display_name}</span>
                      <span className="text-sm font-bold text-slate-900 shrink-0">{t.count.toLocaleString()}</span>
                    </div>
                    <div className="data-bar-track">
                      <div className="data-bar-fill" style={{ width: `${(t.count / maxTopicCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Article Types */}
            <div className="pro-card p-6">
              <h2 className="font-bold text-slate-900 mb-1">Article Type Distribution</h2>
              <p className="text-sm text-slate-500 mb-6">Publication output by research type</p>
              <div className="space-y-3">
                {topTypes.map((t: any) => (
                  <div key={t.key}>
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-sm text-slate-700 font-medium capitalize">{(t.key_display_name ?? t.key).replace(/-/g, " ")}</span>
                      <span className="text-sm font-bold text-slate-900">{t.count.toLocaleString()}</span>
                    </div>
                    <div className="data-bar-track">
                      <div className="data-bar-fill bg-slate-600" style={{ width: `${(t.count / maxTypeCount) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Publication Velocity */}
            <div className="pro-card p-6 lg:col-span-2">
              <h2 className="font-bold text-slate-900 mb-1">Publication Velocity</h2>
              <p className="text-sm text-slate-500 mb-6">Annual research output, 2015 to present</p>
              <div className="flex items-end gap-2 h-40">
                {trendYears.map((t: any) => (
                  <div key={t.key} className="flex-1 flex flex-col items-center gap-1 group">
                    <div className="text-xs font-semibold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">{t.count}</div>
                    <div className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                      style={{ height: `${Math.max(4, (t.count / maxPubYear) * 128)}px` }} />
                    <span className="text-xs text-slate-400">{t.key}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* ── OPEN SCIENCE ── */}
        {activeTab === "openscience" && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

            {/* OA Breakdown */}
            <div className="pro-card p-6">
              <h2 className="font-bold text-slate-900 mb-1">Open Access Breakdown</h2>
              <p className="text-sm text-slate-500 mb-6">Distribution of access status across all publications</p>
              <div className="flex justify-center mb-6">
                <div className="relative flex items-center justify-center">
                  <svg viewBox="0 0 120 120" className="w-36 h-36">
                    {(() => {
                      let offset = 0;
                      const circ = 2 * Math.PI * 44;
                      return topOATypes.map((o: any, i: number) => {
                        const pct = o.count / totalWorks;
                        const dash = pct * circ;
                        const colors = ["#2563eb","#059669","#64748b","#94a3b8","#cbd5e1"];
                        const el = (
                          <circle key={o.key} cx="60" cy="60" r="44" fill="none" strokeWidth="18"
                            stroke={colors[i]}
                            strokeDasharray={`${dash} ${circ}`}
                            strokeDashoffset={-offset}
                            transform="rotate(-90 60 60)" />
                        );
                        offset += dash;
                        return el;
                      });
                    })()}
                    <text x="60" y="55" textAnchor="middle" fontSize="20" fontWeight="700" fill="#0f172a">{oaPercent}%</text>
                    <text x="60" y="70" textAnchor="middle" fontSize="9" fill="#64748b">Open Access</text>
                  </svg>
                </div>
              </div>
              <div className="space-y-3">
                {topOATypes.map((o: any, i: number) => {
                  const colors = ["bg-blue-600","bg-emerald-600","bg-slate-500","bg-slate-400","bg-slate-300"];
                  return (
                    <div key={o.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[i]} shrink-0`} />
                        <span className="text-sm text-slate-700">{OA_LABEL[o.key] ?? o.key_display_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">{o.count.toLocaleString()}</span>
                        <span className="text-xs text-slate-400 ml-1">({Math.round((o.count / totalWorks) * 100)}%)</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* OA Over Time */}
            <div className="pro-card p-6">
              <h2 className="font-bold text-slate-900 mb-1">Open Access Over Time</h2>
              <p className="text-sm text-slate-500 mb-6">OA share per year — growth trajectory</p>
              <div className="space-y-3">
                {[...trendYears].reverse().map((t: any) => {
                  const oaPct = Math.min(100, Math.round(((t.oa_works_count ?? 0) / (t.count ?? 1)) * 100));
                  return (
                    <div key={t.key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">{t.key}</span>
                        <span className="text-slate-500">{t.oa_works_count ?? 0} OA / {t.count} total · {oaPct}%</span>
                      </div>
                      <div className="data-bar-track">
                        <div className="data-bar-fill bg-emerald-600" style={{ width: `${oaPct}%` }} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Pledge banner */}
            <div className="lg:col-span-2 bg-blue-50 border border-blue-100 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center shrink-0">
                  <Unlock className="w-5 h-5 text-blue-700" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 mb-1">Open Science Commitment</h3>
                  <p className="text-sm text-slate-600 leading-relaxed">
                    {summary?.display_name} maintains a <strong>{oaPercent}% open-access rate</strong> across {totalWorks.toLocaleString()} publications, making research freely accessible to the global academic community through Gold and Green OA pathways.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── COLLABORATIONS ── */}
        {activeTab === "collaborations" && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

            <div className="lg:col-span-2 pro-card p-6">
              <h2 className="font-bold text-slate-900 mb-1">International Collaboration Network</h2>
              <p className="text-sm text-slate-500 mb-6">Top partner countries by co-authored publications (excluding India)</p>
              <div className="space-y-4">
                {topCountries.map((c: any) => (
                  <div key={c.key} className="flex items-center gap-3">
                    <span className="text-xl w-8 text-center shrink-0">{COUNTRY_FLAGS[c.key] ?? "🌍"}</span>
                    <div className="flex-1">
                      <div className="flex justify-between mb-1.5">
                        <span className="text-sm font-medium text-slate-700">{c.key_display_name}</span>
                        <span className="text-sm font-bold text-slate-900">{c.count.toLocaleString()}</span>
                      </div>
                      <div className="data-bar-track">
                        <div className="data-bar-fill" style={{ width: `${(c.count / maxCollabCount) * 100}%` }} />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-4">
              <div className="pro-card p-6">
                <div className="w-10 h-10 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                  <Globe className="w-5 h-5 text-blue-700" />
                </div>
                <div className="stat-value">{topCountries.length}+</div>
                <div className="stat-label">Partner Countries</div>
                <p className="text-xs text-slate-400 mt-2">Active international research collaborations</p>
              </div>
              <div className="pro-card p-5">
                <h3 className="text-sm font-bold text-slate-900 mb-3">Top Partners</h3>
                {topCountries.slice(0, 5).map((c: any, i) => (
                  <div key={c.key} className="flex items-center gap-3 py-2 border-b border-slate-100 last:border-0">
                    <span className="text-xs text-slate-400 w-4">#{i + 1}</span>
                    <span>{COUNTRY_FLAGS[c.key] ?? "🌍"}</span>
                    <span className="text-sm text-slate-700 flex-1">{c.key_display_name}</span>
                    <span className="text-xs font-bold text-slate-900">{c.count}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
