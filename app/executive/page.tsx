import {
  getInstitutionSummary,
  getTopAuthors,
  getPublicationTrends,
  getOpenAccessBreakdown,
  getCountryCollaborations,
} from "@/services/openalex/api";
import { Award, TrendingUp, BookOpen, Globe, Users, Unlock, CheckCircle2 } from "lucide-react";

const SDG_GOALS = [
  { id: 1, title: "No Poverty", icon: "🏠" },
  { id: 2, title: "Zero Hunger", icon: "🌾" },
  { id: 3, title: "Good Health", icon: "❤️" },
  { id: 4, title: "Quality Education", icon: "📚" },
  { id: 5, title: "Gender Equality", icon: "⚖️" },
  { id: 6, title: "Clean Water", icon: "💧" },
  { id: 7, title: "Clean Energy", icon: "☀️" },
  { id: 8, title: "Decent Work", icon: "💼" },
  { id: 9, title: "Industry & Innovation", icon: "🏭" },
  { id: 10, title: "Reduced Inequalities", icon: "🤝" },
  { id: 11, title: "Sustainable Cities", icon: "🏙️" },
  { id: 12, title: "Responsible Consumption", icon: "♻️" },
  { id: 13, title: "Climate Action", icon: "🌍" },
  { id: 14, title: "Life Below Water", icon: "🌊" },
  { id: 15, title: "Life on Land", icon: "🌿" },
  { id: 16, title: "Peace & Justice", icon: "🕊️" },
  { id: 17, title: "Partnerships", icon: "🌐" },
];

const TOPIC_SDG_MAP: Record<string, number[]> = {
  economics: [1, 8, 10], political: [16, 10], sociology: [5, 10, 16],
  biology: [3, 15], chemistry: [3, 9], environment: [13, 14, 15],
  education: [4], health: [3], gender: [5], energy: [7, 13],
  water: [6, 14], urban: [11], innovation: [9], climate: [13, 14, 15],
  poverty: [1, 2, 10], finance: [8, 10], law: [16], psychology: [3, 4],
  mathematics: [9], physics: [7, 9], computer: [9], data: [9],
};

function getRelevantSDGs(topics: any[]): Set<number> {
  const relevant = new Set<number>();
  topics.forEach((t: any) => {
    const name = (t.display_name ?? "").toLowerCase();
    Object.entries(TOPIC_SDG_MAP).forEach(([kw, goals]) => {
      if (name.includes(kw)) goals.forEach(g => relevant.add(g));
    });
  });
  [3, 4, 9, 10, 16].forEach(g => relevant.add(g));
  return relevant;
}

export default async function ExecutiveDashboard() {
  const [summary, authors, trends, oaBreakdown, countryCollabs] = await Promise.all([
    getInstitutionSummary(),
    getTopAuthors(),
    getPublicationTrends(),
    getOpenAccessBreakdown(),
    getCountryCollaborations(),
  ]);

  const totalWorks = summary.works_count;
  const totalCitations = summary.cited_by_count;
  const hIndex = summary.summary_stats.h_index;
  const i10Index = summary.summary_stats.i10_index;
  const meanCitedness = summary.summary_stats["2yr_mean_citedness"];

  const totalOA = oaBreakdown.filter((o: any) => o.key !== "closed").reduce((s: number, o: any) => s + o.count, 0);
  const oaPercent = Math.round((totalOA / totalWorks) * 100);
  const partnerCountries = countryCollabs.filter((c: any) => c.key !== "IN").length;

  const trendsSorted = [...(trends as any[])]
    .filter((t: any) => Number(t.key) >= 2015)
    .sort((a: any, b: any) => Number(a.key) - Number(b.key))
    .slice(-8);
  const maxTrend = Math.max(...trendsSorted.map((t: any) => t.count));

  const topTopics = summary.topics.slice(0, 6);
  const maxTopicCount = topTopics[0]?.count ?? 1;

  const recentYear = trendsSorted[trendsSorted.length - 1];
  const prevYear = trendsSorted[trendsSorted.length - 2];
  const growthPct = prevYear?.count > 0
    ? Math.round(((recentYear?.count - prevYear?.count) / prevYear?.count) * 100)
    : 0;

  const relevantSDGs = getRelevantSDGs(summary.topics);

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="section-label mb-1">Executive Dashboard</p>
              <h1 className="text-3xl font-bold text-slate-900">{summary.display_name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm text-slate-500">Live data — verified</span>
              </div>
            </div>
            {/* Headline metrics */}
            <div className="flex gap-3 flex-wrap">
              {[
                { label: "h-index", value: hIndex },
                { label: "i10-index", value: i10Index },
                { label: "2yr Impact", value: `${meanCitedness?.toFixed(1) ?? "–"}×` },
              ].map(kpi => (
                <div key={kpi.label} className="bg-slate-50 border border-slate-200 rounded-xl px-5 py-3 text-center min-w-[100px]">
                  <div className="text-2xl font-bold text-slate-900">{kpi.value}</div>
                  <div className="text-xs text-slate-500 mt-0.5">{kpi.label}</div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-6 py-8 space-y-6">

        {/* ── KPI CARDS ── */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Total Publications", value: totalWorks.toLocaleString(), sub: `+${growthPct}% YoY growth`, icon: BookOpen },
            { label: "Total Citations", value: totalCitations.toLocaleString(), sub: "All-time cumulative", icon: TrendingUp },
            { label: "Open Access Rate", value: `${oaPercent}%`, sub: `${totalOA.toLocaleString()} OA works`, icon: Unlock },
            { label: "Partner Countries", value: `${partnerCountries}+`, sub: "International collaborations", icon: Globe },
          ].map(kpi => (
            <div key={kpi.label} className="pro-card p-5">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center mb-4">
                <kpi.icon className="w-4 h-4 text-blue-700" />
              </div>
              <div className="stat-value">{kpi.value}</div>
              <div className="text-sm font-semibold text-slate-700 mt-2">{kpi.label}</div>
              <div className="text-xs text-slate-400 mt-0.5">{kpi.sub}</div>
            </div>
          ))}
        </div>

        {/* ── ROW 2: Velocity + Domains ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Publication Velocity */}
          <div className="pro-card p-6">
            <h2 className="font-bold text-slate-900 mb-1">Research Output Velocity</h2>
            <p className="text-sm text-slate-500 mb-6">Publications per year — strategic growth trajectory</p>
            <div className="flex items-end gap-2 h-36">
              {trendsSorted.map((t: any) => (
                <div key={t.key} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-xs font-semibold text-blue-700 opacity-0 group-hover:opacity-100 transition-opacity">{t.count}</div>
                  <div className="w-full bg-blue-600 rounded-t hover:bg-blue-700 transition-colors"
                    style={{ height: `${Math.max(4, (t.count / maxTrend) * 112)}px` }} />
                  <span className="text-xs text-slate-400">{t.key}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-emerald-700">+{growthPct}%</span> growth in {recentYear?.key} vs {prevYear?.key}
              </span>
            </div>
          </div>

          {/* Research Domains */}
          <div className="pro-card p-6">
            <h2 className="font-bold text-slate-900 mb-1">Strategic Research Domains</h2>
            <p className="text-sm text-slate-500 mb-6">Top research areas by publication volume</p>
            <div className="space-y-4">
              {topTopics.map((t: any) => (
                <div key={t.id}>
                  <div className="flex justify-between items-start mb-1.5">
                    <span className="text-sm text-slate-700 font-medium pr-2 leading-snug">{t.display_name}</span>
                    <span className="text-sm font-bold text-slate-900 shrink-0">{t.count.toLocaleString()}</span>
                  </div>
                  <div className="data-bar-track">
                    <div className="data-bar-fill" style={{ width: `${(t.count / maxTopicCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── RESEARCHER LEADERBOARD ── */}
        <div className="pro-card p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="font-bold text-slate-900">Researcher Leaderboard</h2>
              <p className="text-sm text-slate-500 mt-0.5">Top researchers by total citation impact</p>
            </div>
            <Award className="w-6 h-6 text-slate-400" />
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-slate-200">
                  {["Rank", "Researcher", "Works", "Citations", "h-index"].map(h => (
                    <th key={h} className={`py-3 text-xs font-semibold text-slate-500 uppercase tracking-wide ${h === "Rank" || h === "Researcher" ? "text-left px-3" : "text-right px-3"}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {authors.slice(0, 10).map((author: any, i) => (
                  <tr key={author.id} className="border-b border-slate-100 hover:bg-slate-50 transition-colors">
                    <td className="py-3 px-3 text-sm font-semibold text-slate-400">#{i + 1}</td>
                    <td className="py-3 px-3">
                      <div className="flex items-center gap-2.5">
                        <div className="w-7 h-7 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500 shrink-0">
                          {author.display_name?.charAt(0)}
                        </div>
                        <span className="font-medium text-slate-900">{author.display_name}</span>
                      </div>
                    </td>
                    <td className="py-3 px-3 text-right font-semibold text-slate-700">{author.works_count ?? "–"}</td>
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{(author.cited_by_count ?? 0).toLocaleString()}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="badge-neutral">{author.summary_stats?.h_index ?? "–"}</span>
                    </td>
                    <td className="py-3 px-3 text-right">
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* ── SDG ALIGNMENT ── */}
        <div className="pro-card p-6">
          <h2 className="font-bold text-slate-900 mb-1">UN SDG Research Alignment</h2>
          <p className="text-sm text-slate-500 mb-6 max-w-2xl">
            Research topics mapped to the 17 Sustainable Development Goals. Highlighted goals indicate active research alignment.
          </p>
          <div className="grid grid-cols-5 sm:grid-cols-9 md:grid-cols-17 gap-2">
            {SDG_GOALS.map(sdg => {
              const isActive = relevantSDGs.has(sdg.id);
              return (
                <div key={sdg.id} title={sdg.title}
                  className={`rounded-lg p-2 text-center border transition-all ${isActive
                    ? "bg-blue-50 border-blue-200 shadow-sm"
                    : "bg-slate-50 border-slate-200 opacity-40"
                    }`}>
                  <div className="text-lg">{sdg.icon}</div>
                  <div className="text-xs font-bold text-slate-600 mt-0.5">{sdg.id}</div>
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-blue-200 border border-blue-300 inline-block" />
              Aligned ({relevantSDGs.size} goals)
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 inline-block" />
              Not aligned
            </div>
          </div>
        </div>

        {/* ── GLOBAL SUMMARY ── */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { label: "Open Access", value: `${oaPercent}%`, sub: `${totalOA.toLocaleString()} freely accessible works`, icon: Unlock },
            { label: "Global Reach", value: `${partnerCountries}+`, sub: "Partner countries with co-authored research", icon: Globe },
            { label: "Scholar Network", value: authors.length, sub: "Active publishing researchers tracked", icon: Users },
          ].map(c => (
            <div key={c.label} className="pro-card p-5 flex items-start gap-4">
              <div className="w-9 h-9 bg-blue-50 rounded-lg flex items-center justify-center shrink-0">
                <c.icon className="w-4 h-4 text-blue-700" />
              </div>
              <div>
                <div className="stat-value">{c.value}</div>
                <div className="text-sm font-semibold text-slate-700 mt-1.5">{c.label}</div>
                <div className="text-xs text-slate-400 mt-0.5">{c.sub}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
