import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    const { error } = isSignUp 
      ? await supabase.auth.signUp({ email, password })
      : await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      setError(error.message);
    } else {
      navigate("/");
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setEmail("");
    setPassword("");
    setError(null);
  };

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="p-8 border-4 border-foreground bg-background">
        <h1 className="font-serif text-4xl font-black uppercase italic mb-2 text-center">
          {isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 text-center mb-10">
          Edition: {isSignUp ? "New Member" : "Returning Member"}
        </p>

        <form onSubmit={handleAuth} className="space-y-4">
          <div>
            <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Email Address</label>
            <input 
              type="email" 
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-sm focus:bg-neutral-100 outline-none transition-colors"
              required
            />
          </div>
          <div>
            <label className="font-sans text-[10px] font-black uppercase tracking-widest block mb-2">Password</label>
            <input 
              type="password" 
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent border-b-2 border-foreground py-2 font-mono text-sm focus:bg-neutral-100 outline-none transition-colors"
              required
            />
          </div>
          
          {error && <p className="font-mono text-accent text-[10px] uppercase">{error}</p>}

          <button type="submit" className="w-full py-4 bg-foreground text-background font-sans font-black uppercase tracking-widest hover:bg-accent transition-colors">
            {isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <button onClick={toggleAuthMode} className="w-full mt-8 font-serif italic text-sm hover:text-accent transition-colors underline underline-offset-4 cursor-pointer">
          {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
        </button>
      </div>
    </div>
  );
}