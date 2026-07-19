# Netlify Deployment Guide: Sonali Kothari Academy

This guide outlines how to deploy your Next.js academy application to Netlify. We have already prepared the `netlify.toml` file in your root folder.

---

## Option A: GitHub Connection (Recommended)
This method links Netlify directly to a private GitHub repository. Any future changes pushed to GitHub will trigger automatic updates on the live website.

### Step 1: Initialize Git and Push to GitHub
1. Create a free account on [GitHub](https://github.com).
2. Create a new repository named `sonali-kothari-academy`. Set it to **Private** to keep your code secure.
3. Open your terminal in this project directory and run:
   ```powershell
   git init
   git add .
   git commit -m "deploy ready commit"
   git branch -M main
   git remote add origin https://github.com/YOUR_GITHUB_USERNAME/sonali-kothari-academy.git
   git push -u origin main
   ```

### Step 2: Connect Netlify
1. Log in to [Netlify](https://www.netlify.com).
2. Click **Add new site** -> **Import from an existing project**.
3. Select **GitHub** and authorize permissions.
4. Choose the `sonali-kothari-academy` repository.
5. Netlify will auto-detect the build command (`npm run build`) and the publish directory (`.next`) using our `netlify.toml` file.
6. Click **Deploy Site**.

---

## Option B: Direct Terminal CLI Deploy (Fastest, No Git Required)
This method builds the Next.js project locally on your machine and uploads it directly to Netlify.

### Step 1: Run local production build
Open your command line in the project folder and compile the optimized production bundle:
```powershell
cmd.exe /c "npm run build"
```

### Step 2: Run Netlify deploy command
Execute the Netlify CLI deployment command:
```powershell
npx netlify-cli deploy --prod
```
1. Follow the browser prompt to log in and authorize Netlify.
2. Select **Create & configure a new site**.
3. Choose your team account.
4. Input a custom site name.
5. When prompted for **Publish Directory**, input `.next` and press Enter.

---

## Connecting Your Custom Domain
1. In your Netlify dashboard, navigate to **Site configuration** -> **Domain management**.
2. Click **Add domain alias** or **Add custom domain** and type `sonalikothari.com` (or `learn.sonalikothari.com`).
3. Netlify will provide its Nameservers:
   - `dns1.p01.nsone.net`
   - `dns2.p01.nsone.net`
   - ...
4. Log into Hostinger (your hosting provider), go to DNS/Nameservers settings for `sonalikothari.com`, replace the default Hostinger Nameservers with the Netlify Nameservers, and save.
5. Within a few hours, your secure, custom-branded academy portal will be live at `https://sonalikothari.com` with a free SSL certificate!
