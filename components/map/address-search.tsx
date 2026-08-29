'use client';

import { useState, useCallback, useEffect, useRef } from 'react';
import { useMap } from 'react-leaflet';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Clock, X, Loader2, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const NOMINATIM_API = 'https://nominatim.openstreetmap.org/search';
const RECENT_SEARCHES_KEY = 'Solvix-recent-searches';
const MAX_RECENT_SEARCHES = 5;

interface NominatimResult {
  place_id: number;
  display_name: string;
  lat: string;
  lon: string;
  type: string;
  address?: {
    house_number?: string;
    road?: string;
    city?: string;
    state?: string;
    country?: string;
  };
}

interface SearchResult {
  id: string;
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
}

interface RecentSearch {
  displayName: string;
  shortName: string;
  lat: number;
  lon: number;
  timestamp: number;
}

function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value);

  useEffect(() => {
    const timer = setTimeout(() => setDebouncedValue(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);

  return debouncedValue;
}

function getRecentSearches(): RecentSearch[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

function saveRecentSearch(search: RecentSearch): void {
  if (typeof window === 'undefined') return;
  try {
    const existing = getRecentSearches();
    const filtered = existing.filter(
      (s) => s.lat !== search.lat || s.lon !== search.lon
    );
    const updated = [search, ...filtered].slice(0, MAX_RECENT_SEARCHES);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  } catch {
    console.log('Failed to save recent search');
  }
}

function formatShortName(result: NominatimResult): string {
  const parts = result.display_name.split(', ');
  if (parts.length <= 2) return result.display_name;
  return parts.slice(0, 2).join(', ');
}

interface AddressSearchProps {
  className?: string;
  onLocationSelect?: (lat: number, lon: number, name: string) => void;
}

export function AddressSearch({ className, onLocationSelect }: AddressSearchProps) {
  const map = useMap();
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(-1);

  const debouncedQuery = useDebounce(query, 300);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  useEffect(() => {
    if (!debouncedQuery.trim()) {
      setResults([]);
      setError(null);
      return;
    }

    const controller = new AbortController();
    
    async function search() {
      setIsLoading(true);
      setError(null);
      
      try {
        const params = new URLSearchParams({
          q: debouncedQuery,
          format: 'json',
          addressdetails: '1',
          limit: '5',
          countrycodes: 'us',
        });

        const response = await fetch(`${NOMINATIM_API}?${params}`, {
          signal: controller.signal,
          headers: {
            'Accept': 'application/json',
          },
        });

        if (!response.ok) {
          throw new Error('Search failed');
        }

        const data: NominatimResult[] = await response.json();
        
        if (data.length === 0) {
          setResults([]);
          setError('No results found');
        } else {
          setResults(
            data.map((item) => ({
              id: String(item.place_id),
              displayName: item.display_name,
              shortName: formatShortName(item),
              lat: parseFloat(item.lat),
              lon: parseFloat(item.lon),
            }))
          );
          setError(null);
        }
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          setError('Search failed. Please try again.');
          setResults([]);
        }
      } finally {
        setIsLoading(false);
      }
    }

    search();
    return () => controller.abort();
  }, [debouncedQuery]);

  const handleSelect = useCallback(
    (lat: number, lon: number, displayName: string, shortName: string) => {
      map.flyTo([lat, lon], 16, { duration: 1.5 });

      if (onLocationSelect) {
        onLocationSelect(lat, lon, displayName);
      }
      
      saveRecentSearch({
        displayName,
        shortName,
        lat,
        lon,
        timestamp: Date.now(),
      });
      setRecentSearches(getRecentSearches());
      
      setQuery('');
      setResults([]);
      setIsFocused(false);
      setSelectedIndex(-1);
      inputRef.current?.blur();
      
      onLocationSelect?.(lat, lon, displayName);
    },
    [map, onLocationSelect]
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      const allItems = query.trim() ? results : recentSearches;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => 
          prev < allItems.length - 1 ? prev + 1 : prev
        );
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
      } else if (e.key === 'Enter' && selectedIndex >= 0) {
        e.preventDefault();
        const item = allItems[selectedIndex];
        if (item) {
          if ('id' in item) {
            handleSelect(item.lat, item.lon, item.displayName, item.shortName);
          } else {
            handleSelect(item.lat, item.lon, item.displayName, item.shortName);
          }
        }
      } else if (e.key === 'Escape') {
        setIsFocused(false);
        inputRef.current?.blur();
      }
    },
    [query, results, recentSearches, selectedIndex, handleSelect]
  );

  const showDropdown = isFocused && (results.length > 0 || recentSearches.length > 0 || error || isLoading);

  return (
    <div ref={containerRef} className={cn('relative w-full max-w-md', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Search for an address..."
          value={query}
          onChange={(e) => {
            setQuery(e.target.value);
            setSelectedIndex(-1);
          }}
          onFocus={() => setIsFocused(true)}
          onBlur={(e) => {
            if (!containerRef.current?.contains(e.relatedTarget as Node)) {
              setTimeout(() => setIsFocused(false), 150);
            }
          }}
          onKeyDown={handleKeyDown}
          className="pl-9 pr-9 h-11 bg-background/95 backdrop-blur-sm shadow-lg border-border/50"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            onClick={() => {
              setQuery('');
              setResults([]);
              inputRef.current?.focus();
            }}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
        {isLoading && (
          <Loader2 className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 animate-spin text-muted-foreground" />
        )}
      </div>

      <AnimatePresence>
        {showDropdown && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.15 }}
            className="absolute top-full mt-2 w-full bg-background/95 backdrop-blur-sm rounded-lg shadow-lg border border-border/50 overflow-hidden z-50"
          >
            {isLoading && !results.length && (
              <div className="flex items-center justify-center gap-2 py-4 text-sm text-muted-foreground">
                <Loader2 className="h-4 w-4 animate-spin" />
                Searching...
              </div>
            )}

            {error && !isLoading && (
              <div className="flex items-center gap-2 px-4 py-3 text-sm text-muted-foreground">
                <AlertCircle className="h-4 w-4" />
                {error}
              </div>
            )}

            {!query.trim() && recentSearches.length > 0 && !isLoading && (
              <div>
                <div className="px-3 py-2 text-xs font-medium text-muted-foreground uppercase tracking-wide">
                  Recent Searches
                </div>
                {recentSearches.map((item, index) => (
                  <button
                    key={`${item.lat}-${item.lon}`}
                    onClick={() => handleSelect(item.lat, item.lon, item.displayName, item.shortName)}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                      selectedIndex === index && 'bg-accent'
                    )}
                  >
                    <Clock className="h-4 w-4 mt-0.5 text-muted-foreground flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{item.shortName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {item.displayName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {results.length > 0 && !isLoading && (
              <div>
                {results.map((result, index) => (
                  <button
                    key={result.id}
                    onClick={() => handleSelect(result.lat, result.lon, result.displayName, result.shortName)}
                    className={cn(
                      'w-full flex items-start gap-3 px-3 py-2.5 text-left hover:bg-accent transition-colors',
                      selectedIndex === index && 'bg-accent'
                    )}
                  >
                    <MapPin className="h-4 w-4 mt-0.5 text-primary flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="font-medium text-sm truncate">{result.shortName}</div>
                      <div className="text-xs text-muted-foreground truncate">
                        {result.displayName}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
