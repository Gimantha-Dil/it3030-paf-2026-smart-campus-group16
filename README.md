# Smart Campus Hub

> **IT3030 Programming Applications and Frameworks — PAF 2026 | Group 16**  
> SLIIT Faculty of Computing  
> Spring Boot 3.x + React 18 + MySQL 8

A full-stack campus facility and resource management system supporting bookings, incident tickets, notifications, and role-based access control.

---

## Group Members

| Name | Module |
|------|--------|
| ** IT23543478 GUNASEKARA A G A G D** | Notifications · Role Management · OAuth2 · Auth & Security |
| **IT23635302 Fernando H L R D** | Facilities Catalogue · Resource Management |
| **IT23579668 RUPASINGHA S** | Booking Workflow · Conflict Checking · QR Check-in |
| **IT23775060 JAYALATH J M S R** | Incident Tickets · Attachments · Technician Updates |

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Clone the Repository](#1-clone-the-repository)
3. [Database Setup](#2-database-setup)
4. [Backend Setup](#3-backend-setup)
5. [Frontend Setup](#4-frontend-setup)
6. [First Admin Account](#5-first-admin-account)
7. [User Roles & Permissions](#user-roles--permissions)
8. [Tech Stack](#tech-stack)
9. [API Endpoints](#api-endpoints)
10. [Project Structure](#project-structure)
11. [Key Features](#key-features)
12. [Troubleshooting](#troubleshooting)

---

## Prerequisites

Make sure all of these are installed before you start:

| Tool | Version | Check |
|------|---------|-------|
| Java (JDK) | 17+ | `java -version` |
| Maven | 3.8+ | `mvn -version` |
| Node.js | 18+ | `node -version` |
| npm | 9+ | `npm -version` |
| MySQL | 8+ | `mysql --version` |
| Git | Any | `git --version` |

> The project compiles with **Java 25** but runs on JDK 17+.  
> **MySQL must be running / Railway** before you start the backend.

---

## 1. Clone the Repository

```bash
git clone https://github.com/Gimantha-Dil/it3030-paf-2026-smart-campus-group16.git
cd it3030-paf-2026-smart-campus-group16
```

---

## 2. Database Setup

Start MySQL and create the database (or let Spring Boot auto-create it):

```sql
-- Option A: manual creation
CREATE DATABASE smart_campus CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Option B: auto-create via Spring Boot
-- createDatabaseIfNotExist=true is already set in application.yml
```

Verify MySQL is running:

```bash
# Linux / macOS
sudo systemctl start mysql      # or: brew services start mysql

# Windows
net start MySQL80
```

---

## 3. Backend Setup

### 3.1 Navigate to the backend directory

```bash
cd backend
```

### 3.2 Configure `src/main/resources/application.yml`

This is the **complete `application.yml`** for the project. Replace placeholder values with your own:

```yaml
spring:
  application:
    name: smart-campus-api
  datasource:
    url: ${DB_URL:jdbc:mysql://localhost:3306/smart_campus?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC}
    username: ${DB_USERNAME:root}
    password: ${DB_PASSWORD:your_mysql_password}
    driver-class-name: com.mysql.cj.jdbc.Driver
  jpa:
    hibernate:
      ddl-auto: update
    show-sql: false
    open-in-view: false
    database-platform: org.hibernate.dialect.MySQLDialect
    properties:
      hibernate:
        '[format_sql]': false
        '[jdbc.batch_size]': 20
        '[order_inserts]': true
  servlet:
    multipart:
      max-file-size: 5MB
      max-request-size: 10MB
  security:
    oauth2:
      client:
        registration:
          google:
            client-id: ${GOOGLE_CLIENT_ID:your-google-client-id.apps.googleusercontent.com} #Login service (Add your Google gmail)
            client-secret: ${GOOGLE_CLIENT_SECRET:your-google-client-secret}
            scope: openid, profile, email
          microsoft:
            client-id: ${MICROSOFT_CLIENT_ID:your-microsoft-client-id} #Login service (Add your Microsoft outlook)
            client-secret: ${MICROSOFT_CLIENT_SECRET:your-microsoft-client-secret}
            scope: openid, profile, email, User.Read
            authorization-grant-type: authorization_code
            redirect-uri: "{baseUrl}/login/oauth2/code/{registrationId}"
        provider:
          microsoft:
            authorization-uri: https://login.microsoftonline.com/common/oauth2/v2.0/authorize
            token-uri: https://login.microsoftonline.com/common/oauth2/v2.0/token
            jwk-set-uri: https://login.microsoftonline.com/common/discovery/v2.0/keys
            user-info-uri: https://graph.microsoft.com/oidc/userinfo
            user-name-attribute: sub
  mail:
    host: smtp.gmail.com
    port: 587
    username: ${MAIL_USERNAME:your-email@gmail.com} #Email service (Add your Google gmail)
    password: ${MAIL_PASSWORD:your-gmail-app-password} 
    properties:
      mail:
        smtp:
          auth: true
          starttls:
            enable: true
            required: true
        debug: false

app:
  jwt:
    secret: ${JWT_SECRET:mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong2025}
    expiration-ms: 86400000
  upload:
    dir: ${UPLOAD_DIR:./uploads/tickets}
  cors:
    allowed-origins: ${CORS_ORIGINS:http://localhost:5173,http://localhost:3000}

logging:
  level:
    com.sliit.smartcampus: INFO
    org.springframework.security: WARN
    org.hibernate: WARN
```

> **Values you MUST change before running:**
>
> | Variable | What to put |
> |----------|-------------|
> | `DB_PASSWORD` | Your local MySQL root password |
> | `GOOGLE_CLIENT_ID` | From Google Cloud Console |
> | `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
> | `MAIL_USERNAME` | Your Gmail address |
> | `MAIL_PASSWORD` | Your Gmail **App Password** (16 chars — NOT your login password) |
> | `JWT_SECRET` | Any random string ≥ 32 characters |

---

### 3.3 Set environment variables (recommended)

The app uses `${VAR_NAME:default}` syntax — you can override any value via environment variables without touching `application.yml`.

**Linux / macOS** — add to `~/.bashrc` or `~/.zshrc`:

```bash
export DB_URL=jdbc:mysql://localhost:3306/smart_campus?createDatabaseIfNotExist=true&useSSL=false&allowPublicKeyRetrieval=true&serverTimezone=UTC
export DB_USERNAME=root
export DB_PASSWORD=your_mysql_password

export JWT_SECRET=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong2025

export GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
export GOOGLE_CLIENT_SECRET=your-google-client-secret

export MICROSOFT_CLIENT_ID=your-microsoft-client-id
export MICROSOFT_CLIENT_SECRET=your-microsoft-client-secret

export MAIL_USERNAME=your-email@gmail.com
export MAIL_PASSWORD=your-gmail-app-password

export UPLOAD_DIR=./uploads/tickets
export CORS_ORIGINS=http://localhost:5173,http://localhost:3000
```

Then reload:
```bash
source ~/.bashrc    # or: source ~/.zshrc
```

**Windows** — Command Prompt:

```cmd
set DB_USERNAME=root
set DB_PASSWORD=your_mysql_password
set JWT_SECRET=mySecretKeyForJWTTokenGenerationThatIsAtLeast256BitsLong2025
set GOOGLE_CLIENT_ID=your-client-id.apps.googleusercontent.com
set GOOGLE_CLIENT_SECRET=your-google-client-secret
set MAIL_USERNAME=your-email@gmail.com
set MAIL_PASSWORD=your-gmail-app-password
```

---

### 3.4 Gmail App Password setup (for email features)

The app sends emails via Gmail SMTP on port 587 with STARTTLS. You need a **Gmail App Password**.

1. Go to your Google Account → **Security**
2. Enable **2-Step Verification** (must be ON)
3. Search for **App Passwords** → Select app: `Mail` → Device: `Other (Custom name)`
4. Name it `SmartCampus` → Generate
5. Copy the 16-character password → use it as `MAIL_PASSWORD`

> Email features (forgot-password, booking notifications) will not work without this. The rest of the app still functions normally.

---

### 3.5 Google OAuth2 setup

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. **APIs & Services → Credentials → Create Credentials → OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Add to **Authorized redirect URIs**:
   ```
   http://localhost:8080/login/oauth2/code/google
   ```
5. Copy **Client ID** and **Client Secret** → set as `GOOGLE_CLIENT_ID` and `GOOGLE_CLIENT_SECRET`

---

### 3.6 Microsoft OAuth2 setup (optional)

1. Go to [Azure Portal](https://portal.azure.com/) → **App registrations → New registration**
2. Redirect URI: `http://localhost:8080/login/oauth2/code/microsoft`
3. **Certificates & secrets → New client secret**
4. Copy **Application (client) ID** and **Secret value** → set as `MICROSOFT_CLIENT_ID` / `MICROSOFT_CLIENT_SECRET`

> If Microsoft login is not needed, leave these empty — it simply won't appear as a login option.

---

### 3.7 Build and run

```bash
# From the /backend directory
mvn clean install -DskipTests
mvn spring-boot:run
```

**Expected output:**
```
Started SmartCampusApplication in 4.2 seconds
Tomcat started on port(s): 8080
```

 Backend running at **http://localhost:8080**

### 3.8 Verify

```bash
curl http://localhost:8080/api/v1/resources
# Expected: 401 Unauthorized  ← correct, API is protected
```

---

## 4. Frontend Setup

Open a **new terminal** (keep the backend running).

### 4.1 Navigate to the frontend directory

```bash
cd frontend
```

### 4.2 Install dependencies

```bash
npm install

# Required for PDF export
npm install jspdf jspdf-autotable
```

### 4.3 Configure environment (optional)

Create `.env` in the `frontend/` directory:

```env
VITE_API_BASE_URL=http://localhost:8080
```

> Only needed if your backend runs on a different host or port. Defaults to `http://localhost:8080`.

### 4.4 Run the dev server

```bash
npm run dev
```

**Expected output:**
```
  VITE v5.x.x  ready in 800ms

  ➜  Local:   http://localhost:5173/
```

 Frontend running at **http://localhost:5173**

### 4.5 Production build (optional)

```bash
npm run build
npm run preview
```

---

## 5. First Admin Account

No admin exists on first run. Follow these steps:

### Step 1 — Register

Visit **http://localhost:5173/register** or:

```bash
curl -X POST http://localhost:8080/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"Admin User","email":"admin@sliit.lk","password":"Admin@123"}'
```

### Step 2 — Promote in MySQL

```sql
USE smart_campus;
UPDATE users SET role = 'ADMIN' WHERE email = 'admin@sliit.lk';
```

### Step 3 — Promote future users via the app

**Admin Panel → User Management → Change Role**

Or via API:
```bash
# Login first
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@sliit.lk","password":"Admin@123"}'

# Then promote (replace {userId} and <token>)
curl -X PATCH http://localhost:8080/api/v1/users/{userId}/role \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{"role":"TECHNICIAN"}'
```

---

## User Roles & Permissions

| Role | Description | Key Permissions |
|------|-------------|-----------------|
| `ADMIN` | Full system access | Manage users, resources, bookings, tickets; analytics |
| `TECHNICIAN` | Maintenance staff | View & update assigned tickets; book MAINTENANCE resources |
| `LECTURER` | Academic staff | Create bookings (LECTURE/MEETING/EXAM); submit tickets |
| `LAB_ASSISTANT` | Lab staff | Create bookings (LAB/MAINTENANCE); submit tickets |
| `USER` / `STUDENT` | General user | Browse resources; create bookings; submit tickets |
| `PENDING_STAFF` | Awaiting approval | Limited access until admin promotes |

### Booking Purpose Prefixes by Role

| Role | Required Prefix |
|------|----------------|
| TECHNICIAN | `MAINTENANCE:` |
| LECTURER | `LECTURE:` or `MEETING:` or `EXAM:` |
| LAB_ASSISTANT | `LAB:` or `MAINTENANCE:` |
| USER / STUDENT | Any purpose |

---

## Tech Stack

### Backend

| Technology | Version | Purpose |
|-----------|---------|---------|
| Java | 25 | Primary language |
| Spring Boot | 3.x | Application framework |
| Spring Security | — | JWT + OAuth2 (Google/Microsoft) + role guards |
| Spring Data JPA + Hibernate | — | ORM; batch size 20; ordered inserts |
| MySQL | 8 | Relational DB (7 tables) |
| Maven | 3.8+ | Build tool |
| Jakarta Mail (SMTP) | — | Gmail SMTP port 587, STARTTLS |

### Frontend

| Technology | Version | Purpose |
|-----------|---------|---------|
| React | 18.x | UI framework |
| Vite | 5.x | Build tool + dev server |
| Tailwind CSS | 3.x | Styling + dark mode |
| React Router DOM | 6.x | Client-side routing |
| Axios | — | HTTP client + JWT interceptor |
| React Toastify | — | Toast notifications |
| jsPDF + jspdf-autotable | — | PDF export |
| SheetJS (XLSX) | CDN | Excel export |

---

## API Endpoints

Base URL: `http://localhost:8080`  
Protected endpoints require: `Authorization: Bearer <JWT_TOKEN>`

### Auth & Security

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `POST` | `/api/v1/auth/register` | Public | Register new user |
| `POST` | `/api/v1/auth/login` | Public | Login → JWT token |
| `PATCH` | `/api/v1/auth/profile` | Auth | Update display name |
| `PATCH` | `/api/v1/auth/password` | Auth | Change password |
| `POST` | `/api/v1/auth/forgot-password` | Public | Send reset email |
| `POST` | `/api/v1/auth/reset-password` | Public | Reset with token |
| `GET` | `/oauth2/authorization/google` | Public | Google OAuth2 |
| `GET` | `/api/v1/users` | ADMIN | List all users |
| `PATCH` | `/api/v1/users/{id}/role` | ADMIN | Update role |
| `DELETE` | `/api/v1/users/me` | Auth | Delete own account |

### Notifications

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/v1/notifications` | Auth | Get paginated list |
| `GET` | `/api/v1/notifications/unread-count` | Auth | Badge count |
| `PATCH` | `/api/v1/notifications/{id}/read` | Auth | Mark single read |
| `PATCH` | `/api/v1/notifications/read-all` | Auth | Mark all read |
| `DELETE` | `/api/v1/notifications/delete-all` | Auth | Clear all |
| `GET` | `/api/v1/notifications/preferences` | Auth | Get preferences |
| `PATCH` | `/api/v1/notifications/preferences` | Auth | Update preferences |

### Resources

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/v1/resources` | Auth | List with filters |
| `GET` | `/api/v1/resources/{id}` | Auth | Get by ID |
| `POST` | `/api/v1/resources` | ADMIN | Create |
| `PUT` | `/api/v1/resources/{id}` | ADMIN | Full update |
| `PATCH` | `/api/v1/resources/{id}/status` | ADMIN | Status only |
| `DELETE` | `/api/v1/resources/{id}` | ADMIN | Delete |

**Query params:** `?type=LAB&status=ACTIVE&location=Block+A&minCapacity=20&search=lab`

### Bookings

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/v1/bookings` | Auth | List (role-filtered) |
| `GET` | `/api/v1/bookings/{id}` | Auth | Get detail |
| `POST` | `/api/v1/bookings` | Auth | Create → PENDING |
| `PATCH` | `/api/v1/bookings/{id}/review` | ADMIN | Approve / Reject |
| `DELETE` | `/api/v1/bookings/{id}` | Auth | Cancel |

### Tickets

| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| `GET` | `/api/v1/tickets` | Auth | List (role-filtered) |
| `GET` | `/api/v1/tickets/{id}` | Auth | Detail + attachments + comments |
| `POST` | `/api/v1/tickets` | Auth | Create (multipart, max 3 × 5MB) |
| `PATCH` | `/api/v1/tickets/{id}/status` | Admin/Tech | Update status |
| `PATCH` | `/api/v1/tickets/{id}/assign` | ADMIN | Assign technician |
| `POST` | `/api/v1/tickets/{id}/comments` | Auth | Add comment |

---

## Project Structure

```
it3030-paf-2026-smart-campus-group16/
│
├── backend/
│   └── src/main/
│       ├── java/com/sliit/smartcampus/
│       │   ├── entity/         # User, Resource, Booking, Ticket, Notification …
│       │   ├── enums/          # UserRole, BookingStatus, TicketStatus …
│       │   ├── service/        # AuthService, BookingService, TicketService …
│       │   ├── controller/     # REST controllers (7 modules)
│       │   ├── repository/     # Spring Data JPA repositories
│       │   ├── dto/            # Request / Response DTOs + EntityMapper
│       │   ├── security/       # JwtTokenProvider, JwtAuthFilter, OAuth2UserService
│       │   └── exception/      # Custom exceptions + GlobalExceptionHandler
│       └── resources/
│           └── application.yml # ← main config (DB, JWT, OAuth2, Mail, Upload, CORS)
│
├── frontend/
│   └── src/
│       ├── api/                # authApi, bookingApi, ticketApi … + axiosInstance.js
│       ├── context/            # AuthContext, NotificationContext, ThemeContext
│       ├── features/
│       │   ├── auth/           # Login, Register, ForgotPassword, Reset (Gimantha)
│       │   ├── notifications/  # NotificationPanel (Gimantha)
│       │   ├── users/          # ProfilePage, UserManagement (Gimantha)
│       │   ├── resources/      # ResourceList, ResourceForm, Dashboard (Lakesha)
│       │   ├── bookings/       # BookingForm, BookingList, QRCode (Sasmika)
│       │   └── tickets/        # TicketForm, TicketList, TicketDetail (Sewni)
│       ├── components/         # Navbar, Layout, RoleGuard, ProtectedRoute
│       └── utils/
│           ├── exportUtils.js  # Excel export via SheetJS
│           └── pdfUtils.js     # PDF export via jsPDF + autoTable
│
└── README.md
```

---

## Key Features

### Auth & Security (Gimantha)
- JWT stateless auth (HS256) — `JwtTokenProvider` + `JwtAuthenticationFilter`
- Google & Microsoft OAuth2 with `findOrCreate` account linking
- Forgot / Reset password via time-limited email token (Gmail SMTP)
- Per-type notification preferences (`disabledNotifications` field on User)
- File uploads saved to `./uploads/tickets` (configurable via `UPLOAD_DIR`)
- Max file size: **5MB per file**, **10MB total request**

### Resource Management (Lakesha)
- Paginated catalogue with 5 filter params: type, status, location, minCapacity, search
- Resource status: `ACTIVE` / `MAINTENANCE` / `OUT_OF_SERVICE`
- Admin analytics: top resources by booking count, peak booking hours

### Booking Workflow (Sasmika)
- 9-point validation: time rules, role purpose prefix, JPQL conflict detection
- Admin approve / reject with required reason on rejection
- QR code generated for approved bookings (check-in)
- Email + in-app notification on every booking decision

### Incident Tickets (Sewni)
- Multipart upload: max **3 files × 5MB each**
- Status lifecycle: `OPEN → IN_PROGRESS → RESOLVED → CLOSED`
- Technician assignment auto-advances `OPEN → IN_PROGRESS`
- Multi-party commenting + PDF / Excel export

### Notifications (Gimantha)
- Unread count badge, paginated list, mark single / all / clear all
- Per-category toggle — disable specific notification types
- Async email alongside every in-app notification

---

## Troubleshooting

### `Unable to acquire JDBC Connection`
MySQL not running:
```bash
sudo systemctl start mysql    # Linux
brew services start mysql     # macOS
net start MySQL80             # Windows
```

### `Access denied for user 'root'@'localhost'`
Wrong DB credentials — check `DB_USERNAME` / `DB_PASSWORD`.

### `JWT secret key must be at least 256 bits`
`JWT_SECRET` too short — must be **≥ 32 characters**.

### `Network Error` / `CORS Error` on frontend
- Backend must be on port 8080
- `CORS_ORIGINS` must include `http://localhost:5173`

### `npm install` fails
```bash
rm -rf node_modules package-lock.json
npm install
```

### Emails not sending
- `MAIL_PASSWORD` must be a Gmail **App Password** (16 chars)
- Gmail 2-Step Verification must be **ON**

### Google OAuth2 redirect mismatch
Add this exact URI in Google Cloud Console:
```
http://localhost:8080/login/oauth2/code/google
```

### File uploads failing
```bash
mkdir -p ./uploads/tickets
chmod 755 ./uploads/tickets
```

---

## Quick Start

```bash
# Terminal 1 — MySQL
sudo systemctl start mysql

# Terminal 2 — Backend
cd backend
mvn clean install -DskipTests
mvn spring-boot:run

# Terminal 3 — Frontend
cd frontend
npm install
npm run dev
```

| URL | Service |
|-----|---------|
| `http://localhost:5173` | React Frontend |
| `http://localhost:8080` | Spring Boot API |
| `http://localhost:8080/api/v1/auth/login` | Login endpoint |
| `http://localhost:8080/oauth2/authorization/google` | Google OAuth2 |

---

## License

---
