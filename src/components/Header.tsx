
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Plus, Upload, Search, User, LogOut } from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (term: string) => void;
  onAddSlab: () => void;
  onCSVImport: () => void;
  isAuthenticated: boolean;
}

const Header = ({ searchTerm, onSearchChange, onAddSlab, onCSVImport, isAuthenticated }: HeaderProps) => {
  const { user, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <h1 className="text-2xl font-bold text-slate-800">Slab Inventory</h1>
            
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search by slab ID, family, or formulation..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated ? (
              <>
                <Button onClick={onAddSlab} className="bg-blue-600 hover:bg-blue-700">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slab
                </Button>
                
                <Button variant="outline" onClick={onCSVImport}>
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>

                <div className="flex items-center space-x-2 text-sm text-slate-600">
                  <User className="h-4 w-4" />
                  <span>{user?.email}</span>
                </div>

                <Button variant="outline" onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </Button>
              </>
            ) : (
              <Link to="/auth">
                <Button className="bg-blue-600 hover:bg-blue-700">
                  <User className="h-4 w-4 mr-2" />
                  Sign In
                </Button>
              </Link>
            )}
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
