import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useSlabs } from "@/hooks/useSlabs";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Search } from "lucide-react";
import { Slab } from "@/types/slab";

interface SlabSearchProps {
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

export const SlabSearch = ({ searchTerm, onSearchChange }: SlabSearchProps) => {
  const [showResults, setShowResults] = useState(false);
  const navigate = useNavigate();
  
  const { data: searchResults } = useSlabs(searchTerm);

  const handleSearchChange = (value: string) => {
    onSearchChange(value);
    setShowResults(value.length > 0);
  };

  const handleSlabClick = (slab: Slab) => {
    setShowResults(false);
    onSearchChange("");
    
    // Navigate to the appropriate page based on slab category
    if (slab.category === 'current') {
      navigate('/category/current');
    } else if (slab.category === 'development') {
      navigate('/category/development');
    } else if (slab.status === 'sent') {
      navigate('/outbound-samples');
    }
  };

  return (
    <div className="relative w-full max-w-md">
      <div className="relative">
        <Search className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
        <Input
          type="text"
          placeholder="Search slabs by ID, family, formulation..."
          value={searchTerm}
          onChange={(e) => handleSearchChange(e.target.value)}
          onFocus={() => setShowResults(searchTerm.length > 0)}
          onBlur={() => setTimeout(() => setShowResults(false), 200)}
          className="pl-8 pr-4"
        />
      </div>
      
      {showResults && searchResults && searchResults.length > 0 && (
        <Card className="absolute top-full left-0 right-0 mt-1 z-50 max-h-96 overflow-y-auto">
          <CardContent className="p-0">
            {searchResults.slice(0, 10).map((slab) => (
              <div
                key={slab.id}
                onClick={() => handleSlabClick(slab)}
                className="p-3 hover:bg-gray-50 cursor-pointer border-b last:border-b-0"
              >
                <div className="flex justify-between items-start">
                  <div>
                    <div className="font-medium text-sm">
                      {slab.slab_id || 'No ID'} - {slab.family}
                    </div>
                    <div className="text-xs text-gray-500">
                      {slab.formulation} {slab.version && `v${slab.version}`}
                    </div>
                    <div className="text-xs text-gray-400 capitalize">
                      {slab.category} • {slab.status}
                    </div>
                  </div>
                  <div className="text-xs text-gray-400">
                    Qty: {slab.quantity || 0}
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}
    </div>
  );
};