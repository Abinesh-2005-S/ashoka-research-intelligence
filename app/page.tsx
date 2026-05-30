import {
  getInstitutionSummary,
  getTopAuthors,
  getPublicationTrends,
  getRecentPublications,
  getOpenAccessBreakdown,
  getWorksByType,
  getCountryCollaborations,
  getInstitutionAuthorsCount,
} from "@/services/openalex/api";
import { PortalTabs } from "@/components/portal/PortalTabs";

export default async function Home() {
  const [
    summary,
    authors,
    trends,
    publications,
    oaBreakdown,
    worksByType,
    countryCollabs,
    totalAuthors
  ] = await Promise.all([
    getInstitutionSummary(),
    getTopAuthors(),
    getPublicationTrends(),
    getRecentPublications(undefined, 1, 50, "cited_by_count:desc"),
    getOpenAccessBreakdown(),
    getWorksByType(),
    getCountryCollaborations(),
    getInstitutionAuthorsCount(),
  ]);

  return (
    <PortalTabs 
      summary={summary}
      authors={authors}
      trends={trends}
      publications={publications}
      oaBreakdown={oaBreakdown}
      worksByType={worksByType}
      countryCollabs={countryCollabs}
      totalAuthors={totalAuthors}
    />
  );
}
