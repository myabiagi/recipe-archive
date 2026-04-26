interface UpdatePasswordFormProps {
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  message: string | null;
}

export function UpdatePasswordForm({ password, setPassword, onSubmit, error, message }: UpdatePasswordFormProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">
          New Archive Password
        </label>
        <input
          type="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm focus:bg-neutral-100 outline-none transition-colors"
          required
          placeholder="••••••••"
        />
      </div>

      {(error || message) && (
        <div className="py-2">
          {error ? <p className="font-mono text-accent text-[10px] uppercase">{error}</p> : <p className="font-mono text-accent text-[10px] uppercase">{message}</p>}
        </div>
      )}

      <button
        type="submit"
        className="w-full py-4 bg-foreground text-background font-sans font-black uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer"
      >
        Authorize New Password
      </button>
    </form>
  );
}