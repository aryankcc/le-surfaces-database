import { useState } from "react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { Download, FileSpreadsheet } from "lucide-react";
import { exportSlabsToExcel } from "@/utils/exportUtils";
import { useToast } from "@/hooks/use-toast";

interface ExportButtonProps {
  category?: 'current' | 'development' | 'outbound' | 'all';
  variant?: 'default' | 'outline';
  size?: 'default' | 'sm' | 'lg';
}

const ExportButton = ({ category = 'all', variant = 'outline', size = 'default' }: ExportButtonProps) => {
  const [isExporting, setIsExporting] = useState(false);
  const { toast } = useToast();

  const handleExport = async (exportCategory: 'current' | 'development' | 'all') => {
    setIsExporting(true);
    try {
      let result;
      if (exportCategory === 'outbound') {
        result = await exportSlabsToExcel({ status: 'sent' });
      } else {
        result = await exportSlabsToExcel({ category: exportCategory });
      }
      toast({
        title: "Export Successful",
        description: `Exported ${result.count} slabs to ${result.filename}`,
      });
    } catch (error) {
      console.error('Export failed:', error);
      toast({
        title: "Export Failed",
        description: error instanceof Error ? error.message : "Failed to export slabs",
        variant: "destructive",
      });
    } finally {
      setIsExporting(false);
    }
  };

  if (category !== 'all') {
    // Single category export button
    const buttonText = category === 'outbound' ? 'Export Outbound Slabs' : 
                      `Export ${category === 'current' ? 'Current' : 'Development'} Slabs`;
    
    return (
      <Button
        variant={variant}
        size={size}
        onClick={() => category === 'outbound' ? handleExport('outbound' as any) : handleExport(category)}
        disabled={isExporting}
      >
        <Download className="h-4 w-4 mr-2" />
        {isExporting ? "Exporting..." : buttonText}
      </Button>
    );
  }

  // Multi-category dropdown export button
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant={variant} size={size} disabled={isExporting}>
          <FileSpreadsheet className="h-4 w-4 mr-2" />
          {isExporting ? "Exporting..." : "Export Slabs"}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent>
        <DropdownMenuItem onClick={() => handleExport('all')}>
          <Download className="h-4 w-4 mr-2" />
          Export All Slabs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('current')}>
          <Download className="h-4 w-4 mr-2" />
          Export Current Slabs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('development')}>
          <Download className="h-4 w-4 mr-2" />
          Export Development Slabs
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleExport('outbound' as any)}>
          <Download className="h-4 w-4 mr-2" />
          Export Outbound Slabs
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default ExportButton;