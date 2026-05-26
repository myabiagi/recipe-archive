# 🍳 Recipe Archive: Digital Editorial Vault

A "Newsprint" inspired recipe management system. Built with editorial precision, this vault allows users to archive, scale, and organize their private collections using automated data extraction and a robust relational engine.

**[Live Demo](https://recipe-archive-mb.vercel.app/)**

## ✨ Key Features

*   **📥 Smart Dispatch Import:** Automated recipe extraction using serverless Edge Functions to parse JSON-LD structured data from any culinary domain.
*   **📝 Manuscript Parser:** A custom regex-powered engine that transforms raw, unstructured text into organized relational database records.
*   **⚖️ Geometric Scaling:** Instant recalculation of ingredient ratios based on serving adjustments with decimal-to-fraction normalization.
*   **📂 Editorial Organization:** High-density broadsheet layout for categorizing records by cuisine and course type.

## 🏗️ Core Architecture

*   **Frontend:** React 19 + React Router 7 (Framework Mode)
*   **Serverless Logic:** Supabase Edge Functions (Deno) for bypassing CORS and executing backend scraping.
*   **Database:** PostgreSQL with Row-Level Security (RLS) and Unique Constraints for data integrity.
*   **Data Engine:** Robust Regular Expression (Regex) patterns for Unicode fraction normalization (e.g., ½ → 1/2) and unit shorthand conversion.

## 🛠️ Tech Stack

*   **Frontend:** [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/) + [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Backend/Database:** [Supabase](https://supabase.com/)
*   **Deployment:** [Vercel](https://vercel.app/)
*   **Runtime:** [Deno](https://deno.com/)

## 🚀 Getting Started

1.  **Clone & Install:**
    ```bash
    git clone https://github.com/myabiagi/recipe-archive.git
    cd recipe-archive
    npm install
    ```

2.  **Environment Configuration:**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

3.  **Deploy Edge Functions (Optional for local dev):**
    ```bash
    npx supabase login
    npx supabase link --project-ref your_project_id
    npx supabase functions deploy scrape-recipe
    ```

4.  **Start Development Server:**
    ```bash
    npm run dev
    ```

## 🛡️ Archive Integrity
The archive utilizes **PostgreSQL Unique Constraints** to prevent duplicate record logging. It enforces a case-insensitive title check and unique source URL validation per user to maintain a clean, high-quality collection.
