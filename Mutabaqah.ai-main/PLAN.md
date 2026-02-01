# Mutabaqah.ai - Tawarruq Commodity Trading System

## Project Overview

A Shariah-compliant Tawarruq system for commodity trading (FCPO) with full audit trail, compliance monitoring, and AI-powered Shariah audit summaries.

---

## Recommended Tech Stack

### Core Framework
- **Next.js 14** (App Router) - Full-stack React framework
  - Works natively on Vercel
  - Can deploy to cPanel via Node.js or static export
  - Server-side rendering + API routes

### Styling
- **Tailwind CSS** - Lightweight, responsive, utility-first
- **Shadcn/ui** - Pre-built accessible components

### Database (Dual Support)
- **Supabase** (PostgreSQL) - Primary recommendation
  - Free tier: 500MB database, 1GB file storage
  - Real-time subscriptions (perfect for live monitor)
  - Built-in auth

- **MySQL** (PlanetScale/Tidb) - Secondary option
  - Serverless MySQL
  - Works with cPanel hosting

### ORM
- **Prisma** - Works with both PostgreSQL and MySQL
  - Type-safe database queries
  - Easy schema migrations
  - Switch database via env variable

### Authentication
- **NextAuth.js v5** - Flexible auth solution
  - Supports Supabase, credentials, OAuth
  - Session management

### AI Integration
- **Simulated Audit** - Rule-based templates (default)
- **Google Gemini API** - Free tier available (15 RPM)
  - Fallback for dynamic analysis

---

## Database Schema

```
┌─────────────────────────────────────────────────────────────┐
│                         USERS                                │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ email                                                        │
│ name                                                         │
│ role (admin/operator/viewer)                                 │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      TRANSACTIONS                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ transaction_id (unique, e.g., TXN-20250122-001)             │
│ customer_name                                                │
│ customer_id                                                  │
│ commodity_type (FCPO, etc.)                                  │
│ amount                                                       │
│ status (pending/processing/completed/violation)              │
│ shariah_status (compliant/non_compliant/pending_review)     │
│ created_at                                                   │
│ updated_at                                                   │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      AUDIT_EVENTS                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ transaction_id (FK)                                          │
│ stage (T0/T1/T2)                                             │
│ stage_name (WAKALAH/QABD/LIQUIDATE)                         │
│ status (pending/in_progress/completed/failed)               │
│ timestamp                                                    │
│ certificate_id (FK, nullable)                               │
│ metadata (JSON)                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      CERTIFICATES                            │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ certificate_number                                           │
│ type (WAKALAH_AGREEMENT/QABD_CONFIRMATION/LIQUIDATION)      │
│ issued_by (Bursa Malaysia, etc.)                            │
│ issued_at                                                    │
│ data (JSON - certificate details)                           │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                      AUDIT_LOGS                              │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ transaction_id (FK, nullable)                               │
│ event_type                                                   │
│ message                                                      │
│ severity (info/warning/error/critical)                      │
│ timestamp                                                    │
│ metadata (JSON)                                              │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│                   AI_AUDIT_SUMMARIES                         │
├─────────────────────────────────────────────────────────────┤
│ id (PK)                                                      │
│ transaction_id (FK)                                          │
│ summary                                                      │
│ compliance_score (0-100)                                    │
│ findings (JSON array)                                       │
│ recommendations (JSON array)                                │
│ generated_by (simulated/gemini)                             │
│ created_at                                                   │
└─────────────────────────────────────────────────────────────┘
```

---

## Project Structure (Modular)

```
mutabaqah.ai/
├── src/
│   ├── app/                          # Next.js App Router
│   │   ├── (auth)/                   # Auth routes group
│   │   │   ├── login/
│   │   │   └── register/
│   │   ├── (dashboard)/              # Protected dashboard routes
│   │   │   ├── layout.tsx
│   │   │   ├── page.tsx              # Dashboard home
│   │   │   ├── transactions/
│   │   │   │   ├── page.tsx          # Transaction list
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Transaction detail
│   │   │   ├── audit/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Audit timeline view
│   │   │   ├── certificates/
│   │   │   │   └── [id]/
│   │   │   │       └── page.tsx      # Certificate viewer
│   │   │   └── monitor/
│   │   │       └── page.tsx          # Live logs monitor
│   │   ├── api/                      # API routes
│   │   │   ├── auth/
│   │   │   ├── transactions/
│   │   │   ├── audit/
│   │   │   ├── certificates/
│   │   │   └── ai-summary/
│   │   ├── layout.tsx
│   │   └── page.tsx                  # Landing page
│   │
│   ├── components/                   # Reusable components
│   │   ├── ui/                       # Base UI components
│   │   ├── dashboard/                # Dashboard-specific
│   │   ├── transactions/             # Transaction components
│   │   ├── audit/                    # Audit components
│   │   ├── certificates/             # Certificate components
│   │   └── monitor/                  # Monitor components
│   │
│   ├── lib/                          # Utilities & config
│   │   ├── db/
│   │   │   ├── index.ts              # DB adapter selector
│   │   │   ├── supabase.ts           # Supabase client
│   │   │   └── mysql.ts              # MySQL client
│   │   ├── prisma.ts                 # Prisma client
│   │   ├── auth.ts                   # Auth config
│   │   ├── ai/
│   │   │   ├── index.ts              # AI adapter
│   │   │   ├── simulated.ts          # Rule-based audit
│   │   │   └── gemini.ts             # Gemini integration
│   │   └── utils.ts
│   │
│   ├── services/                     # Business logic
│   │   ├── transaction.service.ts
│   │   ├── audit.service.ts
│   │   ├── certificate.service.ts
│   │   └── monitor.service.ts
│   │
│   ├── types/                        # TypeScript types
│   │   └── index.ts
│   │
│   └── hooks/                        # Custom React hooks
│       ├── useTransactions.ts
│       └── useAudit.ts
│
├── prisma/
│   ├── schema.prisma                 # Database schema
│   └── seed.ts                       # Seed data
│
├── public/
│   └── certificates/                 # Dummy certificate templates
│
├── .env.example
├── .env.local
├── next.config.js
├── tailwind.config.js
├── package.json
└── README.md
```

---

## Key Features

### 1. Transaction Management
- List all commodity purchases (FCPO)
- Table columns: Customer Name, ID, Amount, Status, Time, Audit Action
- Filter by status (pending/processing/completed/violation)
- Search by customer name/ID

### 2. Audit Timeline (T0, T1, T2)
- Visual timeline showing process flow
- **T0 - WAKALAH AGREEMENT**: Agent appointment signing
- **T1 - QABD**: Asset possession/purchase confirmation
- **T2 - LIQUIDATE**: Murabahah execution & liquidation
- Each stage shows: Timestamp, Status, Action (view certificate)

### 3. Certificate Viewer
- Dummy certificate designs (Bursa Malaysia style)
- Types: Wakalah Agreement, Qabd Confirmation, Liquidation Certificate
- PDF-style display with official formatting

### 4. AI Shariah Audit Summary
- Simulated rule-based analysis (default)
- Gemini API integration for dynamic analysis
- Compliance score (0-100)
- Findings & recommendations

### 5. Live Monitor (Logs)
- Real-time event streaming
- Color-coded severity levels
- Filter by event type
- Auto-scroll with pause option

---

## Security Practices

1. **Authentication**: NextAuth.js with secure session handling
2. **Input Validation**: Zod schemas for all API inputs
3. **SQL Injection Prevention**: Prisma ORM parameterized queries
4. **XSS Prevention**: React's built-in escaping + CSP headers
5. **CSRF Protection**: NextAuth.js built-in CSRF tokens
6. **Rate Limiting**: API route protection
7. **Environment Variables**: Secrets in .env (never committed)
8. **HTTPS**: Enforced in production

---

## Deployment Options

### Vercel (Recommended)
- Native Next.js support
- Automatic HTTPS
- Edge functions
- Easy environment variables
- Connect to Supabase/PlanetScale

### cPanel (Alternative)
- Use Next.js static export OR
- Node.js hosting if available
- MySQL database via cPanel
- Manual SSL setup

---

## Development Phases

### Phase 1: Foundation
- [x] Project setup with Next.js 14
- [x] Database schema (Prisma)
- [x] Dual database adapter (Supabase/MySQL)
- [x] Authentication system

### Phase 2: Core Features
- [ ] Transaction CRUD operations
- [ ] Audit timeline system
- [ ] Certificate generation/viewer

### Phase 3: AI & Monitoring
- [ ] Simulated Shariah audit
- [ ] Gemini API integration
- [ ] Live monitor/logs

### Phase 4: UI/UX
- [ ] Dashboard layout
- [ ] Responsive design
- [ ] Landing page

### Phase 5: Polish
- [ ] Testing
- [ ] Performance optimization
- [ ] Documentation

---

## Environment Variables

```env
# Database (choose one or both)
DATABASE_PROVIDER=supabase  # or 'mysql'

# Supabase
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=

# MySQL (PlanetScale/Tidb)
DATABASE_URL=

# Auth
NEXTAUTH_SECRET=
NEXTAUTH_URL=http://localhost:3000

# AI
GEMINI_API_KEY=
AI_PROVIDER=simulated  # or 'gemini'
```

---

## Ready to Proceed?

This plan covers:
- Complete architecture
- Database schema
- Modular code structure
- Security practices
- Deployment options

Shall I start building the project?
