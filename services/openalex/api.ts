export const OPENALEX_API_BASE = "https://api.openalex.org";
export const ASHOKA_ID = "I347237974";

export interface InstitutionSummary {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  country_code: string;
  homepage_url: string;
  image_url: string;
  summary_stats: {
    h_index: number;
    i10_index: number;
    "2yr_mean_citedness": number;
  };
  counts_by_year: Array<{
    year: number;
    works_count: number;
    oa_works_count: number;
    cited_by_count: number;
  }>;
  topics: Array<{
    id: string;
    display_name: string;
    count: number;
    subfield?: { display_name: string };
    field?: { display_name: string };
    domain?: { display_name: string };
  }>;
  roles: Array<{ role: string; id: string; works_count: number }>;
}

export interface Publication {
  id: string;
  title: string;
  publication_year: number;
  type: string;
  cited_by_count: number;
  open_access: { is_oa: boolean; oa_status: string };
  primary_location: {
    source?: { display_name: string; host_organization_name?: string };
  };
  authorships: Array<{ author: { display_name: string } }>;
  doi: string;
  biblio: { volume?: string; issue?: string; first_page?: string };
  sustainable_development_goals?: Array<{ id: string; display_name: string; score: number }>;
}

export interface Author {
  id: string;
  display_name: string;
  works_count: number;
  cited_by_count: number;
  summary_stats: { h_index: number; i10_index: number };
  last_known_institutions: Array<{ display_name: string }>;
  topics: Array<{ display_name: string; count: number }>;
}

const cache = new Map<string, { data: unknown; ts: number }>();
const TTL = 3600_000;

async function cachedFetch<T>(url: string): Promise<T> {
  const hit = cache.get(url);
  if (hit && Date.now() - hit.ts < TTL) return hit.data as T;
  const res = await fetch(url, { next: { revalidate: 3600 } });
  if (!res.ok) throw new Error(`OpenAlex fetch failed: ${url}`);
  const data = await res.json();
  cache.set(url, { data, ts: Date.now() });
  return data;
}

export async function getInstitutionSummary(id: string = ASHOKA_ID): Promise<InstitutionSummary> {
  return cachedFetch(`${OPENALEX_API_BASE}/institutions/${id}`);
}

export async function getPublicationTrends(id: string = ASHOKA_ID) {
  const data = await cachedFetch<{ group_by: unknown[] }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=publication_year`
  );
  return data.group_by;
}

export async function getTopAuthors(id: string = ASHOKA_ID): Promise<Author[]> {
  const data = await cachedFetch<{ results: Author[] }>(
    `${OPENALEX_API_BASE}/authors?filter=affiliations.institution.id:${id}&sort=cited_by_count:desc&per-page=15`
  );
  return data.results;
}

export async function getInstitutionAuthorsCount(id: string = ASHOKA_ID): Promise<number> {
  const data = await cachedFetch<{ meta: { count: number } }>(
    `${OPENALEX_API_BASE}/authors?filter=affiliations.institution.id:${id}&per-page=1`
  );
  return data.meta?.count ?? 0;
}

export async function getRecentPublications(
  id: string = ASHOKA_ID,
  page = 1,
  perPage = 25,
  sortBy: "cited_by_count:desc" | "publication_year:desc" = "cited_by_count:desc",
  filters?: { year?: string; type?: string; isOa?: boolean }
): Promise<{ results: Publication[]; meta: { count: number; page: number; per_page: number } }> {
  let filterStr = `institutions.id:${id}`;
  if (filters?.year && filters.year !== "all") filterStr += `,publication_year:${filters.year}`;
  if (filters?.type && filters.type !== "all") filterStr += `,type:${filters.type}`;
  if (filters?.isOa) filterStr += `,is_oa:true`;

  return cachedFetch(
    `${OPENALEX_API_BASE}/works?filter=${filterStr}&sort=${sortBy}&page=${page}&per-page=${perPage}&select=id,title,publication_year,type,cited_by_count,open_access,primary_location,authorships,doi,biblio,is_retracted,sustainable_development_goals`
  );
}

export async function getPreprints(id: string = ASHOKA_ID) {
  return cachedFetch<{ results: Publication[], meta: any }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id},type:preprint&sort=publication_year:desc&per-page=15`
  );
}

export async function getRetractedPublications(id: string = ASHOKA_ID) {
  return cachedFetch<{ results: Publication[], meta: any }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id},is_retracted:true&sort=publication_year:desc&per-page=15`
  );
}

export async function getOpenAccessBreakdown(id: string = ASHOKA_ID) {
  const data = await cachedFetch<{ group_by: Array<{ key: string; key_display_name: string; count: number }> }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=open_access.oa_status`
  );
  return data.group_by;
}

export async function getCountryCollaborations(id: string = ASHOKA_ID) {
  const data = await cachedFetch<{ group_by: Array<{ key: string; key_display_name: string; count: number }> }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=authorships.countries`
  );
  return data.group_by;
}

export async function getWorksByType(id: string = ASHOKA_ID) {
  const data = await cachedFetch<{ group_by: Array<{ key: string; key_display_name: string; count: number }> }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=type`
  );
  return data.group_by;
}

export async function getTopCollaboratingInstitutions(id: string = ASHOKA_ID) {
  const data = await cachedFetch<{ group_by: unknown[] }>(
    `${OPENALEX_API_BASE}/works?filter=institutions.id:${id}&group_by=institutions.id`
  );
  return data.group_by;
}
