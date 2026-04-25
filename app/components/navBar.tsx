import { Link, NavLink, useNavigate } from "react-router";
import { ChefHat } from "lucide-react";
import { useEffect, useState } from "react";
import { supabase } from "~/lib/supabase";
import type { User } from "@supabase/supabase-js";

export function NavBar() {
  const [user, setUser] = useState<User | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    // Check initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  const handleProtectedNavigation = (e: React.MouseEvent, to: string) => {
    // Allow access to the home page ("/") even if not logged in
    if (!user && to !== "/") {
      e.preventDefault();
      navigate("/auth");
    }
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    navigate("/");
  };

  return (
    <nav className="border-b-4 border-foreground bg-background">
      <div className="w-full px-6 py-2 border-b border-foreground flex justify-between text-[10px] font-mono uppercase tracking-widest text-neutral-500">
        <span>Vol. 1.0 — Archive Edition</span>
        <span>{new Date().toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
        <span className="hidden sm:inline">Printed in Digital Workspace</span>
      </div>
      
      <div className="w-full px-6 py-5 flex flex-col md:flex-row items-center justify-between gap-6">
        <div className="flex items-center gap-2 font-serif font-black text-4xl lg:text-5xl uppercase tracking-tighter cursor-default select-none">
          <ChefHat size={40} strokeWidth={2.5} />
          <span>Recipe Archive</span>
        </div>
        
        <div className="flex items-center gap-8 font-sans text-xs font-bold uppercase tracking-[0.2em]">
          <NavLink 
            to="/" 
            onClick={(e) => handleProtectedNavigation(e, "/")}
            className={({ isActive }) => `flex items-center gap-2 transition-colors ${isActive ? 'text-accent' : 'hover:text-accent'}`}
          >
            <span>My Book</span>
          </NavLink>
          <NavLink 
            to="/import"
            onClick={(e) => handleProtectedNavigation(e, "/import")}
            className={({ isActive }) => `flex items-center gap-2 transition-colors ${isActive ? 'text-accent' : 'hover:text-accent'}`}
          >
            <span>Import</span>
          </NavLink>
          {user ? (
            <button 
              onClick={handleSignOut}
              className="flex items-center gap-2 hover:text-accent transition-colors cursor-pointer"
            >
              <span>Sign Out</span>
            </button>
          ) : (
            <Link to="/auth" className="px-6 py-2 bg-foreground text-background hover:bg-accent transition-colors">
              Sign In
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
}
