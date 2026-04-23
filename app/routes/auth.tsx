import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignUp, setIsSignUp] = useState(false);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (isForgotPassword) {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) {
        setError(error.message);
      } else {
        setMessage("A recovery link has been dispatched to your email address.");
      }
      return;
    }

    if (isSignUp) {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) {
        setError(error.message);
      } else if (data.user && !data.session) {
        setMessage("Account created. Please check your email if confirmation is required.");
      } else {
        navigate("/");
      }
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setError(error.message);
      } else {
        navigate("/");
      }
    }
  };

  const toggleAuthMode = () => {
    setIsSignUp(!isSignUp);
    setIsForgotPassword(false);
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
  };

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="p-8 border-4 border-foreground bg-background">
        <h1 className="font-serif text-4xl font-black uppercase italic mb-2 text-center">
          {isForgotPassword ? "Reset Password" : isSignUp ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 text-center mb-10">
          Edition: {isForgotPassword ? "Recovery Mode" : isSignUp ? "New Member" : "Returning Member"}
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
          {!isForgotPassword && (
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
          )}
          
          {error && <p className="font-mono text-accent text-[10px] uppercase">{error}</p>}
          {message && <p className="font-mono text-accent text-[10px] uppercase">{message}</p>}

          <button type="submit" className="w-full py-4 bg-foreground text-background font-sans font-black uppercase tracking-widest hover:bg-accent transition-colors cursor-pointer">
            {isForgotPassword ? "Send Reset Link" : isSignUp ? "Sign Up" : "Sign In"}
          </button>
        </form>

        <div className="mt-8 space-y-2 text-center">
          <button onClick={toggleAuthMode} className="block w-full font-serif italic text-sm hover:text-accent transition-colors underline underline-offset-4 cursor-pointer text-center">
            {isSignUp ? "Already have an account? Sign In" : "Don't have an account? Sign Up"}
          </button>
          {!isSignUp && (
            <button 
              onClick={() => { setIsForgotPassword(!isForgotPassword); setError(null); setMessage(null); }} 
              className="block w-full font-serif italic text-sm hover:text-accent transition-colors underline underline-offset-4 cursor-pointer text-center"
            >
              {isForgotPassword ? "Back to Sign In" : "Forgot your password?"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}