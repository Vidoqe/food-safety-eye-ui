Quick Deployment Checklist

1. Reset to stable commit (good build)

git fetch origin
git reset --hard 67462a3
git push --force origin main


2. Create a stable branch (backup)

git checkout -b stable-67462a3 67462a3
git push -u origin stable-67462a3


3. Confirm in Vercel

Go to Vercel dashboard → Project → Deployments.

Make sure production is pointing to main.



4. Redeploy if needed

From Vercel dashboard → “Redeploy” latest main branch.



5. Do NOT change app code/layout unless intentional

Only touch if you’re sure.



\# Deployment Workflow – Food Safety Eye UI



This guide explains how to safely update the app without breaking Production.



---



\## 1. Production = main branch

\- The `main` branch is always deployed as \*\*Production\*\* on Vercel.

\- The last known-good commit is:

&nbsp; - Commit: `67462a3`

&nbsp; - Tag: `good-ui-2025-09-07`



---



\## 2. Don’t push directly to main

\- \*\*Never push unfinished changes\*\* to `main`.

\- Always create a branch (e.g. `dev`) for testing.



---



\## 3. Workflow for new changes



\### Step A – Create a branch

```bash

git checkout -b dev



