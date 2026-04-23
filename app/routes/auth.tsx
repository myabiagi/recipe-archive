import { useState } from "react";
import { useNavigate } from "react-router";
import { supabase } from "~/lib/supabase";
import { LoginForm } from "../features/auth/loginForm";
import { SignupForm } from "../features/auth/signupForm";
import { PasswordRecovery } from "../features/auth/passwordRecovery";

export default function Auth() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [view, setView] = useState<"login" | "signup" | "recovery">("login");
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const navigate = useNavigate();

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (view === "recovery") {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth`,
      });
      if (error) setError(error.message);
      else setMessage("A recovery link has been dispatched.");
      return;
    }

    if (view === "signup") {
      const { data, error } = await supabase.auth.signUp({ email, password });
      if (error) setError(error.message);
      else if (data.user && !data.session) setMessage("Account created. Please check your email.");
      else navigate("/");
    } else {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setError(error.message);
      else navigate("/");
    }
  };

  const switchView = (newView: "login" | "signup" | "recovery") => {
    setView(newView);
    setEmail("");
    setPassword("");
    setError(null);
    setMessage(null);
  };

  return (
    <div className="max-w-md mx-auto py-24 px-4">
      <div className="p-8 border-4 border-foreground bg-background">
        <h1 className="font-serif text-4xl font-black uppercase italic mb-2 text-center">
          {view === "recovery" ? "Reset Password" : view === "signup" ? "Create an Account" : "Welcome Back"}
        </h1>
        <p className="font-mono text-[10px] uppercase tracking-widest text-neutral-500 text-center mb-10">
          Edition: {view === "recovery" ? "Recovery Mode" : view === "signup" ? "New Member" : "Returning Member"}
        </p>

        {view === "login" && (
          <LoginForm 
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            onSubmit={handleAuth}
            error={error}
            message={message}
            onToggleSignUp={() => switchView("signup")}
            onForgotPassword={() => switchView("recovery")}
          />
        )}

        {view === "signup" && (
          <SignupForm 
            email={email} setEmail={setEmail}
            password={password} setPassword={setPassword}
            onSubmit={handleAuth}
            error={error}
            message={message}
            onToggleSignIn={() => switchView("login")}
          />
        )}

        {view === "recovery" && (
          <PasswordRecovery 
            email={email} setEmail={setEmail}
            onSubmit={handleAuth}
            error={error}
            message={message}
            onBack={() => switchView("login")}
          />
        )}
      </div>
    </div>
  );
}