import { NextResponse } from "next/server";

const SERPAPI_KEY = process.env.SERPAPI_KEY || "your_api_key_here";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") || "";
  const location = searchParams.get("location") || "";
  const pageToken = searchParams.get("page_token") || "";

  // Return empty if no query
  if (!query.trim()) {
    return NextResponse.json({ jobs: [], total_results: 0 });
  }

  try {
    // Build the API URL with proper formatting
    let apiUrl = `https://serpapi.com/search.json?engine=google_jobs&q=${encodeURIComponent(
      query
    )}`;

    // Add location as a separate parameter if provided
    if (location && location.trim()) {
      apiUrl += `&location=${encodeURIComponent(location)}`;
    }

    // Add language and API key
    apiUrl += `&hl=en&api_key=${SERPAPI_KEY}`;

    // Add page token if available
    if (pageToken) {
      apiUrl += `&next_page_token=${encodeURIComponent(pageToken)}`;
    }

    console.log(
      `Making API request: ${apiUrl.replace(SERPAPI_KEY, "REDACTED_KEY")}`
    );

    const response = await fetch(apiUrl);

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();

    // Check if SerpAPI returned an error or empty results
    if (
      data.error ||
      (data.search_information &&
        data.search_information.jobs_results_state === "Fully empty")
    ) {
      console.log(
        "SerpAPI returned no results or an error:",
        data.error || "No results"
      );

      // Forward the error to the client
      return NextResponse.json({
        jobs: [],
        total_results: 0,
        error: data.error || "No jobs found for your search criteria",
      });
    }

    // Rest of your code to process results
    const jobListings =
      data.jobs_results?.map((job: any) => {
        // Process company thumbnail
        let logo = null;

        // Try to get logo from SerpAPI
        if (job.company_thumbnail) {
          logo = job.company_thumbnail;
        } else {
          // Fallback to Clearbit logo API if no thumbnail available
          const companyName = job.company_name?.split(" ")[0]?.toLowerCase();
          if (companyName) {
            logo = `https://logo.clearbit.com/${companyName}.com`;
          }
        }

        return {
          id: job.job_id || `job-${Math.random().toString(36).substring(2, 9)}`,
          title: job.title || "",
          company: job.company_name || "",
          location: job.location || "",
          description: formatJobDescription(job.description || ""),
          salary: job.detected_extensions?.salary || "Not specified",
          date_posted: job.detected_extensions?.posted_at || "Recently",
          job_type: job.detected_extensions?.schedule_type || "Full-time",
          experience_level: job.detected_extensions?.work_from_home
            ? "Remote"
            : "",
          company_rating: job.company_rating
            ? parseFloat(job.company_rating)
            : null,
          url: job.apply_link || job.job_link || "",
          logo,
          responsibilities: job.description
            ? extractResponsibilities(job.description)
            : [],
          qualifications: job.highlights?.qualifications || [],
          benefits: job.highlights?.benefits || [],
        };
      }) || [];

    return NextResponse.json({
      jobs: jobListings,
      total_results: data.search_metadata?.total_results || jobListings.length,
      next_page_token: data.serpapi_pagination?.next_page_token || null,
    });
  } catch (error) {
    console.error("Error fetching job data:", error);
    return NextResponse.json(
      { error: "Failed to fetch job data", jobs: [], total_results: 0 },
      { status: 500 }
    );
  }
}

// Helper function to extract responsibilities from description
function extractResponsibilities(description: string): string[] {
  // Simple extraction logic - look for lists or sections in the description
  const sentences = description.split(/[.!?]/);

  // Filter sentences that are likely responsibilities (contain action verbs)
  const actionVerbs = [
    "develop",
    "design",
    "create",
    "manage",
    "lead",
    "implement",
    "build",
    "collaborate",
    "analyze",
  ];

  return sentences
    .filter((sentence) => {
      const words = sentence.toLowerCase().split(" ");
      return actionVerbs.some((verb) => words.includes(verb));
    })
    .map((sentence) => sentence.trim())
    .filter((sentence) => sentence.length > 15) // Filter out very short sentences
    .slice(0, 5); // Limit to 5 responsibilities
}

// Add this function to your API route
function formatJobDescription(description: string): string {
  // Some job descriptions have bullet points with various symbols
  // Standardize them for better display
  let formattedDesc = description;

  // Replace various bullet point symbols with standard bullet
  formattedDesc = formattedDesc.replace(/[•●■◆★-]\s/g, "• ");

  // Add line breaks between sections if they don't exist
  formattedDesc = formattedDesc.replace(/([.:])(\w)/g, "$1\n\n$2");

  // Make section headers more prominent
  const sectionHeaders = [
    "Job Description",
    "Responsibilities",
    "Qualifications",
    "Requirements",
    "About the Role",
    "About the Company",
    "Benefits",
    "Additional Information",
  ];

  sectionHeaders.forEach((header) => {
    const regex = new RegExp(`(${header}s?:?)`, "gi");
    formattedDesc = formattedDesc.replace(regex, "\n$1");
  });

  return formattedDesc;
}
