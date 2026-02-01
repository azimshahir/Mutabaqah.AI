# Mutabaqah.AI - Setup Guide

## Step 1: Setup Supabase Project

### 1.1 Create Supabase Account & Project

1. Pergi ke [supabase.com](https://supabase.com)
2. Click **"Start your project"** atau **"Sign In"**
3. Sign in dengan GitHub/Email
4. Click **"New Project"**
5. Isi maklumat:
   - **Organization**: Pilih atau create organization
   - **Project name**: `mutabaqah-ai`
   - **Database Password**: Generate strong password (SIMPAN!)
   - **Region**: `Southeast Asia (Singapore)` - untuk latency rendah
6. Click **"Create new project"**
7. Tunggu 2-3 minit untuk project siap

### 1.2 Get API Credentials

1. Dalam Supabase Dashboard, click **"Project Settings"** (gear icon di sidebar)
2. Click tab **"API"**
3. Copy nilai berikut ke `.env.local`:

```
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...
```

### 1.3 Setup Database Schema

1. Dalam Supabase Dashboard, click **"SQL Editor"** di sidebar
2. Click **"New query"**
3. Copy SEMUA content dari `supabase/schema.sql`
4. Paste dalam SQL Editor
5. Click **"Run"** (atau Ctrl+Enter)
6. Tunggu sehingga semua tables dicipta

### 1.4 Verify Tables Created

1. Click **"Table Editor"** di sidebar
2. Pastikan tables berikut wujud:
   - `customers`
   - `financing_applications`
   - `tawarruq_transactions`
   - `validation_results`
   - `audit_logs`
   - `blockchain_records`

---

## Step 2: Setup Supabase MCP untuk Claude Code

Supabase MCP membolehkan Claude Code berinteraksi terus dengan Supabase database.

### 2.1 MCP Configuration

File `.mcp.json` sudah dicipta dengan config:

```json
{
  "mcpServers": {
    "supabase": {
      "type": "http",
      "url": "https://mcp.supabase.com/mcp"
    },
    "context7": {
      "type": "stdio",
      "command": "npx",
      "args": ["-y", "@upstash/context7-mcp"]
    }
  }
}
```

### 2.2 Connect Supabase MCP

1. **Restart Claude Code** dalam folder projek:
   ```bash
   cd "C:\Users\anis\Desktop\Cursor Project\mutabaqah-ai"
   claude
   ```

2. **Verify MCP loaded** - Taip dalam Claude Code:
   ```
   /mcp
   ```
   Anda sepatutnya nampak `supabase` dalam senarai MCP servers.

3. **Authenticate Supabase MCP**:
   - Bila anda guna Supabase MCP tools, ia akan prompt untuk authenticate
   - Login dengan Supabase account anda
   - Pilih project `mutabaqah-ai`
   - MCP akan auto-connect ke database anda

### 2.3 Test Supabase MCP

Selepas authenticate, cuba minta Claude:
```
"List all tables in my Supabase database"
```

atau

```
"Show me the schema for financing_applications table"
```

---

## Step 3: Setup Environment Variables

### 3.1 Create .env.local

```bash
cp .env.example .env.local
```

### 3.2 Fill in Values

Edit `.env.local` dan masukkan Supabase credentials:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

---

## Step 4: Run Development Server

```bash
npm run dev
```

Buka browser: [http://localhost:3000](http://localhost:3000)

---

## Troubleshooting

### MCP tidak connect

1. Pastikan `.mcp.json` ada di root folder projek
2. Restart Claude Code
3. Check dengan `/mcp` command

### Supabase authentication failed

1. Pastikan Supabase account anda ada access ke project
2. Cuba logout dan login semula
3. Check project permissions dalam Supabase dashboard

### Database tables tidak wujud

1. Buka SQL Editor dalam Supabase
2. Run `supabase/schema.sql` sekali lagi
3. Check untuk error messages

### Environment variables tidak load

1. Pastikan file named `.env.local` (bukan `.env`)
2. Restart development server
3. Check tiada typo dalam variable names

---

## Quick Reference

| Service | Dashboard URL |
|---------|---------------|
| Supabase | https://supabase.com/dashboard |
| Zetrix (Phase 2) | https://explorer.zetrix.com |

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server |
| `npm run build` | Build for production |
| `npm run lint` | Run ESLint |
| `/mcp` | Check MCP servers in Claude Code |

---

## Support

- Supabase Docs: https://supabase.com/docs
- Next.js Docs: https://nextjs.org/docs
- Claude Code: https://github.com/anthropics/claude-code
