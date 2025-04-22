"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import {
  CalendarIcon,
  Clock,
  Building2,
  MapPin,
  Briefcase,
  DollarSign,
  Star,
  StarHalf,
  Filter,
  Search as SearchIcon,
  Bookmark,
  Share2,
  X,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Cpu,
  BookOpen,
  Award,
  Coffee,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { useMediaQuery } from "@/hooks/use-media-query";
import { cn } from "@/lib/utils";
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { JobDescriptionFormatter } from "@/components/job-description-formatter";
import { SuggestionDropdown } from "@/components/suggestion-dropdown";
import {
  getCombinedSearchSuggestions,
  getLocationSuggestions,
  getRecentSearches,
  saveRecentSearch,
  removeRecentSearch,
} from "@/data/search-suggestions";
import { DefaultCompanyLogo } from "@/components/default-company-logo";
import { ItemDetailFormatter } from "@/components/item-detail-formatter";

interface LogoObject {
  primary: string;
  fallbacks: string[];
}

interface JobListing {
  id: string;
  title: string;
  company: string;
  location: string;
  description: string;
  salary: string;
  date_posted: string;
  job_type: string;
  experience_level: string;
  company_rating?: number;
  url: string;
  logo?: string | LogoObject;
  responsibilities?: string[];
  qualifications?: string[];
  benefits?: string[];
}

function SearchPageContent() {
  const searchParams = useSearchParams();
  const initialQuery = searchParams.get("query") || "";
  const isDesktop = useMediaQuery("(min-width: 1024px)");
  const sidebarRef = useRef<HTMLDivElement>(null);

  const [query, setQuery] = useState(initialQuery);
  const [location, setLocation] = useState("");
  const [jobType, setJobType] = useState("all");
  const [datePosted, setDatePosted] = useState("all");
  const [experience, setExperience] = useState("all");
  const [salaryMin, setSalaryMin] = useState([0]);
  const [remoteOnly, setRemoteOnly] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [jobs, setJobs] = useState<JobListing[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobListing[]>([]);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalResults, setTotalResults] = useState(0);
  const [activeView, setActiveView] = useState("list");
  const [selectedJob, setSelectedJob] = useState<JobListing | null>(null);
  const [showSidebar, setShowSidebar] = useState(false);
  const { toast } = useToast();
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const [jobSuggestions, setJobSuggestions] = useState<string[]>([]);
  const [locationSuggestions, setLocationSuggestions] = useState<string[]>([]);
  const [showJobSuggestions, setShowJobSuggestions] = useState(false);
  const [showLocationSuggestions, setShowLocationSuggestions] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const jobInputRef = useRef<HTMLInputElement>(null);
  const locationInputRef = useRef<HTMLInputElement>(null);
  const [nextPageToken, setNextPageToken] = useState<string | null>(null);

  const ITEMS_PER_PAGE = 9;

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        sidebarRef.current &&
        !sidebarRef.current.contains(event.target as Node) &&
        showSidebar
      ) {
        setShowSidebar(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [showSidebar]);

  useEffect(() => {
    if (showSidebar && !isDesktop) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }

    return () => {
      document.body.style.overflow = "auto";
    };
  }, [showSidebar, isDesktop]);

  useEffect(() => {
    if (jobs.length === 0) return;

    let result = [...jobs];

    if (jobType !== "all") {
      result = result.filter((job) => {
        const normalizedJobType = job.job_type.toLowerCase().trim();
        const normalizedFilterType = jobType
          .replace("_", " ")
          .toLowerCase()
          .trim();

        if (
          normalizedFilterType === "full time" &&
          (normalizedJobType === "full-time" ||
            normalizedJobType === "full time")
        ) {
          return true;
        }

        if (
          normalizedFilterType === "part time" &&
          (normalizedJobType === "part-time" ||
            normalizedJobType === "part time")
        ) {
          return true;
        }

        return (
          normalizedJobType === normalizedFilterType ||
          normalizedJobType.includes(normalizedFilterType)
        );
      });
    }

    if (experience !== "all") {
      result = result.filter((job) => {
        const jobExp = job.experience_level.toLowerCase();
        const filterExp = experience.toLowerCase();

        return (
          jobExp.includes(filterExp) ||
          (filterExp === "entry" && jobExp.includes("junior")) ||
          (filterExp === "mid" &&
            (jobExp.includes("mid") || jobExp.includes("intermediate")))
        );
      });
    }

    if (datePosted !== "all") {
      const now = new Date();
      result = result.filter((job) => {
        const postDate = job.date_posted.toLowerCase();

        if (
          datePosted === "day" &&
          (postDate.includes("hour") ||
            postDate.includes("1 day") ||
            postDate.includes("today"))
        ) {
          return true;
        }

        if (datePosted === "week") {
          if (postDate.includes("month") || postDate.includes("year")) {
            return false;
          }
          if (
            postDate.includes("week") ||
            postDate.includes("day") ||
            postDate.includes("hour")
          ) {
            return true;
          }
        }

        if (datePosted === "month") {
          if (postDate.includes("year")) {
            return false;
          }
          return true;
        }

        return true;
      });
    }

    if (salaryMin[0] > 0) {
      result = result.filter((job) => {
        const salaryText = job.salary;
        const numbers = salaryText.match(/\d+/g);
        if (!numbers) return false;

        let minSalary = Math.min(...numbers.map((n) => parseInt(n)));

        if (minSalary > 1000) minSalary = minSalary / 1000;

        return minSalary >= salaryMin[0];
      });
    }

    if (remoteOnly) {
      result = result.filter((job) =>
        job.location.toLowerCase().includes("remote")
      );
    }

    setFilteredJobs(result);
    setTotalPages(Math.ceil(result.length / ITEMS_PER_PAGE));
    setCurrentPage(1);
  }, [jobs, jobType, datePosted, experience, salaryMin, remoteOnly]);

  const fetchJobs = async (page = 1, newSearch = false) => {
    setIsLoading(true);

    try {
      const params = new URLSearchParams();
      params.append("q", query);
      if (location) params.append("location", location);

      if (!newSearch && nextPageToken && page > 1) {
        params.append("page_token", nextPageToken);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);

      if (!response.ok) {
        throw new Error(`API request failed with status ${response.status}`);
      }

      const data = await response.json();

      if (data.error) {
        console.warn("SerpAPI returned an error:", data.error);

        const mockJobs = generateMockJobs(query, location, jobType);

        if (newSearch) {
          setJobs(mockJobs);
          setFilteredJobs(mockJobs);
        }

        setTotalResults(mockJobs.length);
        setTotalPages(Math.ceil(mockJobs.length / ITEMS_PER_PAGE));

        toast({
          title: "No results found",
          description:
            "We couldn't find jobs matching your search. Showing similar positions instead.",
          variant: "default",
        });

        setIsLoading(false);
        return;
      }

      setNextPageToken(data.next_page_token);

      if (newSearch) {
        setJobs(data.jobs);
        setFilteredJobs(data.jobs);
      } else {
        setJobs((prevJobs) => [...prevJobs, ...data.jobs]);
        setFilteredJobs((prevFilteredJobs) => [
          ...prevFilteredJobs,
          ...data.jobs,
        ]);
      }

      setTotalResults(data.total_results);
      setTotalPages(Math.ceil(data.total_results / ITEMS_PER_PAGE));
    } catch (error) {
      console.error("Error fetching jobs:", error);

      const mockJobs = generateMockJobs(query, location, jobType);

      if (newSearch) {
        setJobs(mockJobs);
        setFilteredJobs(mockJobs);
      }

      setTotalResults(mockJobs.length);
      setTotalPages(Math.ceil(mockJobs.length / ITEMS_PER_PAGE));

      toast({
        title: "Error fetching jobs",
        description:
          "We couldn't connect to the job search service. Showing sample listings instead.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (initialQuery) {
      fetchJobs();
    }
  }, [initialQuery]);

  useEffect(() => {
    if (!initialQuery && jobs.length === 0 && !isLoading) {
      const dummyJobs = generateMockJobs("", "", "all");
      const jobsArray = dummyJobs || [];

      setJobs(jobsArray);
      setFilteredJobs(jobsArray);
      setTotalPages(Math.ceil(jobsArray.length / ITEMS_PER_PAGE));
    }
  }, []);

  useEffect(() => {
    setRecentSearches(getRecentSearches());
  }, []);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();

    if (!query.trim()) {
      toast({
        title: "Search field is empty",
        description: "Please enter a job title, keyword, or company name",
        variant: "destructive",
      });
      return;
    }

    const updatedSearches = saveRecentSearch(query.trim());
    setRecentSearches(updatedSearches);

    setCurrentPage(1);
    setNextPageToken(null);

    fetchJobs(1, true);
  };

  const handleSaveJob = (jobId: string) => {
    toast({
      title: "Job Saved",
      description: "This job has been added to your saved jobs.",
    });
  };

  const handleShareJob = (jobId: string) => {
    navigator.clipboard.writeText(`https://yoursite.com/job/${jobId}`);
    toast({
      title: "Link Copied",
      description: "Job link copied to clipboard.",
    });
  };

  const handleApplyJob = (job: JobListing) => {
    window.open(job.url || "#", "_blank");
    toast({
      title: "Application Started",
      description: `You're applying for ${job.title} at ${job.company}`,
    });
  };

  const handleViewJobDetails = (job: JobListing) => {
    setSelectedJob(job);
    setShowSidebar(true);
  };

  const resetFilters = () => {
    setJobType("all");
    setDatePosted("all");
    setExperience("all");
    setSalaryMin([0]);
    setRemoteOnly(false);
  };

  const hasActiveFilters =
    jobType !== "all" ||
    datePosted !== "all" ||
    experience !== "all" ||
    salaryMin[0] > 0 ||
    remoteOnly;

  const getCurrentPageJobs = () => {
    return filteredJobs.slice(
      (currentPage - 1) * ITEMS_PER_PAGE,
      currentPage * ITEMS_PER_PAGE
    );
  };

  const resultsHeading = () => {
    if (isLoading) {
      return "Searching...";
    } else if (filteredJobs.length > 0) {
      if (query.trim()) {
        return `${filteredJobs.length} Jobs Found`;
      } else {
        return "Featured Jobs";
      }
    } else {
      return "No jobs found";
    }
  };

  const resultsSubheading = () => {
    if (isLoading) {
      return "Please wait while we search...";
    } else if (filteredJobs.length > 0) {
      if (query.trim()) {
        return "Based on your search criteria";
      } else {
        return "Popular positions you might be interested in";
      }
    } else {
      return "Try adjusting your search criteria";
    }
  };

  const handleJobInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setQuery(value);

    if (value.length >= 2) {
      setJobSuggestions(getCombinedSearchSuggestions(value));
      setShowJobSuggestions(true);
    } else {
      setJobSuggestions([]);
      setShowJobSuggestions(false);
    }
  };

  const handleLocationInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const value = e.target.value;
    setLocation(value);

    if (value.length >= 2) {
      setLocationSuggestions(getCombinedSearchSuggestions(value, "location"));
      setShowLocationSuggestions(true);
    } else {
      setLocationSuggestions([]);
      setShowLocationSuggestions(false);
    }
  };

  const handleSuggestionSelect = (
    type: "job" | "location",
    suggestion: string
  ) => {
    if (type === "job") {
      const cleanSuggestion = suggestion.replace(/ \(Company\)$/, "");
      setQuery(cleanSuggestion);
      setShowJobSuggestions(false);
    } else {
      setLocation(suggestion);
      setShowLocationSuggestions(false);
    }
  };

  const handleClearRecentSearch = (search: string) => {
    const updatedSearches = removeRecentSearch(search);
    setRecentSearches(updatedSearches);
  };

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        jobInputRef.current &&
        !jobInputRef.current.contains(event.target as Node)
      ) {
        setShowJobSuggestions(false);
      }
      if (
        locationInputRef.current &&
        !locationInputRef.current.contains(event.target as Node)
      ) {
        setShowLocationSuggestions(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleLogoError = (jobId: string) => {
    setLogoErrors((prev) => ({
      ...prev,
      [jobId]: true,
    }));
  };

  const CompanyLogo = ({ job }: { job: JobListing }) => {
    const [logoSrc, setLogoSrc] = useState<string | null>(null);
    const [fallbackIndex, setFallbackIndex] = useState(0);
    const [fallbacksExhausted, setFallbacksExhausted] = useState(false);

    useEffect(() => {
      if (typeof job.logo === "string") {
        setLogoSrc(job.logo);
      } else if (job.logo && typeof job.logo === "object" && job.logo.primary) {
        setLogoSrc(job.logo.primary);
      } else {
        setFallbacksExhausted(true);
      }
    }, [job]);

    const handleError = () => {
      if (
        typeof job.logo === "object" &&
        job.logo?.fallbacks &&
        fallbackIndex < job.logo.fallbacks.length
      ) {
        setLogoSrc(job.logo.fallbacks[fallbackIndex]);
        setFallbackIndex((prev) => prev + 1);
      } else {
        setFallbacksExhausted(true);
      }
    };

    if (fallbacksExhausted) {
      return <DefaultCompanyLogo company={job.company} size="md" />;
    }

    return (
      <div className="h-12 w-12 rounded-md bg-background overflow-hidden flex items-center justify-center">
        <img
          src={logoSrc || ""}
          alt={job.company}
          className="h-10 w-10 object-contain"
          onError={handleError}
        />
      </div>
    );
  };

  return (
    <div className="container relative mx-auto py-8 px-4 md:px-6 lg:px-8">
      <h1 className="text-4xl font-bold mb-2 tracking-tight">
        Find Your Next Career
      </h1>
      <p className="text-muted-foreground mb-8">
        Discover opportunities that match your skills and aspirations
      </p>

      <div className="bg-card rounded-xl shadow-sm border p-6 mb-8">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="relative" ref={jobInputRef}>
              <SearchIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Job title, keywords, or company"
                value={query}
                onChange={handleJobInputChange}
                onFocus={() => {
                  if (query.length >= 2) {
                    setShowJobSuggestions(true);
                  }
                }}
                className="pl-10 bg-background"
              />
              <SuggestionDropdown
                suggestions={jobSuggestions}
                recentSearches={recentSearches}
                isVisible={showJobSuggestions}
                onSelect={(suggestion) =>
                  handleSuggestionSelect("job", suggestion)
                }
                onClear={handleClearRecentSearch}
              />
            </div>

            <div className="relative" ref={locationInputRef}>
              <MapPin className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="City, state, or remote"
                value={location}
                onChange={handleLocationInputChange}
                onFocus={() => setShowLocationSuggestions(location.length >= 2)}
                className="pl-10 bg-background"
              />
              <SuggestionDropdown
                suggestions={locationSuggestions}
                isVisible={showLocationSuggestions}
                onSelect={(suggestion) =>
                  handleSuggestionSelect("location", suggestion)
                }
              />
            </div>

            <Button
              type="submit"
              className="w-full md:w-auto font-medium"
              disabled={!query.trim()}
            >
              {isLoading ? (
                <>
                  <span className="mr-2 h-4 w-4 animate-spin rounded-full border-2 border-background border-t-transparent"></span>
                  Searching...
                </>
              ) : (
                "Search Jobs"
              )}
            </Button>
          </div>

          <div className="flex items-center justify-between flex-wrap gap-3">
            <Button
              type="button"
              variant="outline"
              className="text-sm flex items-center gap-2"
              onClick={() =>
                document
                  .getElementById("filters-section")
                  ?.classList.toggle("hidden")
              }
            >
              <Filter className="h-4 w-4" />
              Advanced Filters
              {hasActiveFilters && (
                <Badge
                  variant="secondary"
                  className="ml-1 h-5 w-5 rounded-full p-0 flex items-center justify-center"
                >
                  ✓
                </Badge>
              )}
            </Button>

            <div className="flex items-center space-x-2">
              <Switch
                id="remote-only"
                checked={remoteOnly}
                onCheckedChange={setRemoteOnly}
              />
              <Label htmlFor="remote-only" className="text-sm font-medium">
                Remote Only
              </Label>
            </div>
          </div>

          <div id="filters-section" className="hidden pt-4 border-t">
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <Label htmlFor="job-type" className="text-sm">
                  Job Type
                </Label>
                <Select value={jobType} onValueChange={setJobType}>
                  <SelectTrigger id="job-type" className="bg-background">
                    <SelectValue placeholder="Any Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Type</SelectItem>
                    <SelectItem value="full_time">Full Time</SelectItem>
                    <SelectItem value="part_time">Part Time</SelectItem>
                    <SelectItem value="contract">Contract</SelectItem>
                    <SelectItem value="internship">Internship</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="date-posted" className="text-sm">
                  Date Posted
                </Label>
                <Select value={datePosted} onValueChange={setDatePosted}>
                  <SelectTrigger id="date-posted" className="bg-background">
                    <SelectValue placeholder="Any Time" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Time</SelectItem>
                    <SelectItem value="day">Past 24 hours</SelectItem>
                    <SelectItem value="week">Past Week</SelectItem>
                    <SelectItem value="month">Past Month</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="experience" className="text-sm">
                  Experience Level
                </Label>
                <Select value={experience} onValueChange={setExperience}>
                  <SelectTrigger id="experience" className="bg-background">
                    <SelectValue placeholder="Any Level" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Any Level</SelectItem>
                    <SelectItem value="entry">Entry Level</SelectItem>
                    <SelectItem value="mid">Mid Level</SelectItem>
                    <SelectItem value="senior">Senior Level</SelectItem>
                    <SelectItem value="executive">Executive</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between">
                  <Label className="text-sm">Salary (min)</Label>
                  <span className="text-sm font-medium">${salaryMin[0]}k+</span>
                </div>
                <Slider
                  value={salaryMin}
                  min={0}
                  max={200}
                  step={5}
                  onValueChange={setSalaryMin}
                  className="py-2"
                />
              </div>
            </div>

            {hasActiveFilters && (
              <div className="flex justify-end mt-4">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={resetFilters}
                  className="text-muted-foreground hover:text-primary hover:bg-primary/5 flex items-center gap-1"
                >
                  <X className="h-3 w-3" /> Reset Filters
                </Button>
              </div>
            )}
          </div>
        </form>
      </div>

      <div className="mb-6">
        <Tabs
          defaultValue="list"
          value={activeView}
          onValueChange={setActiveView}
        >
          <div className="flex justify-between items-center mb-4 flex-wrap gap-3">
            <div>
              <h2 className="text-xl font-semibold tracking-tight">
                {resultsHeading()}
              </h2>
              <p className="text-sm text-muted-foreground">
                {resultsSubheading()}
              </p>
            </div>
            <TabsList>
              <TabsTrigger value="list" className="text-sm">
                List View
              </TabsTrigger>
              <TabsTrigger value="grid" className="text-sm">
                Grid View
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="list" className="space-y-4">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <img
                  src="/img/loading.gif"
                  alt="Loading jobs..."
                  className="h-32 w-32 mb-4"
                />
                <h3 className="text-xl font-medium mb-1">
                  Searching for jobs...
                </h3>
                <p className="text-muted-foreground">
                  Finding the best opportunities for you
                </p>
              </div>
            ) : getCurrentPageJobs().length > 0 ? (
              getCurrentPageJobs().map((job) => (
                <Card
                  key={job.id}
                  className={cn(
                    "overflow-hidden border-muted hover:border-primary/30 transition-all hover:shadow-sm",
                    selectedJob?.id === job.id &&
                      showSidebar &&
                      "border-primary"
                  )}
                >
                  <CardHeader className="pb-2">
                    <div className="flex justify-between">
                      <div className="flex gap-4">
                        <CompanyLogo job={job} />
                        <div>
                          <CardTitle className="text-xl font-semibold hover:text-primary transition-colors line-clamp-1">
                            {job.title}
                          </CardTitle>
                          <CardDescription>
                            <span className="flex items-center gap-1">
                              {job.company}
                              {job.company_rating && (
                                <span className="flex items-center ml-2">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs ml-1">
                                    {job.company_rating}
                                  </span>
                                </span>
                              )}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleSaveJob(job.id)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          <Bookmark className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleShareJob(job.id)}
                          className="text-muted-foreground hover:text-primary hover:bg-primary/5"
                        >
                          <Share2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent>
                    <div className="flex flex-wrap gap-2 mb-3">
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs py-0 font-normal"
                      >
                        <Briefcase className="h-3 w-3" /> {job.job_type}
                      </Badge>
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs py-0 font-normal"
                      >
                        <MapPin className="h-3 w-3" /> {job.location}
                      </Badge>
                      {job.salary && (
                        <Badge
                          variant="outline"
                          className="flex items-center gap-1 text-xs py-0 font-normal"
                        >
                          <DollarSign className="h-3 w-3" /> {job.salary}
                        </Badge>
                      )}
                      <Badge
                        variant="outline"
                        className="flex items-center gap-1 text-xs py-0 font-normal"
                      >
                        <CalendarIcon className="h-3 w-3" /> {job.date_posted}
                      </Badge>
                    </div>

                    <div className="text-sm text-muted-foreground line-clamp-2 mb-2">
                      {job.description}
                    </div>

                    {(job.responsibilities ||
                      job.qualifications ||
                      job.benefits) && (
                      <div className="flex flex-wrap gap-4 mt-3 text-xs text-muted-foreground">
                        {job.responsibilities && (
                          <div className="flex items-center gap-1">
                            <Cpu className="h-3 w-3 text-primary" />
                            {job.responsibilities.length} Responsibilities
                          </div>
                        )}
                        {job.qualifications && (
                          <div className="flex items-center gap-1">
                            <BookOpen className="h-3 w-3 text-primary" />
                            {job.qualifications.length} Qualifications
                          </div>
                        )}
                        {job.benefits && job.benefits.length > 0 && (
                          <div className="flex items-center gap-1">
                            <Coffee className="h-3 w-3 text-primary" />
                            {job.benefits.length} Benefits
                          </div>
                        )}
                      </div>
                    )}
                  </CardContent>

                  <CardFooter className="flex justify-between pt-3 border-t">
                    <Button
                      variant="secondary"
                      size="sm"
                      onClick={() => handleViewJobDetails(job)}
                      className={cn(
                        "bg-muted/50 hover:bg-primary/10 hover:text-primary",
                        selectedJob?.id === job.id &&
                          showSidebar &&
                          "bg-primary/10 text-primary"
                      )}
                    >
                      View Details
                    </Button>

                    <Button
                      size="sm"
                      className="font-medium"
                      onClick={() => handleApplyJob(job)}
                    >
                      Apply Now
                    </Button>
                  </CardFooter>
                </Card>
              ))
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-medium">No jobs found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="grid">
            {isLoading ? (
              <div className="flex flex-col items-center justify-center py-20">
                <img
                  src="/img/loading.gif"
                  alt="Loading jobs..."
                  className="h-32 w-32 mb-4"
                />
                <h3 className="text-xl font-medium mb-1">
                  Searching for jobs...
                </h3>
                <p className="text-muted-foreground">
                  Finding the best opportunities for you
                </p>
              </div>
            ) : getCurrentPageJobs().length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {getCurrentPageJobs().map((job) => (
                  <Card
                    key={job.id}
                    className={cn(
                      "overflow-hidden border-muted hover:border-primary/30 transition-all hover:shadow-sm",
                      selectedJob?.id === job.id &&
                        showSidebar &&
                        "border-primary"
                    )}
                  >
                    <CardHeader className="pb-2 pt-4">
                      <div className="flex gap-3">
                        <CompanyLogo job={job} />
                        <div>
                          <CardTitle className="text-lg hover:text-primary transition-colors line-clamp-1">
                            {job.title}
                          </CardTitle>
                          <CardDescription>
                            <span className="flex items-center gap-1">
                              {job.company}
                              {job.company_rating && (
                                <span className="flex items-center ml-2">
                                  <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                                  <span className="text-xs ml-1">
                                    {job.company_rating}
                                  </span>
                                </span>
                              )}
                            </span>
                          </CardDescription>
                        </div>
                      </div>
                    </CardHeader>

                    <CardContent>
                      <div className="flex flex-wrap gap-1 mb-3">
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {job.job_type}
                        </Badge>
                        <Badge
                          variant="secondary"
                          className="text-xs font-normal"
                        >
                          {job.location}
                        </Badge>
                      </div>

                      <div className="text-xs text-muted-foreground line-clamp-2">
                        {job.description}
                      </div>
                    </CardContent>

                    <CardFooter className="flex justify-between gap-2 pt-3 border-t">
                      <Button
                        variant="secondary"
                        size="sm"
                        className={cn(
                          "w-1/2 bg-muted/50 hover:bg-primary/10 hover:text-primary",
                          selectedJob?.id === job.id &&
                            showSidebar &&
                            "bg-primary/10 text-primary"
                        )}
                        onClick={() => handleViewJobDetails(job)}
                      >
                        Details
                      </Button>

                      <Button
                        size="sm"
                        className="w-1/2 font-medium"
                        onClick={() => handleApplyJob(job)}
                      >
                        Apply
                      </Button>
                    </CardFooter>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-16 bg-muted/30 rounded-lg border">
                <h3 className="text-xl font-medium">No jobs found</h3>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search criteria
                </p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>

      {filteredJobs.length > 0 && (
        <>
          <div className="text-sm text-muted-foreground mb-2 text-center">
            Showing{" "}
            {Math.min(
              (currentPage - 1) * ITEMS_PER_PAGE + 1,
              filteredJobs.length
            )}
            -{Math.min(currentPage * ITEMS_PER_PAGE, filteredJobs.length)} of{" "}
            {filteredJobs.length} total results
          </div>

          <Pagination className="my-8">
            <PaginationContent>
              <PaginationItem>
                <PaginationPrevious
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(1, prev - 1))
                  }
                  className={
                    currentPage === 1 ? "pointer-events-none opacity-50" : ""
                  }
                />
              </PaginationItem>

              {(() => {
                let pagesToShow = [];

                if (totalPages <= 7) {
                  pagesToShow = Array.from(
                    { length: totalPages },
                    (_, i) => i + 1
                  );
                } else {
                  if (currentPage <= 3) {
                    pagesToShow = [1, 2, 3, 4, 5, "ellipsis", totalPages];
                  } else if (currentPage >= totalPages - 2) {
                    pagesToShow = [
                      1,
                      "ellipsis",
                      totalPages - 4,
                      totalPages - 3,
                      totalPages - 2,
                      totalPages - 1,
                      totalPages,
                    ];
                  } else {
                    pagesToShow = [
                      1,
                      "ellipsis",
                      currentPage - 1,
                      currentPage,
                      currentPage + 1,
                      "ellipsis",
                      totalPages,
                    ];
                  }
                }

                return pagesToShow.map((page, i) => {
                  if (page === "ellipsis") {
                    return (
                      <PaginationItem key={`ellipsis-${i}`}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    );
                  }

                  return (
                    <PaginationItem key={`page-${page}`}>
                      <PaginationLink
                        isActive={page === currentPage}
                        onClick={() => {
                          setCurrentPage(page as number);
                          fetchJobs(page as number);
                        }}
                      >
                        {page}
                      </PaginationLink>
                    </PaginationItem>
                  );
                });
              })()}

              <PaginationItem>
                <PaginationNext
                  onClick={() =>
                    setCurrentPage((prev) => Math.min(totalPages, prev + 1))
                  }
                  className={
                    currentPage === totalPages
                      ? "pointer-events-none opacity-50"
                      : ""
                  }
                />
              </PaginationItem>
            </PaginationContent>
          </Pagination>
        </>
      )}

      <div
        className={cn(
          "fixed inset-y-0 right-0 w-full md:w-[550px] lg:w-[650px] bg-background border-l shadow-xl transform transition-transform duration-300 z-50 overflow-y-auto",
          showSidebar ? "translate-x-0" : "translate-x-full"
        )}
        ref={sidebarRef}
      >
        {selectedJob && (
          <div className="flex flex-col h-full">
            <div className="sticky top-0 bg-background/95 backdrop-blur-sm z-10 border-b pb-4 pt-6 px-6">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-2xl font-bold tracking-tight">
                  Job Details
                </h2>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => setShowSidebar(false)}
                  className="hover:bg-muted rounded-full h-8 w-8"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex items-start gap-5">
                <CompanyLogo job={selectedJob} />
                <div className="space-y-2 flex-1">
                  <h3 className="text-xl md:text-2xl font-semibold leading-tight">
                    {selectedJob.title}
                  </h3>
                  <div className="flex items-center gap-2">
                    <span className="text-base font-medium">
                      {selectedJob.company}
                    </span>
                    {selectedJob.company_rating && (
                      <div className="flex items-center bg-muted/50 px-2 py-0.5 rounded-full">
                        <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400" />
                        <span className="text-xs ml-1 font-medium">
                          {selectedJob.company_rating}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>

            <div className="flex-1 overflow-auto px-6 py-6 divide-y divide-border">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 pb-6">
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Job Type
                  </h4>
                  <div className="flex items-center gap-2">
                    <Briefcase className="h-4 w-4 text-primary" />
                    <span>{selectedJob.job_type}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Location
                  </h4>
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-primary" />
                    <span>{selectedJob.location}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Salary Range
                  </h4>
                  <div className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    <span>{selectedJob.salary}</span>
                  </div>
                </div>
                <div className="space-y-1.5">
                  <h4 className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                    Posted
                  </h4>
                  <div className="flex items-center gap-2">
                    <CalendarIcon className="h-4 w-4 text-primary" />
                    <span>{selectedJob.date_posted}</span>
                  </div>
                </div>
              </div>

              <div className="py-6">
                <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  Job Description
                </h4>

                <JobDescriptionFormatter
                  description={selectedJob.description}
                />
              </div>

              {(selectedJob.responsibilities || []).length > 0 && (
                <div className="py-6">
                  <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    Key Responsibilities
                  </h4>
                  <ItemDetailFormatter
                    items={selectedJob.responsibilities || []}
                    type="responsibilities"
                  />
                </div>
              )}

              {(selectedJob.qualifications || []).length > 0 && (
                <div className="py-6">
                  <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    Qualifications
                  </h4>
                  <ItemDetailFormatter
                    items={selectedJob.qualifications || []}
                    type="qualifications"
                  />
                </div>
              )}

              {(selectedJob.benefits || []).length > 0 && (
                <div className="py-6">
                  <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
                    <div className="h-6 w-1 bg-primary rounded-full"></div>
                    Benefits & Perks
                  </h4>
                  <ItemDetailFormatter
                    items={selectedJob.benefits || []}
                    type="benefits"
                  />
                </div>
              )}

              <div className="py-6">
                <h4 className="flex items-center gap-2 font-semibold text-lg mb-4">
                  <div className="h-6 w-1 bg-primary rounded-full"></div>
                  About {selectedJob.company}
                </h4>
                <p className="text-base text-muted-foreground leading-relaxed">
                  {selectedJob.company} is a leading company in its industry,
                  committed to innovation and excellence. Join a team of
                  dedicated professionals working together to create impactful
                  solutions.
                </p>
                <div className="mt-4 flex items-center gap-3">
                  <Button variant="outline" size="sm" className="rounded-full">
                    Visit Website <ExternalLink className="ml-1 h-3 w-3" />
                  </Button>
                  <Button variant="outline" size="sm" className="rounded-full">
                    Company Reviews <Star className="ml-1 h-3 w-3" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="sticky bottom-0 bg-background/95 backdrop-blur-sm border-t p-6 flex flex-col sm:flex-row gap-3 z-10">
              <Button
                className="sm:flex-1 bg-primary hover:bg-primary/90"
                size="lg"
                onClick={() => handleApplyJob(selectedJob)}
              >
                <ExternalLink className="h-5 w-5 mr-2" /> Apply Now
              </Button>
              <div className="flex gap-3 sm:flex-1">
                <Button
                  variant="outline"
                  className="flex-1 border-muted-foreground/20 hover:bg-primary/5 hover:text-primary hover:border-primary"
                  onClick={() => handleSaveJob(selectedJob.id)}
                >
                  <Bookmark className="h-5 w-5 mr-2" /> Save
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 border-muted-foreground/20 hover:bg-primary/5 hover:text-primary hover:border-primary"
                  onClick={() => handleShareJob(selectedJob.id)}
                >
                  <Share2 className="h-5 w-5 mr-2" /> Share
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSidebar && !isDesktop && (
        <div
          className="fixed inset-0 bg-black/30 backdrop-blur-sm z-40"
          onClick={() => setShowSidebar(false)}
        />
      )}
    </div>
  );
}

export default function SearchPage() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <SearchPageContent />
    </Suspense>
  );
}

function generateMockJobs(
  query: string,
  location: string,
  jobType: string
): JobListing[] {
  const companies = [
    {
      name: "Google",
      rating: 4.5,
      logo: "https://logo.clearbit.com/google.com",
    },
    {
      name: "Microsoft",
      rating: 4.3,
      logo: "https://logo.clearbit.com/microsoft.com",
    },
    {
      name: "Amazon",
      rating: 3.9,
      logo: "https://logo.clearbit.com/amazon.com",
    },
    { name: "Meta", rating: 4.1, logo: "https://logo.clearbit.com/meta.com" },
    { name: "Apple", rating: 4.6, logo: "https://logo.clearbit.com/apple.com" },
    {
      name: "Netflix",
      rating: 4.2,
      logo: "https://logo.clearbit.com/netflix.com",
    },
    { name: "Tesla", rating: 3.8, logo: "https://logo.clearbit.com/tesla.com" },
    {
      name: "Twitter",
      rating: 3.7,
      logo: "https://logo.clearbit.com/twitter.com",
    },
    {
      name: "Salesforce",
      rating: 4.0,
      logo: "https://logo.clearbit.com/salesforce.com",
    },
  ];

  const featuredJobs = [
    {
      title: "Senior Software Engineer",
      company: "Google",
      location: "Mountain View, CA",
      type: "Full-time",
      expLevel: "Senior Level",
      salary: "$150K - $220K",
      logo: "https://logo.clearbit.com/google.com",
      rating: 4.5,
      posted: "3 days ago",
      description:
        "Join our team to build the next generation of search technology. You'll work on highly scalable systems that impact billions of users worldwide.",
    },
    {
      title: "Product Manager",
      company: "Microsoft",
      location: "Redmond, WA",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$120K - $160K",
      logo: "https://logo.clearbit.com/microsoft.com",
      rating: 4.3,
      posted: "2 days ago",
      description:
        "Drive product development for our cloud services division. Work with cross-functional teams to deliver innovative solutions to enterprise customers.",
    },
    {
      title: "Frontend Developer",
      company: "Meta",
      location: "Remote",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$130K - $170K",
      logo: "https://logo.clearbit.com/meta.com",
      rating: 4.1,
      posted: "1 week ago",
      description:
        "Build engaging user interfaces and experiences for Meta's family of apps. Focus on performance, accessibility, and cutting-edge web technologies.",
    },
    {
      title: "Data Scientist",
      company: "Netflix",
      location: "Los Angeles, CA",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$140K - $180K",
      logo: "https://logo.clearbit.com/netflix.com",
      rating: 4.2,
      posted: "5 days ago",
      description:
        "Apply machine learning and analytics to help optimize our content recommendations and streaming quality for millions of users.",
    },
    {
      title: "UX Designer",
      company: "Apple",
      location: "Cupertino, CA",
      type: "Full-time",
      expLevel: "Senior Level",
      salary: "$130K - $180K",
      logo: "https://logo.clearbit.com/apple.com",
      rating: 4.6,
      posted: "1 day ago",
      description:
        "Create intuitive and elegant user experiences for Apple products. Collaborate with engineering and product teams to define and implement innovative solutions.",
    },
    {
      title: "DevOps Engineer",
      company: "Amazon",
      location: "Seattle, WA",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$125K - $165K",
      logo: "https://logo.clearbit.com/amazon.com",
      rating: 3.9,
      posted: "4 days ago",
      description:
        "Build and maintain infrastructure for high-volume services. Implement CI/CD pipelines and ensure reliability across AWS environments.",
    },
    {
      title: "Machine Learning Engineer",
      company: "Tesla",
      location: "Austin, TX",
      type: "Full-time",
      expLevel: "Senior Level",
      salary: "$160K - $210K",
      logo: "https://logo.clearbit.com/tesla.com",
      rating: 3.8,
      posted: "2 weeks ago",
      description:
        "Develop machine learning models for autonomous driving systems. Work with large datasets and state-of-the-art algorithms to solve complex problems.",
    },
    {
      title: "Backend Developer",
      company: "Salesforce",
      location: "San Francisco, CA",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$135K - $175K",
      logo: "https://logo.clearbit.com/salesforce.com",
      rating: 4.0,
      posted: "3 days ago",
      description:
        "Design and develop scalable backend services for our CRM platform. Focus on performance, security, and maintainability.",
    },
    {
      title: "iOS Developer",
      company: "Spotify",
      location: "New York, NY",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$120K - $160K",
      logo: "https://logo.clearbit.com/spotify.com",
      rating: 4.2,
      posted: "1 week ago",
      description:
        "Build and improve our iOS app used by millions of users. Focus on performance, user experience, and audio playback quality.",
    },
    {
      title: "Android Developer",
      company: "Airbnb",
      location: "Remote",
      type: "Full-time",
      expLevel: "Mid Level",
      salary: "$125K - $165K",
      logo: "https://logo.clearbit.com/airbnb.com",
      rating: 4.1,
      posted: "6 days ago",
      description:
        "Develop features for our Android app that helps people find and book accommodations worldwide. Focus on reliability and beautiful interfaces.",
    },
  ];

  if (!query && !location && jobType === "all") {
    return featuredJobs.map((job, i) => {
      const formatJobType = (type: string): string => {
        switch (type.toLowerCase()) {
          case "full-time":
          case "full time":
            return "Full-time";
          case "part-time":
          case "part time":
            return "Part-time";
          case "contract":
            return "Contract";
          case "internship":
            return "Internship";
          default:
            return type;
        }
      };

      return {
        id: `featured-job-${i + 1}`,
        title: job.title,
        company: job.company,
        location: job.location,
        description: job.description,
        salary: job.salary,
        date_posted: job.posted,
        job_type: formatJobType(job.type),
        experience_level: job.expLevel,
        company_rating: job.rating,
        url: "#",
        logo: job.logo,
        responsibilities: [],
        qualifications: [],
        benefits: [],
      };
    });
  }

  return [];
}
