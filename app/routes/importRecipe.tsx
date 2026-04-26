import { useState } from "react";
import { UrlImport } from "~/features/import/urlImport";
import { ManualImport } from "~/features/import/manualImport";

export default function ImportRecipe() {
  const [importMethod, setImportMethod] = useState<"url" | "manual">("url");

  return (
    <div className="max-w-4xl mx-auto py-12 px-6">
      <header className="mb-12 border-b-4 border-foreground pb-4">
        <h1 className="font-serif font-black text-5xl md:text-6xl uppercase italic tracking-tighter">
          Add Record.
        </h1>
        <div className="flex gap-8 mt-6 font-mono text-[10px] uppercase tracking-widest">
          <button 
            onClick={() => setImportMethod("url")}
            className={`pb-1 border-b-2 transition-colors cursor-pointer ${importMethod === "url" ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
          >
            via Dispatch (URL)
          </button>
          <button 
            onClick={() => setImportMethod("manual")}
            className={`pb-1 border-b-2 transition-colors cursor-pointer ${importMethod === "manual" ? "border-accent text-accent" : "border-transparent hover:text-accent"}`}
          >
            via Manuscript (Manual)
          </button>
        </div>
      </header>

      <div className="newsprint-texture p-8 border-2 border-foreground bg-white shadow-[8px_8px_0px_0px_rgba(0,0,0,1)]">
        {importMethod === "url" ? (
          <UrlImport />
        ) : (
          <ManualImport />
        )}
      </div>
    </div>
  );
}