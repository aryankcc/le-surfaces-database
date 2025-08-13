
import { Search, Plus, Upload, User, LogOut, Truck } from "lucide-react";
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
import { SlabSearch } from "@/components/SlabSearch";

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
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center space-x-2">
            <img 
              src="/lovable-uploads/fec473b2-b4d7-4f23-9b74-b56176be43af.png" 
              alt="LE Surfaces" 
              className="h-8 w-auto"
            />
          </Link>

          <div className="flex-1 mx-6">
            <SlabSearch 
              searchTerm={searchTerm}
              onSearchChange={onSearchChange}
            />
          </div>

          <div className="flex items-center space-x-4">
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
