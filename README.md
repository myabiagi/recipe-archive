# 🍳 Recipe Archive

A modern recipe management website built with **React**, **React Router**, and **Supabase**. This isn't just a list of ingredients; it's a dynamic culinary assistant designed to make cooking seamless and interactive.

## ✨ Key Features

*   **⚖️ Dynamic Portion Scaling:** Adjust serving sizes instantly. The app recalculates ingredient quantities automatically.
*   **📥 Smart Importing:** Import recipes via direct URLs or by pasting raw text.
*   **📂 Visual Organization:** Categorize your collection by meal type (Breakfast, Lunch, Dinner) or by Cuisine.

## 🛠️ Tech Stack

*   **Frontend:** [React 19](https://react.dev/) + [React Router 7](https://reactrouter.com/) + [TypeScript](https://www.typescriptlang.org/)
*   **Styling:** [Tailwind CSS v4](https://tailwindcss.com/)
*   **Backend/Database:** [Supabase](https://supabase.com/)
*   **Deployment:** [Vercel](https://vercel.com/)

## 🚀 Getting Started

### 📋 Prerequisites

*   [Node.js](https://nodejs.org/) (v18 or higher recommended)
*   [Git](https://git-scm.com/)

### Installation

1.  **Clone the repository:**
    ```bash
    git clone https://github.com/myabiagi/recipe-archive.git
    cd recipe-archive
    ```

2.  **Install dependencies:**
    ```bash
    npm install
    ```

3.  **Set up environment variables:**
    Create a `.env` file in the root directory:
    ```env
    VITE_SUPABASE_URL=your_supabase_url
    VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
    ```

4.  **Launch the app:**
    ```bash
    npm run dev
    ```

## ⚠️ Security Note

Never commit your `.env` file to version control. It is already included in the `.gitignore` to protect your Supabase credentials.
