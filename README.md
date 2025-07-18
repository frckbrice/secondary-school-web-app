# GBHS Bafia - Next.js Fullstack School Management System

A modern, fullstack school management platform built with Next.js 15, TypeScript, PostgreSQL, Drizzle ORM, and Radix UI. Features robust authentication, real-time updates, admin/teacher/student dashboards, and a fully responsive, accessible UI.

## 🚀 Features

- **Authentication**: NextAuth.js with role-based access control (Super Admin, Admin, Teacher, Student, User)
- **Database**: PostgreSQL with Drizzle ORM
- **UI**: Radix UI, Tailwind CSS, modern responsive design
- **API**: RESTful Next.js API routes for all backend logic
- **File Uploads**: Multer, Cloudinary integration
- **Real-time**: WebSocket support, React Query for live data
- **Admin Dashboard**: 8+ management sections (users, students, teachers, news, events, gallery, applications, contacts)
- **Student Portal**: Results, petitions, anonymous reports, status tracking
- **Teacher Portal**: Grade reports, student management, import/export
- **SEO & PWA**: SEO-optimized, installable, offline support
- **Accessibility**: WCAG AA, keyboard navigation, ARIA labels
- **Testing**: Vitest, React Testing Library, Playwright (E2E)
- **Dev Experience**: TypeScript, ESLint, Prettier, hot reload

## 🗂️ Project Structure

```
├── public/                  # Static assets
│   ├── images/             # Static images (school photos, logos, etc.)
│   ├── grading-templates/  # Excel templates for grade reports
│   ├── sample-documents/   # Sample PDFs and documents
│   └── favicon.png         # Site favicon
├── src/
│   ├── app/                # Next.js App Router
│   │   ├── admin/          # Admin dashboard routes
│   │   ├── api/            # API routes
│   │   └── ...             # Other pages/routes
│   ├── components/         # React components (UI, admin, pages, providers)
│   ├── hooks/              # Custom React hooks
│   ├── lib/                # Utilities, db, services
│   ├── types/              # TypeScript types
│   └── utils/              # Test/data utilities
├── migrations/             # Database migrations
└── docs/                   # Documentation
```

## 📁 Static Assets

- **Images**: Place all static images in `/public/images/*`
  - School photos, logos, and static content images
  - Accessible via `/images/filename.ext` in the app
- **Documents**: Sample documents in `/public/sample-documents/*`
- **Templates**: Grading templates in `/public/grading-templates/*`

## 🛠️ Setup

1. **Clone & Install**
   ```bash
   git clone git@github.com:frckbrice/secondary-school-web-app.git
   cd secondary-school-web-app
   yarn install
   ```
2. **Configure Environment**
   - Copy `.env.example` to `.env.local` and fill in DB, NextAuth, etc.
3. **Database**
   - Start PostgreSQL (see Docker example below)
   - Run migrations:
     ```bash
     yarn run db:generate
     yarn run db:push
     # (Optional) Seed sample data
     yarn run db:setup
     ```
4. **Run Dev Server**
   ```bash
   yarn run dev
   # App at http://localhost:3000
   ```

### Docker (for PostgreSQL)

```bash
docker run --name gbhs-postgres \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=gbhs_db \
  -e POSTGRES_USER=gbhs_user \
  -p 5432:5432 \
  -v gbhs_pgdata:/var/lib/postgresql/data \
  -d postgres:15
```

## 🧪 Testing

- **Unit/Integration**: `yarn test` (Vitest, React Testing Library)
- **E2E**: `yarn run test:e2e` (Playwright)
- **Custom scripts**: See `src/utils/test-crud.ts`, `src/utils/test-user-forms.ts`

## 🏗️ Build & Deploy

- **Build**: `yarn run build`
- **Start**: `yarn run start`
- **Lint**: `yarn run lint`
- **Format**: `yarn run format`

## 📝 Default Logins (after seeding)

- Super Admin: `super_admin` / `admin123`
- Admin: `admin` / `admin123`
- Teacher: `teacher1` / `teacher123`
- Student: `GBHS2024001` / `student123`

## 📦 Dockerfile Example

```Dockerfile
# Dockerfile for GBHS Bafia Next.js App
FROM node:20-alpine
WORKDIR /app
COPY package.json yarn.lock ./
RUN yarn install --frozen-lockfile
COPY . .
RUN yarn build
EXPOSE 3000
CMD ["yarn", "start"]
```

## ⚙️ CI/CD (GitHub Actions Example)

Create `.github/workflows/ci-cd.yml`:

```yaml
name: CI/CD
on:
  push:
    branches: [main]
jobs:
  build-test-deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: 20
      - run: yarn install --frozen-lockfile
      - run: yarn lint
      - run: yarn build
      - run: yarn test
      - run: yarn test:e2e
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v25
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.VERCEL_ORG_ID }}
          vercel-project-id: ${{ secrets.VERCEL_PROJECT_ID }}
          vercel-args: '--prod'
```

## 📄 License

Proprietary. All rights reserved.
