# 🎓 Ashoka University - Research Intelligence Portal

A modern, highly optimized, and clean academic analytics dashboard built to monitor and present the research performance, publication outputs, citation impacts, and global collaborations of Ashoka University.

Built with **Next.js 15 (React)**, **TypeScript**, **Tailwind CSS**, and **Shadcn UI**, powered by live open-access research data from **[OpenAlex API](https://openalex.org/)**.

---

## 📊 1. Data Sources & Integration (Where the Data Comes From)

The portal relies completely on **live, real-time scholarly data** from **[OpenAlex](https://openalex.org/)**, a massive, free, and open catalog of the world's scholarly papers, researchers, journals, and institutions. 

- **Primary Institution ID**: `I347237974` (This is the unique identifier for **Ashoka University** in the global OpenAlex database).
- **Base Endpoint**: `https://api.openalex.org`
- **Data Model File**: All data fetching and caching logic is centrally located in [services/openalex/api.ts](file:///d:/mini%20porject/Institutional%20Public%20Profile/services/openalex/api.ts).

### Caching Mechanism & Optimizations:
- **In-Memory Caching**: The application implements an in-memory TTL (Time-To-Live) cache of **1 hour (3600 seconds)** in `cachedFetch()` to avoid hitting OpenAlex rate limits and to make the website load instantly for visitors.
- **Next.js Revalidation**: The portal also uses Next.js ISR (Incremental Static Regeneration) fetch parameters (`next: { revalidate: 3600 }`) to ensure data freshness on the server-side.

---

## ⚙️ 2. Detailed Data Mapping

Below is a breakdown of every data category shown in the UI and the exact OpenAlex API endpoint used to query it:

### A. University Overview & Profile Stats
- **Endpoint**: `/institutions/I347237974`
- **Extracted Data**:
  - Official Name: `display_name` ("Ashoka University")
  - Total Works Count: `works_count` (Total number of publications)
  - Total Citations Count: `cited_by_count` (Total citations received globally)
  - Key Metrics: `summary_stats.h_index` (H-Index) and `summary_stats.i10_index` (i10-Index)
  - Logo / Image: `image_url`

### B. Publication Trends
- **Endpoint**: `/works?filter=institutions.id:I347237974&group_by=publication_year`
- **Extracted Data**: Returns a list of publication counts grouped chronologically by calendar year (e.g., how many papers were published in 2023, 2024, 2025, etc.). Used to render the growth charts.

### C. Top Contributing Authors & Scholars
- **Endpoint**: `/authors?filter=affiliations.institution.id:I347237974&sort=cited_by_count:desc&per-page=15`
- **Extracted Data**: Returns the top 15 researchers affiliated with Ashoka University sorted by their total global citations. Displays their names, citation counts, publication counts, H-indices, and primary fields of expertise.

### D. Recent & Key Publications
- **Endpoint**: `/works?filter=institutions.id:I347237974&sort=cited_by_count:desc&select=id,title,publication_year,type,cited_by_count,open_access,primary_location,authorships,doi,biblio`
- **Extracted Data**: A paginated list of all research articles, books, and conference proceedings, showing authorship teams, publishing journals, publication years, DOI links, and open-access designations.

### E. Open Access (OA) Breakthrough
- **Endpoint**: `/works?filter=institutions.id:I347237974&group_by=open_access.oa_status`
- **Extracted Data**: Groups all works by their open-access status (`gold`, `green`, `bronze`, `hybrid`, or `closed`) to measure the university's compliance with open science initiatives.

### F. Global Collaboration Network
- **Endpoint**: `/works?filter=institutions.id:I347237974&group_by=authorships.countries`
- **Extracted Data**: Groups publications by the home countries of collaborating co-authors, showing the reach of Ashoka's international research partnerships.

### G. Publications by Document Type
- **Endpoint**: `/works?filter=institutions.id:I347237974&group_by=type`
- **Extracted Data**: Groups the institutional outputs by material type (e.g., `journal-article`, `book-chapter`, `dataset`, `conference-proceeding`).

---

## 🎨 3. UI Design System & Architecture

The portal employs a clean, professional, light-themed aesthetic optimized for executive reporting:
- **Core Layout & Navigation**: The application uses a Dashboard Shell that remains persistent. Users can navigate smoothly between sub-sections without losing their position or encountering dead ends, with clear back-to-dashboard controls.
- **Visual Palette**: Neutral colors, clean card layouts, and subtle shadows emphasize readability. 
- **Typography & Brand Identity**: The Ashoka University brand identity is prominently represented, with the institutional logo and research context placed in a balanced header configuration.

---

## 🛠️ 4. Tech Stack & Environment

- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript
- **Styling**: Tailwind CSS & Vanilla CSS variables
- **Component System**: Radix UI (Shadcn)
- **Icons**: Lucide React
- **Deployment**: Configured for Netlify (`netlify.toml` included)

---

## 💻 5. Getting Started Locally

### 1. Prerequisites
Ensure you have **Node.js 22+** installed on your machine.

### 2. Install Dependencies
```bash
npm install
```

### 3. Run Development Server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your browser to view the application locally.

### 4. Build for Production
```bash
npm run build
```

---

## 🌐 6. Netlify Deployment

The project is pre-configured with a custom `netlify.toml` and Next.js build plugins. Every time you push changes to your GitHub repository:
1. Netlify automatically detects the push.
2. It builds the Next.js app using `npm run build`.
3. It serves the build out of the `.next` publish folder.
