import { FilterOptions } from '../types';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/select';
import { Card } from './ui/card';
import { Filter, X } from 'lucide-react';
import { categories, locations } from '../utils/mockData';
import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';

interface SearchFiltersProps {
  filters: FilterOptions;
  onFiltersChange: (filters: FilterOptions) => void;
}

export function SearchFilters({ filters, onFiltersChange }: SearchFiltersProps) {
  const [showFilters, setShowFilters] = useState(false);

  const handleReset = () => {
    onFiltersChange({
      search: '',
      category: 'All',
      location: 'All',
      type: 'all',
      status: 'all',
      dateFrom: '',
      dateTo: '',
    });
  };

  const hasActiveFilters = 
    filters.category !== 'All' || 
    filters.location !== 'All' || 
    filters.type !== 'all' || 
    filters.status !== 'all' ||
    filters.dateFrom ||
    filters.dateTo;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Button
          variant="outline"
          onClick={() => setShowFilters(!showFilters)}
        >
          <Filter className="w-4 h-4 mr-2" />
          {showFilters ? 'Hide Filters' : 'Show Filters'}
          {hasActiveFilters && (
            <span className="ml-2 w-2 h-2 bg-primary rounded-full" />
          )}
        </Button>

        {hasActiveFilters && (
          <Button variant="ghost" size="sm" onClick={handleReset}>
            <X className="w-4 h-4 mr-2" />
            Clear Filters
          </Button>
        )}
      </div>

      <AnimatePresence>
        {showFilters && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
          >
            <Card className="p-4">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="space-y-2">
                  <Label>Category</Label>
                  <Select
                    value={filters.category}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, category: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat} value={cat}>
                          {cat}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Location</Label>
                  <Select
                    value={filters.location}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, location: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {locations.map((loc) => (
                        <SelectItem key={loc} value={loc}>
                          {loc}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Type</Label>
                  <Select
                    value={filters.type}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, type: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="lost">Lost</SelectItem>
                      <SelectItem value="found">Found</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={filters.status}
                    onValueChange={(value) =>
                      onFiltersChange({ ...filters, status: value })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All</SelectItem>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="claimed">Claimed</SelectItem>
                      <SelectItem value="pending">Pending</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Date From</Label>
                  <Input
                    type="date"
                    value={filters.dateFrom}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, dateFrom: e.target.value })
                    }
                  />
                </div>

                <div className="space-y-2">
                  <Label>Date To</Label>
                  <Input
                    type="date"
                    value={filters.dateTo}
                    onChange={(e) =>
                      onFiltersChange({ ...filters, dateTo: e.target.value })
                    }
                  />
                </div>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
