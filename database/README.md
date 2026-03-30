# Database Migrations

Complete SQL migrations for Bolo Pandayan database setup, normalization, and RBAC.

## DEVELOPER & LGU ADMIN SETUP

See [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md) for:
- How to insert yourself as a developer
- Approving LGU admins
- LGU admins managing artisans
- Role hierarchy and permissions

Read this first before running migrations.

## Files

### `migrations/001_fresh_start_rbac_NEW_PROJECT.sql` ⭐ (Use This for New Supabase Projects)
**Clean setup for brand new Supabase projects** - Creates entire database schema WITHOUT any DROP commands:
- Normalized tables (profiles, workshops, products, damage reports, risk assessments)
- Row-Level Security (RLS) policies for RBAC
- Helper functions (`is_developer()`, `is_lgu_admin_approved()`)
- Field-level protection trigger (prevents non-developers from changing their own role/status)
- Proper foreign keys, indexes, and constraints

**When to use:**
- Starting a brand new Supabase project (empty database)
- No existing data to worry about

---

### `migrations/001_fresh_start_rbac.sql` (Use This for Migrations)
**Complete fresh start script with cleanup** - Wipes and recreates entire database schema:
- Includes all DROP commands to remove old tables/policies/functions
- Creates new normalized tables with proper FKs + constraints
- Sets up complete RLS and RBAC

**When to use:**
- Migrating from existing Supabase project
- Current schema has broken/deprecated RLS policies
- Rebuilding after major data corruption
- Already have some data you backed up and want to re-import

---

## How to Run

### ⭐ Quick Reference: Which File to Use?

| Scenario | Use This File | Reason |
|----------|---------------|--------|
| **Brand new Supabase project (empty DB)** | `001_fresh_start_rbac_NEW_PROJECT.sql` | No DROP commands needed |
| **Existing project with broken schema** | `001_fresh_start_rbac.sql` | Includes DROP commands to clean up |
| **Migrating from old Supabase project** | `001_fresh_start_rbac.sql` | Same as above |

---

### ⭐ For Brand New Supabase Project:
```
1. Create new Supabase project
2. Go to SQL Editor
3. Create new query (click "+")
4. Open: migrations/001_fresh_start_rbac_NEW_PROJECT.sql
5. Copy entire contents → paste into SQL Editor
6. Click "Run"
7. Done! No DROP commands needed because DB is empty.
8. Verify (see Step 3 below)
```

### For Migrating Existing Project:

### Step 1: Backup Current Data (Recommended)
```
Go to Supabase Dashboard → SQL Editor
Run: SELECT * FROM public.tbl_user_profiles;
Export results as CSV (click download button in Results panel)
Repeat for: tbl_workshops, tbl_products, tbl_damage_reports, tbl_workshop_risk_assessments
```

### Step 2: Run the Migration
```
1. Go to Supabase Dashboard → SQL Editor
2. Create new query (click "+" or "New Query")
3. Open migrations/001_fresh_start_rbac.sql from this repo
4. Copy entire contents
5. Paste into SQL Editor
6. Click "Run" button (or Ctrl+Enter)
7. Wait for completion (watch for errors in Results panel)
```

### Step 3: Verify Setup
```
Scroll to bottom of migration file
Uncomment the "VERIFICATION QUERIES" block at the very end
Run each query one by one to verify:
  - Tables created ✓
  - Indexes created ✓
  - RLS enabled ✓
  - Policies exist ✓
  - Functions exist ✓
```

### Step 4: Re-import Data (Only for Migration, if You Backed Up)
```
1. Go to Supabase Dashboard → Table Editor
2. Click on tbl_user_profiles
3. Click "Import data" button (top right)
4. Upload your backed-up CSV
5. Map column names carefully
6. Click "Import"
7. Repeat for other tables
```

---

## What the Script Does

### Tables Created
| Table | Purpose | Owner Check |
|-------|---------|------------|
| `tbl_user_profiles` | Users (artisans, LGU admins, developers) | N/A (self-owned) |
| `tbl_workshops` | Workshop entities | `owner_id` |
| `tbl_products` | Bolo masterworks | Inherited from workshop |
| `tbl_damage_reports` | Incident records | Inherited from workshop |
| `tbl_workshop_risk_assessments` | Risk snapshots | LGU admin/developer write |

### Policies Installed
- **Profiles**: Users read all, update self; developer manages all; approved LGU admins manage artisans
- **Workshops**: Public read, owner/developer write
- **Products**: Public read, owner/developer write; approved LGU admins can delete for moderation
- **Damage Reports**: Public read, owner/developer/approved LGU admin write
- **Risk Assessments**: Public read, developer/approved LGU admin write

### Security Features
1. **Row-Level Security (RLS)** on all tables
2. **is_developer() + is_lgu_admin_approved()** functions for role checks
3. **Field protection trigger** prevents non-developers from changing their own role/status
4. **Foreign key constraints** ensure data integrity
5. **Indexes** for query performance

---

## Troubleshooting

### "ERROR: relation 'public.tbl_user_profiles' does not exist"
- You haven't run the migration yet
- Or the migration failed partway through
- **Fix:** Run the entire script again from the beginning

### "ERROR: 42809: count(*) must be used to call a parameterless aggregate function"
- Verification query syntax is wrong
- **Fix:** Use the verified queries commented out at the bottom of the script

### "ERROR: missing FROM-clause entry for table 'auth'"
- Supabase doesn't expose `auth` schema in user SQL
- `auth.uid()` and `auth.users` are built-in—should just work
- **Fix:** Verify you're running in Supabase SQL Editor (not pgAdmin)

### Data Lost After Running Migration
- The script uses `DROP TABLE ... CASCADE`
- You should have backed up first (Step 1)
- **Recovery:** Re-import your backup CSV via Table Editor

---

## Next Steps

After migration completes:

1. **Test RLS Policies**:
   - Create test user via Supabase Auth
   - Have them try inserting a product → should work for their workshop only
   - Try cross-workshop access → should fail

2. **Verify Frontend Compatibility**:
   - Frontend code was already updated to use normalized schema
   - Rebuild frontend: `npm run build`
   - Run: `npm run dev`

3. **Set Up Seed Data** (Optional):
   - Add test workshops/artisans manually via UI
   - Or create `002_seed_test_data.sql` file

---

## Reference

### Key Database Concepts

**Row-Level Security (RLS)**
- Policies run at database level, automatically filtered
- Prevents unauthorized data access even via direct SQL
- Example: `select * from tbl_products` only returns products from workshops you own/manage

**Ownership Model**
- Workshops have `owner_id` (the creating artisan)
- Products inherit from workshop ownership
- Owners can modify their own records, while developers and approved LGU admins can moderate based on policy

**Foreign Keys**
- `tbl_products.workshop_id` → `tbl_workshops.id` (ON DELETE CASCADE)
- `tbl_workshops.owner_id` → `tbl_user_profiles.id` (ON DELETE RESTRICT)
- Prevents orphaned records

---

## Questions?

Refer to the SQL file comments for detailed explanations of each section.
