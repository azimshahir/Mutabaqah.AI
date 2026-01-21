# Mutabaqah.AI - Product Specification Document

## Project Overview

**Project Name:** Mutabaqah.AI
**Full Name:** Automated Shariah Governance Middleware
**Version:** 1.0.0
**Status:** Development

---

## Problem Statement

Islamic banks face significant risks of **Shariah Non-Compliance (SNC)** events in Tawarruq financing, specifically:

1. **Sequence (Tartib) Errors** - Incorrect ordering of commodity purchase (T1) and sale (T2) transactions
2. **Pricing Errors** - Incorrect Cost Price vs. Selling Price calculations that render contracts void (batil)

These errors can invalidate Islamic financing contracts and expose banks to regulatory penalties and reputational damage.

---

## Solution

Mutabaqah.AI is an automated middleware that acts as a **Shariah compliance gateway** between Islamic banks and commodity trading platforms, ensuring all Tawarruq transactions are valid before disbursement.

---

## Target Users

- **Primary:** Islamic Banks (Shariah Audit & Operations Departments)
- **Products:** Personal Financing-i, and other Tawarruq-based products
- **Secondary:** Commodity platform operators, Shariah advisors

---

## Key Features

### 1. Blocking State Machine
- Automatically **blocks** financing disbursement if commodity purchase sequence is incorrect
- Validates T1 (Bank buys commodity) must occur **BEFORE** T2 (Customer sells commodity)
- Prevents timestamp manipulation or backdating

### 2. Real-Time Validation Engine
- Integrates with **Bursa Suq Al-Sila' (BSAS)** commodity platform
- Verifies:
  - Asset existence on platform
  - Correct pricing (Cost Price < Selling Price)
  - Ownership transfer completion (Qabd)
  - Certificate authenticity

### 3. Immutable Audit Trail
- Records all transactions on **Zetrix Layer-1 Blockchain**
- Stores proof of:
  - Ownership transfer (Qabd Haqiqi/Hukmi)
  - Contract sequencing timestamps
  - Pricing calculations
  - Certificate hashes

### 4. Dashboard & Reporting
- Real-time monitoring of all financing applications
- SNC risk alerts and notifications
- Audit reports for Shariah Committee
- Analytics and compliance metrics

---

## Technical Architecture

### Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14+ (App Router) |
| Styling | Tailwind CSS + shadcn/ui |
| Backend | Next.js API Routes / Server Actions |
| Database | Supabase (PostgreSQL) |
| Authentication | Supabase Auth |
| Blockchain | Zetrix SDK |
| External API | Bursa Suq Al-Sila' API |

### System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    ISLAMIC BANK SYSTEM                       │
│                  (Core Banking / LOS)                        │
└─────────────────────────┬───────────────────────────────────┘
                          │ API Request
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                    MUTABAQAH.AI                              │
│  ┌─────────────┐  ┌─────────────┐  ┌─────────────────────┐  │
│  │   Blocking  │  │  Validation │  │   Audit Trail       │  │
│  │   State     │──│  Engine     │──│   (Blockchain)      │  │
│  │   Machine   │  │             │  │                     │  │
│  └─────────────┘  └─────────────┘  └─────────────────────┘  │
└─────────────────────────┬───────────────────────────────────┘
                          │
          ┌───────────────┼───────────────┐
          ▼               ▼               ▼
┌─────────────┐  ┌─────────────────┐  ┌─────────────┐
│  Supabase   │  │  Bursa Suq      │  │   Zetrix    │
│  Database   │  │  Al-Sila' API   │  │  Blockchain │
└─────────────┘  └─────────────────┘  └─────────────┘
```

---

## Database Schema (Supabase)

### Core Tables

#### 1. `financing_applications`
```sql
- id: UUID (PK)
- application_number: VARCHAR(50) UNIQUE
- customer_id: UUID (FK)
- product_type: ENUM ('personal_financing_i', 'home_financing_i', etc.)
- principal_amount: DECIMAL(15,2)
- profit_rate: DECIMAL(5,4)
- tenure_months: INTEGER
- status: ENUM ('pending', 'validating', 'approved', 'blocked', 'disbursed')
- created_at: TIMESTAMP
- updated_at: TIMESTAMP
```

#### 2. `tawarruq_transactions`
```sql
- id: UUID (PK)
- financing_id: UUID (FK)
- transaction_type: ENUM ('T1_PURCHASE', 'T2_SALE')
- commodity_id: VARCHAR(100)
- commodity_type: VARCHAR(50)
- quantity: DECIMAL(10,4)
- unit_price: DECIMAL(15,4)
- total_amount: DECIMAL(15,2)
- platform_reference: VARCHAR(100)
- timestamp: TIMESTAMP WITH TIME ZONE
- sequence_number: INTEGER
- blockchain_tx_hash: VARCHAR(100)
- status: ENUM ('pending', 'validated', 'rejected')
```

#### 3. `validation_results`
```sql
- id: UUID (PK)
- financing_id: UUID (FK)
- validation_type: ENUM ('sequence', 'pricing', 'ownership', 'certificate')
- result: ENUM ('pass', 'fail', 'warning')
- details: JSONB
- validated_at: TIMESTAMP
- validator_version: VARCHAR(20)
```

#### 4. `audit_logs`
```sql
- id: UUID (PK)
- financing_id: UUID (FK)
- action: VARCHAR(100)
- actor_id: UUID (FK)
- actor_type: ENUM ('system', 'user', 'api')
- details: JSONB
- blockchain_proof: VARCHAR(100)
- created_at: TIMESTAMP
```

#### 5. `blockchain_records`
```sql
- id: UUID (PK)
- financing_id: UUID (FK)
- record_type: ENUM ('qabd_proof', 'sequence_proof', 'certificate_hash')
- zetrix_tx_hash: VARCHAR(100)
- block_number: BIGINT
- payload_hash: VARCHAR(100)
- created_at: TIMESTAMP
```

---

## State Machine Definition

### Financing Application States

```
[DRAFT] → [SUBMITTED] → [T1_PENDING] → [T1_VALIDATED] → [T2_PENDING] → [T2_VALIDATED] → [APPROVED] → [DISBURSED]
                              ↓                              ↓
                         [BLOCKED]                      [BLOCKED]
```

### Transition Rules

1. **SUBMITTED → T1_PENDING**: Application submitted, waiting for T1 transaction
2. **T1_PENDING → T1_VALIDATED**: T1 (bank purchase) validated successfully
3. **T1_PENDING → BLOCKED**: T1 validation failed (asset not exist, pricing error)
4. **T1_VALIDATED → T2_PENDING**: Waiting for T2 transaction
5. **T2_PENDING → T2_VALIDATED**: T2 (customer sale) validated, sequence correct
6. **T2_PENDING → BLOCKED**: Sequence error (T2 timestamp before T1)
7. **T2_VALIDATED → APPROVED**: All validations passed
8. **APPROVED → DISBURSED**: Funds released to customer

---

## API Endpoints

### Internal APIs (Next.js API Routes)

```
POST   /api/financing/submit          - Submit new application
GET    /api/financing/:id             - Get application details
POST   /api/financing/:id/validate    - Trigger validation
GET    /api/financing/:id/audit-trail - Get audit history

POST   /api/transactions/t1           - Record T1 transaction
POST   /api/transactions/t2           - Record T2 transaction
GET    /api/transactions/:id/status   - Check transaction status

GET    /api/dashboard/metrics         - Dashboard statistics
GET    /api/reports/snc               - SNC reports
```

### External Integrations

1. **Bursa Suq Al-Sila' API**
   - Verify commodity existence
   - Get real-time pricing
   - Confirm trade execution

2. **Zetrix Blockchain API**
   - Submit proof records
   - Query transaction history
   - Verify data integrity

---

## Security Requirements

1. **Authentication**: Supabase Auth with MFA for bank users
2. **Authorization**: Role-based access control (RBAC)
3. **Encryption**: TLS 1.3 for transit, AES-256 for data at rest
4. **Audit**: All actions logged with blockchain proof
5. **API Security**: Rate limiting, API key authentication for external systems

---

## Compliance Requirements

1. **BNM Shariah Governance Policy Document (SGPD)**
2. **AAOIFI Shariah Standards (SS 30: Monetization/Tawarruq)**
3. **Bank's Internal Shariah Policy**

---

## Development Phases

### Phase 1: Foundation (MVP)
- [ ] Project setup (Next.js + Supabase)
- [ ] Authentication & user management
- [ ] Basic database schema
- [ ] Simple validation engine
- [ ] Basic dashboard

### Phase 2: Core Features
- [ ] Full state machine implementation
- [ ] BSAS API integration (mock/sandbox)
- [ ] Blockchain integration (Zetrix testnet)
- [ ] Comprehensive validation rules

### Phase 3: Production Ready
- [ ] Production API integrations
- [ ] Advanced reporting
- [ ] Performance optimization
- [ ] Security hardening
- [ ] Documentation & training

---

## Success Metrics

1. **SNC Prevention Rate**: Target 100% blocking of invalid sequences
2. **Processing Time**: < 5 seconds for validation
3. **System Uptime**: 99.9%
4. **Audit Completeness**: 100% transactions recorded on blockchain

---

## Glossary

| Term | Definition |
|------|------------|
| **Tawarruq** | Islamic financing structure involving buying and selling commodities |
| **T1** | First transaction - Bank purchases commodity from market |
| **T2** | Second transaction - Customer sells commodity to third party |
| **Tartib** | Proper sequence/order of transactions |
| **Qabd** | Taking possession/ownership of commodity |
| **SNC** | Shariah Non-Compliance |
| **BSAS** | Bursa Suq Al-Sila' (Malaysian commodity trading platform) |

---

*Last Updated: January 2025*
