# Bolo Pandayan: Developer & LGU Admin Workflow Guide

## Role Hierarchy

```
Developer (YOU)
    ↓ approves
LGU Admins (Regional Managers)
    ↓ approve
Artisans (Individual Craftspeople)
```

---

## Part 1: Setting Up Your Developer Account

### Step 1: Register via the App (or use Supabase directly)

**Option A: Via Frontend App**
1. Open the registration page
2. Sign up with your email/password
3. You'll be created in `auth.users` automatically

**Option B: Via Supabase Admin Panel**
1. Go to **Authentication > Users**
2. Click **"Add user"**
3. Enter your email and password
4. Click **"Create user"**

### Step 2: Insert Yourself as Developer in the Database

Once you have an auth user created, run this SQL in Supabase SQL Editor:

```sql
INSERT INTO public.tbl_user_profiles (id, full_name, role, account_status, is_approved)
SELECT 
  auth_user.id,
  'Your Full Name' as full_name,
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
```

**What this does:**
- Sets your role to `'developer'` (master approval authority)
- Auto-approves your account (status = 'approved', is_approved = true)
- Links your auth user to your profile

**Verify it worked:**
```sql
SELECT id, full_name, role, account_status, is_approved 
FROM public.tbl_user_profiles 
WHERE role = 'developer';
```

---

## Part 2: Developer Dashboard (Frontend Setup)

### What Your Dashboard Does

Once logged in as a developer, you'll see:

1. **"Pending LGU Admins"** - List of LGU admins waiting for your approval
   - Shows: Name, Region, Application Date, Status
   - Actions: **Approve** or **Reject**

2. **"Active LGU Admins"** - List of approved regional managers
   - Shows: Name, Region, Approved Date, Artisans Managed Count
   - Actions: **View Dashboard**, **Revoke Access**

### Frontend File (Create This Component)

**File:** `frontend/src/developer/DeveloperDashboard.jsx`

```jsx
import { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';

export default function DeveloperDashboard({ profile }) {
  const [pendingLGU, setPendingLGU] = useState([]);
  const [approvedLGU, setApprovedLGU] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLGUAdmins();
  }, []);

  const fetchLGUAdmins = async () => {
    try {
      // Pending LGU Admins
      const { data: pending } = await supabase
        .from('tbl_user_profiles')
        .select('*')
        .eq('role', 'lgu_admin')
        .eq('is_approved', false)
        .order('created_at', { ascending: false });

      // Approved LGU Admins
      const { data: approved } = await supabase
        .from('tbl_user_profiles')
        .select('*')
        .eq('role', 'lgu_admin')
        .eq('is_approved', true)
        .order('created_at', { ascending: false });

      setPendingLGU(pending || []);
      setApprovedLGU(approved || []);
      setLoading(false);
    } catch (error) {
      console.error('Error fetching LGU admins:', error);
      setLoading(false);
    }
  };

  const approveLGU = async (id) => {
    try {
      const { error } = await supabase
        .from('tbl_user_profiles')
        .update({
          is_approved: true,
          account_status: 'approved',
        })
        .eq('id', id);

      if (error) throw error;
      alert('LGU Admin approved!');
      fetchLGUAdmins();
    } catch (error) {
      console.error('Error approving LGU admin:', error);
      alert('Failed to approve');
    }
  };

  const rejectLGU = async (id) => {
    try {
      const { error } = await supabase
        .from('tbl_user_profiles')
        .update({
          account_status: 'rejected',
          is_approved: false,
        })
        .eq('id', id);

      if (error) throw error;
      alert('LGU Admin rejected!');
      fetchLGUAdmins();
    } catch (error) {
      console.error('Error rejecting LGU admin:', error);
      alert('Failed to reject');
    }
  };

  if (loading) return <div>Loading...</div>;

  return (
    <div className="developer-dashboard">
      <h1>Developer Control Panel</h1>

      <section className="pending-lgu">
        <h2>⏳ Pending LGU Admin Approvals ({pendingLGU.length})</h2>
        {pendingLGU.length === 0 ? (
          <p>No pending LGU admins</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Region</th>
                <th>Applied</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {pendingLGU.map(lgu => (
                <tr key={lgu.id}>
                  <td>{lgu.full_name}</td>
                  <td>{lgu.region || 'Not specified'}</td>
                  <td>{new Date(lgu.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => approveLGU(lgu.id)}>✓ Approve</button>
                    <button onClick={() => rejectLGU(lgu.id)}>✗ Reject</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="approved-lgu">
        <h2>✅ Active LGU Admins ({approvedLGU.length})</h2>
        {approvedLGU.length === 0 ? (
          <p>No approved LGU admins yet</p>
        ) : (
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Region</th>
                <th>Approved</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {approvedLGU.map(lgu => (
                <tr key={lgu.id}>
                  <td>{lgu.full_name}</td>
                  <td>{lgu.region}</td>
                  <td>{new Date(lgu.created_at).toLocaleDateString()}</td>
                  <td>
                    <button onClick={() => window.location.href = `/lgu-dashboard/${lgu.id}`}>
                      View Dashboard
                    </button>
                    <button className="danger" onClick={() => rejectLGU(lgu.id)}>Revoke</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
```

---

## Part 3: LGU Admin Approval Workflow

### How an LGU Admin Registers

1. **Registration Step**
   - Sign up with their email/password in the app
   - Select role: "LGU Admin"
   - Enter their region (e.g., "Cavite", "Batangas", etc.)

2. **Initial Status**
   - Role: `'lgu_admin'`
   - Account Status: `'pending_approval'`
   - Is Approved: `false`
   - Region: Set to their jurisdiction

### Developer Approves Them

1. Log in to the Developer Dashboard
2. See the LGU Admin in **"Pending LGU Admin Approvals"** list
3. Click **"Approve"**
   - Updates: `is_approved = true`, `account_status = 'approved'`
   - They can now log in and see their LGU Admin Dashboard

### Verification Query

```sql
-- List all pending LGU admins waiting for developer approval
SELECT 
  id,
  full_name,
  region,
  created_at,
  account_status
FROM public.tbl_user_profiles
WHERE role = 'lgu_admin' 
  AND is_approved = false
ORDER BY created_at DESC;
```

---

## Part 4: LGU Admin Dashboard

### What LGU Admins Can Do

Once approved, an LGU Admin (in their region) can:

1. **View All Artisans** in their region
   - Filter by: Status (pending/approved), name, workshop
   - See their details: ID, name, region, approval status

2. **Approve/Reject Artisan Applications**
   - When an artisan creates a workshop → status is `'pending_approval'`
   - LGU Admin reviews and clicks **Approve** or **Reject**
   - Only artisans in their region show up

3. **Manage Products**
   - View all products from workshops in their region
   - Delete products that violate guidelines
   - Leave comments/feedback (with additional product_comments table if needed)

4. **Revoke Artisan Access**
   - Can set artisan status to `'revoked'` to prevent publishing

### Key Differences from Artisan Dashboard

| Feature | Artisan Dashboard | LGU Admin Dashboard |
|---------|-------------------|-------------------|
| View Own | Products only | Products from all region workshops |
| Edit | Own products | Can delete any product in region |
| Approve | N/A | Can approve/reject artisans |
| Scope | Workshop | Region |

### Protection via RLS

- LGU Admins can **only see and manage** artisans/products **in their region**
- Artisans can **only see** their own workshop and products
- LGU Admins **cannot** change artisan roles or account_status (only developer can)
- Artisans **cannot** change their own approval status

---

## Part 5: Enforcement via RLS Policies

### What Each Role Can Do

**DEVELOPER**
- ✅ Approve/reject LGU Admins
- ✅ Manage any artisan (approve, revoke, change status)
- ✅ Delete any product
- ✅ Create/edit/delete workshops
- ✅ Delete damage reports and risk assessments

**LGU ADMIN (Approved)**
- ✅ View all artisans in their region
- ✅ Approve/reject artisan applications (via direct profile updates... restricted by policy)
- ✅ Delete products in their region
- ❌ Cannot change artisan role or approval status
- ❌ Cannot approve other LGU admins (developer only)
- ❌ Cannot see other regions

**ARTISAN (Approved)**
- ✅ Create and manage own workshop
- ✅ Upload and manage own products
- ✅ Edit own bio and profile
- ❌ Cannot change own approval status
- ❌ Cannot see other artisans' products (unless approved)
- ❌ Cannot access other workshops

---

## Part 6: Database Maintenance Query

### Check Current Setup

```sql
-- Verify all developers
SELECT full_name, region, role, account_status, is_approved, created_at
FROM public.tbl_user_profiles
WHERE role = 'developer'
ORDER BY created_at;

-- Verify LGU admins by region
SELECT 
  full_name, 
  region, 
  is_approved, 
  account_status, 
  created_at
FROM public.tbl_user_profiles
WHERE role = 'lgu_admin'
ORDER BY region, full_name;

-- Count artisans by region and approval status
SELECT 
  region,
  COUNT(*) as total,
  SUM(CASE WHEN is_approved THEN 1 ELSE 0 END) as approved,
  SUM(CASE WHEN is_approved THEN 0 ELSE 1 END) as pending
FROM public.tbl_user_profiles
WHERE role = 'artisan'
GROUP BY region
ORDER BY region;
```

---

## Part 7: Troubleshooting

### "Developer can't approve LGU admins"
- Check: Is your profile `role = 'developer'` and `is_approved = true`?
- Check: Are you trying to update the correct LGU admin's id?
- Check: Is the LGU admin's id valid and exists in the database?

### "LGU Admin can't see artisans"
- Check: Is the LGU admin `is_approved = true`?
- Check: Do artisans have a `region` value that matches the LGU admin's region?
- Check: Are they all in the `role = 'artisan'` role?

### "Can't insert developer record"
- Check: Does your auth user exist? (Go to auth.users in Supabase)
- Check: Is there already a profile for this user_id?
- If yes, use UPDATE instead of INSERT

---

## Next Steps

1. **Run the migration** on your Supabase project
2. **Insert your developer account** using the SQL above
3. **Create the DeveloperDashboard.jsx** component in frontend
4. **Update navigation** to show Developer Dashboard when user.role === 'developer'
5. **Test the workflow**:
   - Register a test LGU Admin
   - Approve them from Developer Dashboard
   - Have them register an artisan
   - Have LGU Admin approve the artisan
