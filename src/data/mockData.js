// Mock Data for Freelance Job Portal

// ============ SIDEBAR DATA ============
export const developerNav = [
  { icon: "dashboard", label: "Dashboard", path: "/developer/dashboard" },
  { icon: "search", label: "Browse Jobs", path: "/jobs" },
  { icon: "person", label: "Profile", path: "/developer/profile" },
  { icon: "bug_report", label: "Bug Reports", path: "/bug-reports" },
  { icon: "payments", label: "Earnings", path: "/earnings" },
];

export const clientNav = [
  { icon: "dashboard", label: "Dashboard", path: "/client/dashboard" },
  { icon: "add_circle", label: "Post Contract", path: "/post-contract" },
  { icon: "bug_report", label: "Bug Reports", path: "/bug-reports" },
  { icon: "celebration", label: "Milestones", path: "/milestones" },
  { icon: "payments", label: "Payments", path: "/earnings" },
];

export const currentUser = {
  name: "Alex Rivera",
  initials: "AR",
  role: "developer", // "developer" or "client"
};

export const bottomNavItems = [
  { icon: "help", label: "Help Center" },
  { icon: "logout", label: "Logout" },
];

// ============ NAVBAR DATA ============
export const navbarLinks = [{ label: "Browse Jobs", path: "/jobs" }];

// ============ FOOTER DATA ============
export const footerLinks = [
  "Privacy Policy",
  "Terms of Service",
  "Cookie Policy",
  "Support",
];

export const footerCopyright = "© 2024 Kinetic Editorial. All rights reserved.";

// ============ JOB LISTINGS DATA ============
export const allJobs = [
  {
    id: 1,
    featured: true,
    category: "Featured Opportunity",
    title: "NovaStream Architecture",
    description:
      "Lead the migration of a legacy media engine to a distributed Rust-based microservices architecture.",
    tags: ["Rust", "WebAssembly", "Kubernetes"],
    budgetMin: "$15,000",
    budgetMax: "$20,000",
    postedDate: "2h ago",
  },
  {
    id: 2,
    featured: false,
    category: "Full-time Contract",
    title: "Heirloom Finance Dashboard",
    description:
      "Architecting a sub-second ledger system for high-frequency commodities trading using React and Node.js.",
    tags: ["Node.js", "PostgreSQL", "React"],
    budgetMin: "$120/hr",
    budgetMax: null,
    postedDate: "1d ago",
  },
  {
    id: 3,
    featured: false,
    category: "Equity + Stipend",
    title: "Vortex AI Platform",
    description:
      "Early-stage founding engineer for a generative design platform. Focus on Three.js and custom shader development.",
    tags: ["Three.js", "GLSL", "Python"],
    budgetMin: "$8k/mo",
    budgetMax: null,
    postedDate: "3d ago",
  },
  {
    id: 4,
    featured: false,
    category: "Fixed Price",
    title: "Orbital Dash Monitoring",
    description:
      "UI/UX implementation for an aerospace monitoring dashboard. High fidelity Figma to code requirement.",
    tags: ["Next.js", "Tailwind", "TypeScript"],
    budgetMin: "$35,000",
    budgetMax: null,
    postedDate: "5d ago",
  },
  {
    id: 5,
    featured: false,
    category: "Contract",
    title: "Atlas Data Core",
    description:
      "Overhaul of a legacy geospatial data pipeline. Transitioning to a multi-region distributed architecture.",
    tags: ["PostgreSQL", "GCP", "Terraform"],
    budgetMin: "$180,000",
    budgetMax: "$210,000",
    postedDate: "1w ago",
  },
  {
    id: 6,
    featured: false,
    category: "Verified Enterprise",
    title: "Shield OS Kernel",
    description:
      "Hardening an open-source real-time OS kernel for automotive safety systems.",
    tags: ["Rust", "C++", "RTOS"],
    budgetMin: "$140,000",
    budgetMax: "$175,000",
    postedDate: "1w ago",
  },
];

export const techTags = [
  "React",
  "Rust",
  "GraphQL",
  "Docker",
  "TypeScript",
  "Node.js",
  "Python",
];

// ============ CLIENT DASHBOARD DATA ============
export const clientDashboardStats = [
  {
    icon: "account_balance_wallet",
    label: "Budget Committed",
    value: "$42,850",
    accent: "#e37434",
  },
  {
    icon: "history_edu",
    label: "Active Contracts",
    value: "12",
    accent: "#83d3df",
  },
  {
    icon: "speed",
    label: "Avg Completion",
    value: "14.2d",
    accent: "#ffb691",
  },
  {
    icon: "groups",
    label: "Developers Hired",
    value: "8",
    accent: "#83d3df",
  },
];

export const clientContracts = [
  {
    title: "Infrastructure Migration P2",
    id: "CN-8829-X",
    developer: "Helena Meyer",
    initials: "HM",
    status: "Active",
    statusBg: "#006b76",
    statusColor: "#99e9f6",
    deadline: "Nov 12, 2024",
  },
  {
    title: "Edge Analytics Dashboard",
    id: "CN-9012-Y",
    developer: "James T.",
    initials: "JT",
    status: "Pending",
    statusBg: "rgba(227,116,52,0.2)",
    statusColor: "#e37434",
    deadline: "Nov 18, 2024",
  },
  {
    title: "Core API Refactor",
    id: "CN-8744-Z",
    developer: "Sarah Chen",
    initials: "SC",
    status: "Active",
    statusBg: "#006b76",
    statusColor: "#99e9f6",
    deadline: "Dec 01, 2024",
  },
  {
    title: "Mobile App Redesign",
    id: "CN-9103-W",
    developer: "Marco V.",
    initials: "MV",
    status: "Review",
    statusBg: "rgba(203,201,154,0.2)",
    statusColor: "#cbc99a",
    deadline: "Dec 15, 2024",
  },
];

// ============ DEVELOPER DASHBOARD DATA ============
export const developerDashboardStats = [
  {
    icon: "pending_actions",
    label: "Active Applications",
    value: "12",
    sub: "+3 this week",
  },
  {
    icon: "workspace_premium",
    label: "Contracts Won",
    value: "48",
    sub: "98% Success Rate",
  },
  {
    icon: "account_balance_wallet",
    label: "Total Earned",
    value: "$14.2k",
    sub: "$2.4k pending",
  },
  {
    icon: "visibility",
    label: "Profile Views",
    value: "842",
    sub: "Top 5% Expert",
  },
];

export const developerJobsForDashboard = [
  {
    category: "Frontend Architecture",
    title: "Next.js Financial Dashboard Overhaul",
    company: "Fintech Collective • New York (Remote)",
    budget: "$12,000",
    budgetType: "Fixed Budget",
    tags: ["TypeScript", "Tailwind CSS", "Framer Motion", "PostgreSQL"],
    match: "98%",
  },
  {
    category: "Mobile Core",
    title: "React Native Health Monitoring App",
    company: "Vitality Systems • San Francisco (Hybrid)",
    budget: "$85/hr",
    budgetType: "6-Month Contract",
    tags: ["React Native", "HealthKit", "Bluetooth LE"],
    match: "82%",
  },
];

export const developerActivities = [
  {
    icon: "mail",
    color: "#006b76",
    textColor: "#99e9f6",
    text: "New message from",
    highlight: "Prisma Labs",
    time: "2 hours ago",
  },
  {
    icon: "star",
    color: "rgba(227,116,52,0.2)",
    textColor: "#ffb691",
    text: "Invitation to bid:",
    highlight: "E-commerce Backend",
    time: "5 hours ago",
  },
  {
    icon: "payments",
    color: "rgba(34,197,94,0.2)",
    textColor: "#4ade80",
    text: "Payment Received:",
    highlight: "$2,400.00",
    time: "Yesterday",
  },
  {
    icon: "edit",
    color: "#263836",
    textColor: "#d2e7e3",
    text: "Profile updated",
    highlight: "",
    time: "2 days ago",
  },
];

// ============ DEVELOPER PROFILE DATA ============
export const developerSkills = [
  { name: "Rust", level: "Expert" },
  { name: "TypeScript", level: "Expert" },
  { name: "WebGL", level: "Advanced" },
  { name: "Next.js", level: "Expert" },
  { name: "GraphQL", level: "Advanced" },
  { name: "PostgreSQL", level: "Advanced" },
  { name: "Tailwind", level: "Expert" },
  { name: "Docker", level: "Intermediate" },
];

export const developerExperiences = [
  {
    year: "2024",
    title: "Principal Architect at Veridium Cloud",
    desc: "Leading the migration to a serverless edge architecture.",
  },
  {
    year: "2022",
    title: "Senior Developer at Flux Digital",
    desc: "Architected the UI system for a high-frequency trading platform.",
  },
  {
    year: "2020",
    title: "Full-Stack Engineer at NovaStar",
    desc: "Built core microservices infrastructure serving 2M+ users.",
  },
];

// ============ POST CONTRACT DATA ============
export const postContractSteps = [
  "App Details",
  "Contract Info",
  "Milestones",
  "Review",
];

// ============ MILESTONES DATA ============
export const milestones = [
  {
    milestoneId: "MS-001",
    contractId: "CN-8829-X",
    contractTitle: "Infrastructure Migration P2",
    title: "Initial Architecture & Design Audit",
    description: "Reviewing core systems and finalizing the design language.",
    dueDate: "Nov 12, 2024",
    completeDate: "Nov 10, 2024",
    amount: "$4,500",
    status: "Completed",
    escrowStatus: "Released",
    depositDate: "Nov 01, 2024",
    releaseDate: "Nov 10, 2024",
  },
  {
    milestoneId: "MS-002",
    contractId: "CN-8829-X",
    contractTitle: "Infrastructure Migration P2",
    title: "Backend API Development",
    description: "Building core REST APIs and database schema migration.",
    dueDate: "Nov 25, 2024",
    completeDate: null,
    amount: "$6,200",
    status: "In Progress",
    escrowStatus: "Held",
    depositDate: "Nov 12, 2024",
    releaseDate: null,
  },
  {
    milestoneId: "MS-003",
    contractId: "CN-9012-Y",
    contractTitle: "Edge Analytics Dashboard",
    title: "Frontend UI Implementation",
    description: "Converting Figma designs to React components.",
    dueDate: "Nov 30, 2024",
    completeDate: null,
    amount: "$3,800",
    status: "Pending",
    escrowStatus: "Pending",
    depositDate: null,
    releaseDate: null,
  },
  {
    milestoneId: "MS-004",
    contractId: "CN-8744-Z",
    contractTitle: "Core API Refactor",
    title: "Testing & QA Phase",
    description: "End-to-end testing and performance benchmarking.",
    dueDate: "Dec 05, 2024",
    completeDate: null,
    amount: "$2,900",
    status: "Pending",
    escrowStatus: "Pending",
    depositDate: null,
    releaseDate: null,
  },
  {
    milestoneId: "MS-005",
    contractId: "CN-8829-X",
    contractTitle: "Infrastructure Migration P2",
    title: "Deployment & Go-Live",
    description: "Production deployment and monitoring setup.",
    dueDate: "Dec 15, 2024",
    completeDate: null,
    amount: "$5,100",
    status: "Upcoming",
    escrowStatus: "Not Funded",
    depositDate: null,
    releaseDate: null,
  },
];

export const milestoneFilters = [
  "All",
  "Completed",
  "In Progress",
  "Pending",
  "Upcoming",
];

export const milestoneStatusColors = {
  Completed: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  "In Progress": { bg: "#006b76", color: "#99e9f6" },
  Pending: { bg: "rgba(227,116,52,0.2)", color: "#e37434" },
  Upcoming: { bg: "#263836", color: "#83d3df" },
};

export const milestoneEscrowColors = {
  Released: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  Held: { bg: "rgba(131,211,223,0.15)", color: "#83d3df" },
  Pending: { bg: "rgba(227,116,52,0.15)", color: "#e37434" },
  "Not Funded": { bg: "#263836", color: "#a58b80" },
};

// ============ EARNINGS DATA ============
export const earningsTransactions = [
  {
    escrowId: "ESC-001",
    milestoneId: "MS-001",
    milestoneTitle: "Initial Architecture & Design Audit",
    contractTitle: "Infrastructure Migration P2",
    contractId: "CN-8829-X",
    depositAmount: "$4,500",
    depositDate: "Nov 01, 2024",
    releaseDate: "Nov 10, 2024",
    paymentStatus: "Released",
    transactionRef: "TXN-KE-20241110-001",
    paymentShare: "100%",
  },
  {
    escrowId: "ESC-002",
    milestoneId: "MS-002",
    milestoneTitle: "Backend API Development",
    contractTitle: "Infrastructure Migration P2",
    contractId: "CN-8829-X",
    depositAmount: "$6,200",
    depositDate: "Nov 12, 2024",
    releaseDate: null,
    paymentStatus: "Held",
    transactionRef: "TXN-KE-20241112-002",
    paymentShare: "100%",
  },
  {
    escrowId: "ESC-003",
    milestoneId: "MS-003",
    milestoneTitle: "Frontend UI Implementation",
    contractTitle: "Edge Analytics Dashboard",
    contractId: "CN-9012-Y",
    depositAmount: "$3,800",
    depositDate: "Nov 15, 2024",
    releaseDate: null,
    paymentStatus: "Held",
    transactionRef: "TXN-KE-20241115-003",
    paymentShare: "75%",
  },
  {
    escrowId: "ESC-004",
    milestoneId: "MS-004",
    milestoneTitle: "Testing & QA Phase",
    contractTitle: "Core API Refactor",
    contractId: "CN-8744-Z",
    depositAmount: "$2,900",
    depositDate: null,
    releaseDate: null,
    paymentStatus: "Pending",
    transactionRef: null,
    paymentShare: "100%",
  },
];

export const earningsTabs = ["All", "Released", "Held", "Pending"];

export const earningsStatusColors = {
  Released: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
  Held: { bg: "rgba(131,211,223,0.15)", color: "#83d3df" },
  Pending: { bg: "rgba(227,116,52,0.2)", color: "#e37434" },
};

// ============ BUG REPORTS DATA ============
export const bugReports = [
  {
    bugId: "BUG-001",
    contractId: "CN-8829-X",
    contractTitle: "Infrastructure Migration P2",
    title: "API endpoint returning 500 on large payloads",
    description:
      "When sending requests larger than 10MB, the API throws an internal server error.",
    severity: "Critical",
    status: "Open",
    createdDate: "Nov 10, 2024",
    resolvedDate: null,
  },
  {
    bugId: "BUG-002",
    contractId: "CN-9012-Y",
    contractTitle: "Edge Analytics Dashboard",
    title: "Chart rendering breaks on Safari",
    description: "D3.js charts do not render correctly on Safari 16 and below.",
    severity: "High",
    status: "In Progress",
    createdDate: "Nov 08, 2024",
    resolvedDate: null,
  },
  {
    bugId: "BUG-003",
    contractId: "CN-8744-Z",
    contractTitle: "Core API Refactor",
    title: "Memory leak in websocket connection",
    description:
      "WebSocket connections are not properly closed, causing memory buildup.",
    severity: "Medium",
    status: "Resolved",
    createdDate: "Nov 01, 2024",
    resolvedDate: "Nov 05, 2024",
  },
  {
    bugId: "BUG-004",
    contractId: "CN-8829-X",
    contractTitle: "Infrastructure Migration P2",
    title: "Docker container fails on ARM architecture",
    description: "Container builds fail on M1/M2 Mac machines.",
    severity: "Low",
    status: "Open",
    createdDate: "Nov 12, 2024",
    resolvedDate: null,
  },
];

export const bugSeverityColors = {
  Critical: { bg: "rgba(186,26,26,0.2)", color: "#ffb4ab" },
  High: { bg: "rgba(227,116,52,0.2)", color: "#e37434" },
  Medium: { bg: "rgba(131,211,223,0.15)", color: "#83d3df" },
  Low: { bg: "rgba(203,201,154,0.2)", color: "#cbc99a" },
};

export const bugStatusColors = {
  Open: { bg: "rgba(227,116,52,0.2)", color: "#e37434" },
  "In Progress": { bg: "#006b76", color: "#99e9f6" },
  Resolved: { bg: "rgba(74,222,128,0.15)", color: "#4ade80" },
};

export const bugReportStats = [
  {
    label: "Total Reports",
    value: bugReports.length,
    icon: "bug_report",
    color: "#83d3df",
  },
  {
    label: "Open",
    value: bugReports.filter((b) => b.status === "Open").length,
    icon: "error",
    color: "#e37434",
  },
  {
    label: "In Progress",
    value: bugReports.filter((b) => b.status === "In Progress").length,
    icon: "pending",
    color: "#83d3df",
  },
  {
    label: "Resolved",
    value: bugReports.filter((b) => b.status === "Resolved").length,
    icon: "check_circle",
    color: "#4ade80",
  },
];
