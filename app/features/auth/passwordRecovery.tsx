interface PasswordRecoveryProps {
  email: string;
  setEmail: (email: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  message: string | null;
  onBack: () => void;
}

export function PasswordRecovery({ email, setEmail, onSubmit, error, message, onBack }: PasswordRecoveryProps) {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">
          Email Address
        </label>
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm focus:bg-neutral-100 outline-none transition-colors"
          required
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
        Send Reset Link
      </button>
      <button onClick={onBack} className="block w-full font-serif italic text-sm hover:text-accent transition-colors underline underline-offset-4 cursor-pointer text-center">
        Back to Sign In
      </button>
    </form>
  );
}