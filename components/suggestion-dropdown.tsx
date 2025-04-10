import React from "react";
import { Button } from "@/components/ui/button";
import { Clock, X } from "lucide-react";
import { cn } from "@/lib/utils";

interface SuggestionDropdownProps {
  suggestions: string[];
  recentSearches?: string[];
  isVisible: boolean;
  onSelect: (suggestion: string) => void;
  onClear?: (suggestion: string) => void;
  className?: string;
}

export function SuggestionDropdown({
  suggestions,
  recentSearches,
  isVisible,
  onSelect,
  onClear,
  className,
}: SuggestionDropdownProps) {
  if (!isVisible) return null;

  const hasResults = suggestions.length > 0;
  const hasRecent = recentSearches && recentSearches.length > 0;

  if (!hasResults && !hasRecent) return null;

  return (
    <div
      className={cn(
        "absolute left-0 right-0 top-full mt-1 z-50 bg-background border rounded-md shadow-md overflow-hidden",
        className
      )}
    >
      {hasRecent && (
        <div>
          <div className="p-2 text-xs font-medium text-muted-foreground bg-muted/50">
            Recent searches
          </div>
          <ul className="max-h-48 overflow-auto">
            {recentSearches!.map((item, i) => (
              <li
                key={`recent-${i}`}
                className="flex items-center justify-between px-3 py-2 text-sm hover:bg-muted cursor-pointer border-b border-border/50 last:border-b-0"
                onClick={() => onSelect(item)}
              >
                <div className="flex items-center gap-2">
                  <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                  <span>{item}</span>
                </div>
                {onClear && (
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-6 w-6 p-0 hover:bg-muted-foreground/10 rounded-full"
                    onClick={(e) => {
                      e.stopPropagation();
                      onClear(item);
                    }}
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </li>
            ))}
          </ul>
        </div>
      )}

      {hasResults && (
        <div>
          {hasRecent && (
            <div className="p-2 text-xs font-medium text-muted-foreground bg-muted/50">
              Suggestions
            </div>
          )}
          <ul className="max-h-48 overflow-auto">
            {suggestions.map((suggestion, i) => (
              <li
                key={`suggestion-${i}`}
                className="px-3 py-2 text-sm hover:bg-muted cursor-pointer border-b border-border/50 last:border-b-0"
                onClick={() => onSelect(suggestion)}
              >
                {suggestion}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
