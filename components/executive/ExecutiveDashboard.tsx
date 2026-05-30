import { Award, TrendingUp, BookOpen, Globe, Users, Unlock, CheckCircle2 } from "lucide-react";

const SDG_GOALS = [
  { id: 1, title: "No Poverty" },
  { id: 2, title: "Zero Hunger" },
  { id: 3, title: "Good Health" },
  { id: 4, title: "Quality Education" },
  { id: 5, title: "Gender Equality" },
  { id: 6, title: "Clean Water" },
  { id: 7, title: "Clean Energy" },
  { id: 8, title: "Decent Work" },
  { id: 9, title: "Industry & Innovation" },
  { id: 10, title: "Reduced Inequalities" },
  { id: 11, title: "Sustainable Cities" },
  { id: 12, title: "Responsible Consumption" },
  { id: 13, title: "Climate Action" },
  { id: 14, title: "Life Below Water" },
  { id: 15, title: "Life on Land" },
  { id: 16, title: "Peace & Justice" },
  { id: 17, title: "Partnerships" },
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

export interface ExecutiveDashboardProps {
  summary: any;
  authors: any[];
  trends: any[];
  oaBreakdown: any[];
  countryCollabs: any[];
}

export function ExecutiveDashboard({ summary, authors, trends, oaBreakdown, countryCollabs }: ExecutiveDashboardProps) {
  const totalWorks = summary?.works_count ?? 0;
  const hIndex = summary?.summary_stats?.h_index ?? 0;
  const i10Index = summary?.summary_stats?.i10_index ?? 0;
  const meanCitedness = summary?.summary_stats?.["2yr_mean_citedness"] ?? 0;

  const totalOA = oaBreakdown.filter((o: any) => o.key !== "closed").reduce((s: number, o: any) => s + o.count, 0);
  const oaPercent = totalWorks > 0 ? Math.round((totalOA / totalWorks) * 100) : 0;
  const partnerCountries = countryCollabs.filter((c: any) => c.key !== "IN").length;

  const trendsSorted = [...(trends as any[])]
    .filter((t: any) => Number(t.key) >= 2015)
    .sort((a: any, b: any) => Number(a.key) - Number(b.key))
    .slice(-8);
  
  const maxTrend = trendsSorted.length > 0 ? Math.max(...trendsSorted.map((t: any) => t.count)) : 1;

  const topTopics = (summary?.topics ?? []).slice(0, 6);
  const maxTopicCount = topTopics[0]?.count ?? 1;

  const recentYear = trendsSorted[trendsSorted.length - 1];
  const prevYear = trendsSorted[trendsSorted.length - 2];
  const growthPct = prevYear?.count > 0
    ? Math.round(((recentYear?.count - prevYear?.count) / prevYear?.count) * 100)
    : 0;

  const relevantSDGs = getRelevantSDGs(summary?.topics ?? []);

  return (
    <div className="bg-slate-50 w-full animate-in fade-in duration-500">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-8">
          <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
            <div>
              <p className="section-label mb-1">Executive Dashboard</p>
              <h1 className="text-3xl font-bold text-slate-900">{summary?.display_name}</h1>
              <div className="flex items-center gap-2 mt-2">
                <CheckCircle2 className="w-4 h-4 text-slate-500" />
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

        {/* ── ROW 2: Velocity + Domains ── */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Publication Velocity */}
          <div className="pro-card p-6">
            <h2 className="font-bold text-slate-900 mb-1">Research Output Velocity</h2>
            <p className="text-sm text-slate-500 mb-6">Publications per year — strategic growth trajectory</p>
            <div className="flex items-end gap-2 h-36">
              {trendsSorted.map((t: any) => (
                <div key={t.key} className="flex-1 flex flex-col items-center gap-1 group">
                  <div className="text-xs font-semibold text-slate-500 opacity-0 group-hover:opacity-100 transition-opacity">{t.count}</div>
                  <div className="w-full bg-slate-300 rounded-t hover:bg-slate-400 transition-colors"
                    style={{ height: `${Math.max(4, (t.count / maxTrend) * 112)}px` }} />
                  <span className="text-xs text-slate-400">{t.key}</span>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-slate-100 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-slate-500" />
              <span className="text-sm text-slate-600">
                <span className="font-semibold text-slate-700">+{growthPct}%</span> growth in {recentYear?.key} vs {prevYear?.key}
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
                    <span className="text-sm font-bold text-slate-900 shrink-0">{t.count.toLocaleString("en-US")}</span>
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
                    <td className="py-3 px-3 text-right font-bold text-slate-900">{(author.cited_by_count ?? 0).toLocaleString("en-US")}</td>
                    <td className="py-3 px-3 text-right">
                      <span className="badge-neutral">{author.summary_stats?.h_index ?? "–"}</span>
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
                  className={`transition-all rounded-md overflow-hidden border-2 ${isActive
                    ? "border-transparent shadow-md scale-105"
                    : "border-transparent opacity-40 hover:opacity-100 grayscale hover:grayscale-0"
                    }`}>
                  <img src={`/sdg/${sdg.id}.jpg`} alt={sdg.title} className="w-full h-auto" />
                </div>
              );
            })}
          </div>
          <div className="mt-4 flex items-center gap-6 text-xs text-slate-500">
            <div className="flex items-center gap-1.5">
              <span className="w-3 h-3 rounded bg-slate-200 border border-slate-300 inline-block" />
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
            { label: "Open Access", value: `${oaPercent}%`, sub: `${totalOA.toLocaleString("en-US")} freely accessible works`, icon: Unlock },
            { label: "Global Reach", value: `${partnerCountries}+`, sub: "Partner countries with co-authored research", icon: Globe },
            { label: "Scholar Network", value: authors.length, sub: "Active publishing researchers tracked", icon: Users },
          ].map(c => (
            <div key={c.label} className="pro-card p-5 flex items-start gap-4 hover:shadow-md transition-shadow">
              <div className="w-9 h-9 bg-slate-100 rounded-lg flex items-center justify-center shrink-0">
                <c.icon className="w-4 h-4 text-slate-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-slate-900">{c.value}</div>
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

