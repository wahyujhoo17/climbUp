"use client";

import { useState, useEffect } from "react";
import { useLocalStorage } from "@/hooks/use-local-storage";
import { JobApplication } from "@/types/job";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";
import { format, parseISO, subDays, differenceInDays } from "date-fns";
import {
  CalendarDays,
  Briefcase,
  Building,
  Users,
  CheckCircle,
  XCircle,
  Clock,
} from "lucide-react";

export default function DashboardPage() {
  const [jobs, setJobs] = useLocalStorage<JobApplication[]>("jobs", []);
  const [timeFrame, setTimeFrame] = useState<"7days" | "30days" | "all">("all");

  // Calculate statistics based on the job data
  const statistics = {
    totalJobs: jobs.length,
    interviews: jobs.filter(
      (job) => job.status === "Interviewed" || job.status === "Offered"
    ).length,
    offers: jobs.filter((job) => job.status === "Offered").length,
    rejected: jobs.filter((job) => job.status === "Rejected").length,
    interviewRate:
      jobs.length > 0
        ? Math.round(
            (jobs.filter(
              (job) => job.status === "Interviewed" || job.status === "Offered"
            ).length /
              jobs.length) *
              100
          )
        : 0,
    successRate:
      jobs.length > 0
        ? Math.round(
            (jobs.filter((job) => job.status === "Offered").length /
              jobs.length) *
              100
          )
        : 0,
  };

  // Get jobs for the selected time frame
  const getFilteredJobs = () => {
    const today = new Date();

    if (timeFrame === "7days") {
      return jobs.filter(
        (job) => differenceInDays(today, parseISO(job.dateApplied)) <= 7
      );
    } else if (timeFrame === "30days") {
      return jobs.filter(
        (job) => differenceInDays(today, parseISO(job.dateApplied)) <= 30
      );
    }

    return jobs;
  };

  const filteredJobs = getFilteredJobs();

  // Prepare data for status distribution chart
  const statusData = [
    {
      name: "Saved",
      value: jobs.filter((job) => job.status === "Saved").length,
    },
    {
      name: "Applied",
      value: jobs.filter((job) => job.status === "Applied").length,
    },
    {
      name: "Interviewed",
      value: jobs.filter((job) => job.status === "Interviewed").length,
    },
    {
      name: "Offered",
      value: jobs.filter((job) => job.status === "Offered").length,
    },
    {
      name: "Rejected",
      value: jobs.filter((job) => job.status === "Rejected").length,
    },
  ].filter((item) => item.value > 0);

  // Prepare data for applications over time chart
  const getApplicationsOverTime = () => {
    const today = new Date();
    const dateMap = new Map();
    let startDate = subDays(today, 30);

    if (timeFrame === "7days") {
      startDate = subDays(today, 7);
    } else if (timeFrame === "all" && jobs.length > 0) {
      const dates = jobs.map((job) => parseISO(job.dateApplied));
      const earliestDate = new Date(Math.min(...dates.map((d) => d.getTime())));
      startDate = earliestDate;
    }

    // Initialize all dates with 0 applications
    for (let d = new Date(startDate); d <= today; d.setDate(d.getDate() + 1)) {
      dateMap.set(format(d, "yyyy-MM-dd"), 0);
    }

    // Count applications per date
    filteredJobs.forEach((job) => {
      const date = job.dateApplied.split("T")[0];
      if (dateMap.has(date)) {
        dateMap.set(date, dateMap.get(date) + 1);
      }
    });

    // Convert map to array for the chart
    return Array.from(dateMap.entries()).map(([date, count]) => ({
      date,
      applications: count,
    }));
  };

  const applicationsOverTime = getApplicationsOverTime();

  // Prepare data for company distribution chart
  const getCompanyData = () => {
    const companyCount = new Map();

    filteredJobs.forEach((job) => {
      const company = job.company;
      companyCount.set(company, (companyCount.get(company) || 0) + 1);
    });

    return Array.from(companyCount.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, value]) => ({ name, value }));
  };

  const companyData = getCompanyData();

  // Colors for pie charts
  const COLORS = ["#0088FE", "#00C49F", "#FFBB28", "#FF8042", "#A569BD"];
  const STATUS_COLORS = {
    Saved: "#94A3B8", // gray-400
    Applied: "#60A5FA", // blue-400
    Interviewed: "#C084FC", // purple-400
    Offered: "#4ADE80", // green-400
    Rejected: "#F87171", // red-400
  };

  return (
    <div className="mx-auto">
      {/* Header area with gradient background */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-background border-b">
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold mb-2">Dashboard</h1>
          <p className="text-muted-foreground">
            Track your job application statistics and progress
          </p>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto px-4 py-6">
        {/* Time frame selector */}
        <div className="mb-6">
          <Tabs
            defaultValue="all"
            value={timeFrame}
            onValueChange={(v) => setTimeFrame(v as any)}
          >
            <TabsList>
              <TabsTrigger value="7days">Last 7 days</TabsTrigger>
              <TabsTrigger value="30days">Last 30 days</TabsTrigger>
              <TabsTrigger value="all">All time</TabsTrigger>
            </TabsList>
          </Tabs>
        </div>

        {/* Key metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Total Applications
                  </p>
                  <p className="text-3xl font-bold">{statistics.totalJobs}</p>
                </div>
                <div className="p-3 bg-primary/10 rounded-full">
                  <Briefcase className="h-6 w-6 text-primary" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Interview Rate
                  </p>
                  <p className="text-3xl font-bold">
                    {statistics.interviewRate}%
                  </p>
                </div>
                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-full">
                  <Users className="h-6 w-6 text-purple-500 dark:text-purple-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Success Rate
                  </p>
                  <p className="text-3xl font-bold">
                    {statistics.successRate}%
                  </p>
                </div>
                <div className="p-3 bg-green-100 dark:bg-green-900/30 rounded-full">
                  <CheckCircle className="h-6 w-6 text-green-500 dark:text-green-400" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-muted-foreground mb-1">
                    Active Applications
                  </p>
                  <p className="text-3xl font-bold">
                    {
                      jobs.filter(
                        (job) => !["Offered", "Rejected"].includes(job.status)
                      ).length
                    }
                  </p>
                </div>
                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-full">
                  <Clock className="h-6 w-6 text-blue-500 dark:text-blue-400" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
          {/* Status Distribution Chart */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Application Status Distribution</CardTitle>
              <CardDescription>
                Breakdown of your job applications by current status
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {statusData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={statusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        {statusData.map((entry, index) => (
                          <Cell
                            key={`cell-${index}`}
                            fill={
                              STATUS_COLORS[
                                entry.name as keyof typeof STATUS_COLORS
                              ]
                            }
                          />
                        ))}
                      </Pie>
                      <Legend />
                      <Tooltip
                        formatter={(value) => [`${value} jobs`, "Count"]}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Applications Over Time */}
          <Card className="overflow-hidden">
            <CardHeader>
              <CardTitle>Applications Over Time</CardTitle>
              <CardDescription>
                Number of jobs you've applied to over time
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {applicationsOverTime.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={applicationsOverTime}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis
                        dataKey="date"
                        tickFormatter={(date) =>
                          format(parseISO(date), "MMM d")
                        }
                      />
                      <YAxis allowDecimals={false} />
                      <Tooltip
                        labelFormatter={(date) =>
                          format(parseISO(date), "MMM d, yyyy")
                        }
                        formatter={(value) => [
                          `${value} applications`,
                          "Count",
                        ]}
                      />
                      <Bar dataKey="applications" fill="#60A5FA" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Additional Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Companies */}
          <Card>
            <CardHeader>
              <CardTitle>Top Companies Applied</CardTitle>
              <CardDescription>
                Companies where you've applied the most
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {companyData.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={companyData} layout="vertical">
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis type="number" />
                      <YAxis dataKey="name" type="category" width={100} />
                      <Tooltip
                        formatter={(value) => [
                          `${value} applications`,
                          "Count",
                        ]}
                      />
                      <Bar dataKey="value" fill="#A5B4FC" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Response Rate */}
          <Card>
            <CardHeader>
              <CardTitle>Application Response Rates</CardTitle>
              <CardDescription>
                How companies are responding to your applications
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-[300px] w-full">
                {jobs.length > 0 ? (
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={[
                          {
                            name: "Responded",
                            value: statistics.interviews + statistics.rejected,
                          },
                          {
                            name: "No Response",
                            value:
                              jobs.length -
                              (statistics.interviews + statistics.rejected),
                          },
                        ]}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label={({ name, percent }) =>
                          `${name} ${(percent * 100).toFixed(0)}%`
                        }
                      >
                        <Cell key="cell-0" fill="#4ADE80" />
                        <Cell key="cell-1" fill="#94A3B8" />
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} jobs`, "Count"]}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <p className="text-muted-foreground">No data available</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
