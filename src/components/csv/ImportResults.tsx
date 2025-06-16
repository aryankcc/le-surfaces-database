
import { CheckCircle, AlertCircle } from "lucide-react";

interface ImportResultsProps {
  results: {
    success: number;
    updated: number;
    errors: string[];
  };
}

const ImportResults = ({ results }: ImportResultsProps) => {
  return (
    <div className="space-y-2">
      {results.success > 0 && (
        <div className="flex items-center space-x-2 text-green-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Created: {results.success} slabs</span>
        </div>
      )}
      
      {results.updated > 0 && (
        <div className="flex items-center space-x-2 text-blue-600">
          <CheckCircle className="h-4 w-4" />
          <span className="text-sm">Updated: {results.updated} slabs</span>
        </div>
      )}
      
      {results.errors.length > 0 && (
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span className="text-sm">Errors: {results.errors.length}</span>
          </div>
          <div className="max-h-32 overflow-y-auto text-xs text-red-600 bg-red-50 p-2 rounded">
            {results.errors.map((error, index) => (
              <div key={index}>{error}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ImportResults;
