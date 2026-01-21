# Claude.md - AI Assistant Guidelines for Mutabaqah.AI

## Project Context

You are assisting with **Mutabaqah.AI**, an Automated Shariah Governance Middleware for Islamic banking. This system prevents Shariah Non-Compliance (SNC) events in Tawarruq financing.

**Scope**: This repository handles the **User/Customer-facing application** only. Dashboard, admin panel, and analytics are handled by other team members.

---

## Tech Stack

- **Frontend**: Next.js 14+ (App Router), TypeScript
- **Styling**: Tailwind CSS + shadcn/ui
- **Backend**: Next.js API Routes / Server Actions
- **Database**: Supabase (PostgreSQL) - shared with team
- **Auth**: Supabase Auth
- **Blockchain**: Zetrix SDK
- **External API**: Bursa Suq Al-Sila' (BSAS)

---

## Responsive Design

- **Mobile-first approach**: Design for mobile, then scale up to desktop
- **Breakpoints** (Tailwind defaults):
  - `sm`: 640px (small tablets)
  - `md`: 768px (tablets)
  - `lg`: 1024px (laptops)
  - `xl`: 1280px (desktops)
- **Always test** on both mobile and desktop views
- **Touch-friendly**: Buttons min 44px height on mobile
- Use responsive utilities: `flex-col md:flex-row`, `w-full md:w-1/2`, etc.

---

## Code Style Guidelines

### TypeScript
- Use strict TypeScript with no `any` types
- Define interfaces for all data structures
- Use Zod for runtime validation
- Prefer `type` over `interface` for simple types

### React/Next.js
- Use Server Components by default
- Use Client Components only when necessary (interactivity, hooks)
- Prefer Server Actions over API routes for mutations
- Use `app/` directory structure (App Router)

### File Naming
```
components/     - PascalCase (e.g., FinancingCard.tsx)
lib/            - camelCase (e.g., validationEngine.ts)
hooks/          - camelCase with use prefix (e.g., useFinancing.ts)
types/          - camelCase (e.g., financing.ts)
app/api/        - route.ts convention
```

### Component Structure
```tsx
// 1. Imports
import { ... } from '...'

// 2. Types
type Props = { ... }

// 3. Component
export function ComponentName({ prop1, prop2 }: Props) {
  // hooks
  // derived state
  // handlers
  // return JSX
}
```

---

## Domain Knowledge

### Tawarruq Flow
1. **T1 (Purchase)**: Bank buys commodity from market/platform
2. **T2 (Sale)**: Customer sells commodity to third party
3. **Critical Rule**: T1 MUST happen BEFORE T2 (Tartib requirement)

### Validation Rules
1. **Sequence Validation**: T1.timestamp < T2.timestamp
2. **Pricing Validation**: Cost Price < Selling Price
3. **Ownership Validation**: Qabd (possession) must be established
4. **Certificate Validation**: BSAS certificate must be authentic

### State Machine States
```
DRAFT → SUBMITTED → T1_PENDING → T1_VALIDATED → T2_PENDING → T2_VALIDATED → APPROVED → DISBURSED
                         ↓                           ↓
                     BLOCKED                     BLOCKED
```

---

## Database Conventions

### Supabase
- Use Row Level Security (RLS) for all tables
- Use PostgreSQL functions for complex business logic
- Use triggers for audit logging
- Always use parameterized queries

### Table Naming
- Use snake_case for table and column names
- Use plural for table names (e.g., `financing_applications`)
- Prefix junction tables with both table names (e.g., `user_roles`)

---

## API Design

### REST Conventions
- Use proper HTTP methods (GET, POST, PUT, DELETE)
- Return appropriate status codes
- Use consistent response format:
```typescript
type ApiResponse<T> = {
  success: boolean
  data?: T
  error?: {
    code: string
    message: string
  }
}
```

### Error Handling
- Always handle errors gracefully
- Log errors with context
- Return user-friendly error messages
- Never expose internal errors to clients

---

## Security Guidelines

1. **Never** store sensitive data in client-side code
2. **Always** validate input on both client and server
3. **Use** Supabase RLS for data access control
4. **Sanitize** all user inputs
5. **Use** environment variables for secrets

---

## Testing Approach

- Unit tests for validation logic
- Integration tests for API routes
- E2E tests for critical flows (financing submission, validation)

---

## Key Files Reference

```
/app
  /(auth)             - Login & Register pages
  /financing          - Financing application management (user's own)
  /transactions       - Transaction views (user's own)
  /api                - API routes

/components
  /ui                 - shadcn/ui components
  /financing          - Financing-related components
  /layout             - Shared layout components (navbar, etc.)

/lib
  /supabase           - Supabase client & utilities
  /validation         - Validation engine
  /blockchain         - Zetrix integration
  /bsas               - BSAS API client

/types
  financing.ts        - Financing types
  transaction.ts      - Transaction types
  validation.ts       - Validation types
```

### User Flow (This Repository)
```
Login/Register → My Applications List → Create New Application → View Status → Track Transactions
```

### Out of Scope (Other Team Members)
- Admin Dashboard
- Analytics & Reports
- Shariah Committee Review Panel
- Bank Officer Tools

---

## Common Tasks

### Adding New Validation Rule
1. Define rule in `/lib/validation/rules/`
2. Register in validation engine
3. Add corresponding database column if needed
4. Update state machine if needed

### Adding New API Endpoint
1. Create route in `/app/api/`
2. Define request/response types
3. Implement validation with Zod
4. Add RLS policies in Supabase

---

## Shariah Compliance Reminders

When implementing features, always consider:

1. **Tartib (Sequence)**: Order of transactions must be correct
2. **Qabd (Possession)**: Ownership must be established
3. **Pricing**: Must follow Islamic pricing principles
4. **Transparency**: All calculations must be auditable
5. **Documentation**: All decisions must be recorded

---

## External Documentation

- [Next.js Docs](https://nextjs.org/docs)
- [Supabase Docs](https://supabase.com/docs)
- [shadcn/ui](https://ui.shadcn.com)
- [Tailwind CSS](https://tailwindcss.com/docs)
- [Zetrix Docs](https://doc.zetrix.com)

---

*Refer to PSD.md for complete project specifications*
