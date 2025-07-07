
import { Search, Plus, Upload, User, LogOut, Package, Truck } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { supabase } from "@/integrations/supabase/client";
import { Link, useNavigate } from "react-router-dom";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddSlab: () => void;
  onCSVImport: () => void;
  isAuthenticated: boolean;
}

const Header = ({ searchTerm, onSearchChange, onAddSlab, onCSVImport, isAuthenticated }: HeaderProps) => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSignOut = async () => {
    try {
      await supabase.auth.signOut();
      toast({
        title: "Signed out successfully",
        description: "You have been signed out of your account.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error signing out:', error);
      toast({
        title: "Error signing out",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <header className="bg-white border-b border-slate-200 shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-6">
            <Link to="/" className="flex items-center space-x-2">
              <Package className="h-8 w-8 text-blue-600" />
              <h1 className="text-xl font-bold text-slate-800">Slab Inventory</h1>
            </Link>
            
            <nav className="hidden md:flex space-x-4">
              <Link to="/current" className="text-slate-600 hover:text-slate-800 px-3 py-2 rounded-md text-sm font-medium">
                Current Slabs
              </Link>
              <Link to="/development" className="text-slate-600 hover:text-slate-800 px-3 py-2 rounded-md text-sm font-medium">
                Development
              </Link>
              <Link to="/outbound" className="text-slate-600 hover:text-slate-800 px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-1">
                <Truck className="h-4 w-4" />
                <span>Outbound Samples</span>
              </Link>
            </nav>
          </div>

          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                type="text"
                placeholder="Search slabs..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>

            {isAuthenticated && (
              <div className="flex items-center space-x-2">
                <Button onClick={onAddSlab} size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add Slab
                </Button>
                <Button onClick={onCSVImport} variant="outline" size="sm">
                  <Upload className="h-4 w-4 mr-2" />
                  Import CSV
                </Button>
              </div>
            )}

            {user ? (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <User className="h-4 w-4 mr-2" />
                    {user.email}
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem onClick={handleSignOut}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sign out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            ) : (
              <Link to="/auth">
                <Button variant="outline" size="sm">
                  <User className="h-4 w-4 mr-2" />
                  Sign in
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
