import { Link, NavLink } from "react-router";
import { ChefHat, PlusCircle, BookOpen } from "lucide-react";

export function Navbar() {
  return (
    <nav className="border-b border-gray-200 dark:border-gray-800 bg-white dark:bg-gray-950 px-6 py-4">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link to="/" className="flex items-center gap-2 font-bold text-xl text-orange-600">
          <ChefHat size={28} />
          <span>RecipeArchive</span>
        </Link>
        
        <div className="flex items-center gap-6">
          <NavLink 
            to="/" 
            className={({ isActive }) => `flex items-center gap-1.5 transition-colors ${isActive ? 'text-orange-600 font-medium' : 'text-gray-600 hover:text-orange-600 dark:text-gray-300'}`}
          >
            <BookOpen size={20} />
            <span>My Book</span>
          </NavLink>
          <NavLink 
            to="/import" 
            className={({ isActive }) => `flex items-center gap-1.5 transition-colors ${isActive ? 'text-orange-600 font-medium' : 'text-gray-600 hover:text-orange-600 dark:text-gray-300'}`}
          >
            <PlusCircle size={20} />
            <span>Import</span>
          </NavLink>
          <div className="h-8 w-8 rounded-full bg-orange-100 flex items-center justify-center text-orange-700 font-medium border border-orange-200">
            M
          </div>
        </div>
      </div>
    </nav>
  );
}
