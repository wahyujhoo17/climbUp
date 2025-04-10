import { useState, useEffect } from "react";

export function useMediaQuery(query: string): boolean {
  // Initial state set to false to avoid hydration mismatch
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    // Only run in browser environment
    if (typeof window !== "undefined") {
      const media = window.matchMedia(query);
      // Update state on mount
      setMatches(media.matches);

      // Event listener callback
      const listener = () => setMatches(media.matches);
      // Add event listener
      media.addEventListener("change", listener);

      // Clean up
      return () => media.removeEventListener("change", listener);
    }
  }, [query]);

  return matches;
}
