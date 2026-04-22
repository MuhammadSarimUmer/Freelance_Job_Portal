const { PrismaClient } = require('@prisma/client');
const { faker } = require('@faker-js/faker');
const bcrypt = require('bcryptjs');

faker.seed(42);
const prisma = new PrismaClient();

// ─── Constants ───────────────────────────────────────────────────────────────

const SEED_PASSWORD = 'SeedUser@123';

const TECH_STACKS = [
  { techName: 'React', category: 'Frontend', version: '18.x' },
  { techName: 'Vue.js', category: 'Frontend', version: '3.x' },
  { techName: 'Angular', category: 'Frontend', version: '17.x' },
  { techName: 'Next.js', category: 'Frontend', version: '14.x' },
  { techName: 'TailwindCSS', category: 'Frontend', version: '3.x' },
  { techName: 'Node.js', category: 'Backend', version: '20.x' },
  { techName: 'Express.js', category: 'Backend', version: '4.x' },
  { techName: 'Django', category: 'Backend', version: '4.x' },
  { techName: 'FastAPI', category: 'Backend', version: '0.11x' },
  { techName: 'Laravel', category: 'Backend', version: '11.x' },
  { techName: 'PostgreSQL', category: 'Database', version: '16.x' },
  { techName: 'MongoDB', category: 'Database', version: '7.x' },
  { techName: 'MySQL', category: 'Database', version: '8.x' },
  { techName: 'Redis', category: 'Database', version: '7.x' },
  { techName: 'Prisma', category: 'ORM', version: '5.x' },
  { techName: 'Docker', category: 'DevOps', version: '25.x' },
  { techName: 'AWS', category: 'Cloud', version: null },
  { techName: 'TypeScript', category: 'Language', version: '5.x' },
  { techName: 'Python', category: 'Language', version: '3.12' },
  { techName: 'Java', category: 'Language', version: '21' },
  { techName: 'GraphQL', category: 'API', version: '16.x' },
  { techName: 'REST API', category: 'API', version: null },
  { techName: 'React Native', category: 'Mobile', version: '0.74' },
  { techName: 'Flutter', category: 'Mobile', version: '3.x' },
  { techName: 'Figma', category: 'Design', version: null },
];

const APP_TYPES = [
  'Web Application', 'Mobile Application', 'Desktop Application',
  'API Service', 'E-Commerce Platform', 'SaaS Platform',
  'Dashboard', 'CRM System', 'ERP System', 'Content Management System',
];

const CONTRACT_TITLES = [
  'Build E-Commerce Platform', 'Develop REST API for Mobile App',
  'Design and Implement CRM', 'Create Real-Time Chat Application',
  'Build Analytics Dashboard', 'Develop Inventory Management System',
  'Create Booking & Reservation App', 'Build Social Media Integration',
  'Develop Payment Gateway Module', 'Create HR Management Portal',
  'Build Learning Management System', 'Develop Notification Service',
  'Create Multi-Tenant SaaS App', 'Build Reporting & BI Dashboard',
  'Develop Authentication Service', 'Create Job Portal Platform',
  'Build Healthcare Patient Portal', 'Develop Logistics Tracking System',
  'Create Real Estate Listing App', 'Build Food Delivery Platform',
];

const MILESTONE_TITLES = [
  'Project Setup & Architecture', 'Database Schema Design',
  'UI/UX Wireframes & Prototypes', 'User Authentication Module',
  'Core API Development', 'Frontend Integration',
  'Payment Integration', 'Admin Panel Development',
  'Testing & QA', 'Deployment & DevOps Setup',
  'Performance Optimization', 'Documentation & Handover',
  'Third-party API Integration', 'Notification System',
  'Reporting Module',
];

const ROLES = [
  'Full Stack Developer', 'Backend Developer', 'Frontend Developer',
  'Mobile Developer', 'DevOps Engineer', 'Lead Developer',
];

const COUNTRIES = ['Pakistan', 'India', 'United States', 'United Kingdom', 'Canada', 'Australia'];

const DEV_BIOS = [
  'Full-stack engineer with 6+ years building scalable web and mobile applications. Experienced with React, Node.js, and cloud infrastructure.',
  'Backend specialist focused on API design, database optimization, and microservices. Delivered production systems handling millions of requests daily.',
  'Mobile developer with deep expertise in React Native and Flutter. Shipped 12+ apps to the App Store and Google Play.',
  'Frontend engineer passionate about pixel-perfect UI and fast user experiences. Proficient in React, TypeScript, and design systems.',
  'DevOps engineer experienced in CI/CD pipelines, Docker, Kubernetes, and AWS cloud architecture.',
  'Lead developer with a track record of building SaaS platforms from zero to production. Strong in system design and team mentorship.',
  'Full-stack developer specializing in e-commerce platforms, payment integrations, and third-party API connections.',
  'Backend engineer with expertise in Python, Django, and PostgreSQL. Passionate about clean architecture and test-driven development.',
  'React specialist with 5 years building enterprise dashboards, analytics tools, and real-time data visualization.',
  'Software engineer experienced in healthcare, fintech, and logistics domains. Focused on secure, compliant system design.',
  'Node.js developer with strong background in REST and GraphQL API development, JWT authentication, and WebSockets.',
  'TypeScript developer who thrives in agile environments. Experienced in both early-stage startups and Fortune 500 teams.',
];

const CONTRACT_DESCRIPTIONS = [
  'We need a robust e-commerce platform with product management, shopping cart, Stripe payment integration, order tracking, and a responsive storefront.',
  'Building a cross-platform mobile app for iOS and Android that connects field technicians with dispatchers via real-time job assignments and GPS tracking.',
  'Developing a SaaS CRM with lead management, email campaigns, deal pipeline, reporting dashboard, and third-party integrations (Zapier, Slack).',
  'Creating a real-time chat application with group channels, direct messaging, file sharing, read receipts, and push notifications.',
  'Building an analytics dashboard that ingests data from multiple sources, provides drill-down charts, and exports PDF/Excel reports.',
  'Developing an inventory management system with barcode scanning, stock alerts, supplier management, and multi-warehouse support.',
  'Creating a booking and reservation platform for service businesses with calendar integration, automated reminders, and payment processing.',
  'Building a social media management tool that schedules posts, tracks engagement, and provides audience analytics across platforms.',
  'Developing a secure payment gateway module that supports multiple currencies, fraud detection, and reconciliation reports.',
  'Creating an HR management portal with employee onboarding, leave tracking, performance reviews, and payroll integration.',
  'Building a learning management system with course creation, video hosting, quizzes, certifications, and learner progress tracking.',
  'Developing a push notification and email delivery service with template management, segmentation, A/B testing, and delivery analytics.',
  'Creating a multi-tenant SaaS platform with isolated workspaces, subscription billing, usage metering, and admin controls.',
  'Building a BI reporting dashboard that visualizes KPIs, revenue metrics, and user behavior using live database connections.',
  'Developing an authentication service with OAuth2, MFA, SSO integration, audit logs, and role-based access control.',
  'Building a logistics tracking platform with real-time vehicle GPS, route optimization, delivery status updates, and proof of delivery.',
  'Creating a healthcare patient portal for appointment booking, medical records access, prescription management, and secure messaging with doctors.',
  'Developing a food delivery platform with restaurant onboarding, real-time order tracking, driver management, and loyalty rewards.',
  'Building a real estate listing app with MLS integration, property search, virtual tours, agent messaging, and mortgage calculators.',
  'Creating a legal document management system with version control, e-signature support, access permissions, and audit trails.',
];

const MILESTONE_DESCRIPTIONS = [
  'Set up monorepo, CI/CD pipeline, environment configs, database schema, and deploy initial infrastructure to staging.',
  'Design and implement normalized database schema, seed data, migrations, and query optimization for core entities.',
  'Deliver high-fidelity wireframes, clickable prototype, component library, and style guide approved by stakeholders.',
  'Build user registration, login, password reset, email verification, JWT tokens, and role-based access control.',
  'Develop all core REST/GraphQL API endpoints with input validation, error handling, rate limiting, and unit tests.',
  'Integrate designed UI components with backend APIs, implement loading states, error boundaries, and responsive layouts.',
  'Integrate payment gateway, handle webhooks, implement refund logic, and ensure PCI-compliant data handling.',
  'Build admin dashboard with user management, content moderation tools, analytics overview, and audit log viewer.',
  'Conduct end-to-end testing, fix critical bugs, perform security audit, load testing, and document all endpoints.',
  'Containerize app with Docker, configure production server, set up monitoring, alerting, backups, and SSL certificates.',
  'Profile and optimize database queries, implement caching layer, reduce API response times by 40%, and fix memory leaks.',
  'Write technical documentation, API reference, deployment guide, and conduct developer handover session.',
  'Connect third-party services (Twilio, SendGrid, Stripe, Google Maps) and implement fallback and retry strategies.',
  'Build in-app notification center, email digest, push notification support, and notification preference management.',
  'Develop exportable reports module with PDF/Excel output, scheduled delivery, and custom date range filtering.',
];

const BUG_TITLES = [
  'Payments fail silently when card is declined without showing error to user',
  'Dashboard charts show incorrect date range after timezone change',
  'File uploads timeout on files larger than 10MB despite 50MB limit in config',
  'Search results return duplicate entries when pagination is applied',
  'Session tokens not invalidated on password change allowing reuse of old tokens',
  'Email notifications sent multiple times for single event trigger',
  'Mobile layout breaks on devices with screen width below 375px',
  'API returns 500 error when optional query parameter is null',
  'Export to CSV includes HTML entities instead of plain text',
  'User profile image not updated in navigation bar after upload',
  'Webhook events processed out of order causing data inconsistencies',
  'Date picker allows selecting past dates for future-only fields',
  'Admin can delete users without confirmation or soft-delete fallback',
  'Real-time messages not delivered when recipient is on mobile data',
  'Form validation passes with empty whitespace-only input fields',
];

const BUG_DESCRIPTIONS = [
  'When a payment fails due to an insufficient funds or declined card, the UI spins indefinitely and no error message is displayed to the user. Stripe webhook confirms the failure but the frontend does not handle the error response.',
  'After changing system timezone or user account timezone, the analytics dashboard displays data for the wrong date range. Charts show yesterday as today. Reproducible on all chart types.',
  'Uploading files between 10MB and 50MB fails with a generic network error. Server config allows 50MB but middleware rejects at 10MB. Affects both image and document uploads.',
  'When navigating to page 2 or beyond in search results, some records from page 1 reappear. Likely a cursor-based pagination bug when combined with active filters.',
  'After a user resets their password, previously issued JWT tokens remain valid. This is a security issue as compromised tokens should be invalidated immediately.',
  'Email notification webhooks are triggering duplicate sends. Users report receiving 2-3 identical emails for a single order confirmation event.',
];

const REVIEW_COMMENTS = [
  'Excellent work. Delivered on time, communicated proactively, and the code quality exceeded our expectations. Will definitely hire again.',
  'Great developer. Had strong technical skills and was always available to discuss requirements. A few minor revisions needed but overall very satisfied.',
  'Solid work. The feature was built exactly as specified. Would have appreciated more frequent updates but the final delivery was clean.',
  'Outstanding collaboration. The developer brought creative solutions to complex problems and the product shipped ahead of schedule.',
  'Good experience overall. The code was well-structured and documented. Some delays mid-project but communicated them clearly.',
  'Highly professional. Understood the business context quickly and built a solution that went beyond the initial spec in a positive way.',
  'Competent developer with solid fundamentals. The backend API was well-designed. Frontend needed a bit more polish.',
  'Very impressed. The developer refactored legacy code while delivering new features simultaneously. Highly recommended.',
];

const DISPUTE_REASONS = [
  'Deliverables do not match the agreed technical specifications. Key API endpoints are missing and the admin panel was not implemented.',
  'Work was submitted 3 weeks past the agreed deadline with no prior notification. Business launch was delayed as a result.',
  'Code quality is below professional standard. No tests, no documentation, hardcoded credentials, and multiple security vulnerabilities found in review.',
  'Developer became unresponsive after partial payment was released. Final milestone was not completed and communication stopped.',
  'The mobile app crashes on Android 12+ devices. The developer claims it is a device-specific issue but testing confirms it affects all Android 12 users.',
  'Scope was exceeded without authorization. Developer billed for features not in the original contract and is now holding source code.',
];

const MESSAGES = [
  'Hi, I have reviewed the requirements and have a few clarifying questions before I begin. Can we schedule a quick call?',
  'The first milestone is complete and deployed to staging. Please review and let me know if any changes are needed.',
  'I ran into a blocker with the third-party API — their sandbox is down. I will use mock data for now and integrate live when it is restored.',
  'Quick update: backend is on track. Frontend integration starts tomorrow. On schedule for the deadline.',
  'Could you clarify the expected behavior when a user uploads an unsupported file type? Should we reject or convert?',
  'All unit tests are passing and code review feedback has been addressed. Ready for QA.',
  'I noticed the design has changed since the wireframes were approved. Should I implement the new designs or stick to the original spec?',
  'The staging environment is set up. Credentials have been shared via the secure notes. Please verify access.',
  'Performance tests show the API handles 500 concurrent requests within acceptable limits. Load testing report attached.',
  'Final deliverables have been pushed to the main branch with full documentation. Thank you for the great collaboration.',
];

const COMPANY_NAMES = [
  'Nova Digital', 'Apex Software', 'BrightPath Labs', 'Streamline Tech', 'Vortex Systems',
  'Clearwater Dev', 'IronBridge Software', 'Nexus Digital', 'Summit Code', 'Orbital Apps',
  'Cascade Tech', 'Meridian Solutions', 'Redwood Studios', 'Pinnacle Dev', 'Blueprint Digital',
  'CloudForge', 'DataBridge', 'Horizon Labs', 'Catalyst Tech', 'Granite Software',
];

// ─── Helpers ─────────────────────────────────────────────────────────────────

const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
const pickN = (arr, n) => [...arr].sort(() => Math.random() - 0.5).slice(0, n);
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;
const randDate = (start, end) => new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));

const pastDate = (daysAgo) => {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  return d;
};

// ─── Main Seed ───────────────────────────────────────────────────────────────

async function main() {
  console.log('Starting seed...');
  const passwordHash = await bcrypt.hash(SEED_PASSWORD, 10);

  // ── 1. Tech stacks ─────────────────────────────────────────────────────────
  console.log('Seeding technology stacks...');
  await prisma.technologyStack.createMany({ data: TECH_STACKS, skipDuplicates: true });
  const techs = await prisma.technologyStack.findMany();
  console.log(`  ${techs.length} tech stacks`);

  // ── 2. Applications ─────────────────────────────────────────────────────────
  console.log('Seeding applications...');
  const APP_NAMES = [
    'ShopStream', 'DispatchNow', 'PipelinePro', 'ChatHive', 'MetricsPulse',
    'StockSense', 'BookNest', 'SocialHub', 'PaySecure', 'TeamCore',
    'LearnFlow', 'NotifyPro', 'WorkspacePro', 'InsightBoard', 'AuthGuard',
    'RouteTrack', 'MedConnect', 'QuickBite', 'EstateView', 'DocVault',
  ];
  const APP_DESCRIPTIONS = [
    'A full-featured e-commerce storefront with inventory, orders, and Stripe payments.',
    'Real-time field service dispatch app connecting technicians and operations teams.',
    'Sales CRM with deal pipelines, email sequences, and revenue forecasting.',
    'Team messaging platform with channels, DMs, file sharing, and threads.',
    'Business analytics dashboard with live data, KPI tracking, and custom reports.',
    'Inventory management system for multi-location warehouses with barcode support.',
    'Appointment booking SaaS for salons, clinics, and service businesses.',
    'Social media scheduling and analytics tool for marketing teams.',
    'Multi-currency payment gateway with fraud detection and reconciliation.',
    'HR management platform covering hiring, onboarding, leave, and payroll.',
    'Online learning platform with video courses, quizzes, and certifications.',
    'Notification delivery service with email, SMS, and push channel support.',
    'Multi-tenant SaaS workspace for project and team management.',
    'Executive BI dashboard pulling data from Salesforce, HubSpot, and SQL.',
    'Enterprise SSO and MFA authentication service with audit logging.',
    'Last-mile delivery tracking with GPS, route optimization, and POD.',
    'Patient portal for clinics with appointments, records, and secure messaging.',
    'Food delivery marketplace with live tracking, ratings, and loyalty points.',
    'Property listing platform with search, virtual tours, and agent chat.',
    'Legal document management with e-signature, versioning, and permissions.',
  ];
  const appData = Array.from({ length: 20 }, (_, i) => ({
    appName: APP_NAMES[i % APP_NAMES.length],
    appType: APP_TYPES[i % APP_TYPES.length],
    description: APP_DESCRIPTIONS[i % APP_DESCRIPTIONS.length],
    currentVersion: `${randInt(1, 3)}.${randInt(0, 9)}.${randInt(0, 9)}`,
  }));
  await prisma.application.createMany({ data: appData, skipDuplicates: true });
  const apps = await prisma.application.findMany();
  console.log(`  ${apps.length} applications`);

  // ── 3. Developer users (130) ─────────────────────────────────────────────
  console.log('Seeding 130 developers...');
  const developerUsers = [];
  for (let i = 1; i <= 130; i++) {
    const firstName = faker.person.firstName();
    const lastName = faker.person.lastName();
    developerUsers.push({
      fullName: `${firstName} ${lastName}`,
      email: `dev${String(i).padStart(3, '0')}@seed.dev`,
      passwordHash,
      phoneNumber: faker.phone.number({ style: 'international' }),
      accountStatus: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: pastDate(randInt(10, 200)),
      registrationDate: pastDate(randInt(30, 400)),
    });
  }
  await prisma.user.createMany({ data: developerUsers, skipDuplicates: true });
  const devUsers = await prisma.user.findMany({ where: { email: { startsWith: 'dev' } } });

  const developerProfiles = devUsers.map((u) => ({
    userID: u.userID,
    experienceYears: randInt(1, 12),
    hourlyRate: randInt(15, 120),
    portfolioURL: faker.internet.url(),
    availabilityStatus: pick(['AVAILABLE', 'AVAILABLE', 'BUSY', 'UNAVAILABLE']),
    bio: DEV_BIOS[devUsers.indexOf(u) % DEV_BIOS.length],
  }));
  await prisma.developer.createMany({ data: developerProfiles, skipDuplicates: true });
  const developers = await prisma.developer.findMany();
  console.log(`  ${developers.length} developer profiles`);

  // ── 4. Client users (170) ─────────────────────────────────────────────────
  console.log('Seeding 170 clients...');
  const clientUsers = [];
  for (let i = 1; i <= 170; i++) {
    clientUsers.push({
      fullName: faker.person.fullName(),
      email: `client${String(i).padStart(3, '0')}@seed.client`,
      passwordHash,
      phoneNumber: faker.phone.number({ style: 'international' }),
      accountStatus: 'ACTIVE',
      emailVerified: true,
      emailVerifiedAt: pastDate(randInt(10, 200)),
      registrationDate: pastDate(randInt(30, 400)),
    });
  }
  await prisma.user.createMany({ data: clientUsers, skipDuplicates: true });
  const clUsers = await prisma.user.findMany({ where: { email: { startsWith: 'client' } } });

  const clientProfiles = clUsers.map((u) => ({
    userID: u.userID,
    companyName: `${COMPANY_NAMES[clUsers.indexOf(u) % COMPANY_NAMES.length]} ${pick(['Ltd', 'Inc', 'Co', 'LLC', ''])}`.trim(),
    billingAddress: faker.location.streetAddress(),
    country: pick(COUNTRIES),
    bio: `We build ${pick(['mobile apps', 'web platforms', 'SaaS tools', 'enterprise software'])} and need skilled developers who can deliver quality work on schedule.`,
  }));
  await prisma.client.createMany({ data: clientProfiles, skipDuplicates: true });
  const clients = await prisma.client.findMany();
  console.log(`  ${clients.length} client profiles`);

  // ── 5. Developer tech skills ──────────────────────────────────────────────
  console.log('Seeding developer tech skills...');
  const skillData = [];
  for (const dev of developers) {
    const myTechs = pickN(techs, randInt(3, 7));
    for (const tech of myTechs) {
      skillData.push({
        developerID: dev.developerID,
        techID: tech.techID,
        proficiencyLevel: pick(['BEGINNER', 'INTERMEDIATE', 'INTERMEDIATE', 'EXPERT']),
        yearsExperience: randInt(1, 8),
      });
    }
  }
  await prisma.developerTechnology.createMany({ data: skillData, skipDuplicates: true });
  console.log(`  ${skillData.length} skill entries`);

  // ── 6. Contracts (70) ─────────────────────────────────────────────────────
  console.log('Seeding 70 contracts...');
  const contractStatuses = [
    ...Array(15).fill('DRAFT'),
    ...Array(10).fill('SIGNED'),
    ...Array(30).fill('IN_PROGRESS'),
    ...Array(10).fill('COMPLETED'),
    ...Array(5).fill('CANCELLED'),
  ];

  // 60 unique clients each get 1 contract, 5 get a 2nd = 65+5=70
  const contractingClients = pickN(clients, 65);
  const doubleDip = pickN(contractingClients, 5);
  const contractOwners = [...contractingClients, ...doubleDip];

  const contractData = contractOwners.map((client, idx) => {
    const status = contractStatuses[idx % contractStatuses.length];
    const startDate = pastDate(randInt(60, 365));
    const endDate = status === 'COMPLETED'
      ? pastDate(randInt(1, 30))
      : new Date(startDate.getTime() + randInt(60, 180) * 24 * 60 * 60 * 1000);
    return {
      clientID: client.clientID,
      appID: pick(apps).appID,
      title: `${pick(CONTRACT_TITLES)} ${idx + 1}`,
      description: CONTRACT_DESCRIPTIONS[idx % CONTRACT_DESCRIPTIONS.length],
      startDate,
      endDate,
      totalAmount: randInt(2000, 50000),
      status,
      signedDate: ['SIGNED', 'IN_PROGRESS', 'COMPLETED'].includes(status) ? startDate : null,
    };
  });

  await prisma.projectContract.createMany({ data: contractData, skipDuplicates: true });
  const contracts = await prisma.projectContract.findMany();
  console.log(`  ${contracts.length} contracts`);

  // ── 7. Contract technologies ──────────────────────────────────────────────
  console.log('Seeding contract technologies...');
  const ctData = [];
  for (const contract of contracts) {
    const myTechs = pickN(techs, randInt(2, 5));
    for (const tech of myTechs) {
      ctData.push({
        contractID: contract.contractID,
        techID: tech.techID,
        requiredLevel: pick(['INTERMEDIATE', 'INTERMEDIATE', 'EXPERT']),
        purpose: pick(['Primary implementation technology', 'Core backend framework', 'Frontend UI layer', 'Database storage', 'API communication', 'Cloud infrastructure']),
      });
    }
  }
  await prisma.contractTechnology.createMany({ data: ctData, skipDuplicates: true });
  console.log(`  ${ctData.length} contract tech entries`);

  // ── 8. Contract proposals ─────────────────────────────────────────────────
  console.log('Seeding contract proposals...');
  const activeContracts = contracts.filter((c) => ['SIGNED', 'IN_PROGRESS', 'COMPLETED', 'DRAFT'].includes(c.status));
  const proposalData = [];
  const proposalSeen = new Set();
  for (const contract of activeContracts.slice(0, 50)) {
    const numProposals = randInt(1, 4);
    const proposingDevs = pickN(developers, numProposals);
    for (const dev of proposingDevs) {
      const key = `${contract.contractID}-${dev.developerID}`;
      if (proposalSeen.has(key)) continue;
      proposalSeen.add(key);
      const isAccepted = contract.status === 'IN_PROGRESS' || contract.status === 'COMPLETED';
      proposalData.push({
        contractID: contract.contractID,
        developerID: dev.developerID,
        source: pick(['DEVELOPER_PROPOSAL', 'CLIENT_INVITE']),
        status: isAccepted ? pick(['ACCEPTED', 'PENDING', 'DECLINED']) : 'PENDING',
        message: `I have reviewed the project requirements and I am confident in delivering this. My relevant experience includes ${randInt(2, 8)} years in this domain with similar projects.`,
        proposedRate: randInt(20, 100),
        role: pick(ROLES),
        createdAt: pastDate(randInt(5, 60)),
      });
    }
  }
  await prisma.contractProposal.createMany({ data: proposalData, skipDuplicates: true });
  console.log(`  ${proposalData.length} proposals`);

  // ── 9. Contract assignments ───────────────────────────────────────────────
  console.log('Seeding contract assignments...');
  const assignableContracts = contracts.filter((c) => ['IN_PROGRESS', 'COMPLETED'].includes(c.status));
  const assignmentData = [];
  const assignSeen = new Set();
  for (const contract of assignableContracts) {
    const numDevs = randInt(1, 3);
    const assignedDevs = pickN(developers, numDevs);
    const share = parseFloat((100 / assignedDevs.length).toFixed(2));
    for (const dev of assignedDevs) {
      const key = `${dev.developerID}-${contract.contractID}`;
      if (assignSeen.has(key)) continue;
      assignSeen.add(key);
      assignmentData.push({
        developerID: dev.developerID,
        contractID: contract.contractID,
        role: pick(ROLES),
        assignedDate: pastDate(randInt(5, 90)),
        contributionPercentage: share,
        paymentShare: share,
      });
    }
  }
  await prisma.contractAssignment.createMany({ data: assignmentData, skipDuplicates: true });
  const assignments = await prisma.contractAssignment.findMany();
  console.log(`  ${assignments.length} assignments`);

  // ── 10. Milestones (2–4 per contract) ────────────────────────────────────
  console.log('Seeding milestones...');
  const milestoneData = [];
  for (const contract of contracts) {
    const count = randInt(2, 4);
    for (let i = 0; i < count; i++) {
      const dueDate = new Date(contract.startDate.getTime() + (i + 1) * randInt(14, 30) * 24 * 60 * 60 * 1000);
      const isCompleted = contract.status === 'COMPLETED' ||
        (contract.status === 'IN_PROGRESS' && i === 0 && Math.random() > 0.4);
      milestoneData.push({
        contractID: contract.contractID,
        title: MILESTONE_TITLES[i % MILESTONE_TITLES.length],
        description: MILESTONE_DESCRIPTIONS[i % MILESTONE_DESCRIPTIONS.length],
        dueDate,
        completeDate: isCompleted ? pastDate(randInt(1, 20)) : null,
        milestoneAmount: randInt(300, 8000),
        status: isCompleted ? 'COMPLETED' : pick(['PENDING', 'IN_PROGRESS', 'IN_REVIEW']),
        scope: pick(['INDIVIDUAL', 'INDIVIDUAL', 'SHARED']),
      });
    }
  }
  await prisma.milestone.createMany({ data: milestoneData, skipDuplicates: true });
  const milestones = await prisma.milestone.findMany({ include: { contract: { select: { contractID: true } } } });
  console.log(`  ${milestones.length} milestones`);

  // ── 11. Milestone assignments ─────────────────────────────────────────────
  console.log('Seeding milestone assignments...');
  const maData = [];
  const maSeen = new Set();
  for (const milestone of milestones) {
    const contractAssignments = assignments.filter((a) => a.contractID === milestone.contract.contractID);
    if (contractAssignments.length === 0) continue;
    const devCount = Math.min(contractAssignments.length, randInt(1, 2));
    const picked = pickN(contractAssignments, devCount);
    for (const ca of picked) {
      const key = `${milestone.milestoneID}-${ca.developerID}`;
      if (maSeen.has(key)) continue;
      maSeen.add(key);
      maData.push({ milestoneID: milestone.milestoneID, developerID: ca.developerID });
    }
  }
  await prisma.milestoneAssignment.createMany({ data: maData, skipDuplicates: true });
  console.log(`  ${maData.length} milestone assignments`);

  // ── 12. Escrows (12 — keep payment data minimal) ─────────────────────────
  console.log('Seeding 12 escrows...');
  const fundableMilestones = milestones
    .filter((m) => ['IN_PROGRESS', 'COMPLETED', 'IN_REVIEW'].includes(m.status))
    .slice(0, 12);

  const escrowData = fundableMilestones.map((m, idx) => {
    const isReleased = idx < 4;
    const depositDate = pastDate(randInt(5, 40));
    return {
      milestoneID: m.milestoneID,
      depositAmount: m.milestoneAmount,
      paymentStatus: isReleased ? 'RELEASED' : 'DEPOSITED',
      depositDate,
      releaseDate: isReleased ? pastDate(randInt(1, 4)) : null,
      transactionReference: null,
    };
  });
  await prisma.paymentEscrow.createMany({ data: escrowData, skipDuplicates: true });
  const escrows = await prisma.paymentEscrow.findMany();
  console.log(`  ${escrows.length} escrows`);

  // ── 13. Payment payouts (for released escrows) ────────────────────────────
  console.log('Seeding payment payouts...');
  const releasedEscrows = escrows.filter((e) => e.paymentStatus === 'RELEASED');
  const payoutData = [];
  for (const escrow of releasedEscrows) {
    const milestone = milestones.find((m) => m.milestoneID === escrow.milestoneID);
    const contractAssns = assignments.filter((a) => a.contractID === milestone?.contract?.contractID);
    if (contractAssns.length === 0) continue;
    const share = parseFloat((100 / contractAssns.length).toFixed(2));
    const amount = parseFloat((Number(escrow.depositAmount) / contractAssns.length).toFixed(2));
    for (const ca of contractAssns) {
      payoutData.push({
        escrowID: escrow.escrowID,
        developerID: ca.developerID,
        amount,
        sharePercent: share,
        status: 'RELEASED',
        releaseDate: escrow.releaseDate,
      });
    }
  }
  await prisma.paymentPayout.createMany({ data: payoutData, skipDuplicates: true });
  console.log(`  ${payoutData.length} payouts`);

  // ── 14. Bug reports ───────────────────────────────────────────────────────
  console.log('Seeding bug reports...');
  const bugContracts = pickN(contracts.filter((c) => c.status !== 'DRAFT'), 20);
  const bugData = bugContracts.map((c, idx) => ({
    contractID: c.contractID,
    title: BUG_TITLES[idx % BUG_TITLES.length],
    description: BUG_DESCRIPTIONS[idx % BUG_DESCRIPTIONS.length],
    severity: pick(['LOW', 'MINOR', 'MAJOR', 'CRITICAL']),
    status: pick(['REPORTED', 'IN_PROGRESS', 'RESOLVED', 'CLOSED']),
    createdDate: pastDate(randInt(1, 60)),
    resolvedDate: Math.random() > 0.5 ? pastDate(randInt(1, 10)) : null,
  }));
  await prisma.bugReport.createMany({ data: bugData, skipDuplicates: true });
  console.log(`  ${bugData.length} bug reports`);

  // ── 15. Messages ──────────────────────────────────────────────────────────
  console.log('Seeding messages...');
  const msgContracts = pickN(contracts.filter((c) => c.status !== 'DRAFT'), 20);
  const msgData = [];
  for (const contract of msgContracts) {
    const contractAssns = assignments.filter((a) => a.contractID === contract.contractID);
    if (contractAssns.length === 0) continue;
    const clientUser = clUsers.find((u) => {
      const cl = clients.find((c) => c.clientID === contract.clientID);
      return cl && u.userID === cl.userID;
    });
    const senders = contractAssns.map((ca) => {
      const dev = developers.find((d) => d.developerID === ca.developerID);
      return devUsers.find((u) => dev && u.userID === dev.userID);
    }).filter(Boolean);
    if (clientUser) senders.push(clientUser);
    for (let m = 0; m < randInt(2, 5); m++) {
      const sender = pick(senders);
      if (!sender) continue;
      msgData.push({
        contractID: contract.contractID,
        senderID: sender.userID,
        content: MESSAGES[(msgData.length) % MESSAGES.length],
        createdAt: pastDate(randInt(1, 30)),
        isRead: Math.random() > 0.3,
      });
    }
  }
  await prisma.message.createMany({ data: msgData, skipDuplicates: true });
  console.log(`  ${msgData.length} messages`);

  // ── 16. Reviews ───────────────────────────────────────────────────────────
  console.log('Seeding reviews...');
  const completedContracts = contracts.filter((c) => c.status === 'COMPLETED');
  const reviewData = [];
  const reviewSeen = new Set();
  for (const contract of completedContracts.slice(0, 10)) {
    const cl = clients.find((c) => c.clientID === contract.clientID);
    if (!cl) continue;
    const clientUser = clUsers.find((u) => u.userID === cl.userID);
    const contractAssns = assignments.filter((a) => a.contractID === contract.contractID);
    for (const ca of contractAssns) {
      const dev = developers.find((d) => d.developerID === ca.developerID);
      if (!dev) continue;
      const devUser = devUsers.find((u) => u.userID === dev.userID);
      if (!devUser || !clientUser) continue;
      const key = `${contract.contractID}-${clientUser.userID}-${devUser.userID}`;
      if (reviewSeen.has(key)) continue;
      reviewSeen.add(key);
      reviewData.push({
        contractID: contract.contractID,
        reviewerID: clientUser.userID,
        revieweeID: devUser.userID,
        rating: randInt(3, 5),
        comment: REVIEW_COMMENTS[reviewData.length % REVIEW_COMMENTS.length],
        createdAt: pastDate(randInt(1, 15)),
      });
    }
  }
  await prisma.review.createMany({ data: reviewData, skipDuplicates: true });
  console.log(`  ${reviewData.length} reviews`);

  // ── 17. Disputes ──────────────────────────────────────────────────────────
  console.log('Seeding disputes...');
  const disputeContracts = pickN(contracts.filter((c) => ['IN_PROGRESS', 'COMPLETED'].includes(c.status)), 8);
  const disputeData = [];
  for (const contract of disputeContracts) {
    const cl = clients.find((c) => c.clientID === contract.clientID);
    if (!cl) continue;
    const clientUser = clUsers.find((u) => u.userID === cl.userID);
    if (!clientUser) continue;
    disputeData.push({
      contractID: contract.contractID,
      raisedByID: clientUser.userID,
      reason: DISPUTE_REASONS[disputeData.length % DISPUTE_REASONS.length],
      status: pick(['OPEN', 'UNDER_REVIEW', 'RESOLVED', 'CLOSED']),
      resolution: Math.random() > 0.5 ? 'Both parties agreed to partial refund. Remaining work reassigned and contract closed by mutual consent.' : null,
      createdAt: pastDate(randInt(1, 30)),
      resolvedAt: Math.random() > 0.5 ? pastDate(randInt(1, 10)) : null,
    });
  }
  await prisma.dispute.createMany({ data: disputeData, skipDuplicates: true });
  console.log(`  ${disputeData.length} disputes`);

  // ── Summary ───────────────────────────────────────────────────────────────
  const userCount = await prisma.user.count();
  console.log('\n=== Seed Complete ===');
  console.log(`Users:          ${userCount} (130 devs + 170 clients)`);
  console.log(`Developers:     ${developers.length}`);
  console.log(`Clients:        ${clients.length}`);
  console.log(`Tech stacks:    ${techs.length}`);
  console.log(`Applications:   ${apps.length}`);
  console.log(`Contracts:      ${contracts.length}`);
  console.log(`Milestones:     ${milestones.length}`);
  console.log(`Escrows:        ${escrows.length} (payment data minimal)`);
  console.log('\nTest login credentials:');
  console.log('  Developer: dev001@seed.dev  / SeedUser@123');
  console.log('  Client:    client001@seed.client / SeedUser@123');
}

main()
  .catch((e) => { console.error(e); process.exit(1); })
  .finally(() => prisma.$disconnect());
