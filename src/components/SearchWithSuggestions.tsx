import { useState, useEffect, useRef } from 'react';
import { Input } from './ui/input';
import { Search } from 'lucide-react';
import { apiService } from '../services/api';
import { motion, AnimatePresence } from 'motion/react';
import { Card } from './ui/card';

interface SearchWithSuggestionsProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}

export function SearchWithSuggestions({
  value,
  onChange,
  placeholder = 'Quick search items...',
}: SearchWithSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchSuggestions = async () => {
      if (value.length >= 2) {
        setIsLoading(true);
        try {
          const results = await apiService.getSearchSuggestions(value);
          setSuggestions(results);
          setShowSuggestions(results.length > 0);
        } catch (error) {
          console.error('Error fetching suggestions:', error);
          setSuggestions([]);
          setShowSuggestions(false);
        } finally {
          setIsLoading(false);
        }
      } else {
        setSuggestions([]);
        setShowSuggestions(false);
      }
    };

    const timeoutId = setTimeout(fetchSuggestions, 300); // Debounce
    return () => clearTimeout(timeoutId);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        suggestionsRef.current &&
        !suggestionsRef.current.contains(event.target as Node) &&
        inputRef.current &&
        !inputRef.current.contains(event.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSuggestionClick = (suggestion: string) => {
    onChange(suggestion);
    setShowSuggestions(false);
    inputRef.current?.blur();
  };

  return (
    <div className="relative w-full">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => {
            if (suggestions.length > 0) {
              setShowSuggestions(true);
            }
          }}
          className="pl-10"
        />
      </div>

      <AnimatePresence>
        {showSuggestions && suggestions.length > 0 && (
          <motion.div
            ref={suggestionsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
            className="absolute z-50 w-full mt-2"
          >
            <Card className="p-2 max-h-60 overflow-y-auto shadow-lg">
              {isLoading ? (
                <div className="p-4 text-center text-muted-foreground">Loading...</div>
              ) : (
                <ul className="space-y-1">
                  {suggestions.map((suggestion, index) => (
                    <li
                      key={index}
                      className="px-3 py-2 rounded-md hover:bg-muted cursor-pointer transition-colors"
                      onClick={() => handleSuggestionClick(suggestion)}
                    >
                      <div className="flex items-center gap-2">
                        <Search className="w-3 h-3 text-muted-foreground" />
                        <span>{suggestion}</span>
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

