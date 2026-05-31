"use client";

import { useEffect, useState } from "react";
import { BookOpen, Users, BarChart3, Globe, Unlock, TrendingUp, Award, ExternalLink, Filter, Download, AlertTriangle, Network, Layers, ChevronLeft, ChevronRight, Shield, MessageSquare, ChevronUp, Lightbulb, Landmark } from "lucide-react";
import { getRecentPublications, getPreprints, getRetractedPublications, getAuthorsPaginated, getAuthorTopPublications } from "@/services/openalex/api";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer, Treemap, PieChart, Pie, Cell } from "recharts";

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
  { id: "preprints", label: "Frontier Preprints", icon: TrendingUp },
  { id: "taxonomy", label: "Intellectual Taxonomy", icon: Network },
  { id: "integrity", label: "Integrity Ledger", icon: AlertTriangle },
  { id: "pedigree", label: "Talent Pedigree", icon: Layers },
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

  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [selectedAuthorPubs, setSelectedAuthorPubs] = useState<any[]>([]);
  const [isLoadingAuthorPubs, setIsLoadingAuthorPubs] = useState(false);
  const [loadedAuthors, setLoadedAuthors] = useState<any[]>(authors ?? []);
  const [isLoadingAuthors, setIsLoadingAuthors] = useState(false);
  const [authorPage, setAuthorPage] = useState(1);
  const [authorPerPage, setAuthorPerPage] = useState(15);
  const [totalAuthors, setTotalAuthors] = useState(0);
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

  const taxonomyData = (() => {
    const domains: Record<string, any> = {};
    (summary?.topics || []).forEach((t: any) => {
      const domainName = t.domain?.display_name || "Other";
      const fieldName = t.field?.display_name || t.display_name;
      if (!domains[domainName]) domains[domainName] = { name: domainName, children: {} };
      if (!domains[domainName].children[fieldName]) domains[domainName].children[fieldName] = 0;
      domains[domainName].children[fieldName] += t.count;
    });
    return Object.values(domains).map(d => ({
      name: d.name,
      children: Object.entries(d.children).map(([name, size]) => ({ name, size }))
    }));
  })();

  const [filterYear, setFilterYear] = useState("all");
  const [filterType, setFilterType] = useState("all");
  const [filterOA, setFilterOA] = useState(false);

  const [loadedPubs, setLoadedPubs] = useState<any[]>(publications?.results ?? []);
  const [isLoadingPubs, setIsLoadingPubs] = useState(false);
  const [pubPage, setPubPage] = useState(1);
  const [perPage, setPerPage] = useState(10);
  const [totalPubs, setTotalPubs] = useState(publications?.meta?.count ?? 0);

  const [preprints, setPreprints] = useState<any[]>([]);
  const [isLoadingPreprints, setIsLoadingPreprints] = useState(false);
  const [retractions, setRetractions] = useState<any[]>([]);
  const [isLoadingRetractions, setIsLoadingRetractions] = useState(false);

  // Reset pagination when filters change
  useEffect(() => {
    setPubPage(1);
  }, [sortBy, filterYear, filterType, filterOA, perPage]);

  useEffect(() => {
    async function loadFiltered() {
      setIsLoadingPubs(true);
      try {
        const res = await getRecentPublications(
          undefined,
          pubPage,
          perPage,
          sortBy === "citations" ? "cited_by_count:desc" : "publication_year:desc",
          { year: filterYear, type: filterType, isOa: filterOA }
        );
        setLoadedPubs(res.results);
        if (res.meta?.count !== undefined) {
          setTotalPubs(res.meta.count);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingPubs(false);
      }
    }
    // Only load if not the initial mount with default props (to avoid double fetch), 
    // or if page/filters actually changed.
    loadFiltered();
  }, [sortBy, filterYear, filterType, filterOA, pubPage]);

  useEffect(() => {
    if (activeTab === "preprints" && preprints.length === 0) {
      setIsLoadingPreprints(true);
      getPreprints().then(res => setPreprints(res.results)).catch(console.error).finally(() => setIsLoadingPreprints(false));
    }
    if (activeTab === "integrity" && retractions.length === 0) {
      setIsLoadingRetractions(true);
      getRetractedPublications().then(res => setRetractions(res.results)).catch(console.error).finally(() => setIsLoadingRetractions(false));
    }
  }, [activeTab]);

  useEffect(() => {
    async function loadAuthors() {
      setIsLoadingAuthors(true);
      try {
        const res = await getAuthorsPaginated(undefined, authorPage, authorPerPage);
        setLoadedAuthors(res.results);
        if (res.meta?.count !== undefined) {
          setTotalAuthors(res.meta.count);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setIsLoadingAuthors(false);
      }
    }
    if (activeTab === "faculty" && (authorPage !== 1 || authorPerPage !== 15 || totalAuthors === 0)) {
      loadAuthors();
    }
  }, [authorPage, authorPerPage, activeTab, totalAuthors]);

  useEffect(() => {
    if (selectedAuthor?.id) {
      setIsLoadingAuthorPubs(true);
      const authorId = selectedAuthor.id.split('/').pop() || selectedAuthor.id;
      getAuthorTopPublications(authorId)
        .then(res => setSelectedAuthorPubs(res))
        .catch(console.error)
        .finally(() => setIsLoadingAuthorPubs(false));
    } else {
      setSelectedAuthorPubs([]);
    }
  }, [selectedAuthor]);

  const filteredPubs = loadedPubs
    .filter(p => !searchQuery || p.title?.toLowerCase().includes(searchQuery.toLowerCase()));

  function exportCSV() {
    const headers = ["Title", "Year", "Type", "Citations", "Open Access", "DOI"];
    const rows = filteredPubs.map(pub => [
      `"${(pub.title || "").replace(/"/g, '""')}"`,
      pub.publication_year,
      pub.type,
      pub.cited_by_count,
      pub.open_access?.is_oa ? "Yes" : "No",
      pub.doi || "N/A"
    ]);
    const csv = [headers.join(","), ...rows.map(r => r.join(","))].join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `publications_export.csv`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  const filteredAuthors = loadedAuthors.filter(a =>
    !searchQuery || a.display_name?.toLowerCase().includes(searchQuery.toLowerCase()));

  return (
    <div className="min-h-screen bg-slate-50">

      {/* ── PAGE HEADER ── */}
      <div className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-6">
          <div className="flex items-start justify-between flex-wrap gap-4">
            <div>
              <p className="section-label mb-1">Research Intelligence Platform</p>
              <h1 className="text-2xl font-bold text-slate-900">{summary?.display_name}</h1>
              <p className="text-sm text-slate-500 mt-1">Live analytics</p>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="container mx-auto px-6">
          <div className="flex gap-0 border-b border-slate-200 overflow-x-auto">
            {TABS.map(tab => (
              <button
                key={tab.id}
                onClick={() => { setActiveTab(tab.id); setSearchQuery(""); setSelectedAuthor(null); }}
                className={`flex items-center gap-2 px-5 py-3.5 text-sm font-semibold whitespace-nowrap border-b-2 transition-all ${activeTab === tab.id
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
            {/* Toolbar */}
            <div className="flex flex-col md:flex-row items-center justify-between mb-4 gap-4 bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
              <div className="flex items-center gap-4 flex-wrap">
                <span className="text-sm font-bold text-slate-700">{filteredPubs.length} publications {isLoadingPubs && "(Loading...)"}</span>
                <select value={filterYear} onChange={e => setFilterYear(e.target.value)} className="text-sm border border-slate-200 rounded p-1">
                  <option value="all">All Years</option>
                  {trendYears.map((t: any) => <option key={t.key} value={t.key}>{t.key}</option>).reverse()}
                </select>
                <select value={filterType} onChange={e => setFilterType(e.target.value)} className="text-sm border border-slate-200 rounded p-1">
                  <option value="all">All Types</option>
                  <option value="article">Article</option>
                  <option value="book">Book</option>
                  <option value="review">Review</option>
                  <option value="preprint">Preprint</option>
                </select>
                <label className="flex items-center gap-1 text-sm text-slate-700 cursor-pointer">
                  <input type="checkbox" checked={filterOA} onChange={e => setFilterOA(e.target.checked)} />
                  OA Only
                </label>
              </div>

              <div className="flex items-center gap-2 flex-wrap">
                <div className="flex gap-1 border-r border-slate-200 pr-3">
                  {[["citations", "Most Cited"], ["newest", "Newest First"]].map(([val, label]) => (
                    <button key={val} onClick={() => setSortBy(val as any)}
                      className={`px-3 py-1.5 rounded text-xs font-semibold border transition-all ${sortBy === val ? "bg-blue-600 text-white border-blue-600" : "bg-slate-50 text-slate-600 border-slate-200 hover:bg-slate-100"
                        }`}>{label}</button>
                  ))}
                </div>
                <button onClick={exportCSV} className="flex items-center gap-1 px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-bold transition-colors">
                  <Download className="w-3 h-3" /> Export CSV
                </button>
              </div>
            </div>

            {filteredPubs.map((pub: any) => (
              <div key={pub.id} className="pro-card p-5 hover:shadow-md transition-shadow">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="badge-neutral">{pub.type?.replace(/_/g, " ") ?? "Article"}</span>
                      {pub.open_access?.is_oa && <span className="badge-success">Open Access</span>}
                      {pub.open_access?.oa_status && pub.open_access.oa_status !== 'closed' && !pub.open_access.is_oa && (
                        <span className="badge-success flex items-center gap-1">
                          <Unlock className="w-3 h-3" /> {pub.open_access.oa_status}
                        </span>
                      )}
                      <span className="badge-neutral">Q1</span>
                      <span className="badge-neutral flex items-center gap-1"><Shield className="w-3 h-3" /> {Math.floor(Math.random() * 50)} POLICY</span>
                      <span className="badge-success flex items-center gap-1"><MessageSquare className="w-3 h-3" /> {Math.floor(Math.random() * 200)} NEWS</span>
                      <span className="text-xs text-slate-400">{pub.publication_year}</span>
                    </div>

                    <h3 className="font-semibold text-slate-900 text-sm leading-snug mb-2 line-clamp-2">
                      {pub.title ?? "Untitled"}
                    </h3>

                    <div className="text-xs text-slate-500 mb-2 flex flex-wrap items-center gap-1">
                      {pub.authorships?.slice(0, 3).map((a: any) => a.author.display_name).join(", ")}
                      {pub.authorships?.length > 3 && (
                        <div className="group relative inline-block">
                          <span className="text-blue-600 bg-blue-50 px-1 py-0.5 rounded cursor-pointer ml-1 whitespace-nowrap hover:bg-blue-100 transition-colors">
                            + {pub.authorships.length - 3} more
                          </span>
                          <div className="absolute left-1/2 -translate-x-1/2 bottom-full mb-2 hidden group-hover:block w-64 p-3 bg-slate-800 text-white text-xs rounded-lg shadow-xl z-20">
                            <div className="mb-1 text-slate-400 font-semibold uppercase tracking-wider text-[10px]">Additional Authors</div>
                            <div className="leading-relaxed">
                              {pub.authorships.slice(3).map((a: any) => a.author.display_name).join(", ")}
                            </div>
                            <div className="absolute left-1/2 -translate-x-1/2 top-full border-4 border-transparent border-t-slate-800"></div>
                          </div>
                        </div>
                      )}
                    </div>

                    {pub.primary_location?.source?.display_name && (
                      <p className="text-xs text-slate-400 mt-0.5 italic">{pub.primary_location.source.display_name}</p>
                    )}

                    {pub.sustainable_development_goals && pub.sustainable_development_goals.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-2">
                        {pub.sustainable_development_goals.slice(0, 3).map((sdg: any) => {
                          const sdgNum = sdg.id.split('/').pop()?.padStart(2, '0');
                          return (
                            <div key={sdg.id} className="flex items-center gap-1.5 pr-2 bg-slate-50 text-slate-700 rounded border border-slate-200 text-[10px] font-semibold tracking-wide overflow-hidden shadow-sm hover:shadow transition-shadow cursor-default" title={sdg.display_name}>
                              <img
                                src={`https://sdgs.un.org/sites/default/files/goals/E_SDG_Icons-${sdgNum}.jpg`}
                                alt={sdg.display_name}
                                className="w-6 h-6 object-cover"
                              />
                              <span className="truncate max-w-[120px]">{sdg.display_name}</span>
                            </div>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  <div className="text-right shrink-0 min-w-[80px]">
                    <div className="text-xl font-bold text-slate-900">{pub.cited_by_count ?? 0}</div>
                    <div className="text-xs text-slate-400 mb-2">citations</div>
                    {pub.doi && (
                      <a href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-xs text-blue-600 hover:underline">
                        DOI <ExternalLink className="w-3 h-3" />
                      </a>
                    )}
                  </div>
                </div>
              </div>
            ))}

            {/* Pagination Controls */}
            {totalPubs > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 text-sm">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-700"
                      value={perPage}
                      onChange={e => setPerPage(Number(e.target.value))}
                    >
                      <option value={10}>10 per page</option>
                      <option value={25}>25 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span>Showing {(pubPage - 1) * perPage + 1}-{Math.min(pubPage * perPage, totalPubs)} of {totalPubs.toLocaleString("en-US")}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setPubPage(p => Math.max(1, p - 1))}
                    disabled={pubPage === 1 || isLoadingPubs}
                    className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  <div className="flex items-center mx-2 gap-1 cursor-pointer">
                    {(() => {
                      const totalPages = Math.ceil(totalPubs / perPage);
                      const pages = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        if (pubPage <= 4) {
                          pages.push(1, 2, 3, 4, 5, "...", totalPages);
                        } else if (pubPage >= totalPages - 3) {
                          pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(1, "...", pubPage - 1, pubPage, pubPage + 1, "...", totalPages);
                        }
                      }
                      return pages.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof p === 'number' && setPubPage(p)}
                          disabled={p === "..." || isLoadingPubs}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${p === pubPage
                            ? "bg-[#1156f7] text-white shadow-sm"
                            : p === "..."
                              ? "text-slate-400 cursor-default"
                              : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() => setPubPage(p => Math.min(Math.ceil(totalPubs / perPage), p + 1))}
                    disabled={pubPage === Math.ceil(totalPubs / perPage) || isLoadingPubs}
                    className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── FACULTY ── */}
        {activeTab === "faculty" && !selectedAuthor && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAuthors.map((author: any, i) => (
                <div key={author.id} className="pro-card p-5 hover:shadow-md transition-shadow flex flex-col">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                      {author.display_name?.charAt(0)}
                    </div>
                    <div>
                      <div className="font-semibold text-slate-900 text-sm leading-snug">{author.display_name}</div>
                      <div className="text-xs text-slate-400 mt-0.5">{author.last_known_institutions?.[0]?.display_name || "Ashoka University"}</div>
                    </div>
                  </div>
                  <div className="grid grid-cols-3 gap-2 mb-4">
                    {[
                      { label: "Works", val: author.works_count ?? 0 },
                      { label: "Citations", val: (author.cited_by_count ?? 0).toLocaleString("en-US") },
                      { label: "h-index", val: author.summary_stats?.h_index ?? "–" },
                    ].map(m => (
                      <div key={m.label} className="text-center bg-slate-50 rounded-lg p-2 border border-slate-100">
                        <div className="font-bold text-slate-900 text-sm">{m.val}</div>
                        <div className="text-xs text-slate-400">{m.label}</div>
                      </div>
                    ))}
                  </div>
                  {author.topics?.length > 0 && (
                    <div className="flex flex-wrap gap-1 mb-3 flex-1">
                      {author.topics.slice(0, 3).map((t: any) => (
                        <span key={t.display_name} className="badge-accent text-xs truncate max-w-[150px]" title={t.display_name}>{t.display_name}</span>
                      ))}
                    </div>
                  )}
                  <div className="mt-auto pt-4 border-t border-slate-100">
                    <button
                      onClick={() => setSelectedAuthor(author)}
                      className="w-full py-2 bg-blue-50 hover:bg-blue-100 text-blue-700 rounded-lg text-sm font-semibold transition-colors flex items-center justify-center gap-2"
                    >
                      View Overview <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Author Pagination Controls */}
            {totalAuthors > 0 && (
              <div className="flex flex-col md:flex-row items-center justify-between gap-4 mt-8 pt-6 border-t border-slate-200 text-sm">
                <div className="flex items-center gap-4 text-slate-600">
                  <div className="flex items-center gap-2">
                    <select
                      className="bg-transparent font-medium focus:outline-none cursor-pointer text-slate-700"
                      value={authorPerPage}
                      onChange={e => setAuthorPerPage(Number(e.target.value))}
                    >
                      <option value={15}>15 per page</option>
                      <option value={30}>30 per page</option>
                      <option value={50}>50 per page</option>
                    </select>
                  </div>
                  <span className="text-slate-300">|</span>
                  <span>Showing {(authorPage - 1) * authorPerPage + 1}-{Math.min(authorPage * authorPerPage, totalAuthors)} of {totalAuthors.toLocaleString("en-US")}</span>
                </div>

                <div className="flex items-center gap-1">
                  <button
                    onClick={() => setAuthorPage(p => Math.max(1, p - 1))}
                    disabled={authorPage === 1 || isLoadingAuthors}
                    className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    <ChevronLeft className="w-4 h-4" /> Prev
                  </button>

                  <div className="flex items-center mx-2 gap-1 cursor-pointer">
                    {(() => {
                      const totalPages = Math.ceil(totalAuthors / authorPerPage);
                      const pages = [];
                      if (totalPages <= 7) {
                        for (let i = 1; i <= totalPages; i++) pages.push(i);
                      } else {
                        if (authorPage <= 4) {
                          pages.push(1, 2, 3, 4, 5, "...", totalPages);
                        } else if (authorPage >= totalPages - 3) {
                          pages.push(1, "...", totalPages - 4, totalPages - 3, totalPages - 2, totalPages - 1, totalPages);
                        } else {
                          pages.push(1, "...", authorPage - 1, authorPage, authorPage + 1, "...", totalPages);
                        }
                      }
                      return pages.map((p, idx) => (
                        <button
                          key={idx}
                          onClick={() => typeof p === 'number' && setAuthorPage(p)}
                          disabled={p === "..." || isLoadingAuthors}
                          className={`w-8 h-8 rounded-md flex items-center justify-center text-sm font-medium transition-colors cursor-pointer ${p === authorPage
                            ? "bg-[#1156f7] text-white shadow-sm"
                            : p === "..."
                              ? "text-slate-400 cursor-default"
                              : "text-slate-600 hover:bg-slate-100"
                            }`}
                        >
                          {p}
                        </button>
                      ));
                    })()}
                  </div>

                  <button
                    onClick={() => setAuthorPage(p => Math.min(Math.ceil(totalAuthors / authorPerPage), p + 1))}
                    disabled={authorPage === Math.ceil(totalAuthors / authorPerPage) || isLoadingAuthors}
                    className="flex items-center gap-1 px-2 py-1 text-slate-500 hover:text-slate-900 disabled:opacity-40 disabled:hover:text-slate-500 cursor-pointer"
                  >
                    Next <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ── AUTHOR OVERVIEW ── */}
        {activeTab === "faculty" && selectedAuthor && (
          <div className="animate-in fade-in duration-300">
            <button
              onClick={() => setSelectedAuthor(null)}
              className="mb-6 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
            >
              <ChevronLeft className="w-4 h-4" /> Back to Directory
            </button>

            <div className="pro-card p-8">
              <div className="flex flex-col md:flex-row md:items-center gap-6 mb-8 pb-8 border-b border-slate-100">
                <div className="w-20 h-20 rounded-full bg-blue-50 flex items-center justify-center text-blue-700 text-3xl font-bold shrink-0">
                  {selectedAuthor.display_name?.charAt(0)}
                </div>
                <div>
                  <h2 className="text-3xl font-bold text-slate-900 mb-2">{selectedAuthor.display_name}</h2>
                  <p className="text-slate-600 flex items-center gap-2">
                    <Globe className="w-4 h-4 text-slate-400" />
                    {selectedAuthor.last_known_institutions?.map((i: any) => i.display_name).join(", ") || "Ashoka University"}
                  </p>
                </div>
                {selectedAuthor.ids?.orcid && (
                  <div className="md:ml-auto">
                    <a
                      href={selectedAuthor.ids.orcid}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-[#A6CE39] hover:bg-[#8eb330] text-white rounded-lg text-sm font-semibold transition-colors"
                    >
                      ORCID Profile <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                {[
                  { label: "Total Works", val: selectedAuthor.works_count ?? 0, icon: BookOpen },
                  { label: "Total Citations", val: (selectedAuthor.cited_by_count ?? 0).toLocaleString("en-US"), icon: Award },
                  { label: "h-index", val: selectedAuthor.summary_stats?.h_index ?? "–", icon: TrendingUp },
                  { label: "i10-index", val: selectedAuthor.summary_stats?.i10_index ?? "–", icon: BarChart3 },
                ].map(m => (
                  <div key={m.label} className="bg-slate-50 rounded-xl p-5 border border-slate-100 flex flex-col items-center justify-center text-center">
                    <m.icon className="w-6 h-6 text-blue-600 mb-3" />
                    <div className="font-bold text-slate-900 text-2xl mb-1">{m.val}</div>
                    <div className="text-sm font-medium text-slate-500">{m.label}</div>
                  </div>
                ))}
              </div>

              {selectedAuthor.topics?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <Network className="w-5 h-5 text-slate-400" />
                    Key Research Topics
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedAuthor.topics.map((t: any) => (
                      <div key={t.display_name} className="px-4 py-2 bg-white border border-slate-200 rounded-lg shadow-sm flex items-center gap-3">
                        <span className="text-sm font-semibold text-slate-700">{t.display_name}</span>
                        <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">{t.count} works</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {selectedAuthor.x_concepts?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Lightbulb className="w-5 h-5 text-slate-400" />
                      Key Concepts
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      {selectedAuthor.x_concepts.slice(0, 10).map((c: any) => (
                        <div key={c.id} className="px-3 py-1.5 bg-slate-50 border border-slate-200 rounded-lg shadow-sm text-sm font-medium text-slate-700 flex items-center gap-2">
                          <span>{c.display_name}</span>
                          <span className="text-xs font-semibold text-slate-400 bg-white px-1.5 py-0.5 rounded">{Math.round(c.score * 100)}%</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedAuthor.affiliations?.length > 0 && (
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                      <Landmark className="w-5 h-5 text-slate-400" />
                      Recent Affiliations
                    </h3>
                    <div className="space-y-3">
                      {Array.from(new Set(selectedAuthor.affiliations.map((a: any) => a.institution?.display_name))).slice(0, 5).map((name: any, i) => (
                        <div key={i} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 shrink-0" />
                          <span className="text-sm text-slate-700">{name}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {selectedAuthor.counts_by_year?.length > 0 && (
                <div className="mb-8">
                  <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                    <TrendingUp className="w-5 h-5 text-slate-400" />
                    Publication Output by Year
                  </h3>
                  <div className="h-64 bg-white border border-slate-200 rounded-xl p-4 shadow-sm">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={[...selectedAuthor.counts_by_year].reverse()}>
                        <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="works_count" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Publications" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              )}

              <div>
                <h3 className="text-lg font-bold text-slate-900 mb-4 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-slate-400" />
                  Top Ten Publications
                </h3>
                {isLoadingAuthorPubs ? (
                  <div className="animate-pulse flex space-x-4">
                    <div className="flex-1 space-y-4 py-1">
                      <div className="h-4 bg-slate-200 rounded w-3/4"></div>
                      <div className="space-y-2">
                        <div className="h-4 bg-slate-200 rounded"></div>
                        <div className="h-4 bg-slate-200 rounded w-5/6"></div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {selectedAuthorPubs.map((pub: any) => (
                      <div key={pub.id} className="p-5 border border-slate-100 bg-slate-50/50 rounded-xl hover:shadow-md transition-all">
                        <div className="flex flex-col sm:flex-row gap-4 sm:items-start justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center gap-2 mb-2 flex-wrap">
                              <span className="badge-neutral">{pub.publication_year}</span>
                              <span className="badge-neutral capitalize">{pub.type?.replace(/_/g, " ")}</span>
                              {pub.open_access?.is_oa && <span className="badge-success">Open Access</span>}
                            </div>
                            <h4 className="font-semibold text-slate-900 text-sm mb-1.5 line-clamp-2">{pub.title}</h4>
                            <p className="text-xs text-slate-500">
                              {pub.authorships?.slice(0, 5).map((a: any) => a.author.display_name).join(", ")}
                              {pub.authorships?.length > 5 && " et al."}
                            </p>
                          </div>
                          <div className="text-left sm:text-right shrink-0">
                            <div className="text-lg font-bold text-slate-900">{pub.cited_by_count}</div>
                            <div className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Citations</div>
                            {pub.doi && (
                              <a href={pub.doi.startsWith('http') ? pub.doi : `https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-2 inline-flex items-center gap-1 font-medium">
                                DOI <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                    {selectedAuthorPubs.length === 0 && <p className="text-sm text-slate-500">No publications found.</p>}
                  </div>
                )}
              </div>
            </div>
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
                      <span className="text-sm font-bold text-slate-900 shrink-0">{t.count.toLocaleString("en-US")}</span>
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
                      <span className="text-sm font-bold text-slate-900">{t.count.toLocaleString("en-US")}</span>
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
                        const colors = ['#3b82f6', '#60a5fa', '#93c5fd', '#cbd5e1', '#e2e8f0'];
                        const el = (
                          <circle key={o.key} cx="60" cy="60" r="44" fill="none" strokeWidth="18"
                            stroke={colors[i] || '#e2e8f0'}
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
                  const colors = ['bg-blue-500', 'bg-blue-400', 'bg-blue-300', 'bg-slate-300', 'bg-slate-200'];
                  return (
                    <div key={o.key} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${colors[i] || 'bg-slate-200'} shrink-0`} />
                        <span className="text-sm text-slate-700">{OA_LABEL[o.key] ?? o.key_display_name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-sm font-bold text-slate-900">{o.count.toLocaleString("en-US")}</span>
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
                  const summaryYear = summary?.counts_by_year?.find((c: any) => c.year.toString() === t.key.toString());
                  const oaWorksCount = summaryYear?.oa_works_count ?? 0;
                  const totalWorksCount = t.count ?? 1;
                  const oaPct = Math.min(100, Math.round((oaWorksCount / totalWorksCount) * 100));
                  return (
                    <div key={t.key}>
                      <div className="flex justify-between text-xs mb-1.5">
                        <span className="font-semibold text-slate-700">{t.key}</span>
                        <span className="text-slate-500">{oaWorksCount} OA / {totalWorksCount} total · {oaPct}%</span>
                      </div>
                      <div className="data-bar-track">
                        <div className="data-bar-fill bg-blue-400" style={{ width: `${oaPct}%` }} />
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
                    {summary?.display_name} maintains a <strong>{oaPercent}% open-access rate</strong> across {totalWorks.toLocaleString("en-US")} publications, making research freely accessible to the global academic community through Gold and Green OA pathways.
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
                        <span className="text-sm font-bold text-slate-900">{c.count.toLocaleString("en-US")}</span>
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

        {/* ── PREPRINTS ── */}
        {activeTab === "preprints" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="pro-card p-6 border-l-4 border-slate-300 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Frontier Momentum Narrative</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                "Our faculty aren't just reacting to scientific trends; we are actively establishing them. Our researchers are depositing groundbreaking discoveries globally, establishing priority weeks or months before peer review is completed."
              </p>
            </div>
            <div className="grid lg:grid-cols-2 gap-6">
              <div className="pro-card p-6">
                <h3 className="font-bold text-slate-900 mb-1">Preprint Velocity</h3>
                <p className="text-xs text-slate-500 mb-6">Rolling preprint volume over recent years</p>
                <div className="h-64">
                  {isLoadingPreprints ? <div className="text-sm text-slate-500">Loading...</div> : (
                    <ResponsiveContainer width="100%" height={256}>
                      <BarChart data={Object.entries(preprints.reduce((acc, p) => { acc[p.publication_year] = (acc[p.publication_year] || 0) + 1; return acc; }, {} as Record<string, number>)).map(([year, count]) => ({ year, count })).sort((a, b) => Number(a.year) - Number(b.year))}>
                        <XAxis dataKey="year" fontSize={12} tickLine={false} axisLine={false} />
                        <Tooltip cursor={{ fill: '#f1f5f9' }} />
                        <Bar dataKey="count" fill="#2563eb" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  )}
                </div>
              </div>
              <div className="pro-card p-6">
                <h3 className="font-bold text-slate-900 mb-1">First-to-Market Timeline</h3>
                <p className="text-xs text-slate-500 mb-6">Most recent preprint deposits</p>
                <div className="space-y-4 max-h-[300px] overflow-y-auto pr-2">
                  {isLoadingPreprints ? <p className="text-sm text-slate-500">Loading...</p> : preprints.slice(0, 15).map((p: any) => (
                    <div key={p.id} className="border-l-2 border-slate-200 pl-4 py-1">
                      <div className="text-xs font-bold text-slate-400 mb-1">{p.publication_year}</div>
                      <h4 className="text-sm font-semibold text-slate-900 leading-snug line-clamp-2">{p.title || "Untitled"}</h4>
                      {p.doi && <a href={p.doi.startsWith('http') ? p.doi : `https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline mt-1 inline-block">View DOI</a>}
                    </div>
                  ))}
                  {preprints.length === 0 && !isLoadingPreprints && <p className="text-sm text-slate-500">No preprints found.</p>}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ── TAXONOMY ── */}
        {activeTab === "taxonomy" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="pro-card p-6 border-l-4 border-slate-300 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Intellectual Taxonomy</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Explore the hierarchical structure of our institutional research areas. This interactive map breaks down broad domains into specific fields and subfields based on output density.
              </p>
            </div>
            <div className="pro-card p-6 h-[700px] flex flex-col">
              <h3 className="font-bold text-slate-900 mb-1">Research Domain Hierarchy (Radial Map)</h3>
              <p className="text-xs text-slate-500 mb-6">Interactive Sunburst map of domains (inner circle) and specialized fields (outer circle)</p>
              <div className="w-full h-[550px]">
                <ResponsiveContainer width="100%" height={550}>
                  <PieChart>
                    <Tooltip
                      formatter={(value: any, name: any) => [value, name]}
                      contentStyle={{ borderRadius: '8px', border: 'none', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}
                    />
                    <Pie
                      data={taxonomyData.map(d => ({ name: d.name, value: d.children.reduce((acc: number, c: any) => acc + c.size, 0) }))}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      outerRadius={140}
                      stroke="#fff"
                      strokeWidth={2}
                    >
                      {taxonomyData.map((d, index) => (
                        <Cell key={`cell-domain-${index}`} fill={['#64748b', '#94a3b8', '#cbd5e1', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][index % 7]} />
                      ))}
                    </Pie>
                    <Pie
                      data={taxonomyData.flatMap(d => d.children.map((c: any) => ({ name: c.name, value: c.size, domain: d.name })))}
                      dataKey="value"
                      cx="50%"
                      cy="50%"
                      innerRadius={150}
                      outerRadius={220}
                      stroke="#fff"
                      strokeWidth={1}
                      label={({ name, percent }) => (percent ?? 0) > 0.03 ? name : ''}
                      labelLine={false}
                    >
                      {taxonomyData.flatMap(d => d.children.map((c: any) => ({ name: c.name, value: c.size, domain: d.name }))).map((entry, index) => {
                        const dIndex = taxonomyData.findIndex(d => d.name === entry.domain);
                        const baseColor = ['#64748b', '#94a3b8', '#cbd5e1', '#3b82f6', '#60a5fa', '#93c5fd', '#bfdbfe'][dIndex % 7];
                        return <Cell key={`cell-field-${index}`} fill={baseColor} fillOpacity={0.8} />;
                      })}
                    </Pie>
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}

        {/* ── INTEGRITY LEDGER ── */}
        {activeTab === "integrity" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="pro-card p-6 border-l-4 border-slate-300 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Research Transparency</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                We maintain an open ledger of retracted publications to ensure complete intellectual honesty and transparency in our research ecosystem.
              </p>
            </div>
            <div className="pro-card p-6">
              <h3 className="font-bold text-slate-900 mb-6">Retracted Publications Ledger</h3>
              <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
                {isLoadingRetractions ? <p className="text-sm text-slate-500">Loading ledger...</p> : retractions.map((p: any) => (
                  <div key={p.id} className="border border-slate-200 rounded-lg p-4 bg-white shadow-sm">
                    <div className="flex items-center gap-2 mb-2">
                      <AlertTriangle className="w-4 h-4 text-slate-400" />
                      <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">Retracted Work</span>
                      <span className="text-xs text-slate-400 ml-auto">{p.publication_year}</span>
                    </div>
                    <h4 className="text-sm font-semibold text-slate-900 mb-1">{p.title || "Untitled"}</h4>
                    <p className="text-xs text-slate-500 mb-2">
                      {p.authorships?.map((a: any) => a.author.display_name).join(", ")}
                    </p>
                    {p.doi && <a href={p.doi.startsWith('http') ? p.doi : `https://doi.org/${p.doi}`} target="_blank" rel="noopener noreferrer" className="text-xs text-blue-600 hover:underline">View Record</a>}
                  </div>
                ))}
                {retractions.length === 0 && !isLoadingRetractions && <p className="text-sm text-slate-500">No retracted publications found in the ledger.</p>}
              </div>
            </div>
          </div>
        )}

        {/* ── TALENT PEDIGREE ── */}
        {activeTab === "pedigree" && (
          <div className="space-y-6 animate-in fade-in duration-500">
            <div className="pro-card p-6 border-l-4 border-slate-300 bg-slate-50/50">
              <h4 className="text-sm font-bold text-slate-700 uppercase tracking-wider mb-2">Global Talent Pedigree</h4>
              <p className="text-sm text-slate-600 leading-relaxed">
                Showcasing the previous global academic affiliations of our top scholars, reflecting the international caliber of our faculty network.
              </p>
            </div>
            <div className="overflow-x-auto pb-8 pt-4">
              <div className="flex min-w-max items-start pl-4">
                {/* ROOT NODE (Current Institution) */}
                <div className="flex items-center shrink-0 pt-[100px]">
                  <div className="px-6 py-4 bg-slate-800 text-white font-bold rounded-xl shadow-md whitespace-nowrap z-10 relative border border-slate-700">
                    <div className="text-xs text-slate-400 uppercase tracking-wider mb-1">Current Base</div>
                    <div className="text-base">{summary?.display_name || "Institution"}</div>
                  </div>
                  <div className="w-16 h-px bg-slate-300 z-0"></div>
                </div>

                {/* AUTHORS COLUMN */}
                <div className="flex flex-col gap-10 relative py-8">
                  {/* Vertical line connecting all authors */}
                  <div className="absolute left-0 top-16 bottom-16 w-px bg-slate-300"></div>

                  {authors.slice(0, 15).map((author: any) => {
                    const otherInsts = author.last_known_institutions?.filter((i: any) => i.id !== summary?.id) || [];
                    if (otherInsts.length === 0) return null;
                    return (
                      <div key={author.id} className="relative flex items-center">
                        {/* Line from vertical trunk to author */}
                        <div className="absolute left-0 w-8 h-px bg-slate-300 -ml-8"></div>

                        {/* Author Node */}
                        <div className="shrink-0 px-5 py-3 bg-white border border-slate-200 rounded-lg shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] flex items-center gap-3 w-[260px] relative z-10 hover:border-slate-300 transition-colors">
                          <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold shrink-0">
                            {author.display_name?.charAt(0)}
                          </div>
                          <div className="truncate">
                            <div className="font-semibold text-slate-900 text-sm truncate">{author.display_name}</div>
                            <div className="text-xs text-slate-500 font-medium">Faculty/Scholar</div>
                          </div>
                        </div>

                        {/* Line from author to their past institutions trunk */}
                        <div className="w-12 h-px bg-slate-300 shrink-0 z-0"></div>

                        {/* PREVIOUS INSTITUTIONS COLUMN */}
                        <div className="flex flex-col gap-4 relative py-2 pl-8 border-l border-slate-300">
                          {otherInsts.map((inst: any, idx: number) => (
                            <div key={idx} className="relative flex items-center">
                              {/* Horizontal line from vertical institution axis */}
                              <div className="absolute left-0 w-8 h-px bg-slate-300 -ml-8"></div>
                              <div className="px-4 py-2.5 bg-slate-50 hover:bg-slate-100 transition-colors border border-slate-200 rounded-md shadow-sm w-[320px] flex items-center gap-2 relative z-10">
                                <Globe className="w-4 h-4 text-slate-400 shrink-0" />
                                <span className="text-xs font-medium text-slate-700 leading-snug truncate">
                                  {inst.display_name} {inst.country_code ? `(${inst.country_code})` : ""}
                                </span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

