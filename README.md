# Freelance Job Portal

A full-stack freelance marketplace where clients can post contracts, invite developers, review proposals, manage milestones, and track project communication in one workspace.

Live app:
- https://freelance-job-portal-eight.vercel.app/

## Why This Project Exists

Freelance collaboration often gets fragmented across chat apps, spreadsheets, and payment tools. This platform centralizes the full lifecycle:
- Discovery and profile evaluation
- Contract posting and proposal flow
- Milestone and escrow progress
- Messaging, bug reporting, and dispute handling
- Ratings and analytics

## Main Use Cases

### 1) Client posts and manages a contract
- Create a new contract
- Invite developers directly
- Review incoming proposals
- Accept a developer and move into active workspace

### 2) Developer discovers opportunities and applies
- Browse open contract listings
- Submit applications and proposals
- Track application status
- Collaborate after selection

### 3) Team collaboration during delivery
- Exchange messages in context of contract work
- Break work into milestones
- Raise and track bug reports
- Review progress and status updates

### 4) Trust, accountability, and closure
- Escrow-related workflow support
- Dispute reporting and resolution path
- Final reviews and ratings
- Dashboard-level statistics for visibility

## Core Features

### Authentication and Account Security
- JWT-based auth
- Register/login for both Developer and Client roles
- Email verification flow
- Forgot password with OTP reset flow
- Token blacklist support for logout/session invalidation

### Role-Based Profiles
- Dedicated Developer and Client profile models
- Public developer profile pages
- Profile image upload support
- Developer skills and technology mapping

### Contracts and Proposals
- Contract creation and listing
- Direct developer invitations
- Proposal submission and tracking
- Application and acceptance workflow

### Project Execution Workspace
- Milestone planning and updates
- Escrow integration points
- Contract-level messaging
- Bug report logging
- Dispute lifecycle endpoints

### Reputation and Insights
- Review and ratings support
- Stats endpoints for dashboard reporting
- Notification delivery hooks

### Email Infrastructure
- Provider-based email sending service
- Brevo support with free-tier friendly setup
- Resend support as alternate provider
- Verification and OTP emails use common templated layout

## Tech Stack

Frontend:
- React
- Vite
- React Router
- Axios

Backend:
- Node.js
- Express
- Prisma ORM
- PostgreSQL
- JWT authentication
- Multer for uploads

Infrastructure and Deployment:
- Vercel for frontend
- Render for backend
- Neon PostgreSQL

## Project Structure

- frontend: React application
- backend: Express API + Prisma schema and migrations
- render.yaml: Render deployment configuration
- postman-collection-2.json: API testing collection

## Key API Domains

Main backend route groups include:
- auth
- profiles
- technologies
- applications
- contracts
- proposals
- milestones
- escrow
- messages
- bugs
- disputes
- reviews
- notifications
- stats
- uploads

## Local Development

Prerequisites:
- Node.js 18+
- PostgreSQL connection string

1. Clone repository
2. Install backend dependencies:
   - cd backend
   - npm install
3. Configure backend environment in backend/.env
4. Generate Prisma client and apply migrations:
   - npx prisma generate
   - npx prisma migrate deploy
5. Start backend:
   - npm run start

Frontend setup:
1. In a new terminal:
   - cd frontend
   - npm install
2. Start frontend:
   - npm run dev

## Environment Variables (Backend)

Required baseline:
- DATABASE_URL
- JWT_SECRET
- JWT_EXPIRES_IN
- CLIENT_URL
- API_BASE_URL

Email variables:
- EMAIL_PROVIDER (brevo or resend)
- EMAIL_FROM
- EMAIL_FROM_NAME
- EMAIL_VERIFY_TTL_MINUTES
- PASSWORD_RESET_OTP_TTL_MINUTES
- PASSWORD_RESET_OTP_MAX_ATTEMPTS
- BREVO_API_KEY when EMAIL_PROVIDER=brevo
- RESEND_API_KEY when EMAIL_PROVIDER=resend

## Deployment Notes

Frontend:
- Deploy frontend directory to Vercel

Backend:
- Deploy backend directory to Render
- Use render.yaml for baseline service config
- Ensure all production env vars are configured in Render dashboard

Email production tip:
- If using Brevo free tier, verify your sender email before go-live
- If using Resend, verify domain/sender to avoid sandbox recipient restrictions

## Testing

Backend:
- cd backend
- npm test

Frontend:
- cd frontend
- npm test

## Current Status

This project is production-oriented and covers end-to-end freelance workflow from onboarding to contract completion, including communication, milestone management, and trust mechanisms.

## License

ISC
