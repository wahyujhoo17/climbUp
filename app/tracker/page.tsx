"use client";

import { useState, useMemo, useEffect } from "react"; // Update import
import Image from "next/image";
import { format, parseISO } from "date-fns";
import {
  Plus,
  Search,
  Filter,
  Briefcase,
  Check,
  X,
  MoreHorizontal,
  Calendar,
  Building,
  Star,
  StarOff,
  ChevronDown,
  Eye,
  Trash2,
  ExternalLink,
  Save,
  ArrowUpDown,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label"; // Add this import
import { Checkbox } from "@/components/ui/checkbox"; // Add this import
import { Separator } from "@/components/ui/separator"; // Add this import
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useToast } from "@/hooks/use-toast";

// Define job application interface
interface JobApplication {
  id: string;
  title: string;
  company: string;
  location: string;
  status: "Saved" | "Applied" | "Interviewed" | "Offered" | "Rejected";
  dateApplied: string;
  logo?: string;
  favorite: boolean;
  notes?: string;
  salary?: string;
  url?: string;
  color?: string;
  contactName?: string;
  contactEmail?: string;
  nextStep?: string;
  nextDate?: string;
}

// Sample color palette for company cards
const companyColors = [
  "bg-blue-50 dark:bg-blue-950",
  "bg-purple-50 dark:bg-purple-950",
  "bg-green-50 dark:bg-green-950",
  "bg-amber-50 dark:bg-amber-950",
  "bg-red-50 dark:bg-red-950",
  "bg-pink-50 dark:bg-pink-950",
  "bg-sky-50 dark:bg-sky-950",
  "bg-indigo-50 dark:bg-indigo-950",
];

// Mock data for job applications
const mockJobs: JobApplication[] = [
  {
    id: "job1",
    title: "Senior Frontend Developer",
    company: "TechCorp",
    location: "Jakarta, Indonesia (Remote)",
    status: "Interviewed",
    dateApplied: "2025-03-20T09:00:00",
    logo: "https://logo.clearbit.com/techcorp.com",
    favorite: true,
    salary: "Rp 15,000,000 - Rp 25,000,000 per month",
    url: "https://example.com/job1",
    color: companyColors[0],
    contactName: "Sarah Johnson",
    contactEmail: "sarah@techcorp.com",
    nextStep: "Final Interview",
    nextDate: "2025-04-15T14:00:00",
    notes:
      "Had a great second interview with the team lead. They seemed impressed with my React knowledge.",
  },
  {
    id: "job2",
    title: "Full-Stack Developer",
    company: "Innovation Labs",
    location: "Surabaya, Indonesia",
    status: "Applied",
    dateApplied: "2025-03-28T10:30:00",
    logo: "https://logo.clearbit.com/innovationlabs.com",
    favorite: false,
    color: companyColors[1],
    notes:
      "Applied through the company website. Resume was tailored to highlight Node.js experience.",
  },
  {
    id: "job3",
    title: "UX Designer",
    company: "CreativeMinds",
    location: "Bandung, Indonesia",
    status: "Saved",
    dateApplied: "2025-04-01T11:15:00",
    logo: "https://logo.clearbit.com/creativeminds.com",
    favorite: true,
    color: companyColors[2],
    notes: "Need to update portfolio before applying.",
  },
  {
    id: "job4",
    title: "DevOps Engineer",
    company: "CloudNative",
    location: "Remote",
    status: "Rejected",
    dateApplied: "2025-03-15T13:45:00",
    logo: "https://logo.clearbit.com/cloudnative.com",
    favorite: false,
    color: companyColors[3],
    notes:
      "Received rejection email. They were looking for someone with more AWS experience.",
  },
  {
    id: "job5",
    title: "Product Manager",
    company: "GrowthStartup",
    location: "Jakarta, Indonesia",
    status: "Offered",
    dateApplied: "2025-03-10T15:20:00",
    logo: "https://logo.clearbit.com/growthstartup.com",
    favorite: true,
    salary: "Rp 20,000,000 - Rp 30,000,000 per month",
    color: companyColors[4],
    notes: "Received offer! Need to negotiate salary.",
  },
  {
    id: "job6",
    title: "Mobile Developer",
    company: "AppWizards",
    location: "Bali, Indonesia (Remote)",
    status: "Interviewed",
    dateApplied: "2025-03-25T09:30:00",
    logo: "https://logo.clearbit.com/appwizards.com",
    favorite: false,
    color: companyColors[5],
    notes: "First round technical interview completed. Waiting for feedback.",
  },
  {
    id: "job7",
    title: "Backend Engineer",
    company: "DataSystems",
    location: "Remote",
    status: "Applied",
    dateApplied: "2025-04-02T14:10:00",
    logo: "https://logo.clearbit.com/datasystems.com",
    favorite: false,
    color: companyColors[6],
    notes: "Applied via LinkedIn Easy Apply.",
  },
];

export default function TrackerPage() {
  const { toast } = useToast();
  const [jobs, setJobs] = useState<JobApplication[]>(mockJobs);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [showAddJobDialog, setShowAddJobDialog] = useState(false);
  const [newJob, setNewJob] = useState<Partial<JobApplication>>({
    title: "",
    company: "",
    location: "",
    status: "Saved",
    dateApplied: new Date().toISOString().split("T")[0],
    favorite: false,
    notes: "",
  });
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [showJobDetailsDialog, setShowJobDetailsDialog] = useState(false);
  const [logoErrors, setLogoErrors] = useState<Record<string, boolean>>({});
  const [columnHeight, setColumnHeight] = useState("calc(100vh - 300px)");

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 640) {
        setColumnHeight("400px"); // Mobile height
      } else if (window.innerWidth < 1024) {
        setColumnHeight("500px"); // Tablet height
      } else {
        setColumnHeight("calc(100vh - 300px)"); // Desktop height
      }
    };

    // Initial check
    handleResize();

    // Add event listener
    window.addEventListener("resize", handleResize);

    // Clean up
    return () => {
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  // Filter jobs based on search query and status filter
  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
      const matchesSearch =
        searchQuery === "" ||
        job.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.company.toLowerCase().includes(searchQuery.toLowerCase()) ||
        job.location.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus =
        statusFilter === "all" || job.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [jobs, searchQuery, statusFilter]);

  // Group jobs by status
  const jobsByStatus = useMemo(() => {
    const grouped: Record<string, JobApplication[]> = {
      Saved: [],
      Applied: [],
      Interviewed: [],
      Offered: [],
      Rejected: [],
    };

    filteredJobs.forEach((job) => {
      if (grouped[job.status]) {
        grouped[job.status].push(job);
      }
    });

    return grouped;
  }, [filteredJobs]);

  // Count jobs by status
  const statusCounts = useMemo(() => {
    const counts: Record<string, number> = {
      all: filteredJobs.length,
      Saved: 0,
      Applied: 0,
      Interviewed: 0,
      Offered: 0,
      Rejected: 0,
    };

    filteredJobs.forEach((job) => {
      counts[job.status]++;
    });

    return counts;
  }, [filteredJobs]);

  // Handle logo loading error
  const handleLogoError = (jobId: string) => {
    setLogoErrors((prev) => ({ ...prev, [jobId]: true }));
  };

  // Handle adding a new job
  const handleAddJob = () => {
    if (!newJob.title || !newJob.company) {
      toast({
        title: "Missing information",
        description: "Please fill in the job title and company name.",
        variant: "destructive",
      });
      return;
    }

    const jobToAdd: JobApplication = {
      id: `job-${Date.now()}`,
      title: newJob.title || "",
      company: newJob.company || "",
      location: newJob.location || "",
      status: newJob.status as
        | "Saved"
        | "Applied"
        | "Interviewed"
        | "Offered"
        | "Rejected",
      dateApplied: newJob.dateApplied || new Date().toISOString(),
      favorite: newJob.favorite || false,
      notes: newJob.notes || "",
      salary: newJob.salary || "",
      url: newJob.url || "",
      color: companyColors[Math.floor(Math.random() * companyColors.length)],
    };

    setJobs((prev) => [jobToAdd, ...prev]);
    setShowAddJobDialog(false);
    toast({
      title: "Job added",
      description: `${jobToAdd.title} at ${jobToAdd.company} has been added to your tracker.`,
    });

    // Reset the form
    setNewJob({
      title: "",
      company: "",
      location: "",
      status: "Saved",
      dateApplied: new Date().toISOString().split("T")[0],
      favorite: false,
      notes: "",
    });
  };

  // Handle updating job status
  const updateJobStatus = (
    jobId: string,
    newStatus: JobApplication["status"]
  ) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return { ...job, status: newStatus };
        }
        return job;
      })
    );

    toast({
      title: "Status updated",
      description: `Job status has been updated to "${newStatus}".`,
    });
  };

  // Handle toggling favorite status
  const toggleFavorite = (jobId: string) => {
    setJobs((prev) =>
      prev.map((job) => {
        if (job.id === jobId) {
          return { ...job, favorite: !job.favorite };
        }
        return job;
      })
    );
  };

  // Handle job deletion
  const deleteJob = (jobId: string) => {
    setJobs((prev) => prev.filter((job) => job.id !== jobId));
    setShowJobDetailsDialog(false);

    toast({
      title: "Job deleted",
      description: "The job has been removed from your tracker.",
    });
  };

  // Handle job selection for details view
  const showJobDetails = (job: JobApplication) => {
    setSelectedJob(job);
    setShowJobDetailsDialog(true);
  };

  // Handle job updates
  const updateJob = (updatedJob: JobApplication) => {
    setShowJobDetailsDialog(false);
    toast({
      title: "Job updated",
      description: "Your changes have been saved.",
    });
  };

  // Get badge color based on status
  const getStatusBadgeVariant = (
    status: string
  ): "secondary" | "destructive" | "default" | "outline" => {
    switch (status) {
      case "Saved":
        return "outline";
      case "Applied":
        return "secondary";
      case "Interviewed":
        return "default";
      case "Offered":
        // Temporarily map 'success' to 'default' due to type mismatch
        // TODO: Update Badge component variants in components/ui/badge.tsx to include 'success'
        return "default";
      case "Rejected":
        return "destructive";
      default:
        return "outline";
    }
  };

  return (
    <div className="mx-auto">
      {/* Enhanced Header */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-2">
            <div className="max-w-xl">
              <h1 className="text-3xl font-bold tracking-tight mb-2">
                Job Tracker
              </h1>
              <p className="text-muted-foreground leading-relaxed">
                Keep track of your job applications, monitor progress, and stay
                organized during your job search journey.
              </p>
            </div>
            <div className="mt-4 md:mt-0 flex items-center space-x-3">
              <Button
                variant="outline"
                onClick={() => setShowAddJobDialog(true)}
              >
                <Plus className="mr-2 h-4 w-4" /> Add Job
              </Button>
            </div>
          </div>

          {/* Status Overview - Modern Cards with Indicator Bar */}
          <div className="mt-6 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
            {["Saved", "Applied", "Interviewed", "Offered", "Rejected"].map(
              (status) => (
                <button
                  key={status}
                  onClick={() =>
                    setStatusFilter(status === statusFilter ? "all" : status)
                  }
                  className={`relative flex flex-col items-start rounded-lg transition-all overflow-hidden ${
                    statusFilter === status
                      ? "shadow-md border-primary/30 bg-card border"
                      : "bg-card border border-transparent hover:border-border hover:shadow-sm"
                  }`}
                >
                  {/* Top status indicator bar */}
                  <div
                    className={`h-1.5 w-full absolute top-0 left-0 ${
                      status === "Saved"
                        ? "bg-gray-400"
                        : status === "Applied"
                        ? "bg-blue-400"
                        : status === "Interviewed"
                        ? "bg-purple-400"
                        : status === "Offered"
                        ? "bg-green-400"
                        : "bg-red-400"
                    }`}
                  />

                  <div className="p-5 pt-6 w-full">
                    <div className="flex justify-between items-center w-full mb-3">
                      <span className="font-medium text-sm">{status}</span>
                      <Badge
                        variant={
                          statusFilter === status ? "default" : "outline"
                        }
                        className={`${
                          statusFilter === status
                            ? "bg-primary/90"
                            : "bg-background"
                        }`}
                      >
                        {statusFilter === status ? "Active" : ""}
                      </Badge>
                    </div>

                    <div>
                      <span className="block text-3xl font-bold mb-1">
                        {statusCounts[status]}
                      </span>
                      <div className="h-1 w-full bg-muted rounded-full overflow-hidden">
                        <div
                          className={`h-full ${
                            status === "Saved"
                              ? "bg-gray-400"
                              : status === "Applied"
                              ? "bg-blue-400"
                              : status === "Interviewed"
                              ? "bg-purple-400"
                              : status === "Offered"
                              ? "bg-green-400"
                              : "bg-red-400"
                          }`}
                          style={{
                            width:
                              jobs.length > 0
                                ? `${
                                    (statusCounts[status] / jobs.length) * 100
                                  }%`
                                : "0%",
                          }}
                        />
                      </div>
                    </div>
                  </div>
                </button>
              )
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-[280px_1fr] gap-6">
          {/* Improved Sidebar */}
          <div className="space-y-6">
            {/* Search with Icon */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search jobs, companies, locations..."
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>

            {/* Status Filter */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-medium">Filter by Status</h3>
              </div>
              <div className="p-2">
                <button
                  className={`flex items-center justify-between w-full rounded-md px-3 py-2 text-sm ${
                    statusFilter === "all"
                      ? "bg-primary text-primary-foreground"
                      : "hover:bg-muted/50"
                  }`}
                  onClick={() => setStatusFilter("all")}
                >
                  <div className="flex items-center">
                    <Briefcase className="mr-2 h-4 w-4" />
                    <span>All Jobs</span>
                  </div>
                  <Badge
                    variant={statusFilter === "all" ? "outline" : "secondary"}
                    className="ml-auto bg-background/80"
                  >
                    {statusCounts.all}
                  </Badge>
                </button>

                {["Saved", "Applied", "Interviewed", "Offered", "Rejected"].map(
                  (status) => (
                    <button
                      key={status}
                      className={`flex items-center justify-between w-full rounded-md px-3 py-2 text-sm ${
                        statusFilter === status
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/50"
                      }`}
                      onClick={() => setStatusFilter(status)}
                    >
                      <div className="flex items-center">
                        <div
                          className={`h-2.5 w-2.5 rounded-full mr-2 ${
                            status === "Saved"
                              ? "bg-gray-400"
                              : status === "Applied"
                              ? "bg-blue-400"
                              : status === "Interviewed"
                              ? "bg-purple-400"
                              : status === "Offered"
                              ? "bg-green-400"
                              : "bg-red-400"
                          }`}
                        />
                        <span>{status}</span>
                      </div>
                      <Badge
                        variant={
                          statusFilter === status ? "outline" : "secondary"
                        }
                        className="ml-auto bg-background/80"
                      >
                        {statusCounts[status]}
                      </Badge>
                    </button>
                  )
                )}
              </div>
            </div>

            {/* Quick Stats */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-medium">Application Insights</h3>
              </div>
              <div className="p-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        Total Applications
                      </span>
                      <span className="font-medium">{jobs.length}</span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-primary h-full"
                        style={{ width: "100%" }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        Interview Rate
                      </span>
                      <span className="font-medium">
                        {jobs.length > 0
                          ? `${Math.round(
                              ((statusCounts.Interviewed +
                                statusCounts.Offered) /
                                (statusCounts.Applied +
                                  statusCounts.Interviewed +
                                  statusCounts.Offered +
                                  statusCounts.Rejected)) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-purple-400 h-full"
                        style={{
                          width: `${
                            jobs.length > 0
                              ? Math.round(
                                  ((statusCounts.Interviewed +
                                    statusCounts.Offered) /
                                    (statusCounts.Applied +
                                      statusCounts.Interviewed +
                                      statusCounts.Offered +
                                      statusCounts.Rejected)) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <span className="text-sm text-muted-foreground">
                        Offer Rate
                      </span>
                      <span className="font-medium">
                        {jobs.length > 0
                          ? `${Math.round(
                              (statusCounts.Offered /
                                (statusCounts.Applied +
                                  statusCounts.Interviewed +
                                  statusCounts.Offered +
                                  statusCounts.Rejected)) *
                                100
                            )}%`
                          : "0%"}
                      </span>
                    </div>
                    <div className="h-1.5 w-full bg-muted rounded-full overflow-hidden">
                      <div
                        className="bg-green-400 h-full"
                        style={{
                          width: `${
                            jobs.length > 0
                              ? Math.round(
                                  (statusCounts.Offered /
                                    (statusCounts.Applied +
                                      statusCounts.Interviewed +
                                      statusCounts.Offered +
                                      statusCounts.Rejected)) *
                                    100
                                )
                              : 0
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Recently Added */}
            <div className="rounded-lg border bg-card">
              <div className="p-4 border-b">
                <h3 className="font-medium">Recently Added</h3>
              </div>
              <div className="p-2">
                <ScrollArea className="h-[180px]">
                  {jobs.slice(0, 5).map((job) => (
                    <button
                      key={job.id}
                      className="w-full text-left p-2 hover:bg-muted rounded-md"
                      onClick={() => showJobDetails(job)}
                    >
                      <div className="flex items-start">
                        <div className="w-8 h-8 rounded flex items-center justify-center bg-primary/10 text-primary mr-3">
                          {job.company.charAt(0)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">
                            {job.title}
                          </p>
                          <p className="text-xs text-muted-foreground truncate">
                            {job.company}
                          </p>
                        </div>
                      </div>
                    </button>
                  ))}
                </ScrollArea>
              </div>
            </div>
          </div>

          {/* Main Content */}
          <div>
            <Tabs defaultValue="board" className="w-full">
              <TabsList className="mb-4">
                <TabsTrigger value="board">Board View</TabsTrigger>
                <TabsTrigger value="list">List View</TabsTrigger>
              </TabsList>

              {/* Enhanced Board View with Modern Styling */}
              <TabsContent value="board" className="w-full">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg font-medium">Job Board</h3>
                    <Badge variant="outline" className="font-normal">
                      {filteredJobs.length} jobs
                    </Badge>
                  </div>
                  <Select defaultValue="newest">
                    <SelectTrigger className="w-[180px]">
                      <SelectValue placeholder="Sort by" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="newest">Newest First</SelectItem>
                      <SelectItem value="oldest">Oldest First</SelectItem>
                      <SelectItem value="alphabetical">A-Z</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Adjust the overall column layout */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-2 min-h-[70vh]">
                  {[
                    "Saved",
                    "Applied",
                    "Interviewed",
                    "Offered",
                    "Rejected",
                  ].map((status) => (
                    <div
                      key={status}
                      className="rounded-lg border bg-background flex flex-col shadow-sm w-full overflow-hidden"
                    >
                      {/* Column header */}
                      <div className="p-3 border-b sticky top-0 bg-muted/80 backdrop-blur-sm z-10">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center">
                            <div
                              className={`h-2.5 w-2.5 rounded-full mr-2 ${
                                status === "Saved"
                                  ? "bg-gray-400"
                                  : status === "Applied"
                                  ? "bg-blue-400"
                                  : status === "Interviewed"
                                  ? "bg-purple-400"
                                  : status === "Offered"
                                  ? "bg-green-400"
                                  : "bg-red-400"
                              }`}
                            />
                            <h4 className="text-sm font-medium">{status}</h4>
                          </div>
                          <Badge variant="outline">
                            {jobsByStatus[status].length}
                          </Badge>
                        </div>
                      </div>

                      {/* Improved scroll area */}
                      <ScrollArea
                        className="flex-grow"
                        style={{ height: columnHeight }}
                        scrollHideDelay={0}
                      >
                        <div className="p-2 space-y-2">
                          {jobsByStatus[status].length > 0 ? (
                            jobsByStatus[status].map((job) => (
                              <div
                                key={job.id}
                                className={`rounded-lg border overflow-hidden transition-all hover:shadow-md cursor-pointer group relative ${
                                  job.color
                                    ? `${job.color} bg-opacity-100 dark:bg-opacity-100`
                                    : "bg-card"
                                }`}
                                onClick={() => showJobDetails(job)}
                              >
                                {/* Status indicator bar */}
                                <div
                                  className={`h-1 w-full ${
                                    job.status === "Saved"
                                      ? "bg-gray-400"
                                      : job.status === "Applied"
                                      ? "bg-blue-400"
                                      : job.status === "Interviewed"
                                      ? "bg-purple-400"
                                      : job.status === "Offered"
                                      ? "bg-green-400"
                                      : "bg-red-400"
                                  }`}
                                />

                                {/* Job content */}
                                <div className="p-3 space-y-1.5">
                                  {/* Company and title row */}
                                  <div className="flex items-center mb-2">
                                    <div className="rounded-md overflow-hidden flex-shrink-0 flex items-center justify-center h-9 w-9 bg-white dark:bg-gray-800 border mr-2">
                                      {!logoErrors[job.id] && job.logo ? (
                                        <Image
                                          src={job.logo}
                                          alt={`${job.company} logo`}
                                          width={36}
                                          height={36}
                                          className="object-contain"
                                          onError={() =>
                                            handleLogoError(job.id)
                                          }
                                        />
                                      ) : (
                                        <span className="text-sm font-bold">
                                          {job.company.charAt(0)}
                                        </span>
                                      )}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                      <div className="flex items-center justify-between">
                                        <h4 className="font-medium text-sm line-clamp-1 pr-1">
                                          {job.title}
                                        </h4>
                                        {job.favorite && (
                                          <Star className="h-3.5 w-3.5 fill-yellow-400 text-yellow-400 flex-shrink-0 ml-1" />
                                        )}
                                      </div>
                                      <p className="text-xs text-muted-foreground line-clamp-1">
                                        {job.company}
                                      </p>
                                    </div>
                                  </div>

                                  {/* Job details */}
                                  <div className="space-y-1 text-xs text-muted-foreground">
                                    {job.location && (
                                      <div className="flex items-start">
                                        <Building className="h-3 w-3 mr-1.5 flex-shrink-0 mt-0.5" />
                                        <span className="line-clamp-1">
                                          {job.location}
                                        </span>
                                      </div>
                                    )}

                                    <div className="flex items-center">
                                      <Calendar className="h-3 w-3 mr-1.5 flex-shrink-0" />
                                      <span className="line-clamp-1">
                                        Applied:{" "}
                                        {format(
                                          parseISO(job.dateApplied),
                                          "MMM d, yyyy"
                                        )}
                                      </span>
                                    </div>
                                  </div>

                                  {/* Notes preview - simplified */}
                                  {job.notes && (
                                    <div className="mt-2 pt-1.5 border-t border-muted/50">
                                      <p className="text-xs text-muted-foreground italic line-clamp-2">
                                        "{job.notes}"
                                      </p>
                                    </div>
                                  )}
                                </div>

                                {/* Hover action button - simplified */}
                                <Button
                                  variant="secondary"
                                  size="icon"
                                  className="h-6 w-6 rounded-full absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity bg-background/80 backdrop-blur-sm"
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    showJobDetails(job);
                                  }}
                                >
                                  <Eye className="h-3 w-3" />
                                </Button>
                              </div>
                            ))
                          ) : (
                            <div className="flex flex-col items-center justify-center p-6 border border-dashed rounded-lg text-center py-8">
                              <div className="rounded-full bg-muted p-2 mb-2">
                                <Plus className="h-4 w-4 text-muted-foreground" />
                              </div>
                              <p className="text-sm text-muted-foreground">
                                No jobs in {status}
                              </p>
                            </div>
                          )}
                        </div>
                      </ScrollArea>

                      {/* Bottom action */}
                      <div className="p-2 border-t bg-muted/60">
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full h-7"
                          onClick={() => setShowAddJobDialog(true)}
                        >
                          <Plus className="mr-1.5 h-3.5 w-3.5" />
                          Add Job
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </TabsContent>

              {/* Enhanced List View */}
              <TabsContent value="list">
                <div className="bg-background rounded-lg border overflow-hidden">
                  <div className="flex justify-between items-center p-4 bg-muted">
                    <div className="flex items-center space-x-2">
                      <span className="text-sm font-medium">
                        {filteredJobs.length} Jobs
                      </span>
                      <Badge variant="outline">
                        {statusFilter === "all" ? "All" : statusFilter}
                      </Badge>
                    </div>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm" className="h-8 text-xs">
                        <Filter className="h-3.5 w-3.5 mr-1.5" />
                        More Filters
                      </Button>
                      <Select defaultValue="newest">
                        <SelectTrigger className="h-8 w-[150px] text-xs">
                          <SelectValue placeholder="Sort by" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="newest">Newest First</SelectItem>
                          <SelectItem value="oldest">Oldest First</SelectItem>
                          <SelectItem value="az">A-Z (Company)</SelectItem>
                          <SelectItem value="za">Z-A (Company)</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b bg-muted">
                          <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                            Job
                          </th>
                          <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                            Company
                          </th>
                          <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                            Location
                          </th>
                          <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                            Date Applied
                          </th>
                          <th className="h-10 px-4 text-left text-xs font-medium text-muted-foreground">
                            Status
                          </th>
                          <th className="h-10 px-4 text-right text-xs font-medium text-muted-foreground">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-background">
                        {filteredJobs.length > 0 ? (
                          filteredJobs.map((job) => (
                            <tr
                              key={job.id}
                              className="border-b hover:bg-muted cursor-pointer transition-colors"
                              onClick={() => showJobDetails(job)}
                            >
                              <td className="p-4">
                                <div className="flex items-center">
                                  {job.favorite && (
                                    <Star className="h-4 w-4 fill-yellow-400 text-yellow-400 mr-2" />
                                  )}
                                  <div className="font-medium">{job.title}</div>
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <div className="mr-3 rounded-md overflow-hidden flex items-center justify-center h-8 w-8 bg-white dark:bg-gray-800 flex-shrink-0 border">
                                    {!logoErrors[job.id] && job.logo ? (
                                      <Image
                                        src={job.logo}
                                        alt={`${job.company} logo`}
                                        width={32}
                                        height={32}
                                        className="object-contain"
                                        onError={() => handleLogoError(job.id)}
                                      />
                                    ) : (
                                      <span className="text-sm font-bold">
                                        {job.company.charAt(0)}
                                      </span>
                                    )}
                                  </div>
                                  {job.company}
                                </div>
                              </td>
                              <td className="p-4">
                                <div className="flex items-center text-muted-foreground">
                                  <Building className="h-3.5 w-3.5 mr-1.5" />
                                  {job.location || "Not specified"}
                                </div>
                              </td>
                              <td className="p-4 text-muted-foreground">
                                {format(
                                  parseISO(job.dateApplied),
                                  "MMM d, yyyy"
                                )}
                              </td>
                              <td className="p-4">
                                <div className="flex items-center">
                                  <div
                                    className={`h-2 w-2 rounded-full mr-2 ${
                                      job.status === "Saved"
                                        ? "bg-gray-400"
                                        : job.status === "Applied"
                                        ? "bg-blue-400"
                                        : job.status === "Interviewed"
                                        ? "bg-purple-400"
                                        : job.status === "Offered"
                                        ? "bg-green-400"
                                        : "bg-red-400"
                                    }`}
                                  />
                                  <Badge variant={getStatusBadgeVariant(job.status)}>
                                    {job.status}
                                  </Badge>
                                </div>
                              </td>
                              <td className="p-4 text-right">
                                <div className="flex justify-end">
                                  <DropdownMenu>
                                    <DropdownMenuTrigger
                                      asChild
                                      onClick={(e) => e.stopPropagation()}
                                    >
                                      <Button
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8 rounded-full"
                                      >
                                        <MoreHorizontal className="h-4 w-4" />
                                      </Button>
                                    </DropdownMenuTrigger>
                                    <DropdownMenuContent
                                      align="end"
                                      className="w-48"
                                    >
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          showJobDetails(job);
                                        }}
                                      >
                                        <Eye className="mr-2 h-4 w-4" />
                                        View Details
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuLabel>
                                        Change status to
                                      </DropdownMenuLabel>
                                      {[
                                        "Saved",
                                        "Applied",
                                        "Interviewed",
                                        "Offered",
                                        "Rejected",
                                      ].map((status) => (
                                        <DropdownMenuItem
                                          key={status}
                                          disabled={job.status === status}
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            updateJobStatus(
                                              job.id,
                                              status as any
                                            );
                                          }}
                                        >
                                          <div
                                            className={`h-2 w-2 rounded-full mr-2 ${
                                              status === "Saved"
                                                ? "bg-gray-400"
                                                : status === "Applied"
                                                ? "bg-blue-400"
                                                : status === "Interviewed"
                                                ? "bg-purple-400"
                                                : status === "Offered"
                                                ? "bg-green-400"
                                                : "bg-red-400"
                                            }`}
                                          />
                                          {status}
                                        </DropdownMenuItem>
                                      ))}
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          toggleFavorite(job.id);
                                        }}
                                      >
                                        {job.favorite ? (
                                          <>
                                            <StarOff className="mr-2 h-4 w-4" />
                                            Remove from Favorites
                                          </>
                                        ) : (
                                          <>
                                            <Star className="mr-2 h-4 w-4" />
                                            Add to Favorites
                                          </>
                                        )}
                                      </DropdownMenuItem>
                                      <DropdownMenuSeparator />
                                      <DropdownMenuItem
                                        className="text-red-500 focus:text-red-500"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          deleteJob(job.id);
                                        }}
                                      >
                                        <Trash2 className="mr-2 h-4 w-4" />
                                        Delete
                                      </DropdownMenuItem>
                                    </DropdownMenuContent>
                                  </DropdownMenu>
                                </div>
                              </td>
                            </tr>
                          ))
                        ) : (
                          <tr>
                            <td
                              colSpan={6}
                              className="p-8 text-center bg-background"
                            >
                              <div className="flex flex-col items-center justify-center">
                                <div className="rounded-full bg-muted p-3 mb-3">
                                  <Briefcase className="h-6 w-6 text-muted-foreground" />
                                </div>
                                <h4 className="font-medium mb-1">
                                  No job applications found
                                </h4>
                                <p className="text-sm text-muted-foreground mb-4">
                                  Try adjusting your filters or add a new job
                                  application.
                                </p>
                                <Button
                                  variant="outline"
                                  onClick={() => setShowAddJobDialog(true)}
                                >
                                  <Plus className="mr-2 h-4 w-4" />
                                  Add New Job
                                </Button>
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>

        {/* Enhanced Add Job Dialog */}
        <Dialog open={showAddJobDialog} onOpenChange={setShowAddJobDialog}>
          <DialogContent className="sm:max-w-lg">
            <DialogHeader>
              <DialogTitle className="text-xl">Add New Job</DialogTitle>
              <DialogDescription>
                Track a new job application in your list.
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-5 py-4">
              <div className="space-y-4">
                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="title" className="text-sm font-medium">
                    Job Title <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="title"
                    placeholder="e.g. Frontend Developer"
                    value={newJob.title || ""}
                    onChange={(e) =>
                      setNewJob({ ...newJob, title: e.target.value })
                    }
                  />
                </div>

                <div className="grid grid-cols-1 gap-2">
                  <Label htmlFor="company" className="text-sm font-medium">
                    Company Name <span className="text-red-500">*</span>
                  </Label>
                  <Input
                    id="company"
                    placeholder="e.g. Tech Company Inc"
                    value={newJob.company || ""}
                    onChange={(e) =>
                      setNewJob({ ...newJob, company: e.target.value })
                    }
                  />
                </div>
              </div>

              <Separator />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="location" className="text-sm font-medium">
                    Location
                  </Label>
                  <Input
                    id="location"
                    placeholder="e.g. Jakarta, Indonesia (Remote)"
                    value={newJob.location || ""}
                    onChange={(e) =>
                      setNewJob({ ...newJob, location: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="url" className="text-sm font-medium">
                    Job URL
                  </Label>
                  <Input
                    id="url"
                    placeholder="e.g. https://example.com/job"
                    value={newJob.url || ""}
                    onChange={(e) =>
                      setNewJob({ ...newJob, url: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="status" className="text-sm font-medium">
                    Status
                  </Label>
                  <Select
                    value={newJob.status || "Saved"}
                    onValueChange={(value) =>
                      setNewJob({ ...newJob, status: value as any })
                    }
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Saved">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                          Saved
                        </div>
                      </SelectItem>
                      <SelectItem value="Applied">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-400 mr-2" />
                          Applied
                        </div>
                      </SelectItem>
                      <SelectItem value="Interviewed">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-purple-400 mr-2" />
                          Interviewed
                        </div>
                      </SelectItem>
                      <SelectItem value="Offered">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                          Offered
                        </div>
                      </SelectItem>
                      <SelectItem value="Rejected">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-400 mr-2" />
                          Rejected
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="dateApplied" className="text-sm font-medium">
                    Date Applied
                  </Label>
                  <Input
                    id="dateApplied"
                    type="date"
                    value={
                      newJob.dateApplied
                        ? new Date(newJob.dateApplied)
                            .toISOString()
                            .split("T")[0]
                        : ""
                    }
                    onChange={(e) =>
                      setNewJob({ ...newJob, dateApplied: e.target.value })
                    }
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="salary" className="text-sm font-medium">
                  Salary (Optional)
                </Label>
                <Input
                  id="salary"
                  placeholder="e.g. Rp 15,000,000 - 25,000,000 per month"
                  value={newJob.salary || ""}
                  onChange={(e) =>
                    setNewJob({ ...newJob, salary: e.target.value })
                  }
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes
                </Label>
                <textarea
                  id="notes"
                  className="min-h-[80px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring w-full"
                  placeholder="Add any notes about the application..."
                  value={newJob.notes || ""}
                  onChange={(e) =>
                    setNewJob({ ...newJob, notes: e.target.value })
                  }
                />
              </div>

              <div className="flex items-center space-x-2">
                <Checkbox
                  id="favorite"
                  checked={newJob.favorite || false}
                  onCheckedChange={(checked) =>
                    setNewJob({ ...newJob, favorite: !!checked })
                  }
                />
                <Label htmlFor="favorite" className="text-sm font-normal">
                  Mark as favorite
                </Label>
              </div>
            </div>

            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setShowAddJobDialog(false)}
              >
                Cancel
              </Button>
              <Button onClick={handleAddJob}>
                <Plus className="mr-2 h-4 w-4" />
                Add Job
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Enhanced Job Details Dialog */}
        <Dialog
          open={showJobDetailsDialog}
          onOpenChange={setShowJobDetailsDialog}
        >
          <DialogContent className="sm:max-w-lg">
            {selectedJob && (
              <>
                <DialogHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center">
                      <div className="mr-3 rounded-md overflow-hidden flex items-center justify-center h-12 w-12 bg-white dark:bg-gray-800 flex-shrink-0 border">
                        {!logoErrors[selectedJob.id] && selectedJob.logo ? (
                          <Image
                            src={selectedJob.logo}
                            alt={`${selectedJob.company} logo`}
                            width={48}
                            height={48}
                            className="object-contain"
                            onError={() => handleLogoError(selectedJob.id)}
                          />
                        ) : (
                          <span className="text-xl font-bold">
                            {selectedJob.company.charAt(0)}
                          </span>
                        )}
                      </div>
                      <div>
                        <DialogTitle className="text-xl">
                          {selectedJob.title}
                        </DialogTitle>
                        <DialogDescription className="text-base font-medium">
                          {selectedJob.company}
                        </DialogDescription>
                      </div>
                    </div>
                    <Button
                      variant={selectedJob.favorite ? "default" : "outline"}
                      size="sm"
                      className={`h-8 px-3 ${
                        selectedJob.favorite
                          ? "bg-yellow-500 hover:bg-yellow-600"
                          : ""
                      }`}
                      onClick={() => toggleFavorite(selectedJob.id)}
                    >
                      {selectedJob.favorite ? (
                        <>
                          <Star className="mr-1 h-3.5 w-3.5 fill-white text-white" />
                          <span className="text-xs">Favorited</span>
                        </>
                      ) : (
                        <>
                          <Star className="mr-1 h-3.5 w-3.5" />
                          <span className="text-xs">Favorite</span>
                        </>
                      )}
                    </Button>
                  </div>
                </DialogHeader>

                {/* Status Bar */}
                <div className="bg-muted/50 -mx-6 px-6 py-3 border-y flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <div
                      className={`h-2.5 w-2.5 rounded-full ${
                        selectedJob.status === "Saved"
                          ? "bg-gray-400"
                          : selectedJob.status === "Applied"
                          ? "bg-blue-400"
                          : selectedJob.status === "Interviewed"
                          ? "bg-purple-400"
                          : selectedJob.status === "Offered"
                          ? "bg-green-400"
                          : "bg-red-400"
                      }`}
                    />
                    <Badge variant={getStatusBadgeVariant(selectedJob.status)}>
                      {selectedJob.status}
                    </Badge>
                  </div>
                  <Select
                    value={selectedJob.status}
                    onValueChange={(value) =>
                      updateJobStatus(selectedJob.id, value as any)
                    }
                  >
                    <SelectTrigger className="w-[140px]">
                      <SelectValue placeholder="Change status" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Saved">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-gray-400 mr-2" />
                          Saved
                        </div>
                      </SelectItem>
                      <SelectItem value="Applied">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-blue-400 mr-2" />
                          Applied
                        </div>
                      </SelectItem>
                      <SelectItem value="Interviewed">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-purple-400 mr-2" />
                          Interviewed
                        </div>
                      </SelectItem>
                      <SelectItem value="Offered">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-green-400 mr-2" />
                          Offered
                        </div>
                      </SelectItem>
                      <SelectItem value="Rejected">
                        <div className="flex items-center">
                          <div className="h-2 w-2 rounded-full bg-red-400 mr-2" />
                          Rejected
                        </div>
                      </SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                {/* Job Details Tabs */}
                <div className="py-4">
                  <Tabs defaultValue="details">
                    <TabsList className="w-full mb-4">
                      <TabsTrigger value="details">Details</TabsTrigger>
                      <TabsTrigger value="notes">Notes</TabsTrigger>
                      <TabsTrigger value="contacts">Contacts</TabsTrigger>
                      <TabsTrigger value="timeline">Timeline</TabsTrigger>
                    </TabsList>

                    <TabsContent value="details" className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <h3 className="text-sm font-medium mb-1">Location</h3>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Building className="h-3.5 w-3.5 mr-1.5" />
                            {selectedJob.location || "Not specified"}
                          </div>
                        </div>
                        <div>
                          <h3 className="text-sm font-medium mb-1">
                            Date Applied
                          </h3>
                          <div className="flex items-center text-muted-foreground text-sm">
                            <Calendar className="h-3.5 w-3.5 mr-1.5" />
                            {format(
                              parseISO(selectedJob.dateApplied),
                              "MMMM d, yyyy"
                            )}
                          </div>
                        </div>
                        {selectedJob.salary && (
                          <div>
                            <h3 className="text-sm font-medium mb-1">Salary</h3>
                            <p className="text-sm text-muted-foreground">
                              {selectedJob.salary}
                            </p>
                          </div>
                        )}
                        {selectedJob.url && (
                          <div>
                            <h3 className="text-sm font-medium mb-1">
                              Job URL
                            </h3>
                            <a
                              href={selectedJob.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center"
                            >
                              <ExternalLink className="h-3.5 w-3.5 mr-1.5" />
                              Open job listing
                            </a>
                          </div>
                        )}
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="job-title"
                          className="text-sm font-medium"
                        >
                          Job Title
                        </Label>
                        <Input
                          id="job-title"
                          value={selectedJob.title}
                          onChange={(e) =>
                            setSelectedJob({
                              ...selectedJob,
                              title: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="job-company"
                          className="text-sm font-medium"
                        >
                          Company
                        </Label>
                        <Input
                          id="job-company"
                          value={selectedJob.company}
                          onChange={(e) =>
                            setSelectedJob({
                              ...selectedJob,
                              company: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="space-y-2">
                        <Label
                          htmlFor="job-location"
                          className="text-sm font-medium"
                        >
                          Location
                        </Label>
                        <Input
                          id="job-location"
                          value={selectedJob.location || ""}
                          onChange={(e) =>
                            setSelectedJob({
                              ...selectedJob,
                              location: e.target.value,
                            })
                          }
                        />
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="job-url"
                            className="text-sm font-medium"
                          >
                            Job URL
                          </Label>
                          <Input
                            id="job-url"
                            value={selectedJob.url || ""}
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                url: e.target.value,
                              })
                            }
                          />
                        </div>
                        <div className="space-y-2">
                          <Label
                            htmlFor="job-salary"
                            className="text-sm font-medium"
                          >
                            Salary
                          </Label>
                          <Input
                            id="job-salary"
                            value={selectedJob.salary || ""}
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                salary: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="notes">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="notes"
                            className="text-sm font-medium"
                          >
                            Notes
                          </Label>
                          <textarea
                            id="notes"
                            className="w-full h-[200px] rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-sm placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                            placeholder="Add notes about this job..."
                            value={selectedJob.notes || ""}
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                notes: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="contacts">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="contact-name"
                            className="text-sm font-medium"
                          >
                            Contact Name
                          </Label>
                          <Input
                            id="contact-name"
                            placeholder="e.g. John Smith"
                            value={selectedJob.contactName || ""}
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                contactName: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="contact-email"
                            className="text-sm font-medium"
                          >
                            Contact Email
                          </Label>
                          <Input
                            id="contact-email"
                            placeholder="e.g. john@example.com"
                            value={selectedJob.contactEmail || ""}
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                contactEmail: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>

                    <TabsContent value="timeline">
                      <div className="space-y-4">
                        <div className="space-y-2">
                          <Label
                            htmlFor="next-step"
                            className="text-sm font-medium"
                          >
                            Next Step
                          </Label>
                          <Input
                            id="next-step"
                            placeholder="e.g. Technical Interview"
                            value={selectedJob.nextStep || ""}
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                nextStep: e.target.value,
                              })
                            }
                          />
                        </div>

                        <div className="space-y-2">
                          <Label
                            htmlFor="next-date"
                            className="text-sm font-medium"
                          >
                            Next Step Date
                          </Label>
                          <Input
                            id="next-date"
                            type="date"
                            value={
                              selectedJob.nextDate
                                ? new Date(selectedJob.nextDate)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                            }
                            onChange={(e) =>
                              setSelectedJob({
                                ...selectedJob,
                                nextDate: e.target.value,
                              })
                            }
                          />
                        </div>
                      </div>
                    </TabsContent>
                  </Tabs>
                </div>

                <DialogFooter className="flex justify-between items-center border-t pt-4 mt-2">
                  <Button
                    variant="destructive"
                    onClick={() => deleteJob(selectedJob.id)}
                  >
                    <Trash2 className="mr-2 h-4 w-4" />
                    Delete Job
                  </Button>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      onClick={() => setShowJobDetailsDialog(false)}
                    >
                      Cancel
                    </Button>
                    <Button onClick={() => updateJob(selectedJob)}>
                      <Save className="mr-2 h-4 w-4" />
                      Save Changes
                    </Button>
                  </div>
                </DialogFooter>
              </>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
}
