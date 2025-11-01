import { Moon, Sun, Search } from 'lucide-react';
import { Button } from './ui/button';
import { SearchWithSuggestions } from './SearchWithSuggestions';

interface HeaderProps {
  darkMode: boolean;
  toggleDarkMode: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export function Header({ darkMode, toggleDarkMode, searchQuery, onSearchChange }: HeaderProps) {
  return (
    <header className="border-b sticky top-0 bg-background z-10">
      <div className="container mx-auto px-4 py-4">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <Search className="w-6 h-6 text-primary-foreground" />
            </div>
            <div>
              <h1>Campus Lost & Found</h1>
              <p className="text-muted-foreground">Find what matters</p>
            </div>
          </div>
          
          <div className="flex-1 max-w-md hidden md:block">
            <SearchWithSuggestions
              value={searchQuery}
              onChange={onSearchChange}
              placeholder="Quick search items..."
            />
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={toggleDarkMode}
          >
            {darkMode ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
          </Button>
        </div>

        {/* Mobile search */}
        <div className="mt-4 md:hidden">
          <SearchWithSuggestions
            value={searchQuery}
            onChange={onSearchChange}
            placeholder="Quick search items..."
          />
        </div>
      </div>
    </header>
  );
}
