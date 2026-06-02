# Deploy from Cursor (GitHub Pages)

**Do not share your password or PAT in chat.** Use one of the secure options below.

Live site (after first deploy): **https://sanjay-k598.github.io/kavyasanjay/**

Repo: **https://github.com/sanjay-k598/kavyasanjay**

---

## One-time setup (5 minutes)

### 1. Sign in to GitHub on your Mac

Pick **one**:

**Option A — GitHub CLI (recommended)**

```bash
brew install gh
gh auth login
```

Choose: GitHub.com → HTTPS → Login with browser.

**Option B — SSH key**

```bash
ssh-keygen -t ed25519 -C "your@gmail.com"
cat ~/.ssh/id_ed25519.pub
```

Add the key at: GitHub → Settings → SSH and GPG keys → New SSH key.

Then:

```bash
cd /Users/sanjaykumar/Projects/wed
git remote set-url origin git@github.com:sanjay-k598/kavyasanjay.git
```

### 2. Enable GitHub Pages (once)

1. Open https://github.com/sanjay-k598/kavyasanjay/settings/pages  
2. **Build and deployment** → Source: **Deploy from a branch**  
3. Branch: **main** → Folder: **/ (root)** → **Save**  
4. Wait 1–3 minutes for the green URL.

---

## Deploy every time you change the site (from Cursor)

### Terminal in Cursor

```bash
cd /Users/sanjaykumar/Projects/wed
chmod +x scripts/deploy.sh
./scripts/deploy.sh "Describe your change"
```

Example:

```bash
./scripts/deploy.sh "Update RSVP form and events"
```

### Or use Cursor Source Control

1. Open **Source Control** (branch icon)  
2. Stage changed files → write message → **Commit**  
3. **Sync / Push** (requires GitHub sign-in once)

---

## What gets published

- `index.html`, `styles.css`, `app.js`, `data/config.js`
- `assets/` (photos, video, music)

Not published (ignored): `.venv/`, local Python scripts only needed on your machine.

---

## Troubleshooting

| Problem | Fix |
|--------|-----|
| `Permission denied (publickey)` | Run `gh auth login` or set up SSH (above) |
| Pages shows 404 | Enable Pages on `main` / root in repo Settings |
| Old site after push | Hard refresh browser (`Cmd+Shift+R`) |
| Huge commit / wrong files | Ensure git root is `Projects/wed` only: `git rev-parse --show-toplevel` |

---

## Optional: custom domain

1. Buy a domain (e.g. `kavyasanjay.in`)  
2. Repo → Settings → Pages → Custom domain  
3. Add DNS records at your registrar (GitHub shows the values)
