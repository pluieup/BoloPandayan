# Quick Reference: Developer Role Setup

## ⚡ TL;DR - 3 Steps to Get Started

### Step 1: Run the Migration
```sql
-- Copy/paste the entire contents of:
-- migrations/001_fresh_start_rbac_NEW_PROJECT.sql

-- Into Supabase SQL Editor → Click "Run"
```

### Step 2: Create Your Developer Account
```sql
-- After registering in the app (or creating auth user in Supabase)
-- Run this to make yourself a developer:

INSERT INTO public.tbl_user_profiles (id, full_name, role, account_status, is_approved)
SELECT 
  auth_user.id,
  'Your Name' as full_name,
  'developer' as role,
  'approved' as account_status,
  true as is_approved
FROM auth.users auth_user
WHERE auth_user.email = 'your-email@example.com'
ON CONFLICT (id) DO UPDATE
SET 
  role = 'developer',
  account_status = 'approved',
  is_approved = true;

-- Verify:
SELECT id, full_name, role, is_approved FROM public.tbl_user_profiles WHERE role = 'developer';
```

### Step 3: Create DeveloperDashboard Component
- Copy the code from [DEVELOPER_WORKFLOW.md](./DEVELOPER_WORKFLOW.md) Part 2
- Save as `frontend/src/developer/DeveloperDashboard.jsx`
- Update main navigation to show this when `user.role === 'developer'`

---

## 🔗 Role Linking

```
You (Developer)
    ↓ INSERT & UPDATE to approve
LGU Admin Profile  (role='lgu_admin', region='Cavite')
    ↓ SELECT to view, UPDATE is_approved for
Artisan Profiles  (role='artisan', region='Cavite')
```

---

## 📊 What's Changed in the Database

### New Role
- `'developer'` - Master approval authority (replaces old `'admin'` role)

### New Field
- `region` - Added to `tbl_user_profiles` for LGU admins (e.g., "Cavite", "Batangas")

### New Functions
- `is_developer()` - Checks if current user is a developer
- `is_developer_or_lgu_admin()` - Checks if user can approve/manage others

### Updated Policies
| Table | Old Policy | New Policy | Who Can Do It |
|-------|-----------|-----------|---|
| Products | DELETE by owner/admin | DELETE by owner/developer/LGU in region | Owner \| Developer \| Regional LGU Admin |
| Profiles | UPDATE by admin | UPDATE by developer | Only Developer |
| Workshops | Update by owner/admin | Update by owner/developer | Owner \| Developer |

---

## 👥 User States

### Developer
```
role = 'developer'
account_status = 'approved'
is_approved = true
```

### LGU Admin (Pending)
```
role = 'lgu_admin'
account_status = 'pending_approval'
is_approved = false
region = 'Cavite'
```

### LGU Admin (Approved)
```
role = 'lgu_admin'
account_status = 'approved'
is_approved = true
region = 'Cavite'
```

### Artisan (Pending)
```
role = 'artisan'
account_status = 'pending_approval'
is_approved = false
```

### Artisan (Approved)
```
role = 'artisan'
account_status = 'approved'
is_approved = true
```

---

## 🛡️ RLS Enforcement Summary

| Action | Developer | LGU Admin | Artisan |
|--------|-----------|-----------|---------|
| View all profiles | ✅ All | ✅ Same region only | ✅ Own only |
| Approve LGU admins | ✅ Yes | ❌ No | ❌ No |
| Approve artisans | ✅ Yes | ✅ In region | ❌ No |
| Delete products | ✅ All | ✅ In region | ✅ Own only |
| Delete workshops | ✅ All | ❌ No | ✅ Own only |

---

## 🚀 Common SQL Queries

### Get all pending approvals
```sql
SELECT full_name, role, region, created_at
FROM public.tbl_user_profiles
WHERE is_approved = false
ORDER BY created_at DESC;
```

### Approve an LGU admin
```sql
UPDATE public.tbl_user_profiles
SET is_approved = true, account_status = 'approved'
WHERE id = 'lgu-admin-uuid-here'
  AND role = 'lgu_admin';
```

### See how many artisans per LGU region
```sql
SELECT 
  lgu.full_name as lgu_admin,
  lgu.region,
  COUNT(artisans.id) as artisan_count
FROM public.tbl_user_profiles lgu
LEFT JOIN public.tbl_user_profiles artisans 
  ON lgu.region = artisans.region 
  AND artisans.role = 'artisan'
WHERE lgu.role = 'lgu_admin'
  AND lgu.is_approved = true
GROUP BY lgu.id, lgu.full_name, lgu.region
ORDER BY artisan_count DESC;
```

### Revoke an LGU admin
```sql
UPDATE public.tbl_user_profiles
SET account_status = 'revoked', is_approved = false
WHERE id = 'lgu-admin-uuid'
  AND role = 'lgu_admin';
```

---

## 📁 Files Modified

- ✅ `database/migrations/001_fresh_start_rbac_NEW_PROJECT.sql` - Updated roles, functions, policies
- ✅ `database/README.md` - Added developer workflow reference
- 🆕 `database/DEVELOPER_WORKFLOW.md` - Complete setup guide (you are here)
- 📝 `frontend/src/developer/DeveloperDashboard.jsx` - Create this from the guide

---

## ❓ FAQ

**Q: Can I have multiple developers?**
A: Yes! Just insert multiple profiles with `role = 'developer'`. They can all approve LGU admins.

**Q: Can LGU admins approve other LGU admins?**
A: No. Only developers can approve LGU admins. LGU admins can only approve artisans.

**Q: What if I make a mistake approving someone?**
A: Use UPDATE to change them back:
```sql
UPDATE public.tbl_user_profiles
SET is_approved = false, account_status = 'pending_approval'
WHERE id = 'user-uuid';
```

**Q: Can a developer revoke LGU admin access anytime?**
A: Yes. Run this update:
```sql
UPDATE public.tbl_user_profiles
SET account_status = 'revoked', is_approved = false
WHERE id = 'lgu-admin-uuid'
  AND role = 'lgu_admin';
```

**Q: Can an LGU admin see artisans from other regions?**
A: No. RLS policies filter by region. They only see artisans in their region.

**Q: What happens if an artisan's region doesn't match any LGU admin?**
A: Artisan won't get approved by that LGU admin. Developer can approve them directly.

