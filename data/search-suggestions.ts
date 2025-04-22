// Common job search suggestions
export const jobTitleSuggestions = [
  "Software Engineer",
  "Product Manager",
  "Data Scientist",
  "UX Designer",
  "Frontend Developer",
  "Backend Developer",
  "DevOps Engineer",
  "Full Stack Developer",
  "Machine Learning Engineer",
  "iOS Developer",
  "Android Developer",
  "Web Developer",
  "React Developer",
  "Project Manager",
  "UI Designer",
  "Marketing Manager",
  "Content Writer",
  "Sales Representative",
  "Customer Success Manager",
  "Business Analyst",
  "Data Analyst",
  "QA Engineer",
  "Technical Writer",
  "Product Designer",
  "Systems Administrator",
  "Network Engineer",
  "Cloud Architect",
  "Graphic Designer",
  "Accountant",
  "HR Specialist",
];

// Popular tech companies
export const companyNameSuggestions = [
  "Google",
  "Microsoft",
  "Amazon",
  "Apple",
  "Meta",
  "Netflix",
  "Tesla",
  "Twitter",
  "Salesforce",
  "Adobe",
  "Airbnb",
  "Uber",
  "Lyft",
  "Spotify",
  "Slack",
  "Shopify",
  "Intel",
  "IBM",
  "Oracle",
  "Cisco",
  "eBay",
  "PayPal",
  "Zoom",
  "Dropbox",
  "Twilio",
];

// Popular locations
export const locationSuggestions = [
  "Remote",
  "New York, NY",
  "San Francisco, CA",
  "Seattle, WA",
  "Austin, TX",
  "Boston, MA",
  "Chicago, IL",
  "Los Angeles, CA",
  "Denver, CO",
  "Atlanta, GA",
  "Portland, OR",
  "Dallas, TX",
  "Washington, DC",
  "Miami, FL",
  "San Diego, CA",
  "London, UK",
  "Toronto, Canada",
  "Berlin, Germany",
  "Amsterdam, Netherlands",
  "Paris, France",
];

// Generate search suggestions based on input type and query
export function getSearchSuggestions(
  type: "job" | "location" | "company",
  query: string
): string[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();
  let source: string[];

  switch (type) {
    case "job":
      source = jobTitleSuggestions;
      break;
    case "location":
      source = locationSuggestions;
      break;
    case "company":
      source = companyNameSuggestions;
      break;
    default:
      return [];
  }

  return source
    .filter((item) => item.toLowerCase().includes(lowerQuery))
    .slice(0, 5); // Limit to 5 suggestions
}

// Fix for the error - add getLocationSuggestions method
export function getLocationSuggestions(query: string): string[] {
  return getSearchSuggestions("location", query);
}

// Get combined search suggestions (for general search)
export function getCombinedSearchSuggestions(
  query: string,
  type?: "job" | "location" | "company"
): string[] {
  if (!query || query.length < 2) return [];

  const lowerQuery = query.toLowerCase();

  // If type is specified, only search in that category
  if (type) {
    return getSearchSuggestions(type, query);
  }

  // Search in all categories
  const jobMatches = jobTitleSuggestions.filter((item) =>
    item.toLowerCase().includes(lowerQuery)
  );

  const companyMatches = companyNameSuggestions
    .filter((item) => item.toLowerCase().includes(lowerQuery))
    .map((company) => `${company} (Company)`);

  // Combine and limit results
  return [...jobMatches, ...companyMatches].slice(0, 5); // Limit to 5 suggestions
}

// Get recent searches (could be stored in localStorage in a real app)
export function getRecentSearches(): string[] {
  if (typeof window === "undefined") {
    return []; // Return empty array during SSR
  }

  try {
    const saved = localStorage.getItem("recentJobSearches");
    return saved
      ? JSON.parse(saved)
      : [
          "Software Engineer",
          "Product Manager",
          "Google",
          "Remote",
          "Data Scientist",
        ];
  } catch (e) {
    return [
      "Software Engineer",
      "Product Manager",
      "Google",
      "Remote",
      "Data Scientist",
    ];
  }
}

// Save recent searches to localStorage
export function saveRecentSearch(search: string): string[] {
  if (typeof window === "undefined") {
    return []; // Don't save during SSR
  }

  try {
    const current = getRecentSearches();
    // Remove if already exists and add to the front
    const updated = [
      search,
      ...current.filter((item) => item !== search),
    ].slice(0, 5);
    localStorage.setItem("recentJobSearches", JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

// Remove a recent search
export function removeRecentSearch(search: string): string[] {
  if (typeof window === "undefined") {
    return []; // Don't modify during SSR
  }

  try {
    const current = getRecentSearches();
    const updated = current.filter((item) => item !== search);
    localStorage.setItem("recentJobSearches", JSON.stringify(updated));
    return updated;
  } catch (e) {
    return [];
  }
}

// Removed the handleLocationInputChange function as it belongs in a React component
// const handleLocationInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//   const value = e.target.value;
//   // setLocation(value); // Removed this line causing the error
//
//   if (value.length >= 2) {
//     setLocationSuggestions(getLocationSuggestions(value));
//     setShowLocationSuggestions(true);
//   } else {
//     setLocationSuggestions([]);
//     setShowLocationSuggestions(false);
//   }
// };

// Make sure there's no other code below this point if this was the end of the file.
