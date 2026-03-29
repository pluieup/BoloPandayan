# 🗡️ BoloPandayan

BoloPandayan is a modern web application designed to bridge the gap between tourists, local Bolo making artisans, and the Local Government Unit (LGU). The platform serves as a public directory for workshops while providing dedicated portals for Artisans to manage their profiles, and LGU/DRRM officers to conduct and track Disaster Risk Reduction and Management (DRRM) assessments for every workshop.

## 🌟 Key Features

* **Public Tourist Viewer:** Explore a collection gallery of Bolos, view active workshops, toggle between Light/Dark mode, and navigate to live workshop locations directly via Google Maps.
* **Leaflet Map Integration:** View workshop locations mapped out exactly where their latest DRRM risk assessment pinpointed them.
* **Artisan Dashboard:** Protected portal where local craftsmen can update their biography and upload their profile photos directly to the cloud.
* **LGU Admin & DRRM Dashboard:** Comprehensive tools to oversee the artisan directory and log detailed hazard and risk profiles per workshop.
* **Robust Security:** Powered by Supabase Row Level Security (RLS) to ensure users can only modify their own profiles and storage buckets.

## 🛠️ Tech Stack

* **Frontend:** React + Vite
* **Styling:** Tailwind CSS
* **Map Rendering:** React-Leaflet (`react-leaflet`, `leaflet`)
* **Backend as a Service:** Supabase (PostgreSQL Database, Authentication, Storage Buckets)

---

## 🚀 Local Development Setup

Follow these steps to get the project running on your local machine.

### 1. Requirements
* Node.js installed
* A Supabase project set up

### 2. Installation
Clone the repository, then navigate to the frontend folder and install the dependencies:
```bash
cd frontend
npm install
```

### 3. Environment Variables
Create a file named `.env` in the `frontend` folder. Do **not** commit this file to version control. Add your Supabase credentials:

```properties
VITE_SUPABASE_URL=https://your-project-url.supabase.co
VITE_SUPABASE_ANON_KEY=ey...your_supabase_anon_key...
```
*(You can find these inside your Supabase Dashboard under Project Settings > API).*

### 4. Run the App
Start the Vite development server:
```bash
npm run dev
```

---

## 🔒 Database & Security Setup (Supabase)

To fully support the app, your Supabase project requires the following structural security rules:

1. **Storage Buckets:** A public bucket named `bolos` must exist for Artisan profile pictures.
2. **Row Level Security (RLS):** Ensure RLS is enabled on `tbl_workshops`, `tbl_user_profiles`, and `tbl_workshop_risk_assessments`.
    * *Public:* Can `SELECT` (read/view) general profile and workshop data.
    * *Authenticated Artisans:* Can only `UPDATE` their own profile records and `INSERT/UPDATE` their own photos in the `bolos` bucket.
    * *Authenticated Admins:* Can `INSERT/UPDATE` risk assessments and manage general data.

## 🚀 Deployment

This application is configured to be deployed easily on **Cloudflare Pages**. 
* Set the Build command to `npm run build`
* Set the Build output directory to `dist`
* Set the Root directory to `frontend`
* Ensure your `VITE_` environment variables are added to the Cloudflare configuration settings!
