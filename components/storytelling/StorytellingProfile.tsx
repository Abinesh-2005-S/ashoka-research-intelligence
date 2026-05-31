import { useState, useEffect } from "react";
import { ExternalLink, Globe, Unlock, ArrowRight, MapPin, Mail, Phone, BookOpen, Users, ChevronLeft, ChevronRight, TrendingUp, Award, BarChart3, Network, Lightbulb, Landmark } from "lucide-react";
import { getAuthorsPaginated, getAuthorTopPublications } from "@/services/openalex/api";
import { BarChart, Bar, XAxis, Tooltip, ResponsiveContainer } from "recharts";
const SDG_STORIES = [
  { id: 3, title: "Good Health & Well-Being", desc: "Epidemiology, public health, and behavioral medicine research at Ashoka is shaping evidence-based health policy across India." },
  { id: 4, title: "Quality Education", desc: "From curriculum reform to large-scale learning outcome studies, our scholars are redefining how India learns." },
  { id: 13, title: "Climate Action", desc: "Environmental economics, climate modelling, and biodiversity research advance both scientific understanding and policy advocacy." },
  { id: 10, title: "Reduced Inequalities", desc: "Rigorous work on caste, gender, and economic inclusion drives systemic conversations about equity in South Asia." },
  { id: 16, title: "Peace, Justice & Institutions", desc: "Legal scholars, political scientists, and sociologists collaborate on governance and democratic institution research." },
  { id: 9, title: "Industry, Innovation & Infrastructure", desc: "Computer science and data research drives innovation in AI, computational biology, and digital economics." },
];

export interface StorytellingProfileProps {
  summary: any;
  authors: any[];
  oaBreakdown: any[];
  countryCollabs: any[];
  publications: any;
}

export function StorytellingProfile({ summary, authors, oaBreakdown, countryCollabs, publications }: StorytellingProfileProps) {
  const totalWorks = summary?.works_count ?? 0;
  const totalOA = oaBreakdown.filter((o: any) => o.key !== "closed").reduce((s: number, o: any) => s + o.count, 0);
  const oaPercent = totalWorks > 0 ? Math.round((totalOA / totalWorks) * 100) : 0;
  const partnerCountries = countryCollabs.filter((c: any) => c.key !== "IN").length;
  const topPartners = countryCollabs.filter((c: any) => c.key !== "IN").slice(0, 3);
  const topPubs = (publications?.results ?? []).slice(0, 3);

  const [selectedAuthor, setSelectedAuthor] = useState<any>(null);
  const [selectedAuthorPubs, setSelectedAuthorPubs] = useState<any[]>([]);
  const [isLoadingAuthorPubs, setIsLoadingAuthorPubs] = useState(false);


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

  return (
    <div className="flex flex-col bg-white w-full animate-in fade-in duration-500">


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
                    <span className="text-xl font-bold text-slate-900">{(pub.cited_by_count ?? 0).toLocaleString("en-US")}</span>
                    <span className="text-xs text-slate-400 ml-1">citations</span>
                  </div>
                  {pub.doi && (
                    <a href={`https://doi.org/${pub.doi}`} target="_blank" rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs text-slate-600 font-medium hover:text-slate-900 hover:underline">
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
          <p className="text-slate-500 mb-10 max-w-xl">Researchers driving global scholarly impact.</p>

          {!selectedAuthor ? (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {authors.slice(0, 3).map((author: any) => (
                  <div key={author.id} className="pro-card p-5 hover:shadow-md transition-shadow flex flex-col">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="w-11 h-11 rounded-full bg-slate-100 flex items-center justify-center text-slate-700 font-bold text-lg shrink-0">
                        {author.display_name?.charAt(0)}
                      </div>
                      <div>
                        <div className="font-semibold text-slate-900 leading-tight">{author.display_name}</div>
                        <div className="text-xs text-slate-400 mt-0.5">{author.last_known_institutions?.[0]?.display_name || summary?.display_name}</div>
                      </div>
                    </div>
                    <div className="grid grid-cols-3 gap-2 mb-4">
                      {[
                        { l: "Works", v: author.works_count },
                        { l: "Citations", v: (author.cited_by_count ?? 0).toLocaleString("en-US") },
                        { l: "h-index", v: author.summary_stats?.h_index ?? "–" },
                      ].map(m => (
                        <div key={m.l} className="bg-slate-50 rounded-lg p-2 text-center border border-slate-100">
                          <div className="font-bold text-slate-900 text-sm">{m.v}</div>
                          <div className="text-xs text-slate-400">{m.l}</div>
                        </div>
                      ))}
                    </div>
                    {author.topics?.length > 0 && (
                      <div className="flex flex-wrap gap-1 mb-3 flex-1">
                        {author.topics.slice(0, 3).map((t: any) => (
                          <span key={t.display_name} className="badge-accent truncate max-w-[150px]" title={t.display_name}>{t.display_name}</span>
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


            </div>
          ) : (
            <div className="animate-in fade-in duration-300">
              <button
                onClick={() => setSelectedAuthor(null)}
                className="mb-6 flex items-center gap-1 text-sm font-semibold text-slate-500 hover:text-blue-600 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back to Faculty Voices
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
                      {selectedAuthor.last_known_institutions?.map((i: any) => i.display_name).join(", ") || summary?.display_name}
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
                <div className="flex items-start gap-4 mb-4">
                  <div className="w-16 h-16 shrink-0 rounded-md overflow-hidden border border-slate-100 shadow-sm">
                    <img src={`/sdg/${sdg.id}.jpg`} alt={`SDG ${sdg.id}`} className="w-full h-full object-cover" />
                  </div>
                  <div className="pt-1">
                    <div className="text-xs font-bold text-slate-500 uppercase tracking-wide mb-0.5">SDG {sdg.id}</div>
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
                Our researchers co-publish with scholars from {partnerCountries}+ countries, reflecting our commitment to producing internationally relevant knowledge.
              </p>
              <div className="flex flex-wrap gap-2">
                {topPartners.map((c: any) => (
                  <span key={c.key} className="badge-neutral">{c.key_display_name} · {c.count}</span>
                ))}
                {partnerCountries > 3 && (
                  <span className="badge-neutral">+{partnerCountries - 3} more</span>
                )}
              </div>
            </div>
            <div className="pro-card p-6">
              <div className="w-10 h-10 bg-slate-100 rounded-lg flex items-center justify-center mb-4">
                <Unlock className="w-5 h-5 text-slate-600" />
              </div>
              <h3 className="font-bold text-slate-900 mb-2">Open Science Pledge</h3>
              <div className="flex items-baseline gap-2 mb-3">
                <span className="text-4xl font-bold text-slate-900">{oaPercent}%</span>
                <span className="text-slate-500 text-sm">of publications are Open Access</span>
              </div>
              <p className="text-sm text-slate-600 leading-relaxed mb-4">
                {totalOA.toLocaleString("en-US")} out of {totalWorks.toLocaleString("en-US")} publications are freely available — ensuring knowledge reaches researchers, policymakers, and citizens worldwide.
              </p>
              <div className="data-bar-track h-3">
                <div className="data-bar-fill h-full" style={{ width: `${oaPercent}%` }} />
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

    </div>
  );
}

