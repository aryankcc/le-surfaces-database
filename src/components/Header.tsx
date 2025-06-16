
import { useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Layers, Plus, Upload, Download, User, LogOut } from "lucide-react";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { useAuth } from "@/hooks/useAuth";
import { exportInventoryToExcel } from "@/utils/excelExport";
import { useToast } from "@/hooks/use-toast";

interface HeaderProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
  onAddSlab: () => void;
  onCSVImport: () => void;
}

const Header = ({ searchTerm, onSearchChange, onAddSlab, onCSVImport }: HeaderProps) => {
  const { user, signOut } = useAuth();
  const { toast } = useToast();

  const handleSignOut = async () => {
    await signOut();
  };

  const handleExportToExcel = async () => {
    try {
      toast({
        title: "Export Started",
        description: "Preparing Excel file...",
      });

      await exportInventoryToExcel();
      
      toast({
        title: "Export Complete",
        description: "Excel file has been downloaded successfully!",
      });
    } catch (error) {
      console.error('Export error:', error);
      toast({
        title: "Export Failed",
        description: "There was an error exporting the data. Please try again.",
        variant: "destructive",
      });
    }
  };

  return (
    <div className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
      <div className="container mx-auto px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2">
              <Layers className="h-8 w-8 text-blue-600" />
              <div>
                <h1 className="text-2xl font-bold text-slate-800">LE Surfaces</h1>
                <p className="text-sm text-slate-500">Quartz Slab Management System</p>
              </div>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-slate-400 h-4 w-4" />
              <Input
                placeholder="Search slabs..."
                value={searchTerm}
                onChange={(e) => onSearchChange(e.target.value)}
                className="pl-10 w-64"
              />
            </div>
            <Button 
              onClick={onCSVImport}
              variant="outline"
              className="text-blue-600 border-blue-600 hover:bg-blue-50"
            >
              <Upload className="h-4 w-4 mr-2" />
              Import CSV
            </Button>
            <Button 
              onClick={handleExportToExcel}
              variant="outline"
              className="text-green-600 border-green-600 hover:bg-green-50"
            >
              <Download className="h-4 w-4 mr-2" />
              Export Excel
            </Button>
            <Button 
              onClick={onAddSlab}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Plus className="h-4 w-4 mr-2" />
              Add Slab
            </Button>
            
            {/* User Menu */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <User className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem disabled>
                  {user?.email}
                </DropdownMenuItem>
                <DropdownMenuItem onClick={handleSignOut}>
                  <LogOut className="h-4 w-4 mr-2" />
                  Sign Out
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Header;
