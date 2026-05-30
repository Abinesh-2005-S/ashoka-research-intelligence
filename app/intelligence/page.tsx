import {
  getInstitutionSummary,
  getTopAuthors,
  getPublicationTrends,
  getRecentPublications,
  getOpenAccessBreakdown,
  getWorksByType,
  getCountryCollaborations,
} from "@/services/openalex/api";
import { IntelligenceClient } from "@/components/intelligence/IntelligenceClient";

export default async function IntelligencePlatform() {
  const [summary, authors, trends, publications, oaBreakdown, worksByType, countryCollabs] = await Promise.all([
    getInstitutionSummary(),
    getTopAuthors(),
    getPublicationTrends(),
    getRecentPublications(undefined, 1, 50, "cited_by_count:desc"),
    getOpenAccessBreakdown(),
    getWorksByType(),
    getCountryCollaborations(),
  ]);

  return (
    <IntelligenceClient
      summary={summary}
      authors={authors}
      trends={trends}
      publications={publications}
      oaBreakdown={oaBreakdown}
      worksByType={worksByType}
      countryCollabs={countryCollabs}
    />
  );
}
