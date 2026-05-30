"use client";

import { useState } from "react";
import { ExecutiveDashboard } from "@/components/executive/ExecutiveDashboard";
import { IntelligenceClient } from "@/components/intelligence/IntelligenceClient";
import { StorytellingProfile } from "@/components/storytelling/StorytellingProfile";
import { BookOpen, Users, ArrowRight, Unlock, Globe, MapPin, Phone, Mail } from "lucide-react";

interface PortalTabsProps {
  summary: any;
  authors: any[];
  trends: any[];
  publications: any;
  oaBreakdown: any[];
  worksByType: any[];
  countryCollabs: any[];
  totalAuthors: number;
}

export function PortalTabs(props: PortalTabsProps) {
  const [activeTab, setActiveTab] = useState("executive");
  const { summary, totalAuthors, oaBreakdown, countryCollabs } = props;

  const totalWorks = summary?.works_count ?? 0;
  const totalCitations = summary?.cited_by_count ?? 0;

  const totalOA = oaBreakdown.filter((o: any) => o.key !== "closed").reduce((s: number, o: any) => s + o.count, 0);
  const oaPercent = totalWorks > 0 ? Math.round((totalOA / totalWorks) * 100) : 0;
  const partnerCountries = countryCollabs.filter((c: any) => c.key !== "IN").length;

  return (
    <div className="flex flex-col min-h-screen">
      
      {/* ── HERO ── */}
      <section className="relative overflow-hidden border-b border-slate-200">
        <div className="absolute inset-0">
          <div
            className="absolute inset-0 bg-cover bg-center"
            style={{ backgroundImage: "url('https://images.unsplash.com/photo-1562774053-701939374585?q=80&w=2086&auto=format&fit=crop')" }}
          />
          <div className="absolute inset-0 bg-white/55" />
        </div>

        <div className="relative container mx-auto px-6 py-24 flex flex-col items-center text-center">
          <div className="flex items-center gap-3 mb-8">
            <img src="/logo.svg" alt="Ashoka University" className="h-14 w-auto drop-shadow-md" />
            <div className="w-px h-10 bg-slate-400/50" />
            <div className="text-left">
              <div className="text-xs font-bold text-blue-700 uppercase tracking-widest leading-tight">Research Intelligence Portal</div>
            </div>
          </div>

          <h1 className="text-4xl md:text-6xl font-bold text-slate-900 leading-tight mb-3 drop-shadow-sm">
            Ashoka University
          </h1>
          <h2 className="text-3xl md:text-5xl font-bold text-blue-700 leading-tight mb-6 drop-shadow-sm">
            Research Intelligence
          </h2>

          <p className="text-lg text-slate-700 max-w-2xl leading-relaxed">
            A comprehensive portal for understanding our research performance, scholarly output, and global impact — built for every stakeholder.
          </p>
        </div>
      </section>

      {/* ── IMPACT STATS ── */}
      <section className="bg-white border-b border-slate-200">
        <div className="container mx-auto px-6 py-12">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 divide-x divide-slate-200">
            {[
              { value: totalWorks.toLocaleString("en-US"), label: "Publications", sub: "Peer-reviewed research outputs", icon: BookOpen },
              { value: totalAuthors?.toLocaleString("en-US") ?? 0, label: "Scholars & Authors", sub: "Affiliated researchers", icon: Users },
              { value: totalCitations.toLocaleString("en-US"), label: "Total Citations", sub: "Referenced globally", icon: ArrowRight },
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

      {/* ── SUBNAV / TABS ── */}
      <div className="bg-white border-b border-slate-200 sticky top-0 z-50 shadow-sm">
        <div className="px-6">
          <div className="flex items-center justify-center gap-8 overflow-x-auto container mx-auto">
            {[
              { id: "executive", label: "Executive Dashboard" },
              { id: "intelligence", label: "Intelligence Platform" },
              { id: "storytelling", label: "Story Flow" }
            ].map(tab => (
              <button 
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 text-sm font-bold whitespace-nowrap transition-colors border-b-2 ${
                  activeTab === tab.id ? "border-blue-600 text-blue-700" : "border-transparent text-slate-500 hover:text-slate-900"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <main className="flex-1 flex flex-col relative bg-slate-50">
        {activeTab === "executive" && <ExecutiveDashboard {...props} />}
        {activeTab === "intelligence" && <IntelligenceClient {...props} />}
        {activeTab === "storytelling" && <StorytellingProfile {...props} />}
      </main>
      
      {/* ── ABOUT & CONTACT ── */}
      <section className="py-16 bg-white border-t border-slate-200">
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
              </div>
            </div>
            
            {/* ── CONTACTS ── */}
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
                    <div className="w-8 h-8 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-center shrink-0 mt-0.5">
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
      <footer className="border-t border-slate-200 bg-slate-50 py-6 mt-auto">
        <div className="container mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span className="text-xs text-slate-400">© {new Date().getFullYear()} Ashoka University Research Intelligence Portal</span>
        </div>
      </footer>
    </div>
  );
}

