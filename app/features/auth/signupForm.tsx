interface SignupFormProps {
  email: string;
  setEmail: (email: string) => void;
  password: string;
  setPassword: (password: string) => void;
  onSubmit: (e: React.FormEvent) => void;
  error: string | null;
  message: string | null;
  onToggleSignIn: () => void;
}

export function SignupForm({ email, setEmail, password, setPassword, onSubmit, error, message, onToggleSignIn }: SignupFormProps) {
  return (
    <div className="space-y-4">
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Email Address</label>
          <input 
            type="email" 
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm focus:bg-neutral-100 outline-none transition-colors"
            required
          />
        </div>
        <div>
          <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Password</label>
          <input 
            type="password" 
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-[16px] md:text-sm focus:bg-neutral-100 outline-none transition-colors"
            required
          />
        </div>

        {(error || message) && (
          <div className="py-2">
            {error ? <p className="font-mono text-accent text-[10px] uppercase">{error}</p> : <p className="font-mono text-accent text-[10px] uppercase">{message}</p>}
          </div>
        )}

        <button type="submit" className="w-full py-4 bg-foreground text-background font-sans font-black uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer">
          Register Record
        </button>
      </form>

      <div className="mt-8 space-y-2 text-center">
        <button 
          onClick={onToggleSignIn} 
          className="block w-full font-serif italic text-sm hover:text-accent transition-colors underline underline-offset-4 cursor-pointer text-center"
        >
          Already have an account? Sign In
        </button>
      </div>
    </div>
  );
}