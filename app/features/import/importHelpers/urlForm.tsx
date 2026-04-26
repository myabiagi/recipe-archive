interface UrlFormProps {
  url: string;
  setUrl: (val: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export function UrlForm({ url, setUrl, onSubmit, isLoading }: UrlFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <div>
        <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">
          Source Dispatch URL
        </label>
        <input 
          type="url"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
          placeholder="https://cooking.nytimes.com/..."
          className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm focus:bg-neutral-50 outline-none transition-colors"
          required
          disabled={isLoading}
        />
      </div>
      <button 
        disabled={isLoading}
        className="w-full py-4 bg-foreground text-background font-sans font-black uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-y-1 active:shadow-none text-xs disabled:opacity-50"
      >
        {isLoading ? (
          <span className="flex items-center justify-center gap-2">
            <span className="animate-pulse">Dispatching Scraper...</span>
          </span>
        ) : (
          "Extract Data"
        )}
      </button>
    </form>
  );
}