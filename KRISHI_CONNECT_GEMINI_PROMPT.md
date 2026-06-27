# Krishi Connect — Production-Grade PERN Stack Build Prompt (Gemini CLI)

> **Purpose**: Phase-wise prompts to build a production-grade agricultural platform using **PostgreSQL + Express + React + Node.js** with **JWT RBAC, Redis, TanStack Router, real-time maps, and i18n (English + Kannada)**.
> Each phase is a self-contained prompt you paste into Gemini CLI. Complete them in order.

---

## Table of Contents

1. [Phase 1 — Project Scaffolding & Monorepo Setup](#phase-1)
2. [Phase 2 — Database Schema & Migrations](#phase-2)
3. [Phase 3 — Authentication, RBAC & Redis](#phase-3)
4. [Phase 4 — Admin Panel — Layout & Dashboard](#phase-4)
5. [Phase 5 — Admin Panel — Provider & Product Management](#phase-5)
6. [Phase 6 — Admin Panel — Bookings, Orders, Reports](#phase-6)
7. [Phase 7 — Service Provider Panel — Layout & Dashboard](#phase-7)
8. [Phase 8 — Service Provider — Services & Products CRUD](#phase-8)
9. [Phase 9 — Service Provider — Bookings, Earnings, Profile](#phase-9)
10. [Phase 10 — Farmer Panel — Layout, Dashboard & Service Discovery](#phase-10)
11. [Phase 11 — Farmer — Service Booking Flow with Maps](#phase-11)
12. [Phase 12 — Farmer — Products, Cart, Checkout & Orders](#phase-12)
13. [Phase 13 — Farmer — Booking Tracking, Profile & Notifications](#phase-13)
14. [Phase 14 — Real-Time Maps Integration](#phase-14)
15. [Phase 15 — i18n (English + Kannada) & Responsiveness](#phase-15)
16. [Phase 16 — Real-Time WebSocket, Background Jobs & Payment Gateway](#phase-16)
17. [Phase 17 — Testing (Unit, Integration & E2E)](#phase-17)
18. [Phase 18 — Observability, Audit Logging & Search](#phase-18)
19. [Phase 19 — Cloud Storage, CDN, Email/SMS & Accessibility](#phase-19)
20. [Phase 20 — Production Hardening, Docker & CI/CD Deployment](#phase-20)

---

<a id="phase-1"></a>
## Phase 1 — Project Scaffolding & Monorepo Setup

```
Every file must be production-ready.You are a senior full-stack engineer. Initialize a production-grade monorepo for "Krishi Connect" — an agricultural services and e-commerce platform.

### Tech Stack (MANDATORY — do not substitute):
- **Frontend**: React 18+ with TypeScript, Vite, TanStack Router (file-based routing), TanStack Query (React Query v5), Zustand for global state, Tailwind CSS v3, shadcn/ui component library
- **Backend**: Node.js 20+ with Express.js 5, TypeScript, Prisma ORM (PostgreSQL), Redis (ioredis), JWT (jose library), Zod for validation, Multer for file uploads
- **Database**: PostgreSQL 16+
- **Cache/Session**: Redis 7+
- **Monorepo**: pnpm workspaces with a shared `packages/shared` for types, constants, validators

### Directory Structure — Create EXACTLY this:

```
krishi-connect/
├── package.json                    # pnpm workspace root
├── pnpm-workspace.yaml
├── turbo.json                      # Turborepo config
├── docker-compose.yml              # PostgreSQL + Redis
├── .env.example
├── .gitignore
├── packages/
│   └── shared/
│       ├── package.json
│       ├── tsconfig.json
│       └── src/
│           ├── types/              # Shared TypeScript interfaces
│           │   ├── user.ts
│           │   ├── service.ts
│           │   ├── booking.ts
│           │   ├── product.ts
│           │   ├── order.ts
│           │   └── index.ts
│           ├── constants/          # Roles, statuses, categories
│           │   ├── roles.ts        # ADMIN, PROVIDER, FARMER
│           │   ├── statuses.ts     # Booking & order statuses
│           │   ├── categories.ts   # Service & product categories
│           │   └── index.ts
│           └── validators/         # Zod schemas shared between FE & BE
│               ├── auth.ts
│               ├── service.ts
│               ├── booking.ts
│               ├── product.ts
│               ├── order.ts
│               └── index.ts
├── apps/
│   ├── server/
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   ├── prisma/
│   │   │   └── schema.prisma
│   │   └── src/
│   │       ├── index.ts            # Express app entry
│   │       ├── config/
│   │       │   ├── env.ts          # Validated env with Zod
│   │       │   ├── database.ts     # Prisma client singleton
│   │       │   ├── redis.ts        # Redis client singleton
│   │       │   └── cors.ts
│   │       ├── middleware/
│   │       │   ├── auth.ts         # JWT verification
│   │       │   ├── rbac.ts         # Role-based access guard
│   │       │   ├── rateLimiter.ts  # Redis-based rate limiting
│   │       │   ├── upload.ts       # Multer config
│   │       │   ├── validate.ts     # Zod middleware
│   │       │   └── errorHandler.ts # Global error handler
│   │       ├── modules/
│   │       │   ├── auth/
│   │       │   │   ├── auth.controller.ts
│   │       │   │   ├── auth.service.ts
│   │       │   │   └── auth.routes.ts
│   │       │   ├── users/
│   │       │   ├── services/
│   │       │   ├── bookings/
│   │       │   ├── products/
│   │       │   ├── orders/
│   │       │   ├── payments/
│   │       │   ├── reviews/
│   │       │   ├── admin/
│   │       │   └── upload/
│   │       ├── utils/
│   │       │   ├── jwt.ts
│   │       │   ├── password.ts
│   │       │   ├── pagination.ts
│   │       │   └── geolocation.ts
│   │       └── types/
│   │           └── express.d.ts    # Extend Express Request
│   └── web/
│       ├── package.json
│       ├── tsconfig.json
│       ├── vite.config.ts
│       ├── tailwind.config.ts
│       ├── index.html
│       └── src/
│           ├── main.tsx
│           ├── routeTree.gen.ts    # TanStack Router generated
│           ├── routes/             # File-based routing
│           │   ├── __root.tsx
│           │   ├── index.tsx       # Landing/redirect
│           │   ├── _auth.tsx       # Auth layout
│           │   ├── _auth/
│           │   │   ├── login.tsx
│           │   │   └── register.tsx
│           │   ├── _admin.tsx      # Admin layout with sidebar
│           │   ├── _admin/
│           │   │   ├── dashboard.tsx
│           │   │   ├── farmers.tsx
│           │   │   ├── service-providers/
│           │   │   ├── products/
│           │   │   ├── orders/
│           │   │   ├── bookings/
│           │   │   ├── payments.tsx
│           │   │   ├── reports.tsx
│           │   │   └── settings.tsx
│           │   ├── _provider.tsx   # Provider layout with sidebar
│           │   ├── _provider/
│           │   │   ├── dashboard.tsx
│           │   │   ├── bookings.tsx
│           │   │   ├── services/
│           │   │   ├── products/
│           │   │   ├── orders.tsx
│           │   │   ├── earnings.tsx
│           │   │   ├── reviews.tsx
│           │   │   ├── messages.tsx
│           │   │   └── settings.tsx
│           │   ├── _farmer.tsx     # Farmer layout with sidebar
│           │   └── _farmer/
│           │       ├── dashboard.tsx
│           │       ├── services/
│           │       ├── bookings/
│           │       ├── products/
│           │       ├── cart.tsx
│           │       ├── orders/
│           │       ├── payments.tsx
│           │       ├── messages.tsx
│           │       ├── help.tsx
│           │       └── settings.tsx
│           ├── components/
│           │   ├── ui/             # shadcn/ui components
│           │   ├── layouts/
│           │   │   ├── AdminLayout.tsx
│           │   │   ├── ProviderLayout.tsx
│           │   │   ├── FarmerLayout.tsx
│           │   │   └── Sidebar.tsx
│           │   ├── common/
│           │   │   ├── DataTable.tsx
│           │   │   ├── StatusBadge.tsx
│           │   │   ├── StatsCard.tsx
│           │   │   ├── SearchBar.tsx
│           │   │   ├── Pagination.tsx
│           │   │   ├── Modal.tsx
│           │   │   ├── ImageUploader.tsx
│           │   │   ├── DateRangePicker.tsx
│           │   │   └── ExportButton.tsx
│           │   └── maps/
│           │       ├── MapView.tsx
│           │       ├── ServiceMarker.tsx
│           │       └── LocationPicker.tsx
│           ├── hooks/
│           │   ├── useAuth.ts
│           │   ├── useDebounce.ts
│           │   └── useGeolocation.ts
│           ├── lib/
│           │   ├── api.ts          # Axios instance with interceptors
│           │   ├── queryClient.ts
│           │   └── utils.ts
│           ├── stores/
│           │   ├── authStore.ts    # Zustand auth store
│           │   ├── cartStore.ts    # Zustand cart store
│           │   └── uiStore.ts      # Sidebar, modals, locale
│           └── i18n/
│               ├── config.ts
│               ├── en.json
│               └── kn.json         # Kannada translations
```

### Setup Requirements:
1. Create pnpm workspace with all three packages linked
2. Configure Turborepo for parallel dev/build/lint
3. Docker Compose with PostgreSQL 16 and Redis 7 (with persistent volumes and health checks)
4. Environment variables: DATABASE_URL, REDIS_URL, JWT_SECRET, JWT_REFRESH_SECRET, PORT, CORS_ORIGIN, UPLOAD_DIR, MAP_API_KEY
5. ESLint + Prettier configured across all packages
6. Git init with proper .gitignore (node_modules, dist, .env, uploads/)
7. Add scripts: `pnpm dev` (runs server + web concurrently), `pnpm build`, `pnpm db:migrate`, `pnpm db:seed`
8. Tailwind configured with a custom theme using the green color palette from the design: primary green #166534 (dark), #16a34a (medium), #22c55e (light), white backgrounds, gray-50/100 for cards
9. shadcn/ui initialized with the green theme
10. TanStack Router configured with file-based routing and code generation
11. Axios instance with JWT access token in Authorization header, refresh token rotation logic, and request/response interceptors
12. Zustand stores with persist middleware for auth (localStorage) and cart

### docker-compose.yml must include:
- PostgreSQL 16 with a named volume, health check, and init SQL
- Redis 7 with password, persistence (AOF), and health check

### IMPORTANT:
- Use strict TypeScript (no `any`)
- Every API response follows: `{ success: boolean, data?: T, error?: string, meta?: { page, limit, total } }`
- Use ES modules throughout
- Prisma client must be a singleton (avoid multiple instances in dev)
- Redis client must handle reconnection gracefully

Generate ALL files with complete, working code. Do not use placeholders or "// TODO" comments. 
```

---

<a id="phase-2"></a>
## Phase 2 — Database Schema & Migrations

```
You are continuing the "Krishi Connect" PERN stack project. Now create the complete PostgreSQL database schema using Prisma ORM.

### Context:
This is an agricultural platform with 3 user roles: ADMIN, SERVICE_PROVIDER, FARMER. Providers can offer farm services (tractor, labor, equipment rental, irrigation, harvesting, spraying) and sell products. Farmers can book services and buy products. Admin approves providers and products.

### Prisma Schema — Create the following models in `apps/server/prisma/schema.prisma`:

#### 1. User
- id: UUID (default cuid)
- email: String @unique
- phone: String @unique
- password: String (hashed)
- role: enum Role { ADMIN, SERVICE_PROVIDER, FARMER }
- firstName, lastName: String
- profileImage: String? (URL)
- isActive: Boolean (default true)
- isVerified: Boolean (default false)
- preferredLanguage: enum Language { EN, KN } (default EN)
- createdAt, updatedAt: DateTime

#### 2. ProviderProfile (1:1 with User where role=SERVICE_PROVIDER)
- id: UUID
- userId: String @unique -> User
- businessName: String
- serviceCategories: String[] (array of category slugs)
- experience: Int (years)
- address: String
- city, state: String
- pincode: String
- latitude, longitude: Float
- serviceRadius: Int (km, default 25)
- aadharCard: String? (document URL)
- panCard: String? (document URL)
- drivingLicense: String? (document URL)
- bankDetails: Json? ({ accountNumber, ifscCode, bankName, accountHolderName })
- approvalStatus: enum ApprovalStatus { PENDING, APPROVED, REJECTED }
- rejectionReason: String?
- averageRating: Float (default 0)
- totalReviews: Int (default 0)
- isOnline: Boolean (default false)
- createdAt, updatedAt

#### 3. FarmerProfile (1:1 with User where role=FARMER)
- id: UUID
- userId: String @unique -> User
- farmSize: Float? (acres)
- farmAddress: String?
- city, state: String
- pincode: String
- latitude, longitude: Float
- createdAt, updatedAt

#### 4. Service
- id: UUID
- providerId: String -> ProviderProfile
- category: enum ServiceCategory { TRACTOR, LABOR, EQUIPMENT, IRRIGATION, HARVESTING, SPRAYING, ROTAVATOR, WATER_TANKER }
- name: String
- description: String
- capacity: String? (e.g., "50 HP", "5 workers")
- rateType: enum RateType { PER_HOUR, PER_DAY, PER_TRIP, PER_ACRE }
- price: Decimal
- discountPrice: Decimal?
- fuelType: String? (Diesel, Petrol, Electric)
- images: String[] (array of URLs)
- isActive: Boolean (default true)
- createdAt, updatedAt

#### 5. Booking
- id: UUID
- bookingId: String @unique (format: BK + 4 digits, auto-generated)
- farmerId: String -> FarmerProfile
- serviceId: String -> Service
- providerId: String -> ProviderProfile
- bookingDate: DateTime
- startTime: String (e.g., "10:00 AM")
- duration: String (e.g., "2 Hours")
- status: enum BookingStatus { REQUESTED, ACCEPTED, CONFIRMED, IN_PROGRESS, COMPLETED, CANCELLED }
- totalAmount: Decimal
- paymentMethod: enum PaymentMethod { UPI_ONLINE, CASH, CARD }
- paymentStatus: enum PaymentStatus { PENDING, PAID, REFUNDED }
- cancellationReason: String?
- providerNotes: String?
- farmerNotes: String?
- createdAt, updatedAt

#### 6. BookingTracking
- id: UUID
- bookingId: String -> Booking
- status: String (Requested, Accepted, On The Way, In Progress, Completed)
- timestamp: DateTime
- description: String
- latitude, longitude: Float? (provider location during tracking)

#### 7. Product
- id: UUID
- providerId: String -> ProviderProfile
- name: String
- description: String
- category: enum ProductCategory { SEEDS, FERTILIZERS, PESTICIDES, TOOLS, IRRIGATION, EQUIPMENT }
- brand: String?
- price: Decimal
- stock: Int
- unit: String? (kg, L, pieces)
- deliveryRange: Int? (km)
- images: String[] (array of URLs)
- approvalStatus: enum ApprovalStatus { PENDING, APPROVED, REJECTED }
- isActive: Boolean (default true)
- createdAt, updatedAt

#### 8. Order
- id: UUID
- orderId: String @unique (format: ORD + 4 digits, auto-generated)
- farmerId: String -> FarmerProfile
- status: enum OrderStatus { PLACED, CONFIRMED, SHIPPED, DELIVERED, CANCELLED }
- subtotal: Decimal
- deliveryCharges: Decimal (default 0)
- totalAmount: Decimal
- paymentMethod: enum PaymentMethod
- paymentStatus: enum PaymentStatus
- deliveryAddress: Json ({ name, address, city, state, pincode, phone })
- createdAt, updatedAt

#### 9. OrderItem
- id: UUID
- orderId: String -> Order
- productId: String -> Product
- quantity: Int
- unitPrice: Decimal
- totalPrice: Decimal

#### 10. Review
- id: UUID
- farmerId: String -> FarmerProfile
- providerId: String -> ProviderProfile
- serviceId: String? -> Service
- productId: String? -> Product
- rating: Int (1-5)
- comment: String?
- createdAt

#### 11. Payment
- id: UUID
- userId: String -> User
- bookingId: String? -> Booking
- orderId: String? -> Order
- amount: Decimal
- method: enum PaymentMethod
- status: enum PaymentStatus
- transactionId: String?
- createdAt

#### 12. Notification
- id: UUID
- userId: String -> User
- title: String
- message: String
- type: enum NotificationType { BOOKING, ORDER, PAYMENT, APPROVAL, SYSTEM }
- isRead: Boolean (default false)
- metadata: Json?
- createdAt

### Indexes — Add these for performance:
- User: email, phone, role
- Service: providerId, category, isActive
- Booking: farmerId, providerId, status, bookingDate
- Product: providerId, category, approvalStatus
- Order: farmerId, status
- Geospatial: ProviderProfile(latitude, longitude)

### Seed Data — Create `apps/server/prisma/seed.ts`:
Generate realistic seed data:
- 1 Admin user (admin@krishiconnect.com / Admin@123)
- 5 Service Providers (3 approved, 1 pending, 1 rejected) with full profiles including cities in Maharashtra/Madhya Pradesh (Pune, Indore, Bhopal, Nagpur, Jaipur)
- 10 Farmers with profiles in nearby locations
- 15 Services across all categories with realistic Indian pricing (₹600-₹2500/hour or /day)
- 20 Products across all categories (Organic Wheat Seeds ₹120, Urea Fertilizer ₹600, DAP Fertilizer ₹1350, Neem Oil ₹250, Drip Irrigation Kit ₹1200, etc.)
- 30 Bookings with mixed statuses
- 25 Orders with mixed statuses and realistic order items
- Booking tracking entries for some bookings
- Reviews and payments

### Requirements:
1. Run `npx prisma migrate dev --name init` after creating the schema
2. Run the seed script
3. Use Prisma's `@@map` to use snake_case table names in PostgreSQL
4. Add `@@index` decorators for all frequently queried fields
5. Use `Decimal` for all money fields (not Float)
6. Auto-generate bookingId and orderId using a Prisma middleware or database sequence

Generate the complete schema.prisma and seed.ts files. No placeholders.
```

---

<a id="phase-3"></a>
## Phase 3 — Authentication, RBAC & Redis

```
You are continuing the "Krishi Connect" PERN stack project. Now implement the complete authentication system with JWT, role-based access control, and Redis caching.

### Authentication Flow:

#### Registration (POST /api/auth/register):
1. Validate input with Zod: { firstName, lastName, email, phone, password, role (FARMER or SERVICE_PROVIDER) }
2. Check if email/phone already exists
3. Hash password with bcrypt (12 salt rounds)
4. Create User record
5. If role is FARMER: create FarmerProfile (latitude/longitude from request or default)
6. If role is SERVICE_PROVIDER: create ProviderProfile with approvalStatus=PENDING
7. Generate access token (15 min expiry) and refresh token (7 day expiry)
8. Store refresh token in Redis with key `refresh:${userId}` and TTL 7 days
9. Return { user, accessToken, refreshToken }

#### Login (POST /api/auth/login):
1. Validate: { email, password }
2. Find user by email, verify password
3. If SERVICE_PROVIDER: check if ProviderProfile.approvalStatus === APPROVED (if PENDING, return specific error "Your account is pending approval"; if REJECTED, return "Your account was rejected")
4. Generate tokens, store refresh in Redis
5. Return { user (with profile), accessToken, refreshToken }

#### Refresh Token (POST /api/auth/refresh):
1. Validate the refresh token from request body
2. Check if token exists in Redis (`refresh:${userId}`)
3. If valid: generate new access token + new refresh token (rotation)
4. Delete old refresh token from Redis, store new one
5. Return { accessToken, refreshToken }

#### Logout (POST /api/auth/logout):
1. Delete refresh token from Redis
2. Add current access token to Redis blacklist with TTL = remaining token life
3. Return success

#### Get Current User (GET /api/auth/me):
1. Return the authenticated user with their profile (ProviderProfile or FarmerProfile)

### JWT Structure:
- Access token payload: { userId, email, role, iat, exp }
- Use `jose` library for ES256 or HS256 signing
- Access token: 15 min expiry
- Refresh token: 7 days expiry

### Middleware Implementation:

#### auth.ts (JWT Verification):
```typescript
// 1. Extract token from Authorization: Bearer <token>
// 2. Check if token is blacklisted in Redis
// 3. Verify token signature and expiry using jose
// 4. Attach user to req.user
// 5. Throw 401 if invalid/expired/blacklisted
```

#### rbac.ts (Role Guard):
```typescript
// Usage: router.get('/admin/dashboard', auth, rbac('ADMIN'), handler)
// Also support multiple roles: rbac('ADMIN', 'SERVICE_PROVIDER')
// Return 403 if role doesn't match
```

#### rateLimiter.ts (Redis Rate Limiting):
- Login: 5 attempts per 15 minutes per IP
- Register: 3 attempts per hour per IP
- API general: 100 requests per minute per user
- Use Redis INCR + EXPIRE for sliding window

### Redis Usage:
1. **Session/Token Storage**: refresh tokens, token blacklist
2. **Rate Limiting**: sliding window counters
3. **Caching**: Cache frequently accessed data:
   - User profiles: `user:${id}` with 5 min TTL
   - Service listings: `services:${location}:${category}` with 2 min TTL
   - Dashboard stats: `stats:admin` / `stats:provider:${id}` with 1 min TTL
4. **Cache Invalidation**: Invalidate relevant caches on mutations

### API Routes to Create:
```
POST   /api/auth/register
POST   /api/auth/login
POST   /api/auth/refresh
POST   /api/auth/logout
GET    /api/auth/me
PUT    /api/auth/change-password
POST   /api/auth/forgot-password    (stub - send reset link)
POST   /api/auth/reset-password     (stub - reset with token)
```

### Frontend Auth Implementation:

#### authStore.ts (Zustand):
```typescript
interface AuthState {
  user: User | null;
  accessToken: string | null;
  refreshToken: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: RegisterInput) => Promise<void>;
  logout: () => void;
  refreshAccessToken: () => Promise<string>;
  setUser: (user: User) => void;
}
// Persist to localStorage using zustand/middleware
```

#### Axios Interceptors (lib/api.ts):
1. Request interceptor: attach accessToken from store
2. Response interceptor: on 401, attempt token refresh, retry original request
3. If refresh fails: clear auth state, redirect to /login
4. Queue concurrent requests during refresh to avoid multiple refresh calls

#### Protected Routes (TanStack Router):
- `_admin.tsx` layout: check role === ADMIN, redirect to /login if not
- `_provider.tsx` layout: check role === SERVICE_PROVIDER, redirect if not
- `_farmer.tsx` layout: check role === FARMER, redirect if not
- `_auth.tsx` layout: if already authenticated, redirect to appropriate dashboard based on role

#### Login Page (routes/_auth/login.tsx):
- Clean form with email + password fields
- "Login" button with loading state
- Link to register page
- Error display for invalid credentials or pending/rejected accounts
- After login, redirect based on role: ADMIN → /admin/dashboard, PROVIDER → /provider/dashboard, FARMER → /farmer/dashboard

#### Register Page (routes/_auth/register.tsx):
- Form with: firstName, lastName, email, phone, password, confirmPassword
- Role selector: toggle between "I'm a Farmer" and "I'm a Service Provider"
- For Service Provider: additional fields — businessName, serviceCategories (multi-select), experience, address, city, state, pincode
- Document upload section for providers (Aadhar, PAN, Driving License)
- After register as farmer: redirect to farmer dashboard
- After register as provider: show "Your application is under review" message

Generate ALL files with complete working code. The auth system must be fully functional end-to-end.
```

---

<a id="phase-4"></a>
## Phase 4 — Admin Panel — Layout & Dashboard

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Admin Panel layout and dashboard exactly matching the provided design screenshots.

### Admin Layout (_admin.tsx) — EXACT Design Specification:

#### Sidebar (Left, Fixed, 260px width):
- **Header**: Dark green (#166534) background, "Krishi Connect" logo text in white, small leaf/plant icon
- **Navigation Items** (white text on dark green, active item has white bg with green text and rounded-lg):
  1. Dashboard (icon: LayoutDashboard)
  2. Farmers (icon: Users)
  3. Service Providers (icon: Wrench)
  4. Products (icon: Package)
  5. Orders (icon: ShoppingCart)
  6. Bookings (icon: Calendar)
  7. Payments (icon: CreditCard)
  8. Reports (icon: BarChart3)
  9. Settings (icon: Settings)
- **Bottom**: Logout button with icon
- Sidebar is collapsible on mobile (hamburger menu in top bar)

#### Top Bar (sticky, white bg, shadow-sm):
- Left: Hamburger menu icon (mobile only)
- Right: Admin avatar circle with name "Admin" and role "Super Admin" text, notification bell icon

### Dashboard Page (/admin/dashboard) — EXACT Layout:

#### Row 1 — Stats Cards (4 cards in a row, equal width):
Each card has: white bg, rounded-xl, shadow-sm, left colored icon circle, right side has label + value + percentage change

| Card | Label | Icon | Value | Change |
|------|-------|------|-------|--------|
| 1 | Total Farmers | Users (green bg) | 2,431 | +12.5% from last month (green) |
| 2 | Total Providers | Wrench (blue bg) | 1,243 | +8.3% from last month (green) |
| 3 | Total Bookings | Calendar (orange bg) | 3,257 | +15.8% from last month (green) |
| 4 | Total Revenue | IndianRupee (purple bg) | ₹18,75,000 | +18.2% from last month (green) |

#### Row 2 — Two Charts Side by Side:

**Left: Revenue Overview (Line/Area Chart)**
- Title: "Revenue Overview" with a dropdown "This Month ▼"
- X-axis: Jan, Feb, Mar, Apr, May, Jun
- Y-axis: ₹0 to ₹25k with ₹5k intervals
- Smooth green area chart with gradient fill
- Use Recharts library

**Right: Bookings Overview (Donut Chart)**
- Title: "Bookings Overview" with dropdown "This Month ▼"
- Donut chart with 4 segments:
  - Completed: 1,245 (38%) — green
  - Confirmed: 1,102 (34%) — blue
  - Pending: 647 (20%) — orange/yellow
  - Cancelled: 263 (8%) — red
- Legend on the right side with colored dots, labels, and values

#### Row 3 — Two Sections Side by Side:

**Left: Recent Activities (Card)**
- Title: "Recent Activities" with "View All" link (green text, right-aligned)
- List of 4 activity items, each with:
  - Avatar circle (green bg with person icon)
  - Activity description text (bold name within description)
  - Relative timestamp on the right ("10 mins ago", "25 mins ago", "1 hour ago", "2 hours ago")
- Activities:
  1. "Ramesh Kumar registered as a new farmer" — 10 mins ago
  2. "New service provider Arjun Patel pending approval" — 25 mins ago
  3. 'Order #ORD1256 has been delivered' — 1 hour ago
  4. "New booking request for Tractor Service" — 2 hours ago

**Right: Top Performing Services (Table)**
- Title: "Top Performing Services"
- Simple table with columns: Service, Bookings, Revenue
- 5 rows:
  1. Tractor Service | 876 | ₹4,38,000
  2. Labor Service | 654 | ₹2,62,000
  3. Plowing Service | 432 | ₹1,72,000
  4. Irrigation Service | 321 | ₹1,28,000
  5. Harvesting Service | 210 | ₹84,000

### Backend API Endpoints:

```
GET /api/admin/stats
Response: {
  totalFarmers: number,
  totalProviders: number,
  totalBookings: number,
  totalRevenue: number,
  farmerGrowth: number,      // percentage
  providerGrowth: number,
  bookingGrowth: number,
  revenueGrowth: number
}

GET /api/admin/revenue-chart?period=monthly
Response: { data: [{ month: string, revenue: number }] }

GET /api/admin/bookings-overview
Response: { completed: number, confirmed: number, pending: number, cancelled: number }

GET /api/admin/recent-activities?limit=10
Response: { data: [{ id, type, description, userName, timestamp }] }

GET /api/admin/top-services?limit=5
Response: { data: [{ serviceName, bookings, revenue }] }
```

### Technical Requirements:
1. Use Recharts for all charts (npm install recharts)
2. Use TanStack Query for all API calls with proper loading/error states
3. Stats should be cached in Redis for 1 minute
4. All numbers formatted with Indian number system (₹18,75,000 not ₹1,875,000)
5. Responsive: 4 cards become 2x2 grid on tablet, 1 column on mobile
6. Dashboard auto-refreshes stats every 60 seconds (refetchInterval in TanStack Query)

Generate complete code for all components and API endpoints. Match the design EXACTLY.
```

---

<a id="phase-5"></a>
## Phase 5 — Admin Panel — Provider & Product Management

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Admin panel's Service Provider management and Product management pages exactly matching the design.

### Service Providers Page (/admin/service-providers) — EXACT Design:

#### Header Row:
- Page title: "Service Providers" (text-2xl font-bold)
- Right side: Search input ("Search provider..." with search icon) + "Export" button (outlined, with download icon)

#### Tab Bar (below header):
- Tabs: "All Providers" | "Pending Approval" (with red badge showing count, e.g., "13") | "Approved" | "Rejected"
- Active tab has green bottom border and green text
- Clicking a tab filters the table

#### Data Table:
- Columns: Provider (avatar + name) | Phone | Service Type | Location | Status | Registered On | Action
- Provider column: circular avatar image + provider name below
- Status column: colored badges
  - Pending: orange/yellow bg + text
  - Approved: green bg + text (not shown in pending tab)
  - Rejected: red bg + text (not shown in pending tab)
- Action column: "View" link (green text) | "Reject" button (red outlined) — or "Approve" for pending
- Table has alternating row hover states

#### Sample Data Rows:
| Provider | Phone | Service Type | Location | Status | Registered On | Action |
|----------|-------|-------------|----------|--------|---------------|--------|
| Arjun Patel | 8876543210 | Tractor Service | Pune, MH | Pending | 15 May 2024 | View / Reject |
| Ramesh Yadav | 9123456780 | Labor Service | Indore, MP | Pending | 14 May 2024 | View / Reject |
| Suresh Kumar | 9988776655 | Equipment Rental | Bhopal, MP | Pending | 14 May 2024 | View / Reject |
| Mahesh Singh | 8877665544 | Tractor Service | Nagpur, MH | Pending | 13 May 2024 | View / Reject |
| Vikram Joshi | 7766554433 | Labor Service | Jaipur, RJ | Pending | 12 May 2024 | View / Reject |

#### Pagination:
- Bottom of table: "< 1 2 3 ... 10 >" pagination controls
- Show 10 items per page
- Current page has green bg circle

### Provider Details Popup (Modal) — EXACT Design:

When clicking "View" on a provider, show a centered modal (max-w-lg):

- **Header**: "Provider Details" + X close button
- **Left side**: Circular avatar image (80px)
- **Below avatar**: Provider name (bold, lg), email, phone number
- **Right side details**:
  - Service Type: "Tractor Service" (text)
  - Location: "Pune, Maharashtra"
  - Experience: 5-star display (filled/empty stars based on years)
- **Documents Section**:
  - Title: "Documents"
  - 4 document thumbnails in a row: Aadhar Card | PAN Card | Driving License | Bank Details
  - Each is a small card with document icon and label below
- **Footer**: Two full-width buttons side by side
  - "Approve" button: green bg, white text, rounded-lg
  - "Reject" button: red bg, white text, rounded-lg

### Products Page (/admin/products) — EXACT Design:

#### Header Row:
- "Products" title
- Right side: "+ Add Product" green button + "Export" outlined button

#### Tab Bar:
- "All Products" | "Pending Approval" (with red badge count) | "Approved" | "Rejected"

#### Data Table:
- Columns: Product | Provider | Category | Price | Stock | Status | Action
- Product column: small product thumbnail image + product name
- Action column: "View" (green) | "Reject" (red) buttons

#### Sample Data:
| Product | Provider | Category | Price | Stock | Status | Action |
|---------|----------|----------|-------|-------|--------|--------|
| Organic Wheat Seeds (1kg) | Green Fields | Seeds | ₹120 | 50 | Pending | View / Reject |
| Urea Fertilizer (50kg) | Agri Store | Fertilizer | ₹800 | 30 | Pending | View / Reject |
| Organic Pesticide (1L) | Kisan Mart | Pesticides | ₹250 | 25 | Pending | View / Reject |
| Drip Irrigation Kit | Smart Irrigation | Equipment | ₹1000 | 15 | Pending | View / Reject |

### Product Details Popup (Modal) — EXACT Design:

- **Header**: "Product Details" + X close button
- **Product Image**: Large image (200px wide) on the left
- **Right side**:
  - Product name: "Organic Wheat Seeds (1kg)" (bold, xl)
  - "by Green Fields" (gray text)
  - Price: ₹120 | Stock: 50 | Category: Seeds
- **Description**: "High quality organic wheat seeds suitable for all seasons..."
- **Provider Details Section**:
  - Provider avatar + name + email + phone
- **Footer**: Approve (green) + Reject (red) buttons

### Backend API Endpoints:

```
GET    /api/admin/providers?status=PENDING&page=1&limit=10&search=term
GET    /api/admin/providers/:id          (full profile with documents)
PUT    /api/admin/providers/:id/approve
PUT    /api/admin/providers/:id/reject   body: { reason: string }

GET    /api/admin/products?status=PENDING&page=1&limit=10
GET    /api/admin/products/:id
PUT    /api/admin/products/:id/approve
PUT    /api/admin/products/:id/reject    body: { reason: string }

GET    /api/admin/providers/export       (CSV export)
GET    /api/admin/products/export        (CSV export)
```

### API Requirements:
- Approve/Reject endpoints should also create a Notification for the provider
- Invalidate Redis cache for provider/product listings on status change
- Export endpoints should stream CSV with proper headers
- Search should work on provider name, phone, service type
- Pagination returns: { data: [], meta: { page, limit, total, totalPages } }

### Frontend Requirements:
1. Use the reusable DataTable component with sorting and filtering
2. Modals use the shadcn/ui Dialog component
3. Status badges are color-coded pills
4. Loading skeletons for table rows
5. Toast notifications on approve/reject actions (shadcn/ui Sonner)
6. Confirm dialog before reject action
7. Tab counts fetched from API and shown in real-time

Generate ALL code completely. Match the design pixel-perfectly.
```

---

<a id="phase-6"></a>
## Phase 6 — Admin Panel — Bookings, Orders, Reports

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Admin panel's Bookings Management, Orders Management, and Reports & Analytics pages.

### Bookings Management Page (/admin/bookings) — EXACT Design:

#### Header:
- Title: "Bookings"

#### Tab Bar:
- "All Bookings" | "Pending" | "Confirmed" | "Completed" | "Cancelled"

#### Filter Row (below tabs):
- Filter dropdown icon + "Filter" label
- "Date Range" dropdown with calendar picker
- "Export" button (right-aligned)

#### Data Table:
- Columns: Booking ID | Farmer | Service | Provider | Date | Time | Status | Payment | Amount | Action
- Booking ID: bold text (e.g., #BK1256)
- Status: colored badge (Confirmed=green, Pending=orange, Completed=blue, Cancelled=red)
- Payment: "Online" or "COD" text
- Amount: ₹ formatted with Indian notation
- Action: "View" link (green text)

#### Sample Data:
| Booking ID | Farmer | Service | Provider | Date | Time | Status | Payment | Amount | Action |
|------------|--------|---------|----------|------|------|--------|---------|--------|--------|
| #BK1256 | Ramesh Kumar | Tractor Service | Arjun Patel | 20 May 2024 | 10:00 AM | Confirmed | Online | ₹2,500 | View |
| #BK1255 | Suresh Yadav | Labor Service | Ramesh Yadav | 20 May 2024 | 02:00 PM | Pending | COD | ₹1,000 | View |
| #BK1254 | Mahesh Singh | Plowing Service | Vikram Joshi | 19 May 2024 | 09:00 AM | Completed | Online | ₹1,000 | View |
| #BK1253 | Ram Lal | Irrigation Service | Suresh Kumar | 19 May 2024 | 11:00 AM | Confirmed | Online | ₹3,000 | View |

### Orders Management Page (/admin/orders) — EXACT Design:

#### Tab Bar:
- "All Orders" | "Pending" | "Shipped" | "Delivered" | "Cancelled"

#### Filter Row: same as bookings (Filter + Date Range + Export)

#### Data Table:
- Columns: Order ID | Farmer | Items | Amount | Status | Payment | Order Date | Action
- Order ID: bold (e.g., #ORD1256)
- Status: colored badge (Delivered=green, Shipped=blue, Pending=orange, Cancelled=red)

#### Sample Data:
| Order ID | Farmer | Items | Amount | Status | Payment | Order Date | Action |
|----------|--------|-------|--------|--------|---------|------------|--------|
| #ORD1256 | Ramesh Kumar | 2 items | ₹560 | Delivered | Online | 20 May 2024 | View |
| #ORD1255 | Suresh Yadav | 3 items | ₹1,250 | Shipped | COD | 20 May 2024 | View |
| #ORD1254 | Mahesh Singh | 1 item | ₹800 | Pending | Online | 18 May 2024 | View |
| #ORD1253 | Ram Lal | 4 items | ₹2,100 | Delivered | COD | 19 May 2024 | View |

### Reports & Analytics Page (/admin/reports) — EXACT Design:

#### Header:
- Title: "Reports"
- Right side: "Date Range" dropdown + "Export" button

#### Stats Row (4 cards):
| Card | Label | Value | Change |
|------|-------|-------|--------|
| Total Revenue | ₹18,75,000 | +10.2% (green) |
| Farmers | 3,257 | +19.8% (green) |
| Total Orders | 2,431 | +12.5% (green) |
| Total Users | 3,674 | +14.2% (green) |

#### Revenue Growth Chart:
- Large area/line chart (full width)
- X-axis: 01 May, 05 May, 10 May, 15 May, 20 May, 25 May, 31 May
- Y-axis: ₹0 to ₹(max)
- Green gradient area fill
- Chart title: "Revenue Growth"
- Use Recharts AreaChart

### Backend API Endpoints:

```
GET /api/admin/bookings?status=&page=&limit=&dateFrom=&dateTo=&search=
GET /api/admin/bookings/:id
GET /api/admin/bookings/export?status=&dateFrom=&dateTo=

GET /api/admin/orders?status=&page=&limit=&dateFrom=&dateTo=
GET /api/admin/orders/:id
GET /api/admin/orders/export?status=&dateFrom=&dateTo=

GET /api/admin/reports/summary?dateFrom=&dateTo=
GET /api/admin/reports/revenue-growth?period=daily|weekly|monthly
GET /api/admin/reports/service-performance
GET /api/admin/reports/provider-performance
```

### Technical Requirements:
1. Date range filter uses shadcn/ui DateRangePicker
2. Export generates CSV with proper headers and Indian number formatting
3. Reports data cached in Redis for 5 minutes
4. Charts use Recharts with smooth animations
5. Responsive: tables become card lists on mobile
6. All monetary values displayed with Indian comma system (₹18,75,000)

Generate ALL code completely.
```

---

<a id="phase-7"></a>
## Phase 7 — Service Provider Panel — Layout & Dashboard

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Service Provider panel layout and dashboard exactly matching the design screenshots.

### Provider Layout (_provider.tsx) — EXACT Design:

#### Sidebar (Dark green #166534, same style as admin):
- **Header**: "Krishi Connect" + subtitle "Service Provider" in smaller text below
- **Navigation**:
  1. Dashboard (icon: LayoutDashboard)
  2. Bookings (icon: Calendar)
  3. Services (icon: Wrench) — labeled "Services" in the provider sidebar
  4. Products (icon: Package)
  5. Orders (icon: ShoppingCart)
  6. Earnings (icon: IndianRupee)
  7. Reviews (icon: Star)
  8. Messages (icon: MessageSquare)
  9. Reports (icon: BarChart3)
  10. Settings (icon: Settings)
- **Bottom**: Logout

#### Top Bar:
- Left: Hamburger (mobile)
- Right: Provider avatar + name "Ramesh Yadav..." + role "Provider" + notification bell with red badge count

### Provider Dashboard (/provider/dashboard) — EXACT Layout:

#### Row 1 — Stats Cards (4 cards):
| Card | Icon BG | Label | Value | Change |
|------|---------|-------|-------|--------|
| 1 | Green | Total Earnings | ₹48,750 | +12.5% from last month |
| 2 | Blue | Total Bookings | 32 | +8.2% from last month |
| 3 | Orange | Total Orders | 18 | +5.3% from last month |
| 4 | Purple | Average Rating | 4.6 ★★★★★ (128 Reviews) | - |

The Average Rating card shows filled stars (4.6 out of 5) and "(128 Reviews)" text below.

#### Row 2 — Two Charts:

**Left: Earnings Overview (Line Chart)**
- Title: "Earnings Overview" + "This Month ▼" dropdown
- X-axis: 1 May, 8 May, 15 May, 22 May, 31 May
- Y-axis: ₹0 to ₹10k (₹2k intervals)
- Peak at ₹8,750 on "20 May" with a tooltip/label showing the value
- Green line chart with smooth curves

**Right: Booking Status (Donut Chart)**
- Title: "Booking Status" + "This Month ▼" dropdown
- Center text: "32 Total"
- Segments:
  - Completed: 18 (56%) — green
  - Confirmed: 8 (25%) — teal/blue
  - Pending: 4 (12%) — orange
  - Cancelled: 2 (6%) — red
- Legend on the right

#### Row 3 — Two Lists Side by Side:

**Left: Upcoming Bookings (Card)**
- Title: "Upcoming Bookings" + "View All" link
- 3 items, each with:
  - Service icon (tractor icon for tractor, people icon for labor, etc.)
  - Service name (bold) + date + time below
  - Status badge on the right (Confirmed=green, Pending=orange)
- Items:
  1. Tractor Service | 20 May 2024 • 10:00 AM | Confirmed (green)
  2. Labor Service | 21 May 2024 • 09:00 AM | Pending (orange)
  3. Equipment Rental | 22 May 2024 • 11:00 AM | Confirmed (green)

**Right: Recent Orders (Card)**
- Title: "Recent Orders" + "View All" link
- 4 items, each with:
  - Product thumbnail image
  - Product name + date + order ID below
  - Status badge (Delivered=green, Shipped=blue)
- Items:
  1. Organic Wheat Seeds (2kg) | 19 May 2024 • #ORD1254 | Delivered
  2. Urea Fertilizer (5kg) | 18 May 2024 • #ORD1253 | Delivered
  3. [another product] | [date] | Shipped

### Backend API Endpoints:

```
GET /api/provider/stats
GET /api/provider/earnings-chart?period=monthly
GET /api/provider/booking-status-overview
GET /api/provider/upcoming-bookings?limit=5
GET /api/provider/recent-orders?limit=5
```

All endpoints are scoped to the authenticated provider (use req.user.id to filter).

### Technical Requirements:
1. Provider can only see their own data
2. Stats cached in Redis for 1 minute with key `stats:provider:${providerId}`
3. Recharts for all charts
4. TanStack Query with 60s refetch interval
5. Responsive design matching admin panel patterns

Generate ALL code completely.
```

---

<a id="phase-8"></a>
## Phase 8 — Service Provider — Services & Products CRUD

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Service Provider's Services management (CRUD) and Products management (CRUD) pages.

### Services Page (/provider/services) — EXACT Design:

This page is not a table — it is a card-based layout or list showing the provider's services.

#### Add New Service Page (/provider/services/add) — EXACT Design:

**Breadcrumb**: Dashboard / Services / Add Service

**Two-Column Layout:**

**Left Column: Service Information (Form)**
- Service Category: Dropdown (Tractor Service, Labor Service, Equipment Rental, Irrigation Service, Harvesting Service, Spraying Service, Rotavator Service, Water Tanker Service)
- Service Name: Text input (e.g., "John Deere 5050D Tractor")
- Description: Textarea (e.g., "John Deere 5050D tractor with plough and trolley. Suitable for all types of farming.")
- Capacity / Specification: Text input (e.g., "50 HP")
- Rate Type: Dropdown (Per Hour, Per Day, Per Trip, Per Acre)
- Price (₹): Number input (e.g., 1200)
- Discount Price (Optional): Number input (e.g., 1000)

**Right Column: Service Images**
- Title: "Service Images" + subtitle "Upload clear images of your service"
- Image grid: shows uploaded image thumbnails with X button to remove
- "+" Add More Images button (Max 5 images)
- Drag and drop support

**Footer Buttons:**
- "Cancel" (outlined) | "Save Service" (green bg)

### Products Page (/provider/products):
Similar to services but with product-specific fields.

#### Add New Product Page (/provider/products/add) — EXACT Design:

**Left Column: Product Information**
- Product Name: Text input (e.g., "Organic Wheat Seeds (1kg)")
- Category: Dropdown (Seeds, Fertilizers, Pesticides, Tools, Irrigation, Equipment)
- Description: Textarea
- Price (₹): Number input (120)
- Stock: Number input (50)
- Unit: Dropdown (kg, L, pieces, packets)
- Delivery Range: Number input (25) in km

**Right Column: Product Images**
- Same as service images (Max 5, drag & drop, remove button)

**Footer:**
- "Cancel" | "Submit for Approval" (green bg)

**Info Banner (bottom, yellow bg):**
- ⚠️ "Your product will be visible to farmers after admin approval."

### Backend API Endpoints:

```
# Services
GET    /api/provider/services                  (list own services)
GET    /api/provider/services/:id
POST   /api/provider/services                  (create new)
PUT    /api/provider/services/:id              (update)
DELETE /api/provider/services/:id              (soft delete - set isActive=false)

# Products
GET    /api/provider/products                  (list own products)
GET    /api/provider/products/:id
POST   /api/provider/products                  (create new, approvalStatus=PENDING)
PUT    /api/provider/products/:id              (update, reset approvalStatus to PENDING)
DELETE /api/provider/products/:id              (soft delete)

# Image Upload
POST   /api/upload/images                     (multipart, max 5 files, max 5MB each)
Response: { urls: string[] }
```

### Image Upload Requirements:
1. Use Multer with disk storage in `uploads/` directory
2. Accept only JPEG, PNG, WebP
3. Max file size: 5MB per image
4. Max 5 images per upload
5. Generate unique filenames with UUID
6. Serve static files: `/uploads/` mapped to the uploads directory
7. Return array of URLs

### Form Validation (Zod):
- Service: name (3-100 chars), description (10-1000 chars), price (min 1), category (valid enum), at least 1 image
- Product: name (3-100 chars), description (10-1000 chars), price (min 1), stock (min 0), category (valid enum)

### Frontend Requirements:
1. React Hook Form + Zod resolver for all forms
2. Image upload with preview, drag-and-drop (react-dropzone)
3. Loading state on submit buttons
4. Toast on success/error
5. Redirect to list page after successful create
6. Edit mode: pre-populate form fields and existing images

Generate ALL code completely.
```

---

<a id="phase-9"></a>
## Phase 9 — Service Provider — Bookings, Earnings, Profile

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Provider's Bookings management, Earnings page, and Profile Settings page.

### Bookings Page (/provider/bookings) — EXACT Design:

#### Tab Bar:
- "All Bookings" | "Pending" | "Confirmed" | "Completed" | "Cancelled"

#### Right side of header: Filter icon button

#### Data Table:
- Columns: Booking ID | Service | Farmer | Date & Time | Status | Payment | Amount | Action
- Date & Time: "20 May 2024, 10:00 AM" format
- Status badges: same color coding
- Action: "View" link

#### Sample Data:
| Booking ID | Service | Farmer | Date & Time | Status | Payment | Amount | Action |
|------------|---------|--------|-------------|--------|---------|--------|--------|
| #BK1256 | Tractor Service | Suresh Kumar | 20 May 2024, 10:00 AM | Confirmed | Online | ₹2,500 | View |
| #BK1255 | Labor Service | Mahesh Singh | 21 May 2024, 09:00 AM | Pending | Cash | ₹1,500 | View |
| #BK1254 | Equipment Rental | Vikram Joshi | 22 May 2024, 11:00 AM | Confirmed | Online | ₹3,000 | View |
| #BK1253 | Tractor Service | Ram Lal | 23 May 2024, 02:00 PM | Pending | Cash | ₹2,000 | View |
| #BK1252 | Labor Service | Ramesh Patel | 24 May 2024, 08:00 AM | Confirmed | Online | ₹1,800 | View |

#### Pagination: Same as admin panel

### Booking Detail View:
When clicking View, show full booking details with ability to:
- Accept/Reject pending bookings
- Update status (Confirmed → In Progress → Completed)
- Add notes

### Earnings Page (/provider/earnings) — EXACT Design:

#### Stats Row (3 cards):
| Card | Label | Value | Change |
|------|-------|-------|--------|
| 1 | Total Earnings | ₹48,750 | +12.5% from last month |
| 2 | Service Earnings | ₹32,450 | +10.2% from last month |
| 3 | Product Earnings | ₹16,300 | +15.8% from last month |

#### Row 2 — Two Charts:

**Left: Earnings Overview (Area Chart)**
- Title: "Earnings Overview" + "This Month ▼"
- X-axis: 1 May, 8 May, 15 May, 22 May, 31 May
- Y-axis: ₹0 to ₹10k
- Green area chart

**Right: Earnings Breakdown (Donut Chart)**
- Title: "Earnings Breakdown"
- Two segments:
  - Service: 66.5% — green
  - Products: 33.5% — blue/teal

#### Recent Transactions Table:
- Title: "Recent Transactions" + "View All" link
- Columns: Date | Type | Details | Payment Method | Amount | Status
- Status: "Paid" in green badge

| Date | Type | Details | Payment Method | Amount | Status |
|------|------|---------|----------------|--------|--------|
| 19 May 2024 | Service Booking | Tractor Service - #BK1256 | Online | ₹2,500 | Paid |
| 18 May 2024 | Product Order | Order #ORD1254 | Online | ₹1,200 | Paid |
| 17 May 2024 | Service Booking | Labor Service - #BK1251 | Cash | ₹1,500 | Paid |

### Profile Settings Page (/provider/settings) — EXACT Design:

**Two-Column Layout:**

**Left Column: Profile Information**
- Profile photo (large circle, 120px) with "Change Photo" link below
- Full Name: text input
- Phone Number: text input (with +91 prefix)
- Email Address: text input
- Address: textarea
- "Update Profile" green button

**Right Column: Business Information**
- Business Name: text input (e.g., "Yadav Agro Services")
- Service Category: text input or tags (e.g., "Tractor Service, Labor Service")
- Experience: text input (e.g., "5 Years")
- Service Area: text input (e.g., "Indore, Ujjain, Dewas (25 km)")

**Documents Section (below both columns):**
- Title: "Documents"
- Three document cards in a row:
  1. Aadhar Card — "Verified" green badge
  2. PAN Card — "Verified" green badge
  3. Bank Details — "Verified" green badge
- Each card shows document type icon and verification status

### Backend API Endpoints:

```
# Bookings
GET    /api/provider/bookings?status=&page=&limit=
GET    /api/provider/bookings/:id
PUT    /api/provider/bookings/:id/accept
PUT    /api/provider/bookings/:id/reject    body: { reason }
PUT    /api/provider/bookings/:id/status    body: { status }

# Earnings
GET    /api/provider/earnings/summary
GET    /api/provider/earnings/chart?period=monthly
GET    /api/provider/earnings/breakdown
GET    /api/provider/earnings/transactions?page=&limit=

# Profile
GET    /api/provider/profile
PUT    /api/provider/profile                body: { ...profileFields }
PUT    /api/provider/profile/photo          (multipart)
PUT    /api/provider/profile/documents      (multipart, field: aadhar|pan|bank)
```

### Requirements:
1. When provider accepts a booking, create a BookingTracking entry with status "Accepted"
2. When status changes, create corresponding BookingTracking entry
3. Earnings are calculated from completed bookings and delivered orders
4. Profile update invalidates Redis cache
5. Document upload stores files and updates ProviderProfile document URLs

Generate ALL code completely.
```

---

<a id="phase-10"></a>
## Phase 10 — Farmer Panel — Layout, Dashboard & Service Discovery

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Farmer panel layout, dashboard, and service discovery pages exactly matching the design screenshots.

### Farmer Layout (_farmer.tsx) — EXACT Design:

#### Sidebar (Dark green #166534):
- **Header**: "Krishi Connect" logo (leaf icon + text), small leaf/plant icon
- **Navigation**:
  1. Dashboard (icon: LayoutDashboard)
  2. Services (icon: Wrench) — with "New" badge in green pill next to it
  3. Bookings (icon: Calendar)
  4. Products (icon: Package)
  5. Cart (icon: ShoppingCart) — with badge showing item count (e.g., "2")
  6. Orders (icon: ShoppingBag)
  7. Payments (icon: CreditCard)
  8. Messages (icon: MessageSquare)
  9. Help & Support (icon: HelpCircle)
  10. Settings (icon: Settings)
- **Bottom**: Language toggle "English | ಕನ್ನಡ" and Logout

#### Top Bar:
- Left: Hamburger (mobile)
- Location selector: "📍 Indore, MP ▼" dropdown (clicking opens location picker)
- Center: Search bar "Search services, products..." with search icon and magnifying glass
- Right: Notification bell (with count badge) + User avatar + name "Ramesh Kumar" + role "Farmer"

### Farmer Dashboard (/farmer/dashboard) — EXACT Layout:

#### Greeting Section:
- "Good Morning, Ramesh Kumar! 👋" (greeting changes based on time of day)
- "What would you like to book or buy today?"

#### Row 1 — Two CTA Cards (equal width, side by side):

**Left: "Book a Service"**
- Text: "Tractor, Labor, Equipment and more"
- Green "Book Now" button (small)
- Right side: tractor/farm illustration image
- White card with subtle shadow

**Right: "Buy Products"**
- Text: "Seeds, Fertilizers, Pesticides and more"
- Green "Shop Now" button
- Right side: product basket illustration
- White card

#### Row 2 — Nearby Services Section:
- Title: "Nearby Services (Within 25 km)" + "View All" link (green)
- Horizontal scrollable row of 4 service cards:

Each service card:
- Large image (tractor, laborers, rotavator, harvester)
- Service name below image
- Rating: ★ 4.6 (128) — star icon + rating + review count
- Price: ₹1,200 / hour (bold price + rate type)
- Distance: "2.3 km away" (gray text)

Cards:
1. Tractor Service | ★ 4.6 (128) | ₹1,200 / hour | 2.3 km away
2. Labor Service | ★ 4.4 (96) | ₹600 / day | 3.1 km away
3. Rotavator Service | ★ 4.3 (74) | ₹1,000 / hour | 4.5 km away
4. Harvester Service | ★ 4.7 (86) | ₹2,500 / hour | 8.2 km away

#### Row 3 — Two Sections Side by Side:

**Left: Top Categories (or "Popular Categories")**
- Grid of 6 circular icons with labels:
  1. Tractor (tractor icon)
  2. Labor (people icon)
  3. Equipment (gear icon)
  4. Irrigation (water drop icon)
  5. Harvesting (wheat icon)
  6. Spraying (spray icon)
  7. "More" or "..." (if overflow)

**Right: My Bookings (or "Upcoming Bookings")**
- "View All" link
- 3 items showing:
  1. Tractor Service | 20 May, 10:00 AM | Confirmed (green)
  2. Labor Service | 21 May, 08:00 AM | Pending (orange)
  3. Equipment Rental | 22 May, 11:00 AM | Confirmed (green)

### Services Page (/farmer/services) — EXACT Design:

#### Header:
- Location: "📍 Indore, MP ▼" dropdown
- Search bar: "Search services..."
- Filters button + Sort By dropdown

#### Category Filter Bar:
- Horizontal scrollable pills: All | Tractor | Labor | Equipment | Irrigation | Harvesting
- Active pill: green bg, white text
- Inactive: gray outline

#### Service List (Card-based, stacked vertically):
Each card has:
- Left: Service image (rounded, 80x80)
- Center:
  - Service name (bold, e.g., "John Deere 5050D Tractor")
  - Service type (gray, e.g., "Tractor Service")
  - Rating: ★ 4.6 (128) — star + number + review count
  - Distance: 📍 2.3 km away
- Right:
  - Price: "₹1,200 / hour" (bold)
  - Heart/favorite icon (outline)
  - "View Details" green button

#### Service Cards Data:
1. John Deere 5050D Tractor | Tractor Service | ★ 4.6 (128) | 2.1 km | ₹1,200/hour
2. Mahindra 575 DI Tractor | Tractor Service | ★ 4.4 (88) | 3.8 km | ₹1,000/hour
3. Skilled Labor Team | Labor Service | ★ 4.5 (96) | 3.1 km | ₹600/day
4. Rotavator Machine | Rotavator Service | ★ 4.3 (64) | 4.5 km | ₹1,000/hour
5. Water Tanker | Water Service | ★ 4.2 (45) | 5.2 km | ₹800/trip

#### MAP VIEW (toggle between list and map):
- When map view is active, show a Leaflet/MapLibre map centered on farmer's location
- Service locations shown as green markers with price tags (₹1,200, ₹600, ₹1,000)
- Clicking a marker shows a popup card with service details
- Service list appears as a sidebar/panel alongside the map

### Service Details Page (/farmer/services/:id) — EXACT Design:

**Header**: "< Back" link

**Image Carousel**: Large service images (3-4 images) with dot indicators and left/right arrows

**Service Info (below carousel)**:
- Service name: "John Deere 5050D Tractor" (text-2xl bold)
- Service type: "Tractor Service" (gray)
- Rating: ★ 4.6 (128 reviews) — clickable to see reviews
- Price: "₹1,200 / hour" (large, bold, green)

**Specifications Row** (3 columns):
| Capacity | Fuel Type | Location |
|----------|-----------|----------|
| 50 HP | Diesel | 2.3 km away |

**About Service**:
- "John Deere 5050D tractor with plough and trolley. Suitable for all types of farming operations like tilling, plowing, and transportation."

**Provider Section**:
- Provider avatar (40px) + name "Suresh Patel"
- "✓ Verified Provider" green badge
- Rating: ★ 4.6 (128)

**Image Thumbnails**: Row of 4-5 small thumbnails below main image

**CTA Button**: "Book Now" — full-width green button at bottom

### Backend API Endpoints:

```
GET /api/farmer/dashboard
  Response: { greeting, nearbyServices[], upcomingBookings[], popularCategories[] }

GET /api/farmer/services?lat=&lng=&radius=25&category=&search=&sortBy=distance|price|rating&page=&limit=
  Response: { data: Service[], meta }
  — Must calculate distance from farmer's location using Haversine formula
  — Only return services from APPROVED providers within radius

GET /api/farmer/services/:id
  Response: { service, provider, reviews[] }

GET /api/farmer/services/map?lat=&lng=&radius=25&category=
  Response: { data: [{ id, name, price, lat, lng, rating, category }] }
  — Lightweight response for map markers
```

### Geolocation Requirements:
1. Haversine formula utility in `utils/geolocation.ts` for distance calculation
2. SQL query should use Prisma raw query for efficient distance filtering:
   ```sql
   WHERE (6371 * acos(cos(radians($lat)) * cos(radians(latitude)) * cos(radians(longitude) - radians($lng)) + sin(radians($lat)) * sin(radians(latitude)))) <= $radius
   ```
3. Frontend: use browser Geolocation API to get farmer's location
4. Store farmer's location in Zustand and send with API requests
5. Fallback to profile location if browser geolocation denied

Generate ALL code completely. The service discovery with distance calculation must work correctly.
```

---

<a id="phase-11"></a>
## Phase 11 — Farmer — Service Booking Flow with Maps

```
You are continuing the "Krishi Connect" PERN stack project. Now build the complete service booking flow for farmers, including the multi-step booking form and booking tracking with real-time map.

### Book Service Flow — Multi-Step Form:

From the Service Details page, when farmer clicks "Book Now", show a multi-step booking flow. This can be on a new page (/farmer/services/:id/book) or a large modal.

#### Step 1: Select Date & Time — EXACT Design:

**Left side: Calendar**
- Month/Year header with left/right arrows: "< May 2024 >"
- Day headers: SUN MON TUE WED THU FRI SAT
- Calendar grid with dates
- Today highlighted with green circle
- Selected date has green fill
- Past dates are grayed out

**Below Calendar: Time Slots**
- "Select Time" label
- Horizontal row of time pill buttons:
  08:00 AM | 10:00 AM (selected=green fill) | 12:00 PM | 02:00 PM | 04:00 PM
- Selected time: green bg, white text

#### Step 2: Booking Details — EXACT Design:

- Service card recap: image thumbnail + service name + price/rate
- Date: "20 May 2024"
- Time: "10:00 AM"
- Duration: Dropdown (1 Hour, 2 Hours, 3 Hours, Half Day, Full Day)
- Total Amount: calculated = price × duration (e.g., ₹1,200 × 2 = ₹2,400)
- "Continue" green button

#### Step 3: Payment Method — EXACT Design:

Three payment option cards (radio-style, only one selectable):

1. **UPI / Online** — icon + "Pay securely using UPI" — radio filled (green)
2. **Card Payment** — icon + "Debit / Credit Card" — radio empty
3. **Cash on Delivery** — icon + "Pay to provider" — radio empty

- "Confirm Booking" green button (full width)

#### Step 4: Booking Confirmed — EXACT Design:

- Large green checkmark circle icon (centered)
- "Your booking is confirmed!" (text-xl bold)
- Service name + Date + Time + Duration (one line)
- Booking ID: "BK1256" (bold)
- Total Amount: "₹2,400" (bold)
- Two buttons:
  - "View Booking" (green outlined)
  - "Go to Home" (green filled)

### My Bookings Page (/farmer/bookings) — EXACT Design:

#### Tab Bar:
- All | Pending | Confirmed | Completed | Cancelled

#### Booking Cards (stacked vertically):
Each card:
- Left: Service image thumbnail (60x60 rounded)
- Center:
  - Service name (bold): "John Deere 5050D Tractor"
  - Date + Time: "20 May 2024 • 10:00 AM"
  - Duration: "2 Hours"
- Right:
  - Amount: "₹2,400" (bold)
  - Status badge: "Confirmed" (green)
  - "View Details" link

Cards:
1. John Deere 5050D Tractor | 20 May 2024 • 10:00 AM | 2 Hours | ₹2,400 | Confirmed
2. Skilled Labor Team | 21 May 2024 • 09:00 AM | 1 Day | ₹600 | Pending
3. Mahindra 575 DI Tractor | 18 May 2024 • 02:00 PM | 3 Hours | ₹3,000 | Completed

"View All Bookings" button at bottom

### Booking Tracking Page (/farmer/bookings/:id/tracking) — EXACT Design:

**Header**: "< Booking Tracking"

**Booking Info Card**:
- Booking ID: BK1256
- Service image + name: "John Deere 5050D Tractor"
- Date: "20 May 2024 • 10:00 AM"
- Duration: "2 Hours"

**Provider Card**:
- Provider avatar + name: "Suresh Patel"
- Rating: ★ 4.6 (128)
- Two buttons: "Call Provider" | "Chat"

**MAP Section** (RIGHT SIDE or below on mobile):
- Real-time Leaflet/MapLibre map
- Provider location marker (green dot, moving)
- Farmer location marker (blue dot, fixed)
- Route line between them (if provider is on the way)
- "Your Location" label

**Tracking Timeline (LEFT SIDE, vertical)**:
- Green vertical line connecting status dots
- Each step:
  - Green filled circle (completed) or gray (upcoming)
  - Status name (bold) + timestamp + description

Steps:
1. ✅ Requested — 20 May 2024 • 08:15 AM — "Your booking request has been sent"
2. ✅ Accepted — 20 May 2024 • 09:20 AM — "Provider has accepted your request"
3. ✅ On The Way — 20 May 2024 • 09:45 AM — "Provider is on the way to your location"
4. 🔵 In Progress — "Service is in progress" (current)
5. ⚪ Completed — "Service will be marked as completed" (upcoming)

### Backend API Endpoints:

```
# Booking Creation
POST   /api/farmer/bookings
  body: { serviceId, bookingDate, startTime, duration, paymentMethod }
  — Validate service exists, is active, provider is approved
  — Check for time conflicts (no double-booking for same provider at same time)
  — Calculate totalAmount based on service price × duration
  — Create Booking + initial BookingTracking entry (status: "Requested")
  — Create Notification for provider
  — Return booking with bookingId

# Booking List
GET    /api/farmer/bookings?status=&page=&limit=

# Booking Detail
GET    /api/farmer/bookings/:id
  — Include service details, provider details, tracking history

# Booking Tracking
GET    /api/farmer/bookings/:id/tracking
  — Return all BookingTracking entries ordered by timestamp
  — Include provider's latest location if status is "On The Way" or "In Progress"

# Cancel Booking
PUT    /api/farmer/bookings/:id/cancel
  body: { reason }
  — Only if status is REQUESTED or CONFIRMED
```

### Time Slot Generation:
- Generate available slots based on provider's working hours (default 8 AM - 6 PM)
- Exclude slots that are already booked for the selected date
- API: GET /api/farmer/services/:id/available-slots?date=2024-05-20

### Technical Requirements:
1. Multi-step form maintains state using React useState or Zustand
2. Calendar component: use shadcn/ui Calendar (based on react-day-picker)
3. Map: Leaflet with react-leaflet for booking tracking
4. Provider location updates simulated (in production, this would use WebSocket)
5. Booking creation is wrapped in a Prisma transaction
6. Optimistic updates with TanStack Query mutation

Generate ALL code completely.
```

---

<a id="phase-12"></a>
## Phase 12 — Farmer — Products, Cart, Checkout & Orders

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Farmer's product browsing, cart, checkout, and order management pages.

### Products Page (/farmer/products) — EXACT Design:

#### Header:
- Search bar: "Search products..." with search icon
- Filters button (with filter icon)

#### Category Filter (horizontal scrollable pills):
- All | Seeds | Fertilizers | Pesticides | Tools | Irrigation
- Active: green bg, white text

#### Product Grid (3-4 columns on desktop, 2 on tablet, 1 on mobile):
Each product card:
- Product image (square, rounded-lg, fills card width)
- Product name (bold, truncated to 2 lines)
- Price: "₹120" (bold, green)
- "Add to Cart" green button (full width, rounded-lg)

#### Product Cards:
1. Organic Wheat Seeds (1kg) — ₹120 — [Add to Cart]
2. Urea Fertilizer (50kg) — ₹600 — [Add to Cart]
3. DAP Fertilizer (50kg) — ₹1,350 — [Add to Cart]
4. Neem Oil (1L) — ₹250 — [Add to Cart]
5. Drip Irrigation Kit — ₹1,200 — [Add to Cart]
6. Garden Tools Set — ₹550 — [Add to Cart]
7. Pesticide - Imidacloprid — ₹320 — [Add to Cart]
8. Cocopeat (5kg) — ₹180 — [Add to Cart]

### Product Detail Page (/farmer/products/:id) — EXACT Design:

**Header**: "< Back to Products"

**Left Side: Product Images**
- Large main image with thumbnails below (click to change main image)
- 3-4 thumbnail images

**Right Side: Product Info**
- Product name: "Organic Wheat Seeds (1kg)" (text-2xl bold)
- Rating: ★ 4.5 (86 reviews) — stars in gold/yellow
- Price: "₹120" (text-3xl bold)
- **Brand**: "Green Fields" (gray label + value)
- **Category**: "Seeds"
- **Stock**: "In Stock (50+ available)" — green text
- **Description**: "High quality organic wheat seeds suitable for all seasons. High germination rate and disease resistant."
- **Quantity**: Minus [-] button | Number (1) | Plus [+] button
- Two buttons (side by side):
  - "Add to Cart" (green outlined, full width)
  - "Buy Now" (green filled, full width)

### Cart Page (/farmer/cart) — EXACT Design:

**Title**: "My Cart (3 Items)" + "Remove All" red text link

**Cart Items List** (each item is a card):
Each item:
- Product thumbnail (60x60)
- Product name
- Price per unit: "₹120"
- Quantity controls: [-] [1] [+]
- Item subtotal: "₹120"
- X remove button (top right)

Items:
1. Organic Wheat Seeds (1kg) | ₹120 | Qty: 1 | ₹120
2. Urea Fertilizer (50kg) | ₹600 | Qty: 1 | ₹600
3. Drip Irrigation Kit | ₹1,200 | Qty: 1 | ₹1,200

**Order Summary (right side on desktop, bottom on mobile)**:
- Subtotal: ₹1,920
- Delivery Charges: ₹60
- **Total Amount**: ₹1,980 (bold, large)
- "Proceed to Checkout" green button (full width)

### Checkout Page (/farmer/checkout) — EXACT Design:

**Left Side:**

**Delivery Address Section**:
- Title: "Delivery Address"
- Name: Ramesh Kumar
- Address: 123, Near Bus Stand, Dewas Naka, Indore, Madhya Pradesh - 452010
- Phone: +91 98765 43210
- "Change" link (green text)

**Payment Method Section**:
- Radio options:
  1. ● UPI / Online (selected)
  2. ○ Card Payment
  3. ○ Cash on Delivery

**Right Side: Order Summary**:
- Items (3): ₹1,920
- Delivery Charges: ₹60
- **Total Amount**: ₹1,980
- "Place Order" green button (full width)

### Order Confirmed:
- Success screen similar to booking confirmation
- Order ID, items count, total amount
- "View Order" + "Continue Shopping" buttons

### My Orders Page (/farmer/orders) — EXACT Design:

#### Tab Bar:
- All | Pending | Shipped | Delivered | Cancelled

#### Order Cards (stacked):
Each card:
- Order ID: "Order #ORD1256" (bold)
- Date: "20 May 2024"
- Amount: "₹2,000" (bold, right-aligned)
- Status badge: "Delivered" (green) / "Shipped" (blue) / "Pending" (orange)
- "View Details" link

Cards:
1. Order #ORD1256 | 20 May 2024 | ₹2,000 | Delivered
2. Order #ORD1187 | 18 May 2024 | ₹1,250 | Shipped
3. Order #ORD1122 | 15 May 2024 | ₹600 | Pending
4. Order #ORD1055 | 10 May 2024 | ₹1,800 | Delivered

"View All Orders" button at bottom

### Backend API Endpoints:

```
# Products
GET    /api/farmer/products?category=&search=&sortBy=price|name|newest&page=&limit=
GET    /api/farmer/products/:id
  — Only return APPROVED and active products

# Cart (stored in Zustand on frontend, no server cart)
# Cart persists in localStorage via Zustand persist middleware

# Orders
POST   /api/farmer/orders
  body: {
    items: [{ productId, quantity }],
    deliveryAddress: { name, address, city, state, pincode, phone },
    paymentMethod: "UPI_ONLINE" | "CASH" | "CARD"
  }
  — Validate all products exist, are approved, have sufficient stock
  — Calculate subtotal, delivery charges (₹60 flat or free above ₹500)
  — Decrement product stock
  — Create Order + OrderItems in a transaction
  — Create Notification for farmer and provider(s)
  — Return order with orderId

GET    /api/farmer/orders?status=&page=&limit=
GET    /api/farmer/orders/:id
  — Include order items with product details

PUT    /api/farmer/orders/:id/cancel
  — Only if status is PLACED
  — Restore product stock
```

### Cart Store (Zustand):
```typescript
interface CartState {
  items: CartItem[];  // { productId, name, price, quantity, image }
  addItem: (product: Product) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  getSubtotal: () => number;
  getDeliveryCharges: () => number;
  getTotal: () => number;
  getItemCount: () => number;
}
// Persist to localStorage
```

### Technical Requirements:
1. Cart badge in sidebar shows real-time item count from Zustand store
2. "Add to Cart" button changes to "Added ✓" briefly then shows quantity controls
3. Stock validation on checkout (re-check before placing order)
4. Optimistic stock decrement with rollback on failure
5. Order creation wrapped in Prisma transaction
6. Indian number formatting for all prices

Generate ALL code completely.
```

---

<a id="phase-13"></a>
## Phase 13 — Farmer — Profile, Notifications & Help

```
You are continuing the "Krishi Connect" PERN stack project. Now build the Farmer's Profile page, notification system, and help & support page.

### My Profile Page (/farmer/settings) — EXACT Design:

**Header**: "My Profile"

**Profile Card (top)**:
- Large avatar (80px) with camera/edit icon overlay
- Name: "Ramesh Kumar" (bold, xl)
- Email: ramesh.kumar@email.com
- Phone: +91 98765 43210
- "Edit Profile" link (green text)

**Menu List (below profile card)**:
Each item is a full-width row with icon + label + right arrow chevron:
1. 👤 Personal Information →
2. 📍 Addresses →
3. 💳 Payment Methods →
4. ⭐ My Reviews →
5. 🔔 Notifications →
6. ❓ Help & Support →
7. 🚪 Logout (red text)

### Personal Information Edit:
- Form with: First Name, Last Name, Phone, Email, Farm Address, City, State, Pincode
- "Save Changes" green button

### Addresses Management:
- List of saved addresses
- "Add New Address" button
- Each address card: name, full address, phone, "Edit" | "Delete" links
- Default address marked with green badge

### Notification System:

#### Backend:
- Notifications created on: booking status change, order status change, provider approval, payment confirmation
- GET /api/notifications?page=&limit=&unread=true
- PUT /api/notifications/:id/read
- PUT /api/notifications/read-all
- GET /api/notifications/unread-count

#### Frontend:
- Bell icon in top bar shows unread count (red badge)
- Clicking bell opens notification dropdown/panel
- Each notification: icon based on type + message + relative time + read/unread indicator
- "Mark all as read" link

### Help & Support Page:
- FAQ accordion (5-6 common questions)
- Contact form: Subject, Message, "Submit" button
- Contact info: support email, phone number

### Backend Endpoints:
```
GET    /api/farmer/profile
PUT    /api/farmer/profile
PUT    /api/farmer/profile/photo

GET    /api/farmer/addresses
POST   /api/farmer/addresses
PUT    /api/farmer/addresses/:id
DELETE /api/farmer/addresses/:id

GET    /api/notifications
PUT    /api/notifications/:id/read
PUT    /api/notifications/read-all
GET    /api/notifications/unread-count
```

Generate ALL code completely.
```

---

<a id="phase-14"></a>
## Phase 14 — Real-Time Maps Integration

```
You are continuing the "Krishi Connect" PERN stack project. Now implement comprehensive real-time map functionality across the platform.

### Maps Library: Use Leaflet with react-leaflet (free, no API key needed for basic tiles)
### Tile Provider: OpenStreetMap tiles (free)

### 1. Service Discovery Map (/farmer/services — map toggle):

**Implementation:**
- Toggle button: "List View" | "Map View" in the services header
- Map fills the content area (full height minus header)
- Centered on farmer's current location (from browser Geolocation API)
- Zoom level: 12 (shows ~25km radius)
- 25km radius circle overlay (dashed green border, light green fill with opacity)

**Service Markers:**
- Custom green markers for each service location
- Marker shows price tag label (e.g., "₹1,200")
- Clicking marker opens a popup card with:
  - Service image (thumbnail)
  - Service name
  - Rating + distance
  - Price
  - "View Details" button
- Cluster markers when zoomed out (use react-leaflet-cluster)

**Farmer Location:**
- Blue pulsing dot for farmer's current location
- "Your Location" label

### 2. Service Detail Map:
- Small map (200px height) in the Service Details page
- Shows single marker for the service provider's location
- Shows distance from farmer to provider
- Non-interactive (view only) or minimally interactive

### 3. Booking Tracking Map (/farmer/bookings/:id/tracking):

**Full Tracking Map:**
- Split view: map (right/top) + tracking timeline (left/bottom)
- Map shows:
  - Farmer location (blue marker with "Your Location" label)
  - Provider location (green marker, animated/moving)
  - Route line between them (polyline, green dashed)
- Provider marker moves along route when status is "On The Way"
- Map auto-centers to show both markers

**Simulated Real-Time Updates:**
Since this is a web app without true real-time, simulate provider movement:
- Poll GET /api/farmer/bookings/:id/tracking every 10 seconds
- Backend returns provider's current lat/lng (from BookingTracking table)
- Frontend smoothly animates marker position between updates

### 4. Location Picker Component:
- Used in: farmer registration, provider registration, address management
- Full-screen or large modal map
- Draggable marker for selecting location
- Search input with geocoding (use Nominatim free geocoding API)
- "Confirm Location" button returns { lat, lng, address }
- Reverse geocoding: when marker is dragged, update address text

### 5. Provider Service Area Map (Provider Settings):
- Map showing provider's service radius
- Editable circle: provider can drag to change radius
- Shows the coverage area visually

### Map Components to Create:

```
src/components/maps/
├── MapView.tsx              # Base map wrapper with Leaflet
├── ServiceMapView.tsx       # Service discovery map with markers
├── ServiceMarker.tsx        # Custom marker with price tag
├── BookingTrackingMap.tsx   # Booking tracking with two markers
├── LocationPicker.tsx       # Draggable location selector
├── ServiceAreaMap.tsx       # Provider service radius display
├── MapPopupCard.tsx         # Popup card for service markers
└── utils/
    ├── icons.ts             # Custom Leaflet icon definitions
    └── helpers.ts           # Map utility functions
```

### Custom Marker Styles:
- Service markers: Green circle with white icon inside, price tag below
- Farmer marker: Blue pulsing circle
- Provider marker: Green pulsing circle with provider avatar
- Selected marker: Larger with shadow/glow

### Map Configuration:
```typescript
const MAP_CONFIG = {
  defaultCenter: [22.7196, 75.8577], // Indore, MP
  defaultZoom: 12,
  minZoom: 8,
  maxZoom: 18,
  tileUrl: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
  attribution: '© OpenStreetMap contributors',
  serviceRadius: 25, // km
};
```

### Geolocation Hook (useGeolocation.ts):
```typescript
interface GeolocationState {
  latitude: number | null;
  longitude: number | null;
  accuracy: number | null;
  error: string | null;
  loading: boolean;
}
// Uses navigator.geolocation.watchPosition
// Falls back to stored profile location
// Caches last known location in localStorage
```

### Backend Map Endpoints:
```
GET /api/geocode/search?q=Indore           # Forward geocoding (proxy to Nominatim)
GET /api/geocode/reverse?lat=&lng=          # Reverse geocoding (proxy to Nominatim)

PUT /api/provider/bookings/:id/location     # Provider updates their location during active booking
  body: { latitude, longitude }
  — Only allowed when booking status is ACCEPTED or IN_PROGRESS
  — Creates a BookingTracking entry
```

### Technical Requirements:
1. Lazy-load map components (React.lazy + Suspense) to avoid loading Leaflet on non-map pages
2. Leaflet CSS loaded via CDN or import
3. Custom markers using L.divIcon for styled HTML markers
4. Map state preserved when switching between list/map view
5. Geocoding requests rate-limited (max 1 per second for Nominatim TOS)
6. Mobile: map uses full viewport height with a draggable bottom sheet for service list

### Dependencies to Install:
```
npm install leaflet react-leaflet @types/leaflet react-leaflet-cluster
```

Generate ALL map components with complete working code. Maps must render correctly with markers, popups, and interactions.
```

---

<a id="phase-15"></a>
## Phase 15 — i18n (English + Kannada) & Responsiveness

```
You are continuing the "Krishi Connect" PERN stack project. Now implement full internationalization (English + Kannada) and responsive design across all pages.

IMPORTANT: This platform serves farmers in Karnataka and other Indian states. Kannada text rendering and locale-aware formatting are critical. Do NOT use placeholder "..." in translations — every single key must be fully translated.

### 1. Dependencies

npm install react-i18next i18next i18next-browser-languagedetector i18next-http-backend date-fns

### 2. Kannada Web Font Setup

Add Noto Sans Kannada from Google Fonts. This is REQUIRED — without it Kannada text renders broken on many devices.

In apps/web/index.html <head>:
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Noto+Sans+Kannada:wght@400;500;600;700&display=swap" rel="stylesheet">

In tailwind.config.ts:
fontFamily: {
  sans: ['Inter', 'Noto Sans Kannada', 'system-ui', 'sans-serif'],
}

This ensures Inter is used for English text and Noto Sans Kannada is the fallback that renders Kannada glyphs correctly.

### 3. i18n Configuration (src/i18n/config.ts)

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';
import en from './en.json';
import kn from './kn.json';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: { en: { translation: en }, kn: { translation: kn } },
    fallbackLng: 'en',
    supportedLngs: ['en', 'kn'],
    detection: {
      order: ['localStorage', 'navigator'],
      lookupLocalStorage: 'krishi-lang',
      caches: ['localStorage'],
    },
    interpolation: {
      escapeValue: false,  // React already escapes
      format: (value, format, lng) => {
        if (format === 'currency') {
          return new Intl.NumberFormat(lng === 'kn' ? 'kn-IN' : 'en-IN', {
            style: 'currency', currency: 'INR', maximumFractionDigits: 0,
          }).format(value);
        }
        if (format === 'number') {
          return new Intl.NumberFormat(lng === 'kn' ? 'kn-IN' : 'en-IN').format(value);
        }
        if (value instanceof Date) {
          // Use date-fns with locale
          const { format: fnsFormat } = require('date-fns');
          const { enIN } = require('date-fns/locale/en-IN');
          const { kn: knLocale } = require('date-fns/locale/kn');
          return fnsFormat(value, format || 'PP', { locale: lng === 'kn' ? knLocale : enIN });
        }
        return value;
      },
    },
    pluralSeparator: '_',
    // Kannada pluralization: Kannada uses "one" (1) and "other" (everything else), same as English
  });

export default i18n;

### 4. Locale-Aware Number and Currency Formatting Utility

Create src/lib/formatters.ts:

export function formatCurrency(amount: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'kn' ? 'kn-IN' : 'en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
  // en-IN: "₹18,75,000"  (Indian grouping)
  // kn-IN: "₹18,75,000"  (Kannada numerals optional — we keep Arabic numerals for readability)
}

export function formatNumber(num: number, locale: string = 'en'): string {
  return new Intl.NumberFormat(locale === 'kn' ? 'kn-IN' : 'en-IN').format(num);
}

export function formatDate(date: Date | string, formatStr: string = 'dd MMM yyyy', locale: string = 'en'): string {
  import { format } from 'date-fns';
  import { enIN } from 'date-fns/locale/en-IN';
  import { kn } from 'date-fns/locale/kn';
  const d = typeof date === 'string' ? new Date(date) : date;
  return format(d, formatStr, { locale: locale === 'kn' ? kn : enIN });
}

export function formatRelativeTime(date: Date | string, locale: string = 'en'): string {
  import { formatDistanceToNow } from 'date-fns';
  import { enIN } from 'date-fns/locale/en-IN';
  import { kn } from 'date-fns/locale/kn';
  const d = typeof date === 'string' ? new Date(date) : date;
  return formatDistanceToNow(d, { addSuffix: true, locale: locale === 'kn' ? kn : enIN });
  // en: "10 minutes ago"
  // kn: "10 ನಿಮಿಷಗಳ ಹಿಂದೆ"
}

### 5. Language Switcher Component (src/components/common/LanguageSwitcher.tsx)

- Located in: farmer sidebar bottom, all layout top bars
- Toggle between "English" and "ಕನ್ನಡ" as two pill buttons
- Active pill: green bg (#166534), white text
- Inactive pill: gray-200 bg, gray-700 text
- On switch:
  1. Call i18n.changeLanguage(newLang)
  2. Save to localStorage (automatic via detector)
  3. If user is authenticated: call PUT /api/auth/language body: { language: "EN" | "KN" }
  4. Update document.documentElement.lang attribute
  5. Update document.title with translated page name

### 6. COMPLETE Translation Files

CRITICAL: Every key below must be present in BOTH en.json and kn.json. Do NOT use "..." placeholders.

src/i18n/en.json — FULL FILE (150+ keys):
{
  "common": {
    "search": "Search",
    "filter": "Filter",
    "filters": "Filters",
    "sortBy": "Sort By",
    "export": "Export",
    "save": "Save",
    "cancel": "Cancel",
    "delete": "Delete",
    "edit": "Edit",
    "view": "View",
    "close": "Close",
    "approve": "Approve",
    "reject": "Reject",
    "confirm": "Confirm",
    "continue": "Continue",
    "loading": "Loading...",
    "noData": "No data available",
    "viewAll": "View All",
    "back": "Back",
    "next": "Next",
    "previous": "Previous",
    "submit": "Submit",
    "status": "Status",
    "action": "Action",
    "actions": "Actions",
    "amount": "Amount",
    "date": "Date",
    "time": "Time",
    "price": "Price",
    "total": "Total",
    "logout": "Logout",
    "yes": "Yes",
    "no": "No",
    "ok": "OK",
    "error": "Error",
    "success": "Success",
    "warning": "Warning",
    "required": "This field is required",
    "invalidEmail": "Please enter a valid email",
    "invalidPhone": "Please enter a valid phone number",
    "minChars": "Must be at least {{min}} characters",
    "maxChars": "Must be at most {{max}} characters",
    "passwordMismatch": "Passwords do not match",
    "somethingWentWrong": "Something went wrong. Please try again.",
    "networkError": "Network error. Please check your connection.",
    "pageNotFound": "Page not found",
    "goHome": "Go to Home",
    "tryAgain": "Try Again",
    "confirmDelete": "Are you sure you want to delete this?",
    "confirmReject": "Are you sure you want to reject this?",
    "noResults": "No results found",
    "showing": "Showing {{from}}-{{to}} of {{total}}",
    "perPage": "per page",
    "all": "All",
    "phone": "Phone",
    "email": "Email",
    "name": "Name",
    "description": "Description",
    "category": "Category",
    "address": "Address",
    "city": "City",
    "state": "State",
    "pincode": "Pincode",
    "online": "Online",
    "cash": "Cash",
    "fromLastMonth": "from last month"
  },
  "auth": {
    "login": "Login",
    "register": "Register",
    "signIn": "Sign In",
    "signUp": "Sign Up",
    "email": "Email Address",
    "password": "Password",
    "confirmPassword": "Confirm Password",
    "firstName": "First Name",
    "lastName": "Last Name",
    "phone": "Phone Number",
    "forgotPassword": "Forgot Password?",
    "resetPassword": "Reset Password",
    "noAccount": "Don't have an account?",
    "hasAccount": "Already have an account?",
    "registerAsFarmer": "I'm a Farmer",
    "registerAsProvider": "I'm a Service Provider",
    "loginSuccess": "Login successful!",
    "registerSuccess": "Registration successful!",
    "invalidCredentials": "Invalid email or password",
    "accountPending": "Your account is pending approval. We'll notify you once approved.",
    "accountRejected": "Your account application was rejected.",
    "accountLocked": "Account locked. Try again in {{minutes}} minutes.",
    "pendingReview": "Your application is under review",
    "pendingReviewDesc": "We will review your documents and notify you within 24-48 hours.",
    "businessName": "Business Name",
    "serviceCategories": "Service Categories",
    "experience": "Experience (Years)",
    "documents": "Documents",
    "uploadAadhar": "Upload Aadhar Card",
    "uploadPAN": "Upload PAN Card",
    "uploadDrivingLicense": "Upload Driving License"
  },
  "nav": {
    "dashboard": "Dashboard",
    "farmers": "Farmers",
    "serviceProviders": "Service Providers",
    "products": "Products",
    "orders": "Orders",
    "bookings": "Bookings",
    "payments": "Payments",
    "reports": "Reports",
    "settings": "Settings",
    "services": "Services",
    "earnings": "Earnings",
    "reviews": "Reviews",
    "messages": "Messages",
    "cart": "Cart",
    "helpSupport": "Help & Support"
  },
  "dashboard": {
    "greeting": "Good {{timeOfDay}}, {{name}}!",
    "morning": "Morning",
    "afternoon": "Afternoon",
    "evening": "Evening",
    "whatToDo": "What would you like to book or buy today?",
    "bookService": "Book a Service",
    "bookServiceDesc": "Tractor, Labor, Equipment and more",
    "buyProducts": "Buy Products",
    "buyProductsDesc": "Seeds, Fertilizers, Pesticides and more",
    "bookNow": "Book Now",
    "shopNow": "Shop Now",
    "nearbyServices": "Nearby Services (Within {{radius}} km)",
    "popularCategories": "Popular Categories",
    "upcomingBookings": "Upcoming Bookings",
    "recentOrders": "Recent Orders",
    "recentActivities": "Recent Activities",
    "topServices": "Top Performing Services",
    "totalFarmers": "Total Farmers",
    "totalProviders": "Total Providers",
    "totalBookings": "Total Bookings",
    "totalRevenue": "Total Revenue",
    "totalEarnings": "Total Earnings",
    "totalOrders": "Total Orders",
    "averageRating": "Average Rating",
    "reviews": "{{count}} Reviews",
    "revenueOverview": "Revenue Overview",
    "bookingsOverview": "Bookings Overview",
    "earningsOverview": "Earnings Overview",
    "bookingStatus": "Booking Status",
    "thisMonth": "This Month",
    "thisWeek": "This Week",
    "thisYear": "This Year"
  },
  "services": {
    "title": "Services",
    "allServices": "All Services",
    "bookNow": "Book Now",
    "viewDetails": "View Details",
    "addService": "Add Service",
    "editService": "Edit Service",
    "saveService": "Save Service",
    "deleteService": "Delete Service",
    "serviceInfo": "Service Information",
    "serviceImages": "Service Images",
    "uploadImages": "Upload clear images of your service",
    "maxImages": "Max {{max}} images",
    "addMoreImages": "Add More Images",
    "serviceName": "Service Name",
    "serviceCategory": "Service Category",
    "capacity": "Capacity / Specification",
    "rateType": "Rate Type",
    "discountPrice": "Discount Price (Optional)",
    "aboutService": "About Service",
    "specifications": "Specifications",
    "provider": "Provider",
    "verifiedProvider": "Verified Provider",
    "fuelType": "Fuel Type",
    "location": "Location",
    "listView": "List View",
    "mapView": "Map View",
    "tractor": "Tractor",
    "labor": "Labor",
    "equipment": "Equipment",
    "irrigation": "Irrigation",
    "harvesting": "Harvesting",
    "spraying": "Spraying",
    "rotavator": "Rotavator",
    "waterTanker": "Water Tanker",
    "perHour": "/ hour",
    "perDay": "/ day",
    "perTrip": "/ trip",
    "perAcre": "/ acre",
    "kmAway": "{{distance}} km away",
    "noServicesNearby": "No services found nearby. Try expanding your search radius.",
    "serviceCreated": "Service created successfully!",
    "serviceUpdated": "Service updated successfully!",
    "serviceDeleted": "Service deleted successfully!"
  },
  "bookings": {
    "title": "Bookings",
    "myBookings": "My Bookings",
    "allBookings": "All Bookings",
    "newBooking": "New Booking",
    "bookingId": "Booking ID",
    "selectDate": "Select Date & Time",
    "selectTime": "Select Time",
    "bookingDetails": "Booking Details",
    "duration": "Duration",
    "totalAmount": "Total Amount",
    "paymentMethod": "Payment Method",
    "confirmBooking": "Confirm Booking",
    "bookingConfirmed": "Your booking is confirmed!",
    "viewBooking": "View Booking",
    "goToHome": "Go to Home",
    "cancelBooking": "Cancel Booking",
    "cancelReason": "Reason for cancellation",
    "bookingTracking": "Booking Tracking",
    "callProvider": "Call Provider",
    "chat": "Chat",
    "yourLocation": "Your Location",
    "providerLocation": "Provider Location",
    "requested": "Requested",
    "accepted": "Accepted",
    "confirmed": "Confirmed",
    "onTheWay": "On The Way",
    "inProgress": "In Progress",
    "completed": "Completed",
    "cancelled": "Cancelled",
    "pending": "Pending",
    "requestSent": "Your booking request has been sent",
    "providerAccepted": "Provider has accepted your request",
    "providerOnWay": "Provider is on the way to your location",
    "serviceInProgress": "Service is in progress",
    "serviceCompleted": "Service will be marked as completed",
    "upiOnline": "UPI / Online",
    "cardPayment": "Card Payment",
    "cashOnDelivery": "Cash on Delivery",
    "paySecurely": "Pay securely using UPI",
    "debitCredit": "Debit / Credit Card",
    "payToProvider": "Pay to provider",
    "oneHour": "1 Hour",
    "twoHours": "2 Hours",
    "threeHours": "3 Hours",
    "halfDay": "Half Day",
    "fullDay": "Full Day",
    "acceptBooking": "Accept Booking",
    "rejectBooking": "Reject Booking",
    "updateStatus": "Update Status",
    "bookingAccepted": "Booking accepted!",
    "bookingRejected": "Booking rejected",
    "bookingCancelled": "Booking cancelled",
    "noBookings": "No bookings yet",
    "farmer": "Farmer",
    "service": "Service",
    "dateTime": "Date & Time",
    "payment": "Payment"
  },
  "products": {
    "title": "Products",
    "allProducts": "All Products",
    "addProduct": "Add Product",
    "editProduct": "Edit Product",
    "submitForApproval": "Submit for Approval",
    "productInfo": "Product Information",
    "productImages": "Product Images",
    "uploadImages": "Upload clear images of your product",
    "productName": "Product Name",
    "brand": "Brand",
    "stock": "Stock",
    "unit": "Unit",
    "deliveryRange": "Delivery Range",
    "addToCart": "Add to Cart",
    "added": "Added",
    "buyNow": "Buy Now",
    "inStock": "In Stock ({{count}}+ available)",
    "outOfStock": "Out of Stock",
    "lowStock": "Only {{count}} left",
    "seeds": "Seeds",
    "fertilizers": "Fertilizers",
    "pesticides": "Pesticides",
    "tools": "Tools",
    "irrigationEquipment": "Irrigation",
    "equipmentCategory": "Equipment",
    "approvalPending": "Your product will be visible to farmers after admin approval.",
    "productCreated": "Product submitted for approval!",
    "productUpdated": "Product updated!",
    "productDeleted": "Product deleted!",
    "noProducts": "No products available"
  },
  "cart": {
    "myCart": "My Cart ({{count}} Items)",
    "emptyCart": "Your cart is empty",
    "continueShopping": "Continue Shopping",
    "subtotal": "Subtotal",
    "deliveryCharges": "Delivery Charges",
    "freeDelivery": "Free",
    "totalAmount": "Total Amount",
    "proceedToCheckout": "Proceed to Checkout",
    "removeAll": "Remove All",
    "removeItem": "Remove",
    "quantity": "Quantity",
    "itemTotal": "Item Total"
  },
  "checkout": {
    "checkout": "Checkout",
    "deliveryAddress": "Delivery Address",
    "change": "Change",
    "paymentMethod": "Payment Method",
    "orderSummary": "Order Summary",
    "items": "Items ({{count}})",
    "placeOrder": "Place Order",
    "orderConfirmed": "Your order has been placed!",
    "viewOrder": "View Order",
    "continueShopping": "Continue Shopping",
    "orderId": "Order ID",
    "stockError": "Some items in your cart are no longer available in the requested quantity."
  },
  "orders": {
    "title": "Orders",
    "myOrders": "My Orders",
    "allOrders": "All Orders",
    "orderId": "Order ID",
    "orderDate": "Order Date",
    "orderDetails": "Order Details",
    "viewDetails": "View Details",
    "viewAllOrders": "View All Orders",
    "cancelOrder": "Cancel Order",
    "placed": "Placed",
    "shipped": "Shipped",
    "delivered": "Delivered",
    "orderPlaced": "Order Placed",
    "orderShipped": "Order Shipped",
    "orderDelivered": "Order Delivered",
    "orderCancelled": "Order Cancelled",
    "noOrders": "No orders yet",
    "itemsCount": "{{count}} item",
    "itemsCount_other": "{{count}} items"
  },
  "earnings": {
    "title": "Earnings",
    "totalEarnings": "Total Earnings",
    "serviceEarnings": "Service Earnings",
    "productEarnings": "Product Earnings",
    "earningsOverview": "Earnings Overview",
    "earningsBreakdown": "Earnings Breakdown",
    "recentTransactions": "Recent Transactions",
    "transactionType": "Type",
    "details": "Details",
    "paymentMethod": "Payment Method",
    "paid": "Paid",
    "serviceBooking": "Service Booking",
    "productOrder": "Product Order"
  },
  "profile": {
    "myProfile": "My Profile",
    "personalInfo": "Personal Information",
    "businessInfo": "Business Information",
    "addresses": "Addresses",
    "addAddress": "Add New Address",
    "defaultAddress": "Default",
    "paymentMethods": "Payment Methods",
    "myReviews": "My Reviews",
    "notifications": "Notifications",
    "markAllRead": "Mark all as read",
    "noNotifications": "No notifications",
    "helpSupport": "Help & Support",
    "faq": "Frequently Asked Questions",
    "contactUs": "Contact Us",
    "subject": "Subject",
    "message": "Message",
    "editProfile": "Edit Profile",
    "saveChanges": "Save Changes",
    "updateProfile": "Update Profile",
    "changePhoto": "Change Photo",
    "profileUpdated": "Profile updated successfully!",
    "documents": "Documents",
    "verified": "Verified",
    "notVerified": "Not Verified",
    "aadharCard": "Aadhar Card",
    "panCard": "PAN Card",
    "drivingLicense": "Driving License",
    "bankDetails": "Bank Details",
    "businessName": "Business Name",
    "serviceCategory": "Service Category",
    "experience": "Experience",
    "serviceArea": "Service Area"
  },
  "admin": {
    "superAdmin": "Super Admin",
    "searchProvider": "Search provider...",
    "searchProduct": "Search product...",
    "pendingApproval": "Pending Approval",
    "approved": "Approved",
    "rejected": "Rejected",
    "allProviders": "All Providers",
    "providerDetails": "Provider Details",
    "serviceType": "Service Type",
    "registeredOn": "Registered On",
    "rejectionReason": "Reason for Rejection",
    "providerApproved": "Provider approved successfully!",
    "providerRejected": "Provider rejected",
    "productApproved": "Product approved successfully!",
    "productRejected": "Product rejected",
    "productDetails": "Product Details",
    "reports": "Reports & Analytics",
    "revenueGrowth": "Revenue Growth",
    "totalUsers": "Total Users",
    "dateRange": "Date Range",
    "bookingId": "Booking ID",
    "orderId": "Order ID"
  },
  "map": {
    "yourLocation": "Your Location",
    "searchLocation": "Search location...",
    "confirmLocation": "Confirm Location",
    "serviceRadius": "Service Radius",
    "nearbyServices": "Nearby Services"
  },
  "faq": {
    "q1": "How do I book a service?",
    "a1": "Browse services near you, select a service, choose your date and time, select a payment method, and confirm your booking.",
    "q2": "How do I track my booking?",
    "a2": "Go to My Bookings, select the booking, and click on 'Track' to see the real-time status and provider location.",
    "q3": "What payment methods are accepted?",
    "a3": "We accept UPI/Online payments, debit/credit cards, and cash on delivery.",
    "q4": "How do I cancel a booking?",
    "a4": "Go to My Bookings, select the booking, and click 'Cancel Booking'. Cancellation is free if done before the provider accepts.",
    "q5": "How do I become a service provider?",
    "a5": "Register as a service provider, upload your documents, and wait for admin approval. You'll be notified once approved.",
    "q6": "How do I contact support?",
    "a6": "Use the Help & Support page to submit a query, or call us at +91 1800-XXX-XXXX."
  }
}

src/i18n/kn.json — FULL FILE (must have the SAME keys as en.json, fully translated):
{
  "common": {
    "search": "ಹುಡುಕಿ",
    "filter": "ಫಿಲ್ಟರ್",
    "filters": "ಫಿಲ್ಟರ್‌ಗಳು",
    "sortBy": "ವಿಂಗಡಿಸಿ",
    "export": "ರಫ್ತು",
    "save": "ಉಳಿಸಿ",
    "cancel": "ರದ್ದುಮಾಡಿ",
    "delete": "ಅಳಿಸಿ",
    "edit": "ಸಂಪಾದಿಸಿ",
    "view": "ವೀಕ್ಷಿಸಿ",
    "close": "ಮುಚ್ಚಿ",
    "approve": "ಅನುಮೋದಿಸಿ",
    "reject": "ತಿರಸ್ಕರಿಸಿ",
    "confirm": "ದೃಢೀಕರಿಸಿ",
    "continue": "ಮುಂದುವರಿಸಿ",
    "loading": "ಲೋಡ್ ಆಗುತ್ತಿದೆ...",
    "noData": "ಯಾವುದೇ ಡೇಟಾ ಲಭ್ಯವಿಲ್ಲ",
    "viewAll": "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ",
    "back": "ಹಿಂದೆ",
    "next": "ಮುಂದೆ",
    "previous": "ಹಿಂದಿನ",
    "submit": "ಸಲ್ಲಿಸಿ",
    "status": "ಸ್ಥಿತಿ",
    "action": "ಕ್ರಮ",
    "actions": "ಕ್ರಮಗಳು",
    "amount": "ಮೊತ್ತ",
    "date": "ದಿನಾಂಕ",
    "time": "ಸಮಯ",
    "price": "ಬೆಲೆ",
    "total": "ಒಟ್ಟು",
    "logout": "ಲಾಗ್ ಔಟ್",
    "yes": "ಹೌದು",
    "no": "ಇಲ್ಲ",
    "ok": "ಸರಿ",
    "error": "ದೋಷ",
    "success": "ಯಶಸ್ಸು",
    "warning": "ಎಚ್ಚರಿಕೆ",
    "required": "ಈ ಕ್ಷೇತ್ರ ಅಗತ್ಯ",
    "invalidEmail": "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಇಮೇಲ್ ನಮೂದಿಸಿ",
    "invalidPhone": "ದಯವಿಟ್ಟು ಮಾನ್ಯ ಫೋನ್ ಸಂಖ್ಯೆ ನಮೂದಿಸಿ",
    "minChars": "ಕನಿಷ್ಠ {{min}} ಅಕ್ಷರಗಳು ಇರಬೇಕು",
    "maxChars": "ಗರಿಷ್ಠ {{max}} ಅಕ್ಷರಗಳು ಇರಬೇಕು",
    "passwordMismatch": "ಪಾಸ್‌ವರ್ಡ್‌ಗಳು ಹೊಂದಿಕೆಯಾಗುತ್ತಿಲ್ಲ",
    "somethingWentWrong": "ಏನೋ ತಪ್ಪಾಗಿದೆ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "networkError": "ನೆಟ್‌ವರ್ಕ್ ದೋಷ. ದಯವಿಟ್ಟು ನಿಮ್ಮ ಸಂಪರ್ಕ ಪರಿಶೀಲಿಸಿ.",
    "pageNotFound": "ಪುಟ ಕಂಡುಬಂದಿಲ್ಲ",
    "goHome": "ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ",
    "tryAgain": "ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    "confirmDelete": "ಇದನ್ನು ಅಳಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ?",
    "confirmReject": "ಇದನ್ನು ತಿರಸ್ಕರಿಸಲು ನೀವು ಖಚಿತವಾಗಿದ್ದೀರಾ?",
    "noResults": "ಯಾವುದೇ ಫಲಿತಾಂಶಗಳು ಕಂಡುಬಂದಿಲ್ಲ",
    "showing": "{{total}} ರಲ್ಲಿ {{from}}-{{to}} ತೋರಿಸಲಾಗುತ್ತಿದೆ",
    "perPage": "ಪ್ರತಿ ಪುಟಕ್ಕೆ",
    "all": "ಎಲ್ಲಾ",
    "phone": "ಫೋನ್",
    "email": "ಇಮೇಲ್",
    "name": "ಹೆಸರು",
    "description": "ವಿವರಣೆ",
    "category": "ವಿಭಾಗ",
    "address": "ವಿಳಾಸ",
    "city": "ನಗರ",
    "state": "ರಾಜ್ಯ",
    "pincode": "ಪಿನ್‌ಕೋಡ್",
    "online": "ಆನ್‌ಲೈನ್",
    "cash": "ನಗದು",
    "fromLastMonth": "ಕಳೆದ ತಿಂಗಳಿಂದ"
  },
  "auth": {
    "login": "ಲಾಗಿನ್",
    "register": "ನೋಂದಣಿ",
    "signIn": "ಸೈನ್ ಇನ್",
    "signUp": "ಸೈನ್ ಅಪ್",
    "email": "ಇಮೇಲ್ ವಿಳಾಸ",
    "password": "ಪಾಸ್‌ವರ್ಡ್",
    "confirmPassword": "ಪಾಸ್‌ವರ್ಡ್ ದೃಢೀಕರಿಸಿ",
    "firstName": "ಮೊದಲ ಹೆಸರು",
    "lastName": "ಕೊನೆಯ ಹೆಸರು",
    "phone": "ಫೋನ್ ಸಂಖ್ಯೆ",
    "forgotPassword": "ಪಾಸ್‌ವರ್ಡ್ ಮರೆತಿರಾ?",
    "resetPassword": "ಪಾಸ್‌ವರ್ಡ್ ಮರುಹೊಂದಿಸಿ",
    "noAccount": "ಖಾತೆ ಇಲ್ಲವೇ?",
    "hasAccount": "ಈಗಾಗಲೇ ಖಾತೆ ಇದೆಯೇ?",
    "registerAsFarmer": "ನಾನು ರೈತ",
    "registerAsProvider": "ನಾನು ಸೇವಾ ಪೂರೈಕೆದಾರ",
    "loginSuccess": "ಯಶಸ್ವಿಯಾಗಿ ಲಾಗಿನ್ ಆಗಿದೆ!",
    "registerSuccess": "ನೋಂದಣಿ ಯಶಸ್ವಿಯಾಗಿದೆ!",
    "invalidCredentials": "ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್",
    "accountPending": "ನಿಮ್ಮ ಖಾತೆ ಅನುಮೋದನೆಗೆ ಬಾಕಿ ಇದೆ. ಅನುಮೋದಿಸಿದ ನಂತರ ನಿಮಗೆ ತಿಳಿಸಲಾಗುವುದು.",
    "accountRejected": "ನಿಮ್ಮ ಖಾತೆ ಅರ್ಜಿಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ.",
    "accountLocked": "ಖಾತೆ ಲಾಕ್ ಆಗಿದೆ. {{minutes}} ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ.",
    "pendingReview": "ನಿಮ್ಮ ಅರ್ಜಿ ಪರಿಶೀಲನೆಯಲ್ಲಿದೆ",
    "pendingReviewDesc": "ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಪರಿಶೀಲಿಸಿ 24-48 ಗಂಟೆಗಳಲ್ಲಿ ತಿಳಿಸಲಾಗುವುದು.",
    "businessName": "ವ್ಯಾಪಾರದ ಹೆಸರು",
    "serviceCategories": "ಸೇವಾ ವಿಭಾಗಗಳು",
    "experience": "ಅನುಭವ (ವರ್ಷಗಳು)",
    "documents": "ದಾಖಲೆಗಳು",
    "uploadAadhar": "ಆಧಾರ್ ಕಾರ್ಡ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "uploadPAN": "ಪ್ಯಾನ್ ಕಾರ್ಡ್ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "uploadDrivingLicense": "ಚಾಲನಾ ಪರವಾನಗಿ ಅಪ್‌ಲೋಡ್ ಮಾಡಿ"
  },
  "nav": {
    "dashboard": "ಡ್ಯಾಶ್‌ಬೋರ್ಡ್",
    "farmers": "ರೈತರು",
    "serviceProviders": "ಸೇವಾ ಪೂರೈಕೆದಾರರು",
    "products": "ಉತ್ಪನ್ನಗಳು",
    "orders": "ಆರ್ಡರ್‌ಗಳು",
    "bookings": "ಬುಕಿಂಗ್‌ಗಳು",
    "payments": "ಪಾವತಿಗಳು",
    "reports": "ವರದಿಗಳು",
    "settings": "ಸೆಟ್ಟಿಂಗ್‌ಗಳು",
    "services": "ಸೇವೆಗಳು",
    "earnings": "ಗಳಿಕೆ",
    "reviews": "ವಿಮರ್ಶೆಗಳು",
    "messages": "ಸಂದೇಶಗಳು",
    "cart": "ಕಾರ್ಟ್",
    "helpSupport": "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ"
  },
  "dashboard": {
    "greeting": "ಶುಭ {{timeOfDay}}, {{name}}!",
    "morning": "ಬೆಳಿಗ್ಗೆ",
    "afternoon": "ಮಧ್ಯಾಹ್ನ",
    "evening": "ಸಂಜೆ",
    "whatToDo": "ಇಂದು ನೀವು ಏನನ್ನು ಬುಕ್ ಮಾಡಲು ಅಥವಾ ಖರೀದಿಸಲು ಬಯಸುತ್ತೀರಿ?",
    "bookService": "ಸೇವೆಯನ್ನು ಬುಕ್ ಮಾಡಿ",
    "bookServiceDesc": "ಟ್ರ್ಯಾಕ್ಟರ್, ಕಾರ್ಮಿಕ, ಉಪಕರಣ ಮತ್ತು ಹೆಚ್ಚಿನವು",
    "buyProducts": "ಉತ್ಪನ್ನಗಳನ್ನು ಖರೀದಿಸಿ",
    "buyProductsDesc": "ಬೀಜಗಳು, ರಸಗೊಬ್ಬರ, ಕೀಟನಾಶಕ ಮತ್ತು ಹೆಚ್ಚಿನವು",
    "bookNow": "ಈಗ ಬುಕ್ ಮಾಡಿ",
    "shopNow": "ಈಗ ಖರೀದಿಸಿ",
    "nearbyServices": "ಹತ್ತಿರದ ಸೇವೆಗಳು ({{radius}} ಕಿ.ಮೀ ಒಳಗೆ)",
    "popularCategories": "ಜನಪ್ರಿಯ ವಿಭಾಗಗಳು",
    "upcomingBookings": "ಮುಂಬರುವ ಬುಕಿಂಗ್‌ಗಳು",
    "recentOrders": "ಇತ್ತೀಚಿನ ಆರ್ಡರ್‌ಗಳು",
    "recentActivities": "ಇತ್ತೀಚಿನ ಚಟುವಟಿಕೆಗಳು",
    "topServices": "ಉತ್ತಮ ಸೇವೆಗಳು",
    "totalFarmers": "ಒಟ್ಟು ರೈತರು",
    "totalProviders": "ಒಟ್ಟು ಪೂರೈಕೆದಾರರು",
    "totalBookings": "ಒಟ್ಟು ಬುಕಿಂಗ್‌ಗಳು",
    "totalRevenue": "ಒಟ್ಟು ಆದಾಯ",
    "totalEarnings": "ಒಟ್ಟು ಗಳಿಕೆ",
    "totalOrders": "ಒಟ್ಟು ಆರ್ಡರ್‌ಗಳು",
    "averageRating": "ಸರಾಸರಿ ರೇಟಿಂಗ್",
    "reviews": "{{count}} ವಿಮರ್ಶೆಗಳು",
    "revenueOverview": "ಆದಾಯ ಅವಲೋಕನ",
    "bookingsOverview": "ಬುಕಿಂಗ್ ಅವಲೋಕನ",
    "earningsOverview": "ಗಳಿಕೆ ಅವಲೋಕನ",
    "bookingStatus": "ಬುಕಿಂಗ್ ಸ್ಥಿತಿ",
    "thisMonth": "ಈ ತಿಂಗಳು",
    "thisWeek": "ಈ ವಾರ",
    "thisYear": "ಈ ವರ್ಷ"
  },
  "services": {
    "title": "ಸೇವೆಗಳು",
    "allServices": "ಎಲ್ಲಾ ಸೇವೆಗಳು",
    "bookNow": "ಈಗ ಬುಕ್ ಮಾಡಿ",
    "viewDetails": "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "addService": "ಸೇವೆ ಸೇರಿಸಿ",
    "editService": "ಸೇವೆ ಸಂಪಾದಿಸಿ",
    "saveService": "ಸೇವೆ ಉಳಿಸಿ",
    "deleteService": "ಸೇವೆ ಅಳಿಸಿ",
    "serviceInfo": "ಸೇವಾ ಮಾಹಿತಿ",
    "serviceImages": "ಸೇವಾ ಚಿತ್ರಗಳು",
    "uploadImages": "ನಿಮ್ಮ ಸೇವೆಯ ಸ್ಪಷ್ಟ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "maxImages": "ಗರಿಷ್ಠ {{max}} ಚಿತ್ರಗಳು",
    "addMoreImages": "ಹೆಚ್ಚಿನ ಚಿತ್ರಗಳನ್ನು ಸೇರಿಸಿ",
    "serviceName": "ಸೇವೆಯ ಹೆಸರು",
    "serviceCategory": "ಸೇವಾ ವಿಭಾಗ",
    "capacity": "ಸಾಮರ್ಥ್ಯ / ವಿಶೇಷಣ",
    "rateType": "ದರ ಪ್ರಕಾರ",
    "discountPrice": "ರಿಯಾಯಿತಿ ಬೆಲೆ (ಐಚ್ಛಿಕ)",
    "aboutService": "ಸೇವೆಯ ಬಗ್ಗೆ",
    "specifications": "ವಿಶೇಷಣಗಳು",
    "provider": "ಪೂರೈಕೆದಾರ",
    "verifiedProvider": "ಪರಿಶೀಲಿಸಿದ ಪೂರೈಕೆದಾರ",
    "fuelType": "ಇಂಧನ ಪ್ರಕಾರ",
    "location": "ಸ್ಥಳ",
    "listView": "ಪಟ್ಟಿ ವೀಕ್ಷಣೆ",
    "mapView": "ನಕ್ಷೆ ವೀಕ್ಷಣೆ",
    "tractor": "ಟ್ರ್ಯಾಕ್ಟರ್",
    "labor": "ಕಾರ್ಮಿಕ",
    "equipment": "ಉಪಕರಣ",
    "irrigation": "ನೀರಾವರಿ",
    "harvesting": "ಕೊಯ್ಲು",
    "spraying": "ಸಿಂಪಡಣೆ",
    "rotavator": "ರೋಟವೇಟರ್",
    "waterTanker": "ನೀರಿನ ಟ್ಯಾಂಕರ್",
    "perHour": "/ ಗಂಟೆ",
    "perDay": "/ ದಿನ",
    "perTrip": "/ ಪ್ರಯಾಣ",
    "perAcre": "/ ಎಕರೆ",
    "kmAway": "{{distance}} ಕಿ.ಮೀ ದೂರ",
    "noServicesNearby": "ಹತ್ತಿರದಲ್ಲಿ ಯಾವುದೇ ಸೇವೆಗಳು ಕಂಡುಬಂದಿಲ್ಲ. ನಿಮ್ಮ ಹುಡುಕಾಟ ವ್ಯಾಪ್ತಿಯನ್ನು ವಿಸ್ತರಿಸಿ.",
    "serviceCreated": "ಸೇವೆ ಯಶಸ್ವಿಯಾಗಿ ರಚಿಸಲಾಗಿದೆ!",
    "serviceUpdated": "ಸೇವೆ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
    "serviceDeleted": "ಸೇವೆ ಯಶಸ್ವಿಯಾಗಿ ಅಳಿಸಲಾಗಿದೆ!"
  },
  "bookings": {
    "title": "ಬುಕಿಂಗ್‌ಗಳು",
    "myBookings": "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳು",
    "allBookings": "ಎಲ್ಲಾ ಬುಕಿಂಗ್‌ಗಳು",
    "newBooking": "ಹೊಸ ಬುಕಿಂಗ್",
    "bookingId": "ಬುಕಿಂಗ್ ಐಡಿ",
    "selectDate": "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ ಆಯ್ಕೆಮಾಡಿ",
    "selectTime": "ಸಮಯ ಆಯ್ಕೆಮಾಡಿ",
    "bookingDetails": "ಬುಕಿಂಗ್ ವಿವರಗಳು",
    "duration": "ಅವಧಿ",
    "totalAmount": "ಒಟ್ಟು ಮೊತ್ತ",
    "paymentMethod": "ಪಾವತಿ ವಿಧಾನ",
    "confirmBooking": "ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ",
    "bookingConfirmed": "ನಿಮ್ಮ ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಲಾಗಿದೆ!",
    "viewBooking": "ಬುಕಿಂಗ್ ವೀಕ್ಷಿಸಿ",
    "goToHome": "ಮುಖಪುಟಕ್ಕೆ ಹೋಗಿ",
    "cancelBooking": "ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ",
    "cancelReason": "ರದ್ದತಿಯ ಕಾರಣ",
    "bookingTracking": "ಬುಕಿಂಗ್ ಟ್ರ್ಯಾಕಿಂಗ್",
    "callProvider": "ಪೂರೈಕೆದಾರರಿಗೆ ಕರೆ ಮಾಡಿ",
    "chat": "ಚಾಟ್",
    "yourLocation": "ನಿಮ್ಮ ಸ್ಥಳ",
    "providerLocation": "ಪೂರೈಕೆದಾರರ ಸ್ಥಳ",
    "requested": "ವಿನಂತಿಸಲಾಗಿದೆ",
    "accepted": "ಸ್ವೀಕರಿಸಲಾಗಿದೆ",
    "confirmed": "ದೃಢೀಕರಿಸಲಾಗಿದೆ",
    "onTheWay": "ದಾರಿಯಲ್ಲಿ",
    "inProgress": "ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "completed": "ಪೂರ್ಣಗೊಂಡಿದೆ",
    "cancelled": "ರದ್ದುಮಾಡಲಾಗಿದೆ",
    "pending": "ಬಾಕಿ ಇದೆ",
    "requestSent": "ನಿಮ್ಮ ಬುಕಿಂಗ್ ವಿನಂತಿಯನ್ನು ಕಳುಹಿಸಲಾಗಿದೆ",
    "providerAccepted": "ಪೂರೈಕೆದಾರರು ನಿಮ್ಮ ವಿನಂತಿಯನ್ನು ಸ್ವೀಕರಿಸಿದ್ದಾರೆ",
    "providerOnWay": "ಪೂರೈಕೆದಾರರು ನಿಮ್ಮ ಸ್ಥಳಕ್ಕೆ ಬರುತ್ತಿದ್ದಾರೆ",
    "serviceInProgress": "ಸೇವೆ ಪ್ರಗತಿಯಲ್ಲಿದೆ",
    "serviceCompleted": "ಸೇವೆ ಪೂರ್ಣಗೊಂಡಿದೆ ಎಂದು ಗುರುತಿಸಲಾಗುತ್ತದೆ",
    "upiOnline": "ಯುಪಿಐ / ಆನ್‌ಲೈನ್",
    "cardPayment": "ಕಾರ್ಡ್ ಪಾವತಿ",
    "cashOnDelivery": "ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ",
    "paySecurely": "ಯುಪಿಐ ಬಳಸಿ ಸುರಕ್ಷಿತವಾಗಿ ಪಾವತಿಸಿ",
    "debitCredit": "ಡೆಬಿಟ್ / ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್",
    "payToProvider": "ಪೂರೈಕೆದಾರರಿಗೆ ಪಾವತಿಸಿ",
    "oneHour": "1 ಗಂಟೆ",
    "twoHours": "2 ಗಂಟೆಗಳು",
    "threeHours": "3 ಗಂಟೆಗಳು",
    "halfDay": "ಅರ್ಧ ದಿನ",
    "fullDay": "ಪೂರ್ಣ ದಿನ",
    "acceptBooking": "ಬುಕಿಂಗ್ ಸ್ವೀಕರಿಸಿ",
    "rejectBooking": "ಬುಕಿಂಗ್ ತಿರಸ್ಕರಿಸಿ",
    "updateStatus": "ಸ್ಥಿತಿ ನವೀಕರಿಸಿ",
    "bookingAccepted": "ಬುಕಿಂಗ್ ಸ್ವೀಕರಿಸಲಾಗಿದೆ!",
    "bookingRejected": "ಬುಕಿಂಗ್ ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    "bookingCancelled": "ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಲಾಗಿದೆ",
    "noBookings": "ಇನ್ನೂ ಯಾವುದೇ ಬುಕಿಂಗ್‌ಗಳಿಲ್ಲ",
    "farmer": "ರೈತ",
    "service": "ಸೇವೆ",
    "dateTime": "ದಿನಾಂಕ ಮತ್ತು ಸಮಯ",
    "payment": "ಪಾವತಿ"
  },
  "products": {
    "title": "ಉತ್ಪನ್ನಗಳು",
    "allProducts": "ಎಲ್ಲಾ ಉತ್ಪನ್ನಗಳು",
    "addProduct": "ಉತ್ಪನ್ನ ಸೇರಿಸಿ",
    "editProduct": "ಉತ್ಪನ್ನ ಸಂಪಾದಿಸಿ",
    "submitForApproval": "ಅನುಮೋದನೆಗೆ ಸಲ್ಲಿಸಿ",
    "productInfo": "ಉತ್ಪನ್ನ ಮಾಹಿತಿ",
    "productImages": "ಉತ್ಪನ್ನ ಚಿತ್ರಗಳು",
    "uploadImages": "ನಿಮ್ಮ ಉತ್ಪನ್ನದ ಸ್ಪಷ್ಟ ಚಿತ್ರಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ",
    "productName": "ಉತ್ಪನ್ನದ ಹೆಸರು",
    "brand": "ಬ್ರ್ಯಾಂಡ್",
    "stock": "ಸ್ಟಾಕ್",
    "unit": "ಘಟಕ",
    "deliveryRange": "ವಿತರಣಾ ವ್ಯಾಪ್ತಿ",
    "addToCart": "ಕಾರ್ಟ್‌ಗೆ ಸೇರಿಸಿ",
    "added": "ಸೇರಿಸಲಾಗಿದೆ",
    "buyNow": "ಈಗ ಖರೀದಿಸಿ",
    "inStock": "ಸ್ಟಾಕ್‌ನಲ್ಲಿದೆ ({{count}}+ ಲಭ್ಯ)",
    "outOfStock": "ಸ್ಟಾಕ್ ಖಾಲಿಯಾಗಿದೆ",
    "lowStock": "ಕೇವಲ {{count}} ಉಳಿದಿದೆ",
    "seeds": "ಬೀಜಗಳು",
    "fertilizers": "ರಸಗೊಬ್ಬರಗಳು",
    "pesticides": "ಕೀಟನಾಶಕಗಳು",
    "tools": "ಉಪಕರಣಗಳು",
    "irrigationEquipment": "ನೀರಾವರಿ",
    "equipmentCategory": "ಯಂತ್ರೋಪಕರಣ",
    "approvalPending": "ನಿಮ್ಮ ಉತ್ಪನ್ನ ಆಡಳಿತ ಅನುಮೋದನೆ ನಂತರ ರೈತರಿಗೆ ಕಾಣಿಸುತ್ತದೆ.",
    "productCreated": "ಉತ್ಪನ್ನವನ್ನು ಅನುಮೋದನೆಗೆ ಸಲ್ಲಿಸಲಾಗಿದೆ!",
    "productUpdated": "ಉತ್ಪನ್ನ ನವೀಕರಿಸಲಾಗಿದೆ!",
    "productDeleted": "ಉತ್ಪನ್ನ ಅಳಿಸಲಾಗಿದೆ!",
    "noProducts": "ಯಾವುದೇ ಉತ್ಪನ್ನಗಳು ಲಭ್ಯವಿಲ್ಲ"
  },
  "cart": {
    "myCart": "ನನ್ನ ಕಾರ್ಟ್ ({{count}} ವಸ್ತುಗಳು)",
    "emptyCart": "ನಿಮ್ಮ ಕಾರ್ಟ್ ಖಾಲಿಯಾಗಿದೆ",
    "continueShopping": "ಶಾಪಿಂಗ್ ಮುಂದುವರಿಸಿ",
    "subtotal": "ಉಪ ಮೊತ್ತ",
    "deliveryCharges": "ವಿತರಣಾ ಶುಲ್ಕ",
    "freeDelivery": "ಉಚಿತ",
    "totalAmount": "ಒಟ್ಟು ಮೊತ್ತ",
    "proceedToCheckout": "ಚೆಕ್‌ಔಟ್‌ಗೆ ಮುಂದುವರಿಯಿರಿ",
    "removeAll": "ಎಲ್ಲವನ್ನೂ ತೆಗೆದುಹಾಕಿ",
    "removeItem": "ತೆಗೆದುಹಾಕಿ",
    "quantity": "ಪ್ರಮಾಣ",
    "itemTotal": "ವಸ್ತುವಿನ ಒಟ್ಟು"
  },
  "checkout": {
    "checkout": "ಚೆಕ್‌ಔಟ್",
    "deliveryAddress": "ವಿತರಣಾ ವಿಳಾಸ",
    "change": "ಬದಲಿಸಿ",
    "paymentMethod": "ಪಾವತಿ ವಿಧಾನ",
    "orderSummary": "ಆರ್ಡರ್ ಸಾರಾಂಶ",
    "items": "ವಸ್ತುಗಳು ({{count}})",
    "placeOrder": "ಆರ್ಡರ್ ಮಾಡಿ",
    "orderConfirmed": "ನಿಮ್ಮ ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ!",
    "viewOrder": "ಆರ್ಡರ್ ವೀಕ್ಷಿಸಿ",
    "continueShopping": "ಶಾಪಿಂಗ್ ಮುಂದುವರಿಸಿ",
    "orderId": "ಆರ್ಡರ್ ಐಡಿ",
    "stockError": "ನಿಮ್ಮ ಕಾರ್ಟ್‌ನಲ್ಲಿರುವ ಕೆಲವು ವಸ್ತುಗಳು ವಿನಂತಿಸಿದ ಪ್ರಮಾಣದಲ್ಲಿ ಲಭ್ಯವಿಲ್ಲ."
  },
  "orders": {
    "title": "ಆರ್ಡರ್‌ಗಳು",
    "myOrders": "ನನ್ನ ಆರ್ಡರ್‌ಗಳು",
    "allOrders": "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳು",
    "orderId": "ಆರ್ಡರ್ ಐಡಿ",
    "orderDate": "ಆರ್ಡರ್ ದಿನಾಂಕ",
    "orderDetails": "ಆರ್ಡರ್ ವಿವರಗಳು",
    "viewDetails": "ವಿವರಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "viewAllOrders": "ಎಲ್ಲಾ ಆರ್ಡರ್‌ಗಳನ್ನು ವೀಕ್ಷಿಸಿ",
    "cancelOrder": "ಆರ್ಡರ್ ರದ್ದುಮಾಡಿ",
    "placed": "ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ",
    "shipped": "ರವಾನಿಸಲಾಗಿದೆ",
    "delivered": "ವಿತರಿಸಲಾಗಿದೆ",
    "orderPlaced": "ಆರ್ಡರ್ ಮಾಡಲಾಗಿದೆ",
    "orderShipped": "ಆರ್ಡರ್ ರವಾನಿಸಲಾಗಿದೆ",
    "orderDelivered": "ಆರ್ಡರ್ ವಿತರಿಸಲಾಗಿದೆ",
    "orderCancelled": "ಆರ್ಡರ್ ರದ್ದುಮಾಡಲಾಗಿದೆ",
    "noOrders": "ಇನ್ನೂ ಯಾವುದೇ ಆರ್ಡರ್‌ಗಳಿಲ್ಲ",
    "itemsCount": "{{count}} ವಸ್ತು",
    "itemsCount_other": "{{count}} ವಸ್ತುಗಳು"
  },
  "earnings": {
    "title": "ಗಳಿಕೆ",
    "totalEarnings": "ಒಟ್ಟು ಗಳಿಕೆ",
    "serviceEarnings": "ಸೇವಾ ಗಳಿಕೆ",
    "productEarnings": "ಉತ್ಪನ್ನ ಗಳಿಕೆ",
    "earningsOverview": "ಗಳಿಕೆ ಅವಲೋಕನ",
    "earningsBreakdown": "ಗಳಿಕೆ ವಿಭಜನೆ",
    "recentTransactions": "ಇತ್ತೀಚಿನ ವಹಿವಾಟುಗಳು",
    "transactionType": "ಪ್ರಕಾರ",
    "details": "ವಿವರಗಳು",
    "paymentMethod": "ಪಾವತಿ ವಿಧಾನ",
    "paid": "ಪಾವತಿಸಲಾಗಿದೆ",
    "serviceBooking": "ಸೇವಾ ಬುಕಿಂಗ್",
    "productOrder": "ಉತ್ಪನ್ನ ಆರ್ಡರ್"
  },
  "profile": {
    "myProfile": "ನನ್ನ ಪ್ರೊಫೈಲ್",
    "personalInfo": "ವೈಯಕ್ತಿಕ ಮಾಹಿತಿ",
    "businessInfo": "ವ್ಯಾಪಾರ ಮಾಹಿತಿ",
    "addresses": "ವಿಳಾಸಗಳು",
    "addAddress": "ಹೊಸ ವಿಳಾಸ ಸೇರಿಸಿ",
    "defaultAddress": "ಡೀಫಾಲ್ಟ್",
    "paymentMethods": "ಪಾವತಿ ವಿಧಾನಗಳು",
    "myReviews": "ನನ್ನ ವಿಮರ್ಶೆಗಳು",
    "notifications": "ಅಧಿಸೂಚನೆಗಳು",
    "markAllRead": "ಎಲ್ಲವನ್ನೂ ಓದಿದ ಎಂದು ಗುರುತಿಸಿ",
    "noNotifications": "ಯಾವುದೇ ಅಧಿಸೂಚನೆಗಳಿಲ್ಲ",
    "helpSupport": "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ",
    "faq": "ಪದೇ ಪದೇ ಕೇಳಲಾಗುವ ಪ್ರಶ್ನೆಗಳು",
    "contactUs": "ನಮ್ಮನ್ನು ಸಂಪರ್ಕಿಸಿ",
    "subject": "ವಿಷಯ",
    "message": "ಸಂದೇಶ",
    "editProfile": "ಪ್ರೊಫೈಲ್ ಸಂಪಾದಿಸಿ",
    "saveChanges": "ಬದಲಾವಣೆಗಳನ್ನು ಉಳಿಸಿ",
    "updateProfile": "ಪ್ರೊಫೈಲ್ ನವೀಕರಿಸಿ",
    "changePhoto": "ಫೋಟೋ ಬದಲಿಸಿ",
    "profileUpdated": "ಪ್ರೊಫೈಲ್ ಯಶಸ್ವಿಯಾಗಿ ನವೀಕರಿಸಲಾಗಿದೆ!",
    "documents": "ದಾಖಲೆಗಳು",
    "verified": "ಪರಿಶೀಲಿಸಲಾಗಿದೆ",
    "notVerified": "ಪರಿಶೀಲಿಸಲಾಗಿಲ್ಲ",
    "aadharCard": "ಆಧಾರ್ ಕಾರ್ಡ್",
    "panCard": "ಪ್ಯಾನ್ ಕಾರ್ಡ್",
    "drivingLicense": "ಚಾಲನಾ ಪರವಾನಗಿ",
    "bankDetails": "ಬ್ಯಾಂಕ್ ವಿವರಗಳು",
    "businessName": "ವ್ಯಾಪಾರದ ಹೆಸರು",
    "serviceCategory": "ಸೇವಾ ವಿಭಾಗ",
    "experience": "ಅನುಭವ",
    "serviceArea": "ಸೇವಾ ಪ್ರದೇಶ"
  },
  "admin": {
    "superAdmin": "ಸೂಪರ್ ಅಡ್ಮಿನ್",
    "searchProvider": "ಪೂರೈಕೆದಾರರನ್ನು ಹುಡುಕಿ...",
    "searchProduct": "ಉತ್ಪನ್ನ ಹುಡುಕಿ...",
    "pendingApproval": "ಅನುಮೋದನೆ ಬಾಕಿ",
    "approved": "ಅನುಮೋದಿಸಲಾಗಿದೆ",
    "rejected": "ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    "allProviders": "ಎಲ್ಲಾ ಪೂರೈಕೆದಾರರು",
    "providerDetails": "ಪೂರೈಕೆದಾರ ವಿವರಗಳು",
    "serviceType": "ಸೇವಾ ಪ್ರಕಾರ",
    "registeredOn": "ನೋಂದಣಿ ದಿನಾಂಕ",
    "rejectionReason": "ತಿರಸ್ಕಾರದ ಕಾರಣ",
    "providerApproved": "ಪೂರೈಕೆದಾರರನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅನುಮೋದಿಸಲಾಗಿದೆ!",
    "providerRejected": "ಪೂರೈಕೆದಾರರನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    "productApproved": "ಉತ್ಪನ್ನವನ್ನು ಯಶಸ್ವಿಯಾಗಿ ಅನುಮೋದಿಸಲಾಗಿದೆ!",
    "productRejected": "ಉತ್ಪನ್ನವನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    "productDetails": "ಉತ್ಪನ್ನ ವಿವರಗಳು",
    "reports": "ವರದಿಗಳು ಮತ್ತು ವಿಶ್ಲೇಷಣೆ",
    "revenueGrowth": "ಆದಾಯ ಬೆಳವಣಿಗೆ",
    "totalUsers": "ಒಟ್ಟು ಬಳಕೆದಾರರು",
    "dateRange": "ದಿನಾಂಕ ವ್ಯಾಪ್ತಿ",
    "bookingId": "ಬುಕಿಂಗ್ ಐಡಿ",
    "orderId": "ಆರ್ಡರ್ ಐಡಿ"
  },
  "map": {
    "yourLocation": "ನಿಮ್ಮ ಸ್ಥಳ",
    "searchLocation": "ಸ್ಥಳ ಹುಡುಕಿ...",
    "confirmLocation": "ಸ್ಥಳ ದೃಢೀಕರಿಸಿ",
    "serviceRadius": "ಸೇವಾ ವ್ಯಾಪ್ತಿ",
    "nearbyServices": "ಹತ್ತಿರದ ಸೇವೆಗಳು"
  },
  "faq": {
    "q1": "ಸೇವೆಯನ್ನು ಹೇಗೆ ಬುಕ್ ಮಾಡುವುದು?",
    "a1": "ನಿಮ್ಮ ಹತ್ತಿರದ ಸೇವೆಗಳನ್ನು ಬ್ರೌಸ್ ಮಾಡಿ, ಸೇವೆಯನ್ನು ಆಯ್ಕೆಮಾಡಿ, ದಿನಾಂಕ ಮತ್ತು ಸಮಯ ಆಯ್ಕೆಮಾಡಿ, ಪಾವತಿ ವಿಧಾನ ಆಯ್ಕೆಮಾಡಿ, ಮತ್ತು ಬುಕಿಂಗ್ ದೃಢೀಕರಿಸಿ.",
    "q2": "ನನ್ನ ಬುಕಿಂಗ್ ಅನ್ನು ಹೇಗೆ ಟ್ರ್ಯಾಕ್ ಮಾಡುವುದು?",
    "a2": "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳಿಗೆ ಹೋಗಿ, ಬುಕಿಂಗ್ ಆಯ್ಕೆಮಾಡಿ, ಮತ್ತು ನೈಜ-ಸಮಯದ ಸ್ಥಿತಿ ಮತ್ತು ಪೂರೈಕೆದಾರ ಸ್ಥಳ ನೋಡಲು 'ಟ್ರ್ಯಾಕ್' ಕ್ಲಿಕ್ ಮಾಡಿ.",
    "q3": "ಯಾವ ಪಾವತಿ ವಿಧಾನಗಳನ್ನು ಸ್ವೀಕರಿಸಲಾಗುತ್ತದೆ?",
    "a3": "ನಾವು ಯುಪಿಐ/ಆನ್‌ಲೈನ್ ಪಾವತಿಗಳು, ಡೆಬಿಟ್/ಕ್ರೆಡಿಟ್ ಕಾರ್ಡ್‌ಗಳು, ಮತ್ತು ಕ್ಯಾಶ್ ಆನ್ ಡೆಲಿವರಿ ಸ್ವೀಕರಿಸುತ್ತೇವೆ.",
    "q4": "ಬುಕಿಂಗ್ ಅನ್ನು ಹೇಗೆ ರದ್ದುಮಾಡುವುದು?",
    "a4": "ನನ್ನ ಬುಕಿಂಗ್‌ಗಳಿಗೆ ಹೋಗಿ, ಬುಕಿಂಗ್ ಆಯ್ಕೆಮಾಡಿ, ಮತ್ತು 'ಬುಕಿಂಗ್ ರದ್ದುಮಾಡಿ' ಕ್ಲಿಕ್ ಮಾಡಿ. ಪೂರೈಕೆದಾರರು ಸ್ವೀಕರಿಸುವ ಮೊದಲು ರದ್ದತಿ ಉಚಿತ.",
    "q5": "ಸೇವಾ ಪೂರೈಕೆದಾರರಾಗಲು ಹೇಗೆ?",
    "a5": "ಸೇವಾ ಪೂರೈಕೆದಾರರಾಗಿ ನೋಂದಾಯಿಸಿ, ನಿಮ್ಮ ದಾಖಲೆಗಳನ್ನು ಅಪ್‌ಲೋಡ್ ಮಾಡಿ, ಮತ್ತು ಆಡಳಿತ ಅನುಮೋದನೆಗಾಗಿ ಕಾಯಿರಿ. ಅನುಮೋದಿಸಿದ ನಂತರ ನಿಮಗೆ ತಿಳಿಸಲಾಗುವುದು.",
    "q6": "ಬೆಂಬಲವನ್ನು ಹೇಗೆ ಸಂಪರ್ಕಿಸುವುದು?",
    "a6": "ಸಹಾಯ ಮತ್ತು ಬೆಂಬಲ ಪುಟದಲ್ಲಿ ಪ್ರಶ್ನೆ ಸಲ್ಲಿಸಿ, ಅಥವಾ +91 1800-XXX-XXXX ಗೆ ಕರೆ ಮಾಡಿ."
  }
}

### 7. Backend i18n for API Errors and Notifications

The backend must also support translated responses. Create apps/server/src/i18n/errors.ts:

export const API_ERRORS = {
  en: {
    INVALID_CREDENTIALS: "Invalid email or password",
    ACCOUNT_PENDING: "Your account is pending approval",
    ACCOUNT_REJECTED: "Your account was rejected",
    ACCOUNT_LOCKED: "Account locked. Try again in {{minutes}} minutes",
    EMAIL_EXISTS: "An account with this email already exists",
    PHONE_EXISTS: "An account with this phone number already exists",
    SERVICE_NOT_FOUND: "Service not found",
    BOOKING_CONFLICT: "This time slot is already booked",
    INSUFFICIENT_STOCK: "Insufficient stock for {{productName}}",
    ORDER_CANCEL_NOT_ALLOWED: "Only placed orders can be cancelled",
    BOOKING_CANCEL_NOT_ALLOWED: "This booking cannot be cancelled",
    UNAUTHORIZED: "Please login to continue",
    FORBIDDEN: "You don't have permission to perform this action",
    FILE_TOO_LARGE: "File size must be less than 5MB",
    INVALID_FILE_TYPE: "Only JPEG, PNG, and WebP files are allowed",
    RATE_LIMITED: "Too many requests. Please try again later",
  },
  kn: {
    INVALID_CREDENTIALS: "ಅಮಾನ್ಯ ಇಮೇಲ್ ಅಥವಾ ಪಾಸ್‌ವರ್ಡ್",
    ACCOUNT_PENDING: "ನಿಮ್ಮ ಖಾತೆ ಅನುಮೋದನೆಗೆ ಬಾಕಿ ಇದೆ",
    ACCOUNT_REJECTED: "ನಿಮ್ಮ ಖಾತೆಯನ್ನು ತಿರಸ್ಕರಿಸಲಾಗಿದೆ",
    ACCOUNT_LOCKED: "ಖಾತೆ ಲಾಕ್ ಆಗಿದೆ. {{minutes}} ನಿಮಿಷಗಳ ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
    EMAIL_EXISTS: "ಈ ಇಮೇಲ್‌ನೊಂದಿಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ",
    PHONE_EXISTS: "ಈ ಫೋನ್ ಸಂಖ್ಯೆಯೊಂದಿಗೆ ಖಾತೆ ಈಗಾಗಲೇ ಇದೆ",
    SERVICE_NOT_FOUND: "ಸೇವೆ ಕಂಡುಬಂದಿಲ್ಲ",
    BOOKING_CONFLICT: "ಈ ಸಮಯದ ಸ್ಲಾಟ್ ಈಗಾಗಲೇ ಬುಕ್ ಆಗಿದೆ",
    INSUFFICIENT_STOCK: "{{productName}} ಗೆ ಸಾಕಷ್ಟು ಸ್ಟಾಕ್ ಇಲ್ಲ",
    ORDER_CANCEL_NOT_ALLOWED: "ಆರ್ಡರ್ ಮಾಡಿದ ಆರ್ಡರ್‌ಗಳನ್ನು ಮಾತ್ರ ರದ್ದುಮಾಡಬಹುದು",
    BOOKING_CANCEL_NOT_ALLOWED: "ಈ ಬುಕಿಂಗ್ ಅನ್ನು ರದ್ದುಮಾಡಲಾಗುವುದಿಲ್ಲ",
    UNAUTHORIZED: "ಮುಂದುವರಿಸಲು ದಯವಿಟ್ಟು ಲಾಗಿನ್ ಆಗಿ",
    FORBIDDEN: "ಈ ಕ್ರಿಯೆಯನ್ನು ನಿರ್ವಹಿಸಲು ನಿಮಗೆ ಅನುಮತಿ ಇಲ್ಲ",
    FILE_TOO_LARGE: "ಫೈಲ್ ಗಾತ್ರ 5MB ಗಿಂತ ಕಡಿಮೆ ಇರಬೇಕು",
    INVALID_FILE_TYPE: "JPEG, PNG, ಮತ್ತು WebP ಫೈಲ್‌ಗಳನ್ನು ಮಾತ್ರ ಅನುಮತಿಸಲಾಗಿದೆ",
    RATE_LIMITED: "ತುಂಬಾ ಹೆಚ್ಚು ವಿನಂತಿಗಳು. ದಯವಿಟ್ಟು ನಂತರ ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ",
  }
};

// Usage in error handler:
// const lang = req.user?.preferredLanguage === 'KN' ? 'kn' : 'en';
// const message = API_ERRORS[lang][errorCode] || API_ERRORS.en[errorCode];

Backend reads Accept-Language header or user's preferredLanguage from JWT payload to determine which language to return error messages in.

### 8. Email Template i18n

Email templates in apps/server/src/templates/emails/ must have both language versions.
File naming: welcome.en.html and welcome.kn.html
Select template based on user's preferredLanguage field in database.

### 9. SMS Template i18n

SMS messages must be in the user's preferred language:
- English: "Booking BK1256 confirmed for Tractor Service on 20 May at 10:00 AM. Amount: Rs.2,400"
- Kannada: "ಬುಕಿಂಗ್ BK1256 ಟ್ರ್ಯಾಕ್ಟರ್ ಸೇವೆಗೆ 20 ಮೇ 10:00 AM ಕ್ಕೆ ದೃಢೀಕರಿಸಲಾಗಿದೆ. ಮೊತ್ತ: Rs.2,400"

### 10. Responsive Design Requirements

Breakpoints (Tailwind defaults):
- sm: 640px (mobile landscape)
- md: 768px (tablet)
- lg: 1024px (desktop)
- xl: 1280px (wide desktop)

Sidebar Behavior:
- Desktop (lg+): Fixed sidebar, always visible, 260px width
- Tablet (md): Collapsed sidebar (icons only, 72px width), expand on hover
- Mobile (below md): Hidden sidebar, hamburger button opens overlay sidebar with backdrop

Dashboard Cards: Desktop 4 in a row, Tablet 2x2, Mobile single column
Data Tables: Desktop full table, Tablet hide less important columns, Mobile card layout
Forms: Desktop two columns, Mobile single column
Product Grid: Desktop 4 columns, Tablet 3, Mobile 2
Map Views: Desktop side-by-side, Mobile full-screen with bottom sheet
Service Detail: Desktop gallery left + info right, Mobile stacked

### Technical Requirements:
1. Use useTranslation() hook in EVERY component with user-facing text — no hardcoded strings anywhere
2. Locale-aware date formatting with date-fns kn locale
3. Number/currency formatting using Intl.NumberFormat with 'kn-IN' and 'en-IN' locales
4. Translation keys follow dot notation: t('services.bookNow')
5. Pluralization: t('orders.itemsCount', { count: 3 }) uses _other suffix
6. Language switch persists via localStorage AND user profile API call
7. All form validation errors use translation keys from common.required, common.invalidEmail etc.
8. All toast messages use translation keys
9. Document title updates on language switch: document.title = t('nav.dashboard') + ' | Krishi Connect'
10. Noto Sans Kannada font loaded with font-display: swap for performance
11. Backend API error messages translated based on Accept-Language header or user preference
12. Email and SMS templates bilingual

Generate the COMPLETE en.json (150+ keys) and kn.json (EXACT SAME 150+ keys fully translated) files. Generate the i18n config with Intl.NumberFormat integration. Generate the LanguageSwitcher component. Generate the formatters utility. Generate the backend error translations. Update ALL existing components to use t() instead of hardcoded strings. Generate all responsive Tailwind changes.
```

---

<a id="phase-16"></a>
## Phase 16 — Real-Time WebSocket, Background Jobs & Payment Gateway

```
You are continuing the "Krishi Connect" PERN stack project. Now add the critical production infrastructure: WebSocket for real-time updates, BullMQ for background job processing, and Razorpay for actual payment collection.

### 1. WebSocket with Socket.IO

Production apps do NOT poll for booking status, notifications, or chat. Implement Socket.IO:

**Install:**
```bash
pnpm add socket.io socket.io-client @socket.io/redis-adapter
```

**Server Setup (apps/server/src/config/socket.ts):**
```typescript
// 1. Create Socket.IO server attached to the Express HTTP server
// 2. Use Redis adapter (@socket.io/redis-adapter) so multiple server instances share the same event bus — this is REQUIRED for horizontal scaling
// 3. Authenticate socket connections using the JWT access token passed in auth.token handshake
// 4. Join sockets to rooms based on role and userId:
//    - `user:${userId}` — personal notifications
//    - `provider:${providerId}` — provider-specific events
//    - `booking:${bookingId}` — live tracking for a specific booking
//    - `admin` — admin dashboard real-time updates

// Namespace: /notifications, /tracking, /chat
```

**Events to Emit (server → client):**

| Event | Namespace | Room | Trigger |
|-------|-----------|------|---------|
| `booking:new` | /notifications | `provider:${id}` | Farmer creates a booking |
| `booking:status` | /notifications | `user:${farmerId}` | Provider accepts/rejects/updates booking |
| `booking:location` | /tracking | `booking:${id}` | Provider sends GPS update |
| `order:status` | /notifications | `user:${farmerId}` | Order shipped/delivered |
| `approval:status` | /notifications | `user:${providerId}` | Admin approves/rejects provider/product |
| `notification:new` | /notifications | `user:${userId}` | Any new notification |
| `stats:update` | /notifications | `admin` | Dashboard stat changes |
| `chat:message` | /chat | `chat:${conversationId}` | New chat message |

**Frontend Socket Hook (apps/web/src/hooks/useSocket.ts):**
```typescript
// 1. Connect on login, disconnect on logout
// 2. Pass accessToken in handshake auth
// 3. Reconnect automatically with exponential backoff
// 4. Listen for events and update TanStack Query cache directly:
//    - On `booking:status` → invalidate bookings query
//    - On `notification:new` → increment unread count in Zustand, show toast
//    - On `booking:location` → update marker position on tracking map
// 5. DO NOT duplicate data fetching — socket events should trigger cache invalidation, not replace API calls
```

**Booking Tracking Real-Time Flow:**
```
Provider App:
  1. Provider navigates to active booking
  2. Browser Geolocation API watches position
  3. Every 10 seconds: emit 'tracking:location' → { bookingId, lat, lng }

Server:
  1. Receives location event
  2. Stores in Redis (not database) as `tracking:${bookingId}` with 60s TTL
  3. Broadcasts to room `booking:${bookingId}`

Farmer App:
  1. Farmer opens tracking page
  2. Joins room `booking:${bookingId}`
  3. Receives location updates, smoothly animates marker using Leaflet
  4. When booking completes, leave room
```

### 2. Background Job Queue with BullMQ

Things that MUST NOT block HTTP request threads:

**Install:**
```bash
pnpm add bullmq
```

**Queue Architecture (apps/server/src/queues/):**

```
queues/
├── index.ts              # Queue registry, shared connection
├── email.queue.ts        # Email sending jobs
├── sms.queue.ts          # SMS notification jobs
├── notification.queue.ts # Push notification + in-app notification creation
├── image.queue.ts        # Image resize/optimize after upload
├── report.queue.ts       # Generate CSV/PDF reports async
└── workers/
    ├── email.worker.ts
    ├── sms.worker.ts
    ├── notification.worker.ts
    ├── image.worker.ts
    └── report.worker.ts
```

**Jobs:**

| Queue | Job | Trigger | Processing |
|-------|-----|---------|------------|
| `email` | Welcome email | User registration | Send via Nodemailer/Resend |
| `email` | Booking confirmation | Booking created/confirmed | Email with booking details |
| `email` | Order confirmation | Order placed | Email with order summary |
| `email` | Password reset | Forgot password request | Email with reset link |
| `sms` | OTP verification | Registration/login | Send via Twilio/MSG91 |
| `sms` | Booking status | Status change | SMS to farmer |
| `notification` | In-app notification | Any event | Create Notification record + emit socket |
| `image` | Resize & optimize | Image uploaded | sharp: resize to 800px, 400px, 100px thumbnails + WebP conversion |
| `report` | CSV export | Admin clicks export | Generate CSV, store temporarily, return download URL |

**Job Configuration:**
```typescript
// All queues use the same Redis connection
// Default job options:
{
  attempts: 3,
  backoff: { type: 'exponential', delay: 2000 },
  removeOnComplete: { count: 1000, age: 24 * 3600 },
  removeOnFail: { count: 5000, age: 7 * 24 * 3600 }
}
```

**Admin Dashboard: BullMQ Board**
- Mount Bull Board UI at /admin/queues (protected by admin auth)
- Shows active/waiting/completed/failed jobs per queue
- Allows retry of failed jobs

### 3. Razorpay Payment Gateway Integration

**Install:**
```bash
pnpm add razorpay
```

**Environment Variables:**
```
RAZORPAY_KEY_ID=rzp_test_xxxxx
RAZORPAY_KEY_SECRET=xxxxx
RAZORPAY_WEBHOOK_SECRET=xxxxx
```

**Payment Flow:**

```
Step 1: Create Order (Server)
  POST /api/payments/create-order
  body: { amount, currency: "INR", bookingId? orderId?, type: "BOOKING" | "ORDER" }
  → Create Razorpay order via razorpay.orders.create()
  → Store in Payment table with status PENDING
  → Return { razorpayOrderId, amount, currency, key: RAZORPAY_KEY_ID }

Step 2: Collect Payment (Frontend)
  → Open Razorpay Checkout modal with the order details
  → User completes payment (UPI/Card/Netbanking)
  → Razorpay returns: { razorpay_payment_id, razorpay_order_id, razorpay_signature }

Step 3: Verify Payment (Server)
  POST /api/payments/verify
  body: { razorpay_payment_id, razorpay_order_id, razorpay_signature }
  → Verify signature using HMAC SHA256
  → Update Payment record: status=PAID, transactionId=razorpay_payment_id
  → Update Booking/Order paymentStatus=PAID
  → Emit socket event for confirmation
  → Queue email/SMS confirmation

Step 4: Webhook (Server — Fallback)
  POST /api/payments/webhook
  → Razorpay sends events for payment.captured, payment.failed, refund.processed
  → Verify webhook signature
  → Update payment status (handles cases where frontend verify call fails)
```

**Idempotency:**
```typescript
// CRITICAL: Prevent double payments and duplicate orders

// 1. Idempotency Key Middleware:
//    - Client sends X-Idempotency-Key header (UUID generated on frontend)
//    - Server stores key in Redis: `idempotency:${key}` with 24h TTL
//    - If key exists: return the cached response (don't process again)
//    - If key doesn't exist: process request, store response in Redis

// 2. Apply to these endpoints:
//    - POST /api/payments/create-order
//    - POST /api/payments/verify
//    - POST /api/farmer/bookings
//    - POST /api/farmer/orders

// Implementation:
app.post('/api/farmer/orders', 
  auth, 
  rbac('FARMER'), 
  idempotencyCheck,  // ← checks Redis for duplicate
  validate(orderSchema),
  orderController.create
);
```

**Refund Flow:**
```
POST /api/payments/:id/refund
  body: { reason }
  → Only for PAID bookings/orders that are CANCELLED
  → Call razorpay.payments.refund(paymentId, { amount })
  → Update Payment status=REFUNDED
  → Queue notification to user
```

**Frontend Payment Component (apps/web/src/components/payment/RazorpayCheckout.tsx):**
```typescript
// 1. Load Razorpay checkout script dynamically
// 2. Open Razorpay modal with order details
// 3. Handle success/failure callbacks
// 4. Show loading state during verification
// 5. Redirect to confirmation page on success
// 6. Show retry option on failure
```

**Cash Payment Flow:**
- If paymentMethod is CASH:
  - Skip Razorpay entirely
  - Create booking/order with paymentStatus=PENDING
  - Provider marks payment as collected after service completion
  - PUT /api/provider/bookings/:id/collect-payment → updates paymentStatus=PAID

### Backend API Endpoints:

```
POST   /api/payments/create-order          (create Razorpay order)
POST   /api/payments/verify                (verify payment signature)
POST   /api/payments/webhook               (Razorpay webhook — no auth middleware, verify via signature)
POST   /api/payments/:id/refund            (initiate refund)
GET    /api/payments/history               (user's payment history)
PUT    /api/provider/bookings/:id/collect-payment  (mark cash payment collected)
```

### 4. Graceful Shutdown

```typescript
// apps/server/src/index.ts

// Handle SIGTERM and SIGINT:
// 1. Stop accepting new connections (server.close())
// 2. Close Socket.IO connections gracefully
// 3. Wait for in-flight requests to complete (max 30s timeout)
// 4. Close BullMQ workers (worker.close())
// 5. Close Redis connections
// 6. Disconnect Prisma ($disconnect)
// 7. Exit process

// This prevents dropped requests during deployments
```

### Dependencies Summary:
```bash
pnpm add socket.io @socket.io/redis-adapter bullmq razorpay nodemailer
pnpm add -D @types/nodemailer
# Frontend:
cd apps/web && pnpm add socket.io-client
```

Generate ALL files completely. WebSocket must work with Redis adapter for horizontal scaling. BullMQ workers must handle failures with retries. Razorpay must include webhook verification. Idempotency middleware must prevent duplicate transactions.
```

---

<a id="phase-17"></a>
## Phase 17 — Testing (Unit, Integration & E2E)

```
You are continuing the "Krishi Connect" PERN stack project. Now add a comprehensive testing strategy. A production app without tests is NOT production-grade.

### Testing Stack:

**Backend:**
- Vitest (test runner — same config as Vite, faster than Jest)
- Supertest (HTTP integration testing)
- Prisma test setup with isolated test database
- Redis mock or test Redis instance

**Frontend:**
- Vitest + React Testing Library (component testing)
- MSW (Mock Service Worker) for API mocking
- Playwright (E2E testing)

**Install:**
```bash
# Backend
cd apps/server && pnpm add -D vitest supertest @types/supertest @faker-js/faker

# Frontend
cd apps/web && pnpm add -D vitest @testing-library/react @testing-library/jest-dom @testing-library/user-event msw jsdom @playwright/test
```

### 1. Backend Unit Tests

**Directory: apps/server/src/__tests__/unit/**

Test files to create:

```
__tests__/
├── unit/
│   ├── utils/
│   │   ├── geolocation.test.ts      # Haversine formula accuracy
│   │   ├── pagination.test.ts       # Pagination helper
│   │   ├── jwt.test.ts              # Token generation/verification
│   │   └── password.test.ts         # Hash/verify
│   ├── validators/
│   │   ├── auth.test.ts             # Registration/login validation schemas
│   │   ├── booking.test.ts          # Booking creation validation
│   │   ├── product.test.ts          # Product creation validation
│   │   └── order.test.ts            # Order creation validation
│   └── middleware/
│       ├── auth.test.ts             # JWT middleware (mock req/res/next)
│       ├── rbac.test.ts             # Role guard (different roles)
│       └── rateLimiter.test.ts      # Rate limit logic
├── integration/
│   ├── setup.ts                     # Test DB setup, seed, cleanup
│   ├── auth.test.ts                 # Full auth flow
│   ├── admin/
│   │   ├── providers.test.ts        # Provider approval/rejection
│   │   ├── products.test.ts         # Product approval
│   │   └── dashboard.test.ts        # Stats endpoints
│   ├── provider/
│   │   ├── services.test.ts         # CRUD services
│   │   ├── bookings.test.ts         # Accept/reject/status update
│   │   └── earnings.test.ts         # Earnings calculation
│   └── farmer/
│       ├── services.test.ts         # Service discovery, distance filter
│       ├── bookings.test.ts         # Create booking, cancel
│       ├── orders.test.ts           # Place order, stock decrement
│       └── cart.test.ts             # Cart operations
└── e2e/                             # Playwright (separate)
```

**Test Database Setup (apps/server/src/__tests__/integration/setup.ts):**
```typescript
// 1. Use a separate test database: DATABASE_URL with _test suffix
// 2. Before all: run prisma migrate deploy on test DB
// 3. Before each test suite: seed minimal data with @faker-js/faker
// 4. After each test suite: truncate all tables (cascade)
// 5. After all: disconnect Prisma

// Helper: createTestUser(role: Role) → { user, accessToken }
// Helper: createTestProvider(approved: boolean) → { provider, user, token }
// Helper: createTestFarmer() → { farmer, user, token }
// Helper: createTestService(providerId) → { service }
// Helper: createTestProduct(providerId) → { product }
// Helper: authenticatedRequest(token) → supertest agent with auth header
```

**Critical Integration Tests:**

```typescript
// auth.test.ts
describe('Authentication', () => {
  it('registers a farmer and returns tokens');
  it('registers a provider with PENDING status');
  it('rejects login for pending provider with specific error');
  it('rejects login for rejected provider');
  it('logs in approved provider successfully');
  it('refreshes an expired access token');
  it('rejects blacklisted access token after logout');
  it('rate-limits login after 5 failed attempts');
  it('prevents duplicate email registration');
  it('prevents duplicate phone registration');
});

// farmer/bookings.test.ts
describe('Farmer Bookings', () => {
  it('creates a booking with correct total amount calculation');
  it('rejects booking for inactive service');
  it('rejects booking for unapproved provider');
  it('prevents double-booking same provider at same time');
  it('creates BookingTracking entry on booking creation');
  it('creates notification for provider on new booking');
  it('cancels a REQUESTED booking and creates tracking entry');
  it('rejects cancellation of COMPLETED booking');
  it('returns available time slots excluding booked times');
  it('idempotency: duplicate request with same key returns same response');
});

// farmer/orders.test.ts
describe('Farmer Orders', () => {
  it('places order and decrements product stock');
  it('rejects order when product stock insufficient');
  it('rejects order for unapproved products');
  it('calculates delivery charges correctly (free above ₹500)');
  it('cancels order and restores stock');
  it('processes order creation in a transaction (rolls back on failure)');
  it('idempotency: duplicate order request returns same order');
});

// farmer/services.test.ts
describe('Service Discovery', () => {
  it('returns only services within specified radius');
  it('calculates distance correctly using Haversine');
  it('filters by category');
  it('sorts by distance ascending');
  it('sorts by price ascending');
  it('excludes services from unapproved providers');
  it('excludes inactive services');
  it('paginates results correctly');
});

// admin/providers.test.ts
describe('Admin Provider Management', () => {
  it('lists providers filtered by approval status');
  it('approves a pending provider');
  it('rejects a provider with reason');
  it('creates notification on approval');
  it('creates notification on rejection');
  it('returns 403 for non-admin users');
  it('paginates and searches providers');
});

// payments.test.ts
describe('Payments', () => {
  it('creates Razorpay order for booking');
  it('verifies payment signature correctly');
  it('rejects invalid payment signature');
  it('updates booking payment status on verification');
  it('processes webhook event for payment.captured');
  it('verifies webhook signature');
  it('initiates refund for cancelled paid booking');
  it('prevents refund for unpaid booking');
});
```

### 2. Frontend Component Tests

**Directory: apps/web/src/__tests__/**

```
__tests__/
├── components/
│   ├── StatsCard.test.tsx           # Renders value with Indian formatting
│   ├── StatusBadge.test.tsx         # Correct color per status
│   ├── DataTable.test.tsx           # Pagination, sorting, filtering
│   ├── SearchBar.test.tsx           # Debounce, clear, submit
│   ├── ImageUploader.test.tsx       # Drag/drop, preview, remove
│   └── Pagination.test.tsx          # Page changes, disabled states
├── pages/
│   ├── LoginPage.test.tsx           # Form validation, submit, error display
│   ├── RegisterPage.test.tsx        # Role toggle, provider extra fields
│   ├── FarmerDashboard.test.tsx     # Stats render, greeting by time of day
│   └── CartPage.test.tsx            # Add/remove items, quantity, totals
├── stores/
│   ├── authStore.test.ts            # Login/logout state transitions
│   └── cartStore.test.ts            # Add/remove/update/clear, persistence
├── hooks/
│   ├── useAuth.test.ts              # Token refresh logic
│   └── useDebounce.test.ts          # Timing behavior
└── utils/
    └── formatters.test.ts           # Indian number format, date format, currency
```

**MSW Setup (apps/web/src/__tests__/mocks/):**
```typescript
// handlers.ts — mock API responses for all endpoints used in tests
// server.ts — setup MSW server for tests
// Every handler returns realistic data matching the API contract
```

**Key Frontend Tests:**
```typescript
// CartPage.test.tsx
describe('Cart Page', () => {
  it('renders all cart items with correct prices');
  it('updates quantity and recalculates subtotal');
  it('removes item and updates total');
  it('shows empty state when cart is empty');
  it('calculates delivery charges (₹60 if subtotal < ₹500, free otherwise)');
  it('navigates to checkout on button click');
});

// LoginPage.test.tsx
describe('Login Page', () => {
  it('shows validation errors for empty fields');
  it('shows server error message for invalid credentials');
  it('shows "pending approval" message for pending providers');
  it('redirects admin to /admin/dashboard after login');
  it('redirects farmer to /farmer/dashboard after login');
  it('stores tokens in auth store on success');
});

// formatters.test.ts
describe('Indian Number Formatting', () => {
  it('formats 1875000 as "18,75,000"');
  it('formats 120 as "120"');
  it('formats 2400 as "2,400"');
  it('adds ₹ prefix for currency format');
});
```

### 3. E2E Tests with Playwright

**Directory: apps/web/e2e/**

```
e2e/
├── playwright.config.ts
├── fixtures/
│   └── auth.ts                  # Login helper, authenticated page
├── farmer/
│   ├── booking-flow.spec.ts     # Full booking: browse → book → confirm
│   ├── order-flow.spec.ts       # Full order: browse → cart → checkout
│   └── service-discovery.spec.ts # Search, filter, sort services
├── provider/
│   ├── service-crud.spec.ts     # Add/edit/delete service
│   └── booking-management.spec.ts # Accept/reject booking
├── admin/
│   ├── provider-approval.spec.ts  # Approve/reject provider
│   └── dashboard.spec.ts         # Stats load, charts render
└── auth/
    ├── login.spec.ts              # Login flow for all roles
    └── register.spec.ts           # Registration for farmer and provider
```

**Critical E2E Flows:**
```typescript
// booking-flow.spec.ts
test('Farmer can book a tractor service end-to-end', async ({ page }) => {
  // 1. Login as farmer
  // 2. Navigate to services
  // 3. Click on a tractor service
  // 4. Click "Book Now"
  // 5. Select date and time
  // 6. Click Continue
  // 7. Select 2 Hours duration
  // 8. Verify total = price × 2
  // 9. Select "Cash on Delivery" payment
  // 10. Click "Confirm Booking"
  // 11. Verify confirmation screen shows booking ID
  // 12. Navigate to My Bookings
  // 13. Verify the new booking appears with "Requested" status
});

// order-flow.spec.ts
test('Farmer can purchase products end-to-end', async ({ page }) => {
  // 1. Login as farmer
  // 2. Navigate to products
  // 3. Add 2 products to cart
  // 4. Go to cart
  // 5. Verify quantities and totals
  // 6. Proceed to checkout
  // 7. Verify delivery address pre-filled
  // 8. Select payment method
  // 9. Place order (skip Razorpay in test — use Cash)
  // 10. Verify order confirmation
  // 11. Check order appears in My Orders
});
```

### Vitest Configuration:

**apps/server/vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.ts'],
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      thresholds: {
        branches: 70,
        functions: 70,
        lines: 70,
        statements: 70,
      },
    },
    // Separate integration tests (need DB) from unit tests
    testTimeout: 30000,
  },
});
```

**apps/web/vitest.config.ts:**
```typescript
import { defineConfig } from 'vitest/config';
export default defineConfig({
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/__tests__/setup.ts'],
    include: ['src/__tests__/**/*.test.{ts,tsx}'],
    coverage: {
      provider: 'v8',
      thresholds: {
        branches: 60,
        functions: 60,
        lines: 60,
        statements: 60,
      },
    },
  },
});
```

### Package.json Scripts:
```json
{
  "scripts": {
    "test": "vitest run",
    "test:watch": "vitest",
    "test:coverage": "vitest run --coverage",
    "test:unit": "vitest run --dir src/__tests__/unit",
    "test:integration": "vitest run --dir src/__tests__/integration",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  }
}
```

Generate ALL test files with complete, runnable test code. At minimum, create 50+ backend tests and 30+ frontend tests. Tests must actually assert real business logic, not just "renders without crashing." Include the setup files, mock factories, and configuration.
```

---

<a id="phase-18"></a>
## Phase 18 — Observability, Audit Logging & Full-Text Search

```
You are continuing the "Krishi Connect" PERN stack project. Now add production observability, audit logging, and search infrastructure.

### 1. Structured Logging with Pino

**Why Pino over Winston:** Pino is 5x faster, JSON-native, and the Node.js standard for production logging.

**Install:**
```bash
pnpm add pino pino-http pino-pretty
```

**Logger Setup (apps/server/src/config/logger.ts):**
```typescript
import pino from 'pino';

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development'
    ? { target: 'pino-pretty', options: { colorize: true, translateTime: 'SYS:standard' } }
    : undefined,
  // Production: raw JSON for log aggregators (ELK, Datadog, CloudWatch)
  serializers: {
    err: pino.stdSerializers.err,
    req: pino.stdSerializers.req,
    res: pino.stdSerializers.res,
  },
  redact: ['req.headers.authorization', 'req.body.password', 'req.body.confirmPassword'],
  // ^ CRITICAL: Never log passwords or tokens
});
```

**Request Logging Middleware (pino-http):**
```typescript
// Every request gets a correlationId (X-Request-Id header or generated UUID)
// Log: method, url, statusCode, responseTime, userId (if authenticated)
// Attach correlationId to all log calls within the request lifecycle
// Use AsyncLocalStorage to propagate correlationId without passing it everywhere

import { AsyncLocalStorage } from 'async_hooks';
export const requestContext = new AsyncLocalStorage<{ correlationId: string; userId?: string }>();

// Usage in any module:
// const ctx = requestContext.getStore();
// logger.info({ correlationId: ctx?.correlationId }, 'Processing booking');
```

**What to Log:**
```
ALWAYS LOG (info level):
- User login success/failure (include email, IP, user agent — NOT password)
- Booking created, status changed
- Order created, status changed
- Payment initiated, completed, failed, refunded
- Provider approved/rejected by admin
- Product approved/rejected
- File uploads (filename, size, userId)

ALWAYS LOG (warn level):
- Rate limit exceeded (IP, userId)
- Invalid JWT token attempt
- Failed payment verification
- Stock conflict during order (requested vs available)

ALWAYS LOG (error level):
- Unhandled exceptions (with full stack trace)
- Database connection failures
- Redis connection failures
- External service failures (Razorpay, Nominatim, email)
- BullMQ job failures

NEVER LOG:
- Passwords, tokens, API keys
- Full credit card numbers
- Aadhar/PAN numbers (log only last 4 digits)
- Request body for file uploads (too large)
```

### 2. Metrics Endpoint (Prometheus-Compatible)

**Install:**
```bash
pnpm add prom-client
```

**Metrics to Expose (GET /metrics):**
```typescript
// HTTP Metrics:
const httpRequestDuration = new Histogram({
  name: 'http_request_duration_seconds',
  help: 'Duration of HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
  buckets: [0.01, 0.05, 0.1, 0.5, 1, 2, 5],
});

const httpRequestTotal = new Counter({
  name: 'http_requests_total',
  help: 'Total HTTP requests',
  labelNames: ['method', 'route', 'status_code'],
});

// Business Metrics:
const bookingsCreatedTotal = new Counter({
  name: 'bookings_created_total',
  help: 'Total bookings created',
  labelNames: ['service_category', 'payment_method'],
});

const ordersCreatedTotal = new Counter({
  name: 'orders_created_total',
  help: 'Total orders created',
  labelNames: ['payment_method'],
});

const paymentAmountTotal = new Counter({
  name: 'payment_amount_total_inr',
  help: 'Total payment amount processed in INR',
  labelNames: ['type', 'method'], // type: booking/order
});

const activeWebSocketConnections = new Gauge({
  name: 'websocket_connections_active',
  help: 'Active WebSocket connections',
});

const bullmqJobDuration = new Histogram({
  name: 'bullmq_job_duration_seconds',
  help: 'Duration of BullMQ job processing',
  labelNames: ['queue', 'status'], // status: completed/failed
});

// System Metrics (auto-collected):
collectDefaultMetrics(); // CPU, memory, event loop lag, GC
```

### 3. Health Check Endpoints

```typescript
// GET /api/health (public, no auth)
// Returns overall system health with individual service checks

interface HealthCheckResponse {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: string;
  version: string;
  uptime: number;
  checks: {
    database: { status: 'up' | 'down'; latency: number };
    redis: { status: 'up' | 'down'; latency: number };
    diskSpace: { status: 'ok' | 'low'; available: string };
  };
}

// GET /api/health/ready — returns 200 if ready to accept traffic (DB + Redis connected)
// GET /api/health/live — returns 200 if process is running (always 200 unless deadlocked)

// Implementation:
// - Database check: SELECT 1 (with 5s timeout)
// - Redis check: PING (with 2s timeout)
// - If any check fails: status = 'degraded', HTTP 200 still (for visibility)
// - If critical checks fail: status = 'unhealthy', HTTP 503
```

### 4. Audit Logging

**Why:** Admin actions (approve/reject providers, approve/reject products) must be traceable for compliance and dispute resolution.

**Prisma Model — Add to schema:**
```prisma
model AuditLog {
  id            String   @id @default(cuid())
  userId        String
  user          User     @relation(fields: [userId], references: [id])
  action        String   // e.g., "PROVIDER_APPROVED", "PRODUCT_REJECTED", "ORDER_CANCELLED"
  entityType    String   // e.g., "ProviderProfile", "Product", "Booking", "Order"
  entityId      String   // ID of the affected entity
  changes       Json?    // { before: {...}, after: {...} } — what changed
  metadata      Json?    // Additional context (IP address, user agent, reason)
  ipAddress     String?
  userAgent     String?
  createdAt     DateTime @default(now())

  @@index([userId])
  @@index([entityType, entityId])
  @@index([action])
  @@index([createdAt])
  @@map("audit_logs")
}
```

**Audit Logger Service (apps/server/src/utils/auditLogger.ts):**
```typescript
// Usage:
await auditLog({
  userId: req.user.id,
  action: 'PROVIDER_APPROVED',
  entityType: 'ProviderProfile',
  entityId: providerId,
  changes: { before: { approvalStatus: 'PENDING' }, after: { approvalStatus: 'APPROVED' } },
  metadata: { reason: 'Documents verified' },
  ipAddress: req.ip,
  userAgent: req.headers['user-agent'],
});

// Audit these actions:
// - Admin: approve/reject provider, approve/reject product, view sensitive data
// - Provider: update service price, update product stock, accept/reject booking
// - System: payment processed, refund initiated, account locked
```

**Admin Audit Log Page (optional):**
- GET /api/admin/audit-logs?action=&entityType=&userId=&dateFrom=&dateTo=&page=&limit=
- Table: Timestamp | User | Action | Entity | Details
- Filterable by action type, user, date range

### 5. Full-Text Search with PostgreSQL tsvector

**Why:** LIKE '%term%' doesn't scale and misses fuzzy matches. PostgreSQL's built-in full-text search is production-grade for this scale.

**Schema Changes:**
```prisma
// Add to Service model:
model Service {
  // ... existing fields
  searchVector  Unsupported("tsvector")?
  @@index([searchVector], type: Gin) // GIN index for fast full-text search
}

// Add to Product model:
model Product {
  // ... existing fields
  searchVector  Unsupported("tsvector")?
  @@index([searchVector], type: Gin)
}
```

**Migration SQL (create manually alongside Prisma):**
```sql
-- Add tsvector columns
ALTER TABLE services ADD COLUMN search_vector tsvector;
ALTER TABLE products ADD COLUMN search_vector tsvector;

-- Create GIN indexes
CREATE INDEX idx_services_search ON services USING GIN(search_vector);
CREATE INDEX idx_products_search ON products USING GIN(search_vector);

-- Populate search vectors
UPDATE services SET search_vector = 
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(category::text, '')), 'C');

UPDATE products SET search_vector = 
  setweight(to_tsvector('english', coalesce(name, '')), 'A') ||
  setweight(to_tsvector('english', coalesce(description, '')), 'B') ||
  setweight(to_tsvector('english', coalesce(brand, '')), 'C') ||
  setweight(to_tsvector('english', coalesce(category::text, '')), 'C');

-- Auto-update trigger for services
CREATE OR REPLACE FUNCTION services_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.category::text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_services_search_vector 
  BEFORE INSERT OR UPDATE ON services
  FOR EACH ROW EXECUTE FUNCTION services_search_vector_trigger();

-- Same trigger for products
CREATE OR REPLACE FUNCTION products_search_vector_trigger() RETURNS trigger AS $$
BEGIN
  NEW.search_vector :=
    setweight(to_tsvector('english', coalesce(NEW.name, '')), 'A') ||
    setweight(to_tsvector('english', coalesce(NEW.description, '')), 'B') ||
    setweight(to_tsvector('english', coalesce(NEW.brand, '')), 'C') ||
    setweight(to_tsvector('english', coalesce(NEW.category::text, '')), 'C');
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trig_products_search_vector 
  BEFORE INSERT OR UPDATE ON products
  FOR EACH ROW EXECUTE FUNCTION products_search_vector_trigger();
```

**Search API Implementation:**
```typescript
// GET /api/farmer/services?search=tractor+plowing

// Use Prisma.$queryRaw for full-text search:
const results = await prisma.$queryRaw`
  SELECT *, 
    ts_rank(search_vector, plainto_tsquery('english', ${searchTerm})) as rank
  FROM services
  WHERE search_vector @@ plainto_tsquery('english', ${searchTerm})
    AND is_active = true
  ORDER BY rank DESC
  LIMIT ${limit} OFFSET ${offset}
`;

// Benefits over LIKE:
// - "tractor" matches "tractors" (stemming)
// - "organic wheat" matches description containing both words
// - Results ranked by relevance (title matches > description matches)
// - GIN index = O(1) lookup vs O(n) table scan
```

### Dependencies:
```bash
pnpm add pino pino-http prom-client
pnpm add -D pino-pretty
```

Generate ALL files completely. Logger must redact sensitive data. Metrics must be Prometheus-compatible. Audit logs must cover all admin actions. Full-text search must use tsvector with GIN indexes.
```

---

<a id="phase-19"></a>
## Phase 19 — Cloud Storage, CDN, Email/SMS & Accessibility

```
You are continuing the "Krishi Connect" PERN stack project. Now replace local file storage with cloud storage, add email/SMS infrastructure, and implement accessibility.

### 1. Cloud File Storage (S3-Compatible)

**Why:** Local `uploads/` directory is a single point of failure. Files are lost on redeploy, can't scale horizontally, and have no CDN.

**Implementation: Use MinIO for local dev, AWS S3 for production.**

Both share the same API — use the AWS SDK:

**Install:**
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

**Environment Variables:**
```
# Local (MinIO via Docker):
S3_ENDPOINT=http://localhost:9000
S3_ACCESS_KEY=minioadmin
S3_SECRET_KEY=minioadmin
S3_BUCKET=krishi-connect
S3_REGION=us-east-1
S3_PUBLIC_URL=http://localhost:9000/krishi-connect

# Production (AWS S3):
S3_ENDPOINT=https://s3.ap-south-1.amazonaws.com
S3_ACCESS_KEY=AKIA...
S3_SECRET_KEY=...
S3_BUCKET=krishi-connect-prod
S3_REGION=ap-south-1
S3_PUBLIC_URL=https://krishi-connect-prod.s3.ap-south-1.amazonaws.com
# Or use CloudFront CDN URL:
S3_PUBLIC_URL=https://cdn.krishiconnect.com
```

**Docker Compose — Add MinIO:**
```yaml
minio:
  image: minio/minio:latest
  command: server /data --console-address ":9001"
  environment:
    MINIO_ROOT_USER: minioadmin
    MINIO_ROOT_PASSWORD: minioadmin
  ports:
    - "9000:9000"    # API
    - "9001:9001"    # Console UI
  volumes:
    - minio_data:/data
  healthcheck:
    test: ["CMD", "mc", "ready", "local"]
    interval: 5s
    timeout: 5s
    retries: 5
```

**Upload Service (apps/server/src/modules/upload/upload.service.ts):**
```typescript
// 1. Receive file from Multer (memoryStorage, not diskStorage)
// 2. Generate unique key: `${folder}/${uuid}-${filename}` 
//    Folders: services/, products/, profiles/, documents/
// 3. Upload to S3 with PutObjectCommand
// 4. Generate thumbnails using sharp BEFORE upload:
//    - Original: max 1920px width
//    - Medium: 800px width  (for product/service cards)
//    - Thumb: 200px width   (for list thumbnails)
//    - Convert to WebP for 30-40% size reduction
// 5. Upload all variants to S3
// 6. Return URLs: { original, medium, thumb }
// 7. Queue thumbnail generation in BullMQ if you want non-blocking uploads

// Delete: delete all variants when service/product is deleted
```

**Presigned URLs for Private Documents:**
```typescript
// Provider documents (Aadhar, PAN) should NOT be publicly accessible
// Use presigned URLs that expire in 15 minutes:

import { GetObjectCommand } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

async function getDocumentUrl(key: string): Promise<string> {
  const command = new GetObjectCommand({ Bucket: S3_BUCKET, Key: key });
  return getSignedUrl(s3Client, command, { expiresIn: 900 }); // 15 min
}

// Public files (service images, product images): use direct S3/CDN URL
// Private files (documents): use presigned URL via API
```

**Update All Upload Endpoints:**
- Remove Multer diskStorage, switch to memoryStorage
- Replace all `fs.writeFile` with S3 upload
- Update image URL references from `/uploads/filename` to `${S3_PUBLIC_URL}/path`
- Update seed data to use placeholder image URLs

### 2. Email Service

**Library: Resend (recommended) or Nodemailer with SMTP**

**Install:**
```bash
pnpm add resend
# OR for self-hosted SMTP:
pnpm add nodemailer @types/nodemailer
```

**Environment Variables:**
```
EMAIL_PROVIDER=resend     # or "smtp"
RESEND_API_KEY=re_xxxxx
# OR
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=noreply@krishiconnect.com
SMTP_PASS=xxxxx
EMAIL_FROM="Krishi Connect <noreply@krishiconnect.com>"
```

**Email Service (apps/server/src/services/email.service.ts):**
```typescript
// Abstract email provider behind an interface:
interface EmailService {
  send(options: { to: string; subject: string; html: string }): Promise<void>;
}

// Implementations: ResendEmailService, SmtpEmailService
// Selected based on EMAIL_PROVIDER env var
```

**Email Templates (apps/server/src/templates/emails/):**
```
emails/
├── base.html              # Base layout with header, footer, green theme
├── welcome.html           # Welcome after registration
├── booking-confirmed.html # Booking details with service info
├── booking-status.html    # Status update (accepted/rejected/completed)
├── order-confirmed.html   # Order summary with items
├── order-shipped.html     # Shipping notification
├── payment-receipt.html   # Payment confirmation with amount
├── password-reset.html    # Reset link with expiry
└── provider-approved.html # Approval notification
```

Each template:
- Uses the green (#166534) branding from the design
- Includes Krishi Connect logo
- Is mobile-responsive (inline CSS)
- Has plain-text fallback
- Uses template variables: {{userName}}, {{bookingId}}, {{amount}}, etc.

**All emails are sent via BullMQ queue (from Phase 16), NOT synchronously in the API request.**

### 3. SMS Service

**Library: MSG91 (India-focused, cheaper) or Twilio**

**Install:**
```bash
# MSG91 uses REST API — no SDK needed, use axios
# OR:
pnpm add twilio
```

**SMS Templates:**
```
- OTP: "{{otp}} is your Krishi Connect verification code. Valid for 5 minutes."
- Booking Confirmed: "Booking {{bookingId}} confirmed for {{service}} on {{date}} at {{time}}. Amount: ₹{{amount}}"
- Booking Status: "Your booking {{bookingId}} status updated to {{status}}."
- Order Shipped: "Order {{orderId}} has been shipped. Track at {{url}}"
- Payment Received: "Payment of ₹{{amount}} received for {{type}} {{id}}."
```

**SMS sent via BullMQ queue — never block the API request.**

### 4. OTP-Based Phone Verification

```typescript
// Flow:
// 1. POST /api/auth/send-otp body: { phone }
//    → Generate 6-digit OTP
//    → Store in Redis: `otp:${phone}` = { otp, attempts: 0 } with 5 min TTL
//    → Queue SMS job to send OTP
//    → Return { message: "OTP sent" }

// 2. POST /api/auth/verify-otp body: { phone, otp }
//    → Get from Redis: `otp:${phone}`
//    → Check attempts < 3 (prevent brute force)
//    → If match: delete from Redis, mark user.isVerified = true
//    → If wrong: increment attempts
//    → Return success/failure

// Rate limit: max 3 OTP requests per phone per hour
```

### 5. Accessibility (WCAG 2.1 AA Compliance)

**Why:** A platform serving farmers must be accessible to users with varying abilities and technical literacy.

**Global Fixes:**

```typescript
// 1. Focus Management
// - All interactive elements have visible focus indicators (ring-2 ring-green-500)
// - Skip-to-content link at the top of every page
// - Focus trapped inside modals (use Radix UI's Dialog which handles this)
// - After page navigation: focus moves to main content <h1>

// 2. ARIA Labels — Add to all components:
// - All icon-only buttons: aria-label="Close", aria-label="Menu"
// - Status badges: role="status" + aria-label="Status: Confirmed"
// - Charts: aria-label describing the data + hidden table fallback
// - Maps: aria-label="Map showing nearby services"
// - Loading spinners: role="status" + aria-label="Loading"
// - Pagination: nav with aria-label="Pagination" + aria-current="page"

// 3. Form Accessibility
// - Every input has an associated <label> (htmlFor + id)
// - Error messages linked to inputs via aria-describedby
// - Required fields marked with aria-required="true"
// - Form groups use <fieldset> + <legend>

// 4. Color Contrast
// - All text meets WCAG AA contrast ratio (4.5:1 for normal text, 3:1 for large)
// - Status badges: don't rely solely on color — include text/icon
// - Verify all green-on-white, white-on-green, red-on-white combinations

// 5. Keyboard Navigation
// - All functionality accessible via keyboard (no mouse-only interactions)
// - Tab order follows visual order
// - Dropdown menus navigable with arrow keys
// - Esc closes modals and dropdowns
// - Enter/Space activates buttons and links

// 6. Screen Reader Support
// - Page titles set on each route: document.title = "Bookings | Krishi Connect"
// - Live regions for dynamic updates: aria-live="polite" for notifications, toast
// - Tables have <caption> and proper <th scope="col"> headers
// - Images have descriptive alt text (product images: alt="Organic Wheat Seeds 1kg package")

// 7. Reduced Motion
// - Respect prefers-reduced-motion media query
// - Disable chart animations, map marker animations for users who prefer reduced motion
// - Tailwind: motion-safe: and motion-reduce: variants
```

**Reusable Accessible Components:**
```typescript
// Update existing components:
// - DataTable: add aria-sort, scope, caption
// - Modal: focus trap, aria-modal, aria-labelledby
// - StatusBadge: sr-only text alternative
// - StatsCard: aria-label with full stat description
// - Pagination: aria-label, aria-current
// - Toast: role="alert" for errors, role="status" for success
// - Sidebar: nav with aria-label, aria-current for active link
```

### Dependencies:
```bash
pnpm add @aws-sdk/client-s3 @aws-sdk/s3-request-presigner sharp resend
```

Generate ALL files. S3 upload must work with MinIO locally and AWS S3 in production. Email templates must be complete HTML with green branding. Accessibility changes must cover all existing components.
```

---

<a id="phase-20"></a>
## Phase 20 — Production Hardening, Docker & CI/CD Deployment

```
You are continuing the "Krishi Connect" PERN stack project. This is the final phase. Harden everything for production deployment.

### 1. Security Hardening

**Backend Middleware Stack (in order):**
```typescript
// apps/server/src/index.ts — middleware order matters!

app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "https://checkout.razorpay.com"],
      styleSrc: ["'self'", "'unsafe-inline'"],  // Needed for inline styles
      imgSrc: ["'self'", "data:", "https:", "blob:"],
      connectSrc: ["'self'", "wss:", process.env.S3_PUBLIC_URL],
      frameSrc: ["https://api.razorpay.com"],
    },
  },
  crossOriginEmbedderPolicy: false,  // Required for loading external images
}));

app.use(cors(corsOptions));          // Restrict to known origins
app.use(compression());             // Gzip
app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true, limit: '1mb' }));
app.use(pinoHttp({ logger }));      // Request logging
app.use(correlationId());           // X-Request-Id
app.use(rateLimiter());             // Global rate limit

// Razorpay webhook needs raw body for signature verification:
app.use('/api/payments/webhook', express.raw({ type: 'application/json' }));
```

**Secure Cookie Configuration (for refresh tokens):**
```typescript
// Move refresh token from response body to httpOnly cookie:
res.cookie('refreshToken', refreshToken, {
  httpOnly: true,          // JavaScript can't access
  secure: process.env.NODE_ENV === 'production',  // HTTPS only in prod
  sameSite: 'strict',      // CSRF protection
  maxAge: 7 * 24 * 60 * 60 * 1000,  // 7 days
  path: '/api/auth/refresh',  // Only sent to refresh endpoint
});

// Access token stays in memory (Zustand, NOT localStorage)
// On page reload: call /api/auth/refresh to get new access token from cookie
```

**Account Lockout:**
```typescript
// After 5 failed login attempts:
// - Lock account for 15 minutes
// - Redis key: `lockout:${email}` with 15 min TTL
// - Return: "Account locked. Try again in 15 minutes."
// - Log: warn level with email and IP
// - After successful login: clear failed attempt counter
```

**Input Sanitization:**
```bash
pnpm add dompurify isomorphic-dompurify
```
```typescript
// Sanitize all user-submitted strings (names, descriptions, addresses)
// before database insertion — removes script tags, event handlers
// Apply via Zod transform: z.string().transform(sanitize)
```

### 2. Performance Optimization

**Database:**
```sql
-- Connection pool (add to DATABASE_URL):
?connection_limit=10&pool_timeout=30

-- Analyze and optimize slow queries:
-- Run EXPLAIN ANALYZE on:
-- 1. Service discovery with distance filter
-- 2. Admin dashboard aggregate queries
-- 3. Provider earnings calculation
-- 4. Product search with full-text

-- Add missing indexes if any query does sequential scan on >1000 rows
```

**Redis Cache Strategy:**
```typescript
// Cache Layers:
const CACHE_CONFIG = {
  // Frequently read, rarely changed:
  'user:profile': { ttl: 300, invalidateOn: ['profile.update'] },
  'provider:services': { ttl: 120, invalidateOn: ['service.create', 'service.update', 'service.delete'] },
  'admin:stats': { ttl: 60, invalidateOn: ['booking.create', 'order.create'] },
  
  // Computed/expensive:
  'provider:earnings': { ttl: 300, invalidateOn: ['booking.complete', 'order.deliver'] },
  'admin:revenue-chart': { ttl: 300, invalidateOn: ['payment.confirm'] },
  
  // Search results (short TTL, high volume):
  'services:search': { ttl: 30 },
  'products:search': { ttl: 30 },
};

// Cache-aside pattern implementation:
async function cachedQuery<T>(key: string, ttl: number, queryFn: () => Promise<T>): Promise<T> {
  const cached = await redis.get(key);
  if (cached) return JSON.parse(cached);
  const result = await queryFn();
  await redis.setex(key, ttl, JSON.stringify(result));
  return result;
}
```

**Frontend Bundle Optimization:**
```typescript
// vite.config.ts:
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom'],
          'vendor-router': ['@tanstack/react-router'],
          'vendor-query': ['@tanstack/react-query'],
          'vendor-charts': ['recharts'],
          'vendor-maps': ['leaflet', 'react-leaflet'],
          'vendor-ui': ['@radix-ui/react-dialog', '@radix-ui/react-dropdown-menu'],
        },
      },
    },
    target: 'es2020',
    sourcemap: true,   // For error tracking in production
    cssMinify: true,
  },
});

// Lazy load heavy route groups:
// Admin panel: React.lazy(() => import('./routes/_admin'))
// Provider panel: React.lazy(() => import('./routes/_provider'))
// Maps: React.lazy(() => import('./components/maps/MapView'))
```

### 3. Docker Production Setup

**apps/server/Dockerfile:**
```dockerfile
# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/server/package.json apps/server/
COPY packages/shared/package.json packages/shared/
RUN corepack enable pnpm && pnpm install --frozen-lockfile --prod=false

# Stage 2: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY --from=deps /app/apps/server/node_modules ./apps/server/node_modules
COPY --from=deps /app/packages/shared/node_modules ./packages/shared/node_modules
COPY . .
RUN cd packages/shared && npx tsc
RUN cd apps/server && npx prisma generate && npx tsc

# Stage 3: Production
FROM node:20-alpine AS runner
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 appuser
WORKDIR /app
COPY --from=builder /app/apps/server/dist ./dist
COPY --from=builder /app/apps/server/prisma ./prisma
COPY --from=builder /app/apps/server/node_modules ./node_modules
COPY --from=builder /app/apps/server/package.json ./
USER appuser
EXPOSE 4000
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:4000/api/health/live || exit 1
CMD ["node", "dist/index.js"]
```

**apps/web/Dockerfile:**
```dockerfile
# Stage 1: Build
FROM node:20-alpine AS builder
WORKDIR /app
COPY package.json pnpm-lock.yaml pnpm-workspace.yaml ./
COPY apps/web/package.json apps/web/
COPY packages/shared/package.json packages/shared/
RUN corepack enable pnpm && pnpm install --frozen-lockfile
COPY . .
RUN cd packages/shared && npx tsc
RUN cd apps/web && npx vite build

# Stage 2: Serve
FROM nginx:1.25-alpine
COPY --from=builder /app/apps/web/dist /usr/share/nginx/html
COPY apps/web/nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost/health || exit 1
```

**apps/web/nginx.conf:**
```nginx
server {
    listen 80;
    server_name _;
    root /usr/share/nginx/html;
    index index.html;

    # SPA: all routes serve index.html
    location / {
        try_files $uri $uri/ /index.html;
    }

    # Health check
    location /health {
        access_log off;
        return 200 'ok';
        add_header Content-Type text/plain;
    }

    # Proxy API to backend
    location /api/ {
        proxy_pass http://server:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 300s;
    }

    # Proxy WebSocket
    location /socket.io/ {
        proxy_pass http://server:4000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
    }

    # Gzip
    gzip on;
    gzip_types text/plain text/css application/json application/javascript text/xml image/svg+xml;
    gzip_min_length 1000;
    gzip_comp_level 6;

    # Security headers
    add_header X-Frame-Options "SAMEORIGIN" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=(self)" always;

    # Cache static assets
    location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg|woff2?)$ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

**docker-compose.production.yml:**
```yaml
version: '3.8'

services:
  web:
    build:
      context: .
      dockerfile: apps/web/Dockerfile
    ports:
      - "80:80"
      - "443:443"
    depends_on:
      server:
        condition: service_healthy
    restart: always
    networks:
      - frontend

  server:
    build:
      context: .
      dockerfile: apps/server/Dockerfile
    environment:
      - NODE_ENV=production
      - DATABASE_URL=postgresql://krishi:${DB_PASSWORD}@postgres:5432/krishi_connect
      - REDIS_URL=redis://:${REDIS_PASSWORD}@redis:6379
    env_file:
      - .env.production
    depends_on:
      postgres:
        condition: service_healthy
      redis:
        condition: service_healthy
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 1G
        reservations:
          cpus: '0.5'
          memory: 256M
    networks:
      - frontend
      - backend

  postgres:
    image: postgres:16-alpine
    environment:
      POSTGRES_DB: krishi_connect
      POSTGRES_USER: krishi
      POSTGRES_PASSWORD: ${DB_PASSWORD}
    volumes:
      - postgres_data:/var/lib/postgresql/data
      - ./backups:/backups
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U krishi -d krishi_connect"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    deploy:
      resources:
        limits:
          cpus: '2'
          memory: 2G
    networks:
      - backend

  redis:
    image: redis:7-alpine
    command: redis-server --requirepass ${REDIS_PASSWORD} --appendonly yes --maxmemory 256mb --maxmemory-policy allkeys-lru
    volumes:
      - redis_data:/data
    healthcheck:
      test: ["CMD", "redis-cli", "-a", "${REDIS_PASSWORD}", "ping"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    deploy:
      resources:
        limits:
          cpus: '1'
          memory: 512M
    networks:
      - backend

  minio:
    image: minio/minio:latest
    command: server /data --console-address ":9001"
    environment:
      MINIO_ROOT_USER: ${MINIO_ACCESS_KEY}
      MINIO_ROOT_PASSWORD: ${MINIO_SECRET_KEY}
    volumes:
      - minio_data:/data
    healthcheck:
      test: ["CMD", "mc", "ready", "local"]
      interval: 10s
      timeout: 5s
      retries: 5
    restart: always
    networks:
      - backend

volumes:
  postgres_data:
  redis_data:
  minio_data:

networks:
  frontend:
  backend:
    internal: true   # Not accessible from outside
```

### 4. Database Backup Strategy

```bash
# scripts/backup-db.sh
#!/bin/bash
# Run daily via cron: 0 2 * * * /app/scripts/backup-db.sh

TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="/backups/krishi_connect_${TIMESTAMP}.sql.gz"

# Create compressed backup
docker exec postgres pg_dump -U krishi krishi_connect | gzip > "$BACKUP_FILE"

# Keep only last 30 days of backups
find /backups -name "*.sql.gz" -mtime +30 -delete

# Optional: upload to S3
# aws s3 cp "$BACKUP_FILE" "s3://krishi-connect-backups/${BACKUP_FILE}"

echo "Backup completed: ${BACKUP_FILE}"
```

### 5. CI/CD Pipeline (GitHub Actions)

```yaml
# .github/workflows/ci.yml
name: CI/CD Pipeline

on:
  push:
    branches: [main, develop]
  pull_request:
    branches: [main]

env:
  NODE_VERSION: '20'
  PNPM_VERSION: '9'

jobs:
  lint-and-typecheck:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter shared build
      - run: pnpm --filter server exec tsc --noEmit
      - run: pnpm --filter web exec tsc --noEmit
      - run: pnpm lint

  test-backend:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    services:
      postgres:
        image: postgres:16-alpine
        env:
          POSTGRES_DB: krishi_connect_test
          POSTGRES_USER: test
          POSTGRES_PASSWORD: test
        ports: ['5432:5432']
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
      redis:
        image: redis:7-alpine
        ports: ['6379:6379']
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
    env:
      DATABASE_URL: postgresql://test:test@localhost:5432/krishi_connect_test
      REDIS_URL: redis://localhost:6379
      JWT_SECRET: test-jwt-secret-minimum-32-characters-long
      JWT_REFRESH_SECRET: test-refresh-secret-minimum-32-characters
      NODE_ENV: test
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter shared build
      - run: cd apps/server && npx prisma migrate deploy
      - run: pnpm --filter server test:coverage
      - uses: actions/upload-artifact@v4
        with:
          name: backend-coverage
          path: apps/server/coverage/

  test-frontend:
    runs-on: ubuntu-latest
    needs: lint-and-typecheck
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: pnpm --filter shared build
      - run: pnpm --filter web test:coverage

  test-e2e:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
        with:
          version: ${{ env.PNPM_VERSION }}
      - uses: actions/setup-node@v4
        with:
          node-version: ${{ env.NODE_VERSION }}
          cache: 'pnpm'
      - run: pnpm install --frozen-lockfile
      - run: npx playwright install --with-deps chromium
      - run: docker compose -f docker-compose.test.yml up -d
      - run: pnpm --filter shared build
      - run: cd apps/server && npx prisma migrate deploy && npx prisma db seed
      - run: pnpm --filter server dev &
      - run: pnpm --filter web dev &
      - run: sleep 10 && pnpm --filter web test:e2e
      - uses: actions/upload-artifact@v4
        if: failure()
        with:
          name: playwright-report
          path: apps/web/playwright-report/

  build-and-push:
    runs-on: ubuntu-latest
    needs: [test-backend, test-frontend]
    if: github.ref == 'refs/heads/main'
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4
      - uses: docker/setup-buildx-action@v3
      - uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: ${{ github.actor }}
          password: ${{ secrets.GITHUB_TOKEN }}
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/server/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/server:${{ github.sha }},ghcr.io/${{ github.repository }}/server:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
      - uses: docker/build-push-action@v5
        with:
          context: .
          file: apps/web/Dockerfile
          push: true
          tags: ghcr.io/${{ github.repository }}/web:${{ github.sha }},ghcr.io/${{ github.repository }}/web:latest
          cache-from: type=gha
          cache-to: type=gha,mode=max
```

### 6. API Documentation (Swagger/OpenAPI)

```bash
pnpm add swagger-jsdoc swagger-ui-express @types/swagger-jsdoc @types/swagger-ui-express
```

```typescript
// apps/server/src/config/swagger.ts
const swaggerSpec = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Krishi Connect API',
      version: '1.0.0',
      description: 'Agricultural Services & E-commerce Platform API',
    },
    servers: [
      { url: '/api', description: 'API Server' },
    ],
    components: {
      securitySchemes: {
        bearerAuth: { type: 'http', scheme: 'bearer', bearerFormat: 'JWT' },
      },
    },
    security: [{ bearerAuth: [] }],
  },
  apis: ['./src/modules/**/*.routes.ts'],
};

// Mount at /api/docs (development only or admin-only in production)
if (process.env.NODE_ENV !== 'production') {
  app.use('/api/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}
```

### 7. Error Boundary & Global Error Handling

**Frontend (apps/web/src/components/ErrorBoundary.tsx):**
```typescript
// Catch React rendering errors
// Show a user-friendly error page with:
//   - "Something went wrong" message
//   - "Try Again" button (reloads the page)
//   - "Go Home" button
// Log error details to console (or external error tracking like Sentry)
```

**Backend Global Error Handler:**
```typescript
// apps/server/src/middleware/errorHandler.ts
// Maps error types to HTTP responses:
// - ZodError → 400 with field-specific errors
// - PrismaClientKnownRequestError P2002 → 409 "Already exists"
// - PrismaClientKnownRequestError P2025 → 404 "Not found"
// - JsonWebTokenError → 401 "Invalid token"
// - TokenExpiredError → 401 "Token expired"
// - MulterError LIMIT_FILE_SIZE → 413 "File too large"
// - AppError (custom) → error.statusCode with error.message
// - Unknown → 500 "Internal server error" (log full error, return generic message)
```

### 8. Final Production Checklist:

```
SECURITY:
✅ Helmet.js with strict CSP
✅ CORS restricted to known origins
✅ Rate limiting on all endpoints (Redis-based)
✅ JWT in httpOnly cookies (refresh) + memory (access)
✅ Password hashing with bcrypt (12 rounds)
✅ Input sanitization (DOMPurify)
✅ File upload MIME type validation
✅ Account lockout after failed attempts
✅ Idempotency keys for payments/orders
✅ Razorpay webhook signature verification
✅ SQL injection prevention (Prisma parameterized queries)
✅ XSS prevention (React + sanitization)
✅ Sensitive data redacted from logs

DATA:
✅ PostgreSQL with proper indexes
✅ All money fields use Decimal
✅ Audit logging for admin actions
✅ Database backups (daily, 30-day retention)
✅ Full-text search with tsvector + GIN index
✅ Soft deletes where appropriate

INFRASTRUCTURE:
✅ Docker multi-stage builds (non-root user)
✅ Health checks on all services
✅ Graceful shutdown (drain connections)
✅ Redis persistence (AOF)
✅ Resource limits in Docker Compose
✅ Internal network for backend services
✅ S3-compatible object storage (MinIO/AWS)

OBSERVABILITY:
✅ Structured logging (Pino, JSON in prod)
✅ Request correlation IDs
✅ Prometheus metrics endpoint
✅ Error tracking (frontend + backend)
✅ BullMQ dashboard for queue monitoring

PERFORMANCE:
✅ Redis caching with proper invalidation
✅ Code splitting (per role, lazy maps/charts)
✅ Gzip compression
✅ Static asset caching (1 year, immutable)
✅ Image optimization (sharp + WebP)
✅ Database connection pooling
✅ Bundle size < 200KB gzipped (initial)

CI/CD:
✅ Lint + TypeCheck + Unit + Integration + E2E
✅ Coverage thresholds enforced
✅ Docker image build and push
✅ Automated on push to main

ACCESSIBILITY:
✅ WCAG 2.1 AA compliance
✅ Keyboard navigation
✅ Screen reader support (ARIA)
✅ Focus management
✅ Color contrast verified
✅ Reduced motion support
```

Generate ALL files for this phase. This is the final production hardening — everything must be complete, no stubs, no TODOs.
```

---

## How to Use These Prompts

### Prerequisites:
1. Install Node.js 20+, pnpm, Docker Desktop
2. Have Gemini CLI installed and authenticated

### Execution Order:
```bash
# Run each phase as a separate Gemini CLI prompt
# Wait for each phase to complete before starting the next

# FOUNDATION (run in order)
# Phase 1:  Scaffolding (run first)
# Phase 2:  Database schema + seed
# Phase 3:  Auth + RBAC + Redis

# UI PANELS (phases 4-6, 7-9, 10-13 can run in parallel groups)
# Phase 4-6:   Admin Panel
# Phase 7-9:   Provider Panel
# Phase 10-13: Farmer Panel

# INFRASTRUCTURE (run in order after UI)
# Phase 14: Maps
# Phase 15: i18n + Responsive
# Phase 16: WebSocket + BullMQ + Razorpay + Idempotency
# Phase 17: Testing (unit + integration + e2e)
# Phase 18: Observability + Audit + Search
# Phase 19: Cloud Storage + Email/SMS + Accessibility
# Phase 20: Production Docker + CI/CD + Final Hardening
```

### Tips:
- Run `pnpm dev` after each phase to verify the build works
- Run `docker compose up -d` before Phase 2 to start PostgreSQL + Redis
- After Phase 2, run `pnpm db:migrate && pnpm db:seed` to populate data
- After each UI phase, visually compare with the design screenshots
- If Gemini output is truncated, say "continue from where you stopped"
- If a phase produces errors, paste the error into Gemini and ask it to fix

### Production Architecture:
```
                         ┌─────────────┐
                         │   CDN/CF    │ ← Static assets (JS/CSS/images)
                         └──────┬──────┘
                                │
┌───────────────────────────────▼─────────────────────────────────┐
│                        NGINX (Reverse Proxy)                     │
│              TLS termination, gzip, static serving               │
│         ┌──────────┬──────────┬──────────┐                      │
│         │  Admin   │ Provider │  Farmer  │  React SPA            │
│         │  Panel   │  Panel   │  Panel   │  (TanStack Router)    │
│         └──────────┴──────────┴──────────┘                      │
└──────────────┬──────────────────────┬───────────────────────────┘
               │ REST API             │ WebSocket (Socket.IO)
┌──────────────▼──────────────────────▼───────────────────────────┐
│                    Express.js API Server                          │
│  ┌────────┐ ┌──────┐ ┌───────┐ ┌────────┐ ┌──────────────────┐ │
│  │  Auth  │ │ RBAC │ │ Rate  │ │Validate│ │  Idempotency     │ │
│  │  JWT   │ │Guard │ │Limiter│ │ (Zod)  │ │  Middleware       │ │
│  └────────┘ └──────┘ └───────┘ └────────┘ └──────────────────┘ │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │                Module Controllers                         │   │
│  │  Auth │ Services │ Bookings │ Products │ Orders │ Payments│   │
│  └──────────────────────────────────────────────────────────┘   │
│  ┌──────────────────┐  ┌─────────────────┐  ┌──────────────┐   │
│  │  Socket.IO       │  │  BullMQ Workers │  │  Pino Logger │   │
│  │  (Redis Adapter) │  │  (Email/SMS/    │  │  (Structured)│   │
│  │                  │  │   Image/Report) │  │              │   │
│  └──────────────────┘  └─────────────────┘  └──────────────┘   │
└────────┬──────────┬──────────┬──────────┬──────────────────────┘
         │          │          │          │
┌────────▼────┐ ┌───▼────┐ ┌──▼────┐ ┌───▼──────────┐
│ PostgreSQL  │ │ Redis  │ │ MinIO │ │   Razorpay   │
│ 16          │ │ 7      │ │ / S3  │ │   Gateway    │
│             │ │        │ │       │ │              │
│ • Users     │ │• Cache │ │• Imgs │ │ • Payments   │
│ • Services  │ │• Queue │ │• Docs │ │ • Refunds    │
│ • Bookings  │ │• Tokens│ │• Files│ │ • Webhooks   │
│ • Products  │ │• Locks │ │       │ │              │
│ • Orders    │ │• PubSub│ │       │ │              │
│ • AuditLog  │ │• Rates │ │       │ │              │
│ • tsvector  │ │        │ │       │ │              │
└─────────────┘ └────────┘ └───────┘ └──────────────┘
```

---

## Color Palette Reference (from Design):
| Token | Hex | Usage |
|-------|-----|-------|
| primary-900 | #14532d | Sidebar dark bg |
| primary-800 | #166534 | Sidebar bg, buttons |
| primary-700 | #15803d | Button hover |
| primary-600 | #16a34a | Active states |
| primary-500 | #22c55e | Success badges, accents |
| primary-50 | #f0fdf4 | Light green bg |
| white | #ffffff | Card bg, page bg |
| gray-50 | #f9fafb | Page bg |
| gray-100 | #f3f4f6 | Table header bg |
| gray-500 | #6b7280 | Secondary text |
| gray-900 | #111827 | Primary text |
| red-500 | #ef4444 | Error, reject, cancel |
| orange-500 | #f97316 | Warning, pending |
| blue-500 | #3b82f6 | Info, shipped, confirmed |

---

*Generated for Krishi Connect — Production-Grade Agricultural Platform*
*Tech Stack: PostgreSQL + Express + React + Node.js + JWT + RBAC + Redis + Socket.IO + BullMQ + Razorpay + S3 + TanStack Router + Leaflet Maps + i18n*
