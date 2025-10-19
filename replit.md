# F-35 Birthday Registration Website

## Overview

A production-ready birthday event registration website with an F-35 fighter jet theme. The application combines serious military aviation aesthetics with playful, celebratory elements ("Top Gun meets Chuck E. Cheese"). Guests can register, RSVP to event timeslots across two weather-dependent schedules (Fair Weather vs Rain Plan), and receive web push notifications for event updates.

## User Preferences

Preferred communication style: Simple, everyday language.

## System Architecture

### Frontend Architecture

**Framework & Build System**
- React with TypeScript for type safety and developer experience
- Vite as the build tool for fast development and optimized production builds
- Wouter for lightweight client-side routing

**UI Component System**
- shadcn/ui component library built on Radix UI primitives
- TailwindCSS for utility-first styling with custom design tokens
- Custom color palette matching F-35 military aesthetic: Sky Blue primary, Jet Gray text, Afterburner Orange accents, Radar Green success states
- Typography: Rajdhani (display font) and Inter (body font) from Google Fonts
- Responsive design with mobile-first approach using Tailwind breakpoints

**State Management**
- TanStack Query (React Query) for server state management and caching
- Local component state with React hooks for UI state
- No global state management library needed due to server-driven architecture

**Key UI Features**
- Progressive Web App (PWA) capabilities with service worker and manifest
- Two-column schedule display (Fair Weather / Rain Plan) with responsive tabs on mobile
- SMS verification flow for editing guest profiles
- Admin dashboard with tabbed interface for settings, events, and roster management

### Backend Architecture

**Server Framework**
- Express.js with TypeScript running on Node.js
- RESTful API design pattern
- Session-based authentication using express-session

**Data Layer**
- PostgreSQL database accessed via Neon serverless driver
- Drizzle ORM for type-safe database queries and schema management
- Schema includes: guests, eventBlocks, rsvps, verificationCodes, settings tables
- Enum types for plan types (FAIR/RAIN), RSVP status, and verification purposes

**Authentication & Security**
- Admin authentication via password from environment variable
- Session management with httpOnly cookies
- Helmet.js for security headers
- Rate limiting on SMS sending and admin login attempts using rate-limiter-flexible
- IP hashing for privacy in rate limit keys
- JWT tokens for guest profile edit permissions (24-hour expiry)

**API Structure**
- `/api/admin/*` - Admin-only routes (login, logout, guest management, broadcast)
- `/api/settings` - Public event settings (title, description)
- `/api/events` - Event block CRUD operations
- `/api/guests` - Guest registration and profile management
- `/api/rsvp` - RSVP management per guest per event
- `/api/auth/sms/*` - SMS verification flow for profile edits

**Business Logic Patterns**
- Storage abstraction layer separating database operations from route handlers
- SMS provider abstraction allowing easy swap between Twilio and dev/test implementations
- Phone number normalization to E.164 format using libphonenumber-js
- Verification code generation with 6-digit codes, expiry tracking, and attempt limits

### External Dependencies

**Database**
- Neon Serverless PostgreSQL for scalable, serverless database hosting
- WebSocket support for connection pooling
- Drizzle ORM for migrations and schema management

**SMS Service**
- Twilio for production SMS delivery (verification codes)
- Graceful fallback to console logging in development when credentials absent
- Provider abstraction allows switching SMS vendors without changing business logic

**Authentication**
- bcryptjs for password hashing (future use, currently using direct comparison)
- jsonwebtoken for stateless edit token generation

**UI Component Libraries**
- Radix UI primitives (20+ components) for accessible, unstyled components
- React Hook Form with Zod resolvers for form validation
- date-fns for date formatting and manipulation
- cmdk for command palette patterns

**Development Tools**
- TypeScript for type safety across full stack
- Vite plugins: runtime error overlay, Replit-specific dev tools
- ESBuild for server bundling in production

**Notification System**
- Web Push API with service worker for browser push notifications
- VAPID keys stored in environment variables
- Subscription management tied to guest records
- Admin broadcast capability with optional audience segmentation

**Session Storage**
- In-memory session store (express-session default)
- Production should use connect-pg-simple for PostgreSQL session store

**Build & Deployment**
- Development: tsx for running TypeScript directly
- Production: Vite builds client, esbuild bundles server
- Environment variables: DATABASE_URL, ADMIN_PASSWORD, SESSION_SECRET, Twilio credentials, VAPID keys