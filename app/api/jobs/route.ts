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

    // Modify the location handling to be more globally focused
    if (location && location.trim()) {
      // Add the location parameter without special handling for specific regions
      apiUrl += `&location=${encodeURIComponent(location)}`;

      // Add search parameters that work well globally
      apiUrl += "&chips=date_posted:month";
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

      // Generate fallback job listings using the global function
      const fallbackJobs = generateGlobalJobFallbacks(query, location);

      if (fallbackJobs.length > 0) {
        console.log(
          `Generated ${fallbackJobs.length} fallback job listings for "${query}" in "${location}"`
        );
        return NextResponse.json({
          jobs: fallbackJobs,
          total_results: fallbackJobs.length,
          next_page_token: null,
          is_fallback: true,
        });
      }

      // Forward the error to the client if no fallbacks could be generated
      return NextResponse.json({
        jobs: [],
        total_results: 0,
        error: data.error || "No jobs found for your search criteria",
      });
    }

    // Rest of your code to process results
    const jobListings =
      data.jobs_results?.map((job: any) => {
        // Process company thumbnail with improved format
        let logo = null;

        // Try to get logo from SerpAPI
        if (job.company_thumbnail) {
          logo = {
            primary: job.company_thumbnail,
            fallbacks: [],
          };
        } else {
          // Improved company name handling for Clearbit
          const companyName = job.company_name?.trim();
          if (companyName) {
            // Clean company name for URL
            const cleanCompanyName = companyName
              .toLowerCase()
              .replace(
                /(,?\s+inc\.?|,?\s+ltd\.?|,?\s+llc\.?|,?\s+corp\.?)$/i,
                ""
              )
              .trim()
              .split(/\s+/)[0];

            logo = {
              primary: `https://logo.clearbit.com/${cleanCompanyName}.com`,
              fallbacks: [
                `https://logo.clearbit.com/${cleanCompanyName}.co.id`,
                `https://ui-avatars.com/api/?name=${encodeURIComponent(
                  companyName
                )}&size=120&background=random`,
              ],
            };
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

// Replace the Indonesian-specific fallback generator with a global one
function generateGlobalJobFallbacks(query: string, location: string): any[] {
  // Global tech companies with recognizable brands
  const globalCompanies = [
    {
      name: "Google",
      domain: "google.com",
      logo: {
        primary: "https://logo.clearbit.com/google.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=Google&size=120&background=random",
        ],
      },
    },
    {
      name: "Microsoft",
      domain: "microsoft.com",
      logo: {
        primary: "https://logo.clearbit.com/microsoft.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=Microsoft&size=120&background=random",
        ],
      },
    },
    {
      name: "Apple",
      domain: "apple.com",
      logo: {
        primary: "https://logo.clearbit.com/apple.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=Apple&size=120&background=random",
        ],
      },
    },
    {
      name: "Amazon",
      domain: "amazon.com",
      logo: {
        primary: "https://logo.clearbit.com/amazon.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=Amazon&size=120&background=random",
        ],
      },
    },
    {
      name: "Meta",
      domain: "meta.com",
      logo: {
        primary: "https://logo.clearbit.com/meta.com",
        fallbacks: [
          "https://logo.clearbit.com/facebook.com",
          "https://ui-avatars.com/api/?name=Meta&size=120&background=random",
        ],
      },
    },
    {
      name: "IBM",
      domain: "ibm.com",
      logo: {
        primary: "https://logo.clearbit.com/ibm.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=IBM&size=120&background=random",
        ],
      },
    },
    {
      name: "Oracle",
      domain: "oracle.com",
      logo: {
        primary: "https://logo.clearbit.com/oracle.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=Oracle&size=120&background=random",
        ],
      },
    },
    {
      name: "Salesforce",
      domain: "salesforce.com",
      logo: {
        primary: "https://logo.clearbit.com/salesforce.com",
        fallbacks: [
          "https://ui-avatars.com/api/?name=Salesforce&size=120&background=random",
        ],
      },
    },
  ];

  // Add regional companies based on location
  const regionSpecificCompanies: Record<string, Array<any>> = {
    asia: [
      {
        name: "Alibaba",
        domain: "alibaba.com",
        logo: {
          primary: "https://logo.clearbit.com/alibaba.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Alibaba&size=120&background=random",
          ],
        },
      },
      {
        name: "Tencent",
        domain: "tencent.com",
        logo: {
          primary: "https://logo.clearbit.com/tencent.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Tencent&size=120&background=random",
          ],
        },
      },
    ],
    europe: [
      {
        name: "SAP",
        domain: "sap.com",
        logo: {
          primary: "https://logo.clearbit.com/sap.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=SAP&size=120&background=random",
          ],
        },
      },
      {
        name: "Spotify",
        domain: "spotify.com",
        logo: {
          primary: "https://logo.clearbit.com/spotify.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Spotify&size=120&background=random",
          ],
        },
      },
    ],
    australia: [
      {
        name: "Atlassian",
        domain: "atlassian.com",
        logo: {
          primary: "https://logo.clearbit.com/atlassian.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Atlassian&size=120&background=random",
          ],
        },
      },
      {
        name: "Canva",
        domain: "canva.com",
        logo: {
          primary: "https://logo.clearbit.com/canva.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Canva&size=120&background=random",
          ],
        },
      },
    ],
    india: [
      {
        name: "Infosys",
        domain: "infosys.com",
        logo: {
          primary: "https://logo.clearbit.com/infosys.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Infosys&size=120&background=random",
          ],
        },
      },
      {
        name: "TCS",
        domain: "tcs.com",
        logo: {
          primary: "https://logo.clearbit.com/tcs.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=TCS&size=120&background=random",
          ],
        },
      },
    ],
    indonesia: [
      {
        name: "Tokopedia",
        domain: "tokopedia.com",
        logo: {
          primary: "https://logo.clearbit.com/tokopedia.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Tokopedia&size=120&background=random",
          ],
        },
      },
      {
        name: "Gojek",
        domain: "gojek.com",
        logo: {
          primary: "https://logo.clearbit.com/gojek.com",
          fallbacks: [
            "https://ui-avatars.com/api/?name=Gojek&size=120&background=random",
          ],
        },
      },
    ],
  };

  // Add companies based on location
  const locationLower = location.toLowerCase();
  let companiesPool = [...globalCompanies];

  for (const [region, companies] of Object.entries(regionSpecificCompanies)) {
    if (locationLower.includes(region)) {
      companiesPool = [...companiesPool, ...companies];
      break;
    }
  }

  // Different job titles based on search query
  const queryLower = query.toLowerCase();
  let jobTitles = [];

  // Programming/Development roles
  if (
    queryLower.includes("program") ||
    queryLower.includes("develop") ||
    queryLower.includes("engineer") ||
    queryLower.includes("code")
  ) {
    jobTitles = [
      "Software Engineer",
      "Backend Developer",
      "Frontend Developer",
      "Full Stack Developer",
      "Mobile Developer",
      "DevOps Engineer",
      "Software Architect",
      "Cloud Engineer",
      "QA Engineer",
      "Site Reliability Engineer",
    ];
  }
  // Management roles
  else if (queryLower.includes("manag") || queryLower.includes("lead")) {
    jobTitles = [
      "Product Manager",
      "Project Manager",
      "Engineering Manager",
      "Technical Lead",
      "IT Manager",
      "Team Lead",
      "Program Manager",
      "Development Manager",
      "Delivery Manager",
    ];
  }
  // Design roles
  else if (queryLower.includes("design")) {
    jobTitles = [
      "UI Designer",
      "UX Designer",
      "UI/UX Designer",
      "Product Designer",
      "Graphic Designer",
      "Web Designer",
      "Interaction Designer",
    ];
  }
  // Default for other searches
  else {
    jobTitles = [
      "Software Engineer",
      "Web Developer",
      "Product Manager",
      "UI/UX Designer",
      "Data Analyst",
      "Digital Marketing Specialist",
      "Business Analyst",
      "Content Writer",
      "Customer Success Manager",
      "Operations Specialist",
    ];
  }

  // Experience levels
  const experienceLevels = ["Entry Level", "Mid-Level", "Senior Level"];
  const isJunior =
    queryLower.includes("junior") ||
    queryLower.includes("fresh") ||
    queryLower.includes("entry");
  const isSenior =
    queryLower.includes("senior") ||
    queryLower.includes("lead") ||
    queryLower.includes("architect");

  let selectedLevel = isJunior
    ? "Entry Level"
    : isSenior
    ? "Senior Level"
    : "Mid-Level";

  // Salary ranges based on region and experience
  // Will be set based on location
  let salaryCurrency = "$";
  let salaryRanges = {
    "Entry Level": "$50,000 - $70,000",
    "Mid-Level": "$70,000 - $110,000",
    "Senior Level": "$110,000 - $160,000+",
  };

  // Set currency and salary ranges based on location
  if (locationLower.includes("uk") || locationLower.includes("london")) {
    salaryCurrency = "£";
    salaryRanges = {
      "Entry Level": "£35,000 - £50,000",
      "Mid-Level": "£50,000 - £80,000",
      "Senior Level": "£80,000 - £120,000+",
    };
  } else if (locationLower.includes("europe")) {
    salaryCurrency = "€";
    salaryRanges = {
      "Entry Level": "€40,000 - €60,000",
      "Mid-Level": "€60,000 - €90,000",
      "Senior Level": "€90,000 - €130,000+",
    };
  } else if (
    locationLower.includes("india") ||
    locationLower.includes("mumbai") ||
    locationLower.includes("delhi") ||
    locationLower.includes("bangalore")
  ) {
    salaryCurrency = "₹";
    salaryRanges = {
      "Entry Level": "₹500,000 - ₹800,000",
      "Mid-Level": "₹800,000 - ₹1,500,000",
      "Senior Level": "₹1,500,000 - ₹3,000,000+",
    };
  } else if (
    locationLower.includes("indonesia") ||
    locationLower.includes("jakarta") ||
    locationLower.includes("surabaya")
  ) {
    salaryCurrency = "Rp";
    salaryRanges = {
      "Entry Level": "Rp5,000,000 - Rp10,000,000",
      "Mid-Level": "Rp10,000,000 - Rp18,000,000",
      "Senior Level": "Rp18,000,000 - Rp35,000,000+",
    };
  }

  // Date posted options
  const dateOptions = [
    "Today",
    "1 day ago",
    "2 days ago",
    "3 days ago",
    "This week",
    "Last week",
    "2 weeks ago",
  ];

  // Generate randomized job count (6-10)
  const jobCount = Math.floor(Math.random() * 5) + 6;
  const fallbackJobs = [];

  for (let i = 0; i < jobCount; i++) {
    const company =
      companiesPool[Math.floor(Math.random() * companiesPool.length)];
    const jobTitle = jobTitles[Math.floor(Math.random() * jobTitles.length)];
    const expLevel =
      isJunior || isSenior
        ? selectedLevel
        : experienceLevels[Math.floor(Math.random() * experienceLevels.length)];
    const datePosted =
      dateOptions[Math.floor(Math.random() * dateOptions.length)];
    const isRemote = Math.random() > 0.5;

    let jobLocation = location;
    if (isRemote) {
      jobLocation += " (Remote)";
    }

    const jobId = `fallback-${Math.random().toString(36).substring(2, 9)}`;

    // Generate job description based on role type
    let jobDescription = "";
    let responsibilities = [];
    let qualifications = [];

    if (
      jobTitle.toLowerCase().includes("develop") ||
      jobTitle.toLowerCase().includes("engineer")
    ) {
      jobDescription = `${company.name} is seeking a talented ${jobTitle} to join our engineering team in ${location}. This role offers the opportunity to work on cutting-edge technology solutions for one of the world's most innovative companies.`;
      responsibilities = [
        "Design and build scalable applications and services",
        "Work with product managers and designers to implement new features",
        "Write clean, maintainable code with appropriate test coverage",
        "Collaborate with cross-functional teams to ship high-quality products",
        "Participate in code reviews and help maintain code quality",
      ];
      qualifications = [
        `${
          expLevel === "Entry Level"
            ? "0-2"
            : expLevel === "Mid-Level"
            ? "3-5"
            : "5+"
        } years of experience in software development`,
        "Proficiency in programming languages such as Java, Python, JavaScript, or similar",
        "Experience with modern frameworks and technologies",
        "Strong problem-solving abilities and attention to detail",
        "Good communication skills",
        "Bachelor's degree in Computer Science or related field (or equivalent experience)",
      ];
    } else if (jobTitle.toLowerCase().includes("design")) {
      // Design-specific job content
      jobDescription = `${company.name} is looking for a creative ${jobTitle} to help shape our product experiences. In this role, you will be responsible for designing intuitive and visually appealing interfaces for our digital products.`;
      responsibilities = [
        "Create user-centered designs for web and mobile applications",
        "Develop UI mockups, prototypes, and specifications",
        "Work closely with product managers and engineers to implement designs",
        "Conduct user research and usability testing",
        "Help establish and maintain our design system",
      ];
      qualifications = [
        `${
          expLevel === "Entry Level"
            ? "1-2"
            : expLevel === "Mid-Level"
            ? "3-4"
            : "5+"
        } years of experience as a designer`,
        "Proficiency in design tools such as Figma, Adobe XD, or Sketch",
        "Strong portfolio demonstrating UI/UX design capabilities",
        "Understanding of user-centered design principles",
        "Experience working in agile development environments",
      ];
    } else {
      // Generic job content for other roles
      jobDescription = `${company.name} is hiring a ${jobTitle} to join our growing team in ${location}. This is an excellent opportunity to work with one of the world's leading technology companies.`;
      responsibilities = [
        "Collaborate with cross-functional teams to achieve business objectives",
        "Contribute to strategy and planning for your area of expertise",
        "Help identify and implement improvements to existing processes",
        "Stay updated with industry trends and best practices",
        "Provide regular reports and insights to stakeholders",
      ];
      qualifications = [
        `${
          expLevel === "Entry Level"
            ? "1-2"
            : expLevel === "Mid-Level"
            ? "2-4"
            : "5+"
        } years of relevant experience`,
        "Excellent communication and interpersonal skills",
        "Ability to work in a fast-paced, dynamic environment",
        "Problem-solving mindset with attention to detail",
        "Bachelor's degree in a relevant field (or equivalent experience)",
      ];
    }

    // Add common benefits
    const benefitsList = [
      "Competitive salary package",
      "Health insurance coverage",
      "Retirement plans with company matching",
      "Annual performance bonus",
      "Professional development opportunities",
      "Flexible working arrangements",
      "Modern office facilities",
      "Company stock options",
      "Paid time off and holidays",
      "Wellness programs",
      "Remote work options",
      "Commuter benefits",
      "Parental leave",
      "Education reimbursement",
    ];

    const benefits = benefitsList
      .sort(() => Math.random() - 0.5)
      .slice(0, 4 + Math.floor(Math.random() * 3));

    fallbackJobs.push({
      id: jobId,
      title: jobTitle,
      company: company.name,
      location: jobLocation,
      description: jobDescription,
      salary: salaryRanges[expLevel as keyof typeof salaryRanges],
      date_posted: datePosted,
      job_type: Math.random() > 0.2 ? "Full-time" : "Contract",
      experience_level: expLevel,
      company_rating: (Math.floor(Math.random() * 15) + 35) / 10, // Rating between 3.5-5.0
      url: `https://${company.domain}/careers`,
      logo: company.logo,
      responsibilities: responsibilities,
      qualifications: qualifications,
      benefits: benefits,
    });
  }

  return fallbackJobs;
}
