# CVSA Hoops website

A static site built with [Eleventy](https://www.11ty.dev/), editable through [Decap CMS](https://decapcms.org/) at `/admin`. No database, no PHP, no plugin treadmill — just files, rebuilt automatically on every save.

## What's here

- `src/` — all pages, templates, and content
- `src/_data/site.json` — nav, groups, weekly schedule, contact info, social links (all editable via the admin's "Site Settings")
- `src/blog/` — news posts (Markdown, one file per post)
- `src/gallery/` — gallery photo entries (added via the admin)
- `admin/` — the Decap CMS editor itself

## Local preview

```bash
npm install
npm run start
```

Opens at `http://localhost:8080`.

## Deploying (one-time setup)

### 1. Push to GitHub

Create a new **private** repository on [github.com/new](https://github.com/new) named `cvsa-site`, then from this folder:

```bash
git remote add origin https://github.com/YOUR-USERNAME/cvsa-site.git
git push -u origin main
```

### 2. Connect Netlify

1. Sign up free at [netlify.com](https://netlify.com)
2. **Add new site → Import an existing project → GitHub** → pick `cvsa-site`
3. Build settings should auto-fill from `netlify.toml` (build command `npx @11ty/eleventy`, publish directory `_site`) — click **Deploy**
4. Within a minute or two you'll get a live `*.netlify.app` URL — confirm the site looks right there first

### 3. Point cvsahoops.com at it

In Netlify: **Site settings → Domain management → Add a domain** → enter `cvsahoops.com`. Netlify will show you either:
- DNS records to add at GoDaddy (keep the domain registered there, just update its DNS zone), or
- An option to use Netlify's own DNS (update GoDaddy's nameservers instead)

Either way, Netlify auto-provisions a free SSL certificate once the DNS change is detected — usually within minutes, no manual renewal ever again.

### 4. Turn on the admin login (Identity + Git Gateway)

This is what makes `/admin` actually work:

1. In Netlify: **Site configuration → Identity → Enable Identity**
2. Under Identity **Registration**, set it to **Invite only** (so strangers can't sign themselves up)
3. Under **Identity → Services**, enable **Git Gateway**
4. Under **Identity**, click **Invite users** and invite yourself (ernestobgomez@gmail.com) — you'll get an email to set a password

### 5. Start editing

Go to `https://cvsahoops.com/admin` (or the `*.netlify.app` URL), log in, and edit:
- **Site Settings** — next game time, groups, weekly schedule, contact info, social links
- **News / Blog** — add/edit/delete posts (shows on the homepage and `/blog/`)
- **Pages** — About and Rules body text
- **Gallery Photos** — upload game-day photos

Every save commits straight to GitHub and Netlify rebuilds the live site automatically within about a minute.

## Notes

- The Rules page and Contact info are placeholders — review and edit them via the admin before treating this as final public content.
- The contact form uses [Netlify Forms](https://docs.netlify.com/manage/forms/setup/) (built in, no extra service) — submissions show up under **Site configuration → Forms** in Netlify, and you can add an email notification there.
- Old GoDaddy hosting can be canceled once this is live and verified — the domain registration itself stays at GoDaddy.
