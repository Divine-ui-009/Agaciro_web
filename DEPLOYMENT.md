# AGACIRO Website – Deployment Guide

This document lists common causes of deployment errors and what to change before going live.

---

## 1. Environment variables (backend)

The backend **requires** these in your host’s environment (e.g. Render, Railway, Heroku). If any are missing, the app can fail at startup or at runtime.

| Variable | Required | Notes |
|----------|----------|-------|
| `MONGO_URI` | **Yes** | MongoDB connection string (e.g. Atlas). |
| `JWT_SECRET` | **Yes** | Strong random string for JWT signing. |
| `PORT` | No | Often set by the host (e.g. Render). Fallback: `3000`. |
| `NODE_ENV` | **Yes** (prod) | Set to `production` in production. |
| `CLOUDINARY_CLOUD_NAME` | **Yes** (prod) | Needed when using Cloudinary for uploads. |
| `CLOUDINARY_API_KEY` | **Yes** (prod) | From Cloudinary dashboard. |
| `CLOUDINARY_API_SECRET` | **Yes** (prod) | From Cloudinary dashboard. |
| `SUPERADMIN_PASSWORD` | No | Default: `Admin@123`. **Change in production.** |
| `FRONTEND_URL` | **Yes** (prod) | Exact frontend origin for CORS (e.g. `https://agaciro.vercel.app`). |

**Common mistakes:**
- `.env` only on your machine → set the same variables in the host’s “Environment” / “Config vars”.
- `NODE_ENV` not set to `production` → uploads and CORS may behave like in dev.
- `MONGO_URI` typo or IP not whitelisted in MongoDB Atlas → “MongoServerError” / connection timeout.

---

## 2. Image uploads in production (Cloudinary vs local)

- In production the app uses **Cloudinary** when `NODE_ENV=production` and `CLOUDINARY_*` are set.
- On platforms like **Render** or **Heroku** the filesystem is **ephemeral**: anything in `uploads/` is lost on restart. You must use Cloudinary (or another external storage) in production.
- If `CLOUDINARY_*` are missing in production, the code falls back to local disk; uploads will disappear after a redeploy or restart.

**What to do:**  
- Set `NODE_ENV=production` and all `CLOUDINARY_*` variables in the production environment.  
- Ensure the code paths for “Cloudinary” vs “local” are correct (see code changes in this repo).

---

## 3. CORS

- Backend CORS must include the **exact** frontend URL (scheme + host, no trailing slash), e.g. `https://agaciro.vercel.app`.
- A placeholder like `https://yourdomain.com` will block real requests.
- `http://localhost:5173` and `http://localhost:3000` are only for local development.

**What to do:**  
- Set `FRONTEND_URL` in the backend’s production environment to your real frontend URL.  
- Ensure `server.js` uses `FRONTEND_URL` in the `origin` list for production.

---

## 4. Frontend API base URL

- `Frontend/src/api/axios.ts` uses `https://agaciro.onrender.com` when `import.meta.env.PROD` is true.
- If your API is on another host (e.g. `https://agaciro-api.onrender.com`), the frontend will call the wrong server.

**What to do:**  
- Either keep the backend at `https://agaciro.onrender.com`, or  
- Switch to a build-time variable, e.g. `VITE_API_URL`, and set it in the frontend’s build environment (Vercel, Netlify, etc.).

---

## 5. Frontend (Vite/React) – SPA routing

- The app uses client-side routing (`/login`, `/products`, `/admin/dashboard`, etc.).
- If the server returns 404 for those paths instead of `index.html`, refreshes or direct links will fail.

**What to do (examples):**

- **Vercel:** add `vercel.json`:
  ```json
  { "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }] }
  ```
- **Netlify:** add `public/_redirects` or `netlify.toml`:
  ```
  /*    /index.html   200
  ```

---

## 6. Backend entry and `uploads` in production

- `package.json` `start` runs `node server.js` (correct).
- `app.use('/uploads', express.static(...))` serves local files from `uploads/`. In production with Cloudinary, image URLs are Cloudinary URLs, so `/uploads` is only for default images.

**What to do:**  
- Ensure `uploads/default/` (and any default images) are committed and deployed with the backend, or that default image URLs are absolute (e.g. from Cloudinary or a CDN).  
- If the host builds from a clean checkout, `uploads/products/` should not be required at runtime when using Cloudinary.

---

## 7. MongoDB and `mongoose` options

- `useNewUrlParser` and `useUnifiedTopology` are no longer needed in recent Mongoose versions (they are defaults). They are harmless to keep.

**What to do:**  
- Ensure `MONGO_URI` uses the correct scheme (`mongodb+srv://` for Atlas) and that the Atlas project allows connections from your host’s IP (or `0.0.0.0/0` for “any” during setup).

---

## 8. `sharp` and native dependencies

- `sharp` uses native binaries. Some hosts (e.g. Render) support it; others may need extra build steps.

**What to do:**  
- If you see `sharp`-related errors on deploy, check the host’s docs for Node/native addons.  
- In production with Cloudinary, `sharp` is mainly used when you *don’t* use `multer-storage-cloudinary` for a given upload path; the code changes ensure we avoid `fs.unlink` on Cloudinary URLs and handle local vs Cloudinary correctly.

---

## 9. Security and secrets

- Never commit `.env` or real secrets. Use `.env.example` as a template and set real values only in the host.
- Change `SUPERADMIN_PASSWORD` from the default before going live.
- Use strong, random `JWT_SECRET`.

---

## 10. Build and start commands

**Backend (e.g. Render):**
- Build: (none, or `npm install` if the host runs it).
- Start: `npm start` (runs `node server.js`).
- Root directory: `backend` if the repo root contains both frontend and backend.

**Frontend (e.g. Vercel/Netlify):**
- Root: `Frontend` (or the folder that contains `package.json` and `vite.config.ts`).
- Build: `npm run build`.
- Publish: `dist` (Vite’s default output).

---

## Quick pre-deploy checklist

- [ ] Backend: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLOUDINARY_*`, `FRONTEND_URL`, and (optional) `SUPERADMIN_PASSWORD` set in the host.
- [ ] Backend: CORS `origin` includes the real `FRONTEND_URL` (no `yourdomain.com`).
- [ ] Frontend: API base URL matches the deployed backend (or use `VITE_API_URL`).
- [ ] Frontend: SPA redirect/rewrite so `/*` → `index.html`.
- [ ] MongoDB Atlas: network access allows the host’s IP (or 0.0.0.0/0 for testing).
- [ ] Cloudinary: `CLOUDINARY_*` from the correct Cloudinary project.
- [ ] `SUPERADMIN_PASSWORD` changed from default in production.
