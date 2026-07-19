# Sonali Kothari Academy: Custom Secure LMS

Welcome to your bespoke, high-performance, and secure online course academy and student community! 

This system has been built using **Next.js**, **React**, and **Tailwind CSS**. It is fully styled with a serene slate-blue and teal design system inspired by the **Daily Yoga** app, combined with the professional course delivery and client feedback loops of **TagMango (Energy Queens Hub)**.

---

## 🚀 How to Launch Your Academy Online (For Free)

You do not need to install coding software on your computer to deploy this website. Follow these simple visual steps to set it live:

### Step 1: Upload Your Code to GitHub (Free)
1. Go to [GitHub.com](https://github.com/) and create a free account (if you don't have one).
2. Install [GitHub Desktop](https://desktop.github.com/) on your computer. It is a visual, simple window (no coding required).
3. Open GitHub Desktop, click **"Add Existing Repository"**, and select this folder: `c:\Users\sonal\OneDrive\Desktop\RM- Model`.
4. Type a name for your repository (e.g., `sonali-kothari-academy`), click **"Publish Repository"**, and push it to your private GitHub account.

### Step 2: Deploy to Vercel for Hosting (Free)
1. Go to [Vercel.com](https://vercel.com/) and sign up for a free "Hobby" account using your GitHub account (takes 1 click).
2. Click **"Add New"** > **"Project"**.
3. You will see your GitHub repository `sonali-kothari-academy` in the list. Click **"Import"**.
4. Click **"Deploy"**. Vercel's cloud servers will compile the code and give you a free live URL (e.g., `sonali-kothari-academy.vercel.app`) in under 2 minutes!

### Step 3: Connect Your Hostinger Domain (Free Domain Connection)
1. In your **Vercel Project Dashboard**, go to **Settings** > **Domains**.
2. Type your domain (e.g., `learn.sonalikothari.com` or `sonalikothari.com`) and click **Add**.
3. Vercel will show you two DNS records (a Nameserver or a CNAME record).
4. Log into your **Hostinger** dashboard, go to your DNS Zone Editor for your domain, copy-paste these records, and save.
5. In a few minutes, your premium web application will load directly at your own domain!

---

## 🛠️ Swap Mock Database to Live Supabase (When you are ready)

The application currently has a **built-in local database manager (`lib/db.ts`)** that saves student progress, points, streaks, comments, and breakthroughs in the user's browser storage. This allows you to test the entire site immediately without paying or setting up databases.

When you want a live, shared database across all students:
1. Create a free account on [Supabase.com](https://supabase.com/).
2. Create a new project and copy your **Project URL** and **Anon API Key**.
3. In your Vercel Project settings, go to **Environment Variables** and add:
   * `NEXT_PUBLIC_SUPABASE_URL` = (Your Project URL)
   * `NEXT_PUBLIC_SUPABASE_ANON_KEY` = (Your Anon Key)
4. Update the queries in `lib/db.ts` to fetch/insert into your Supabase tables.

---

## 🎨 How to Manage Your Content (No Coding Needed)

### To Log in as Admin:
1. Go to your live URL or `/login`.
2. Select **"Admin Panel"** from the tabs.
3. Enter `sonali@kothari.com` as the email and click **Enter Dashboard**.
4. You will have full access to:
   * **Course Content Builder:** Add, rename, or delete video lessons and paste your secure video links.
   * **Student Registry:** View all students, their streaks, and toggle their role to "Grant Paid Access."
   * **Breakthrough Moderator:** Moderate client feedback. Pinned breakthroughs instantly display on your public homepage!
