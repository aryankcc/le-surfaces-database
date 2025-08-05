
import { useState, useMemo } from "react";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Edit, Trash2, FileImage, Calendar, Hash, Archive, Tag, Eye, ArrowUpDown, ArrowUp, ArrowDown } from "lucide-react";
import OptimizedImage from "./OptimizedImage";
import { Slab } from "@/types/slab";
import { formatSlabDate } from "@/utils/dateUtils";

interface SlabTableSortedProps {
  slabs: Slab[];
  onSlabSelect: (slab: Slab) => void;
  selectedSlab: Slab | null;
  onEditSlab: (slab: Slab) => void;
  onDeleteSlab: (slab: Slab) => void;
  isAuthenticated: boolean;
  isLoading?: boolean;
  category?: 'current' | 'development';
}

type SortField = 'slab_id' | 'family' | 'formulation' | 'version' | 'status' | 'quantity' | 'received_date' | 'sent_to_location';
type SortOrder = 'asc' | 'desc';

const SlabTableSorted = ({ 
  slabs, 
  onSlabSelect, 
  selectedSlab, 
  onEditSlab, 
  onDeleteSlab, 
  isAuthenticated, 
  isLoading = false,
  category 
}: SlabTableSortedProps) => {
  const [sortField, setSortField] = useState<SortField>('slab_id');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('asc');
    }
  };

  const sortedSlabs = useMemo(() => {
    if (!slabs || slabs.length === 0) return [];
    
    return [...slabs].sort((a, b) => {
      let aValue: any = a[sortField];
      let bValue: any = b[sortField];

      // Handle null/undefined values
      if (aValue === null || aValue === undefined) aValue = '';
      if (bValue === null || bValue === undefined) bValue = '';

      // Convert to string for comparison
      aValue = String(aValue).toLowerCase();
      bValue = String(bValue).toLowerCase();

      if (sortOrder === 'asc') {
        return aValue.localeCompare(bValue);
      } else {
        return bValue.localeCompare(aValue);
      }
    });
  }, [slabs, sortField, sortOrder]);

  const getSortIcon = (field: SortField) => {
    if (sortField !== field) return <ArrowUpDown className="h-4 w-4" />;
    return sortOrder === 'asc' ? <ArrowUp className="h-4 w-4" /> : <ArrowDown className="h-4 w-4" />;
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "in_stock":
        return "bg-green-100 text-green-800 border-green-200";
      case "sent":
        return "bg-blue-100 text-blue-800 border-blue-200";
      case "not_in_yet":
        return "bg-orange-100 text-orange-800 border-orange-200";
      case "discontinued":
        return "bg-red-100 text-red-800 border-red-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  const getStatusDisplay = (status: string) => {
    switch (status) {
      case "not_in_yet":
        return "Not In Yet";
      case "discontinued":
        return "Discontinued";
      case "in_stock":
        return "In Stock";
      default:
        return status.replace('_', ' ');
    }
  };

  const getCategoryColor = (category: string) => {
    switch (category) {
      case "current":
        return "bg-green-100 text-green-800 border-green-200";
      case "development":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="animate-pulse space-y-4">
            <div className="h-4 bg-slate-200 rounded w-1/4"></div>
            <div className="space-y-2">
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="h-12 bg-slate-200 rounded"></div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>
            {category === 'current' ? 'Current Slabs' : 
             category === 'development' ? 'Development Slabs' : 
             'Slab Inventory'}
          </span>
          <span className="text-sm font-normal text-slate-500">{slabs.length} slabs</span>
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="border rounded-lg overflow-hidden">
          <Table>
            <TableHeader className="bg-slate-50">
              <TableRow>
                <TableHead className="w-12"></TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('slab_id')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Slab ID</span>
                    {getSortIcon('slab_id')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('family')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Family</span>
                    {getSortIcon('family')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('formulation')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Formulation</span>
                    {getSortIcon('formulation')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('version')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Version</span>
                    {getSortIcon('version')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('status')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Status</span>
                    {getSortIcon('status')}
                  </Button>
                </TableHead>
                {!category && <TableHead className="font-semibold">Category</TableHead>}
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('quantity')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Qty</span>
                    {getSortIcon('quantity')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('received_date')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Received</span>
                    {getSortIcon('received_date')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">
                  <Button 
                    variant="ghost" 
                    onClick={() => handleSort('sent_to_location')}
                    className="flex items-center space-x-1 h-auto p-0 font-semibold"
                  >
                    <span>Sent To</span>
                    {getSortIcon('sent_to_location')}
                  </Button>
                </TableHead>
                <TableHead className="font-semibold">Image</TableHead>
                <TableHead className="font-semibold sticky right-0 bg-slate-50 z-10 border-l w-32">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sortedSlabs.map((slab) => (
                <TableRow 
                  key={slab.id}
                  className={`cursor-pointer hover:bg-slate-50 ${
                    selectedSlab?.id === slab.id ? 'bg-blue-50 border-l-4 border-l-blue-500' : ''
                  }`}
                  onClick={() => onSlabSelect(slab)}
                >
                  <TableCell>
                    <div className="w-2 h-2 rounded-full bg-slate-300"></div>
                  </TableCell>
                  <TableCell className="font-medium">{slab.slab_id}</TableCell>
                  <TableCell>{slab.family}</TableCell>
                  <TableCell>{slab.formulation}</TableCell>
                  <TableCell>{slab.version || '-'}</TableCell>
                  <TableCell>
                    <Badge className={getStatusColor(slab.status)} variant="outline">
                      {getStatusDisplay(slab.status)}
                    </Badge>
                  </TableCell>
                  {!category && (
                    <TableCell>
                      {slab.category && (
                        <Badge className={getCategoryColor(slab.category)} variant="outline">
                          <Tag className="h-3 w-3 mr-1" />
                          {slab.category}
                        </Badge>
                      )}
                    </TableCell>
                  )}
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Archive className="h-3 w-3 text-slate-400" />
                      <span>{slab.quantity !== null ? slab.quantity : 0}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-1">
                      <Calendar className="h-3 w-3 text-slate-400" />
                      <span className="text-sm">{formatSlabDate(slab.received_date)}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {slab.sent_to_location ? (
                        <div>
                          <div>{slab.sent_to_location}</div>
                          {slab.sent_to_date && (
                            <div className="text-xs text-slate-500">
                              {formatSlabDate(slab.sent_to_date)}
                            </div>
                          )}
                        </div>
                      ) : '-'}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="w-8 h-8">
                      {slab.image_url ? (
                        <OptimizedImage
                          src={slab.image_url}
                          alt={slab.family}
                          className="w-8 h-8 rounded border"
                          sizes="32px"
                        />
                      ) : (
                        <div className="w-8 h-8 bg-slate-100 rounded border flex items-center justify-center">
                          <FileImage className="h-4 w-4 text-slate-400" />
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="sticky right-0 bg-background z-10 border-l w-32">
                    <div className="flex space-x-1 min-w-[120px] justify-start">
                      <Button 
                        size="sm" 
                        variant="ghost" 
                        className="h-7 w-7 p-0 shrink-0"
                        onClick={(e) => {
                          e.stopPropagation();
                          onSlabSelect(slab);
                        }}
                      >
                        <Eye className="h-3 w-3" />
                      </Button>
                      {isAuthenticated && (
                        <>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onEditSlab(slab);
                            }}
                          >
                            <Edit className="h-3 w-3" />
                          </Button>
                          <Button 
                            size="sm" 
                            variant="ghost" 
                            className="h-7 w-7 p-0 text-red-600 hover:text-red-700 shrink-0"
                            onClick={(e) => {
                              e.stopPropagation();
                              onDeleteSlab(slab);
                            }}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </>
                      )}
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default SlabTableSorted;
