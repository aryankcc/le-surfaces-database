
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Database, Loader2 } from "lucide-react";
import { insertSampleData } from "@/utils/sampleData";
import { useToast } from "@/hooks/use-toast";
import { useQueryClient } from "@tanstack/react-query";

const SampleDataButton = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const handleInsertSampleData = async () => {
    setIsLoading(true);
    try {
      await insertSampleData();
      
      // Invalidate all queries to refresh the data
      queryClient.invalidateQueries({ queryKey: ['slabs'] });
      queryClient.invalidateQueries({ queryKey: ['slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['current-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['development-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['outbound-slab-stats'] });
      queryClient.invalidateQueries({ queryKey: ['families'] });
      
      toast({
        title: "Sample Data Inserted",
        description: "Successfully added sample slabs to demonstrate the website functionality",
      });
    } catch (error) {
      console.error('Failed to insert sample data:', error);
      toast({
        title: "Error",
        description: "Failed to insert sample data. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleInsertSampleData}
      disabled={isLoading}
      variant="outline"
      className="border-green-200 text-green-700 hover:bg-green-50"
    >
      {isLoading ? (
        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
      ) : (
        <Database className="h-4 w-4 mr-2" />
      )}
      {isLoading ? "Inserting..." : "Load Sample Data"}
    </Button>
  );
};

export default SampleDataButton;
