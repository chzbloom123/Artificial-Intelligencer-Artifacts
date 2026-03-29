# The Artificial Intelligencer

A manually-managed editorial publication platform where AI-assisted creative works are published under various persona identities.

## What It Is

A professional multi-author news and opinion platform with:
- Public article feed with category filtering and search
- Individual persona profiles (reporters, commentators, contributors)
- Full article pages with persona attribution
- Secure admin dashboard for content management

## Admin Access

- URL: `/admin/login`
- Email: `admin@aier.press`
- Password: `aier-admin-2026`

## Architecture

- **Frontend**: React 19 + TypeScript + Vite + Tailwind + shadcn/ui (port 8000)
- **Backend**: Hono + Bun + Prisma (SQLite) (port 3000)
- **Auth**: JWT tokens (admin only, no public user accounts)

## Routes

### Public
- `/` - Homepage with article feed, category filter, search
- `/article/:slug` - Full article page
- `/persona/:id` - Persona profile with their articles

### Admin (requires login)
- `/admin/login` - Admin login
- `/admin/dashboard` - Full CRUD dashboard (Personas | Articles | Settings)

## API Endpoints

### Public
- `GET /api/articles` - Article list (paginated, filterable by category/search)
- `GET /api/articles/:slug` - Single article
- `GET /api/personas` - Active personas
- `GET /api/personas/:id` - Persona with articles
- `GET /api/settings` - Site settings

### Admin (Bearer token required)
- `POST /api/auth/login` - Login -> JWT token
- `GET /api/auth/me` - Validate session
- `GET /api/personas/admin/all` - All personas (including inactive)
- `POST/PUT/DELETE /api/personas/*` - Persona CRUD
- `GET /api/articles/admin/all` - All articles (including drafts)
- `POST/PUT/DELETE /api/articles/*` - Article CRUD
- `PUT /api/settings` - Update site settings
- `POST /api/upload` - Image upload -> returns URL

## Database Schema

**Persona**: name, bio, role (reporter/commentator/contributor), profile image, display order, active flag
**Article**: title, slug, body, excerpt, featured image, category, tags, style, public flag, publish date, persona FK
**SiteSettings**: global public toggle, site name, tagline
**AdminUser**: email, bcrypt password hash

## Design System

Typography:
- Headlines: Playfair Display (serif)
- Body: Crimson Pro (serif)
- Metadata: DM Mono (monospace)

Color palette: ink black, warm parchment, rust accent, crimson, antiqued gold, editorial teal

## Persona Roles

| Role | Description |
|------|-------------|
| reporter | Objective reporting voice, news-style |
| commentator | Opinion/analysis, editorial voice |
| contributor | Experimental, guest or new persona |

## Site Privacy

The admin can toggle the entire site offline via Settings. When offline, all public routes show a "Check back soon" message while the admin dashboard remains accessible.
