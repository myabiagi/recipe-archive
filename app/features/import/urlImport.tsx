import { useState } from "react";

export function UrlImport() {
  const [url, setUrl] = useState("");

  const handleUrlSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Logic for scraping will go here
    console.log("Scraping URL:", url);
  };

  return (
    <form onSubmit={handleUrlSubmit} className="space-y-6">
      <div>
        <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-4">
          Source Dispatch URL
        </label>
        <input 
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://cooking.nytimes.com/..."
          className="w-full bg-transparent border-b-2 border-foreground py-4 font-mono text-lg focus:bg-neutral-50 outline-none transition-colors"
          required
        />
      </div>
      <button className="w-full py-4 bg-foreground text-background font-sans font-black uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer">
        Extract Data
      </button>
    </form>
  );
}