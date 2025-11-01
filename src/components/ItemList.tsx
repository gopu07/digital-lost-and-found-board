import { Item, FilterOptions } from '../types';
import { ItemCard } from './ItemCard';
import { SearchFilters } from './SearchFilters';
import { Alert, AlertDescription } from './ui/alert';
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious } from './ui/pagination';
import { AlertCircle } from 'lucide-react';
import { useState, useMemo } from 'react';

interface ItemListProps {
  items: Item[];
  onViewDetails: (item: Item) => void;
}

export function ItemList({ items, onViewDetails }: ItemListProps) {
  const [filters, setFilters] = useState<FilterOptions>({
    search: '',
    category: 'All',
    location: 'All',
    type: 'all',
    status: 'all',
    dateFrom: '',
    dateTo: '',
  });

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 9;

  const filteredItems = useMemo(() => {
    return items.filter((item) => {
      const searchLower = filters.search.toLowerCase();
      const matchesSearch = 
        item.title.toLowerCase().includes(searchLower) ||
        item.description.toLowerCase().includes(searchLower) ||
        item.location.toLowerCase().includes(searchLower) ||
        item.contactName.toLowerCase().includes(searchLower);

      const matchesCategory = filters.category === 'All' || item.category === filters.category;
      const matchesLocation = filters.location === 'All' || item.location === filters.location;
      const matchesType = filters.type === 'all' || item.type === filters.type;
      const matchesStatus = filters.status === 'all' || item.status === filters.status;

      const matchesDateFrom = !filters.dateFrom || new Date(item.date) >= new Date(filters.dateFrom);
      const matchesDateTo = !filters.dateTo || new Date(item.date) <= new Date(filters.dateTo);

      return (
        matchesSearch &&
        matchesCategory &&
        matchesLocation &&
        matchesType &&
        matchesStatus &&
        matchesDateFrom &&
        matchesDateTo
      );
    });
  }, [items, filters]);

  // Sort by newest first
  const sortedItems = [...filteredItems].sort((a, b) => 
    new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const totalPages = Math.ceil(sortedItems.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentItems = sortedItems.slice(startIndex, endIndex);

  const recentItems = sortedItems.filter(item => {
    const daysSinceCreated = (new Date().getTime() - new Date(item.createdAt).getTime()) / (1000 * 60 * 60 * 24);
    return daysSinceCreated <= 3;
  }).slice(0, 6);

  return (
    <div className="space-y-6">
      <div>
        <h2>Browse Items</h2>
        <p className="text-muted-foreground">Search and filter through lost and found items</p>
      </div>

      <SearchFilters filters={filters} onFiltersChange={setFilters} />

      {recentItems.length > 0 && filters.search === '' && filters.category === 'All' && (
        <div>
          <h3 className="mb-4">Recent & Trending Items</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {recentItems.map((item) => (
              <ItemCard key={item.id} item={item} onViewDetails={onViewDetails} />
            ))}
          </div>
        </div>
      )}

      <div>
        <div className="flex items-center justify-between mb-4">
          <h3>
            {filters.search || filters.category !== 'All' || filters.location !== 'All' || filters.type !== 'all' || filters.status !== 'all' || filters.dateFrom || filters.dateTo
              ? 'Search Results'
              : 'All Items'}
          </h3>
          <p className="text-muted-foreground">
            {sortedItems.length} {sortedItems.length === 1 ? 'item' : 'items'} found
          </p>
        </div>

        {currentItems.length === 0 ? (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              No items found matching your criteria. Try adjusting your filters.
            </AlertDescription>
          </Alert>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {currentItems.map((item) => (
                <ItemCard key={item.id} item={item} onViewDetails={onViewDetails} />
              ))}
            </div>

            {totalPages > 1 && (
              <div className="mt-8">
                <Pagination>
                  <PaginationContent>
                    <PaginationItem>
                      <PaginationPrevious
                        onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                        className={currentPage === 1 ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                    {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                      let pageNum;
                      if (totalPages <= 5) {
                        pageNum = i + 1;
                      } else if (currentPage <= 3) {
                        pageNum = i + 1;
                      } else if (currentPage >= totalPages - 2) {
                        pageNum = totalPages - 4 + i;
                      } else {
                        pageNum = currentPage - 2 + i;
                      }
                      
                      return (
                        <PaginationItem key={pageNum}>
                          <PaginationLink
                            onClick={() => setCurrentPage(pageNum)}
                            isActive={currentPage === pageNum}
                            className="cursor-pointer"
                          >
                            {pageNum}
                          </PaginationLink>
                        </PaginationItem>
                      );
                    })}
                    <PaginationItem>
                      <PaginationNext
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        className={currentPage === totalPages ? 'pointer-events-none opacity-50' : 'cursor-pointer'}
                      />
                    </PaginationItem>
                  </PaginationContent>
                </Pagination>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
