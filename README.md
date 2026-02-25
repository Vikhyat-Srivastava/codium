# 🌌 SmartSociety — Campus Discovery Platform

A full-stack platform connecting students with campus societies and announcements, with role-based access and a smart recommendation engine.

---

## 📁 Project Structure

```
smart-society/
├── frontend/                    ← Static website (open index.html in browser)
│   ├── index.html               ← Home page
│   ├── societies.html           ← Browse societies
│   ├── announcements.html       ← View announcements
│   ├── login.html               ← Login page
│   ├── admin.html               ← Admin dashboard
│   ├── css/
│   │   └── style.css            ← All styles
│   └── js/
│       ├── data.js              ← LocalStorage data store + mock auth
│       ├── nav.js               ← Shared nav, toast, mobile menu
│       ├── index.js             ← Home page animations
│       ├── login.js             ← Login logic
│       ├── societies.js         ← Societies page (filter, search, render)
│       ├── announcements.js     ← Announcements page
│       └── admin.js             ← Admin dashboard logic
│
└── backend/                     ← Node.js/Express REST API
    ├── server.js                ← Entry point
    ├── package.json
    ├── .env                     ← Environment variables (DO NOT COMMIT)
    ├── .env.example             ← Template
    ├── config/
    │   ├── db.js                ← MongoDB connection
    │   └── constants.js         ← App-wide constants
    ├── models/
    │   ├── User.js              ← User schema (bcrypt, JWT)
    │   ├── Society.js           ← Society schema
    │   └── Announcement.js      ← Announcement schema
    ├── controllers/
    │   ├── authController.js    ← register, login, getMe
    │   ├── societyController.js ← CRUD + pagination + search
    │   ├── announcementController.js
    │   └── recommendController.js
    ├── routes/
    │   ├── authRoutes.js
    │   ├── societyRoutes.js
    │   ├── announcementRoutes.js
    │   └── recommendRoutes.js
    ├── middleware/
    │   ├── auth.js              ← protect + authorise (RBAC)
    │   ├── validate.js          ← express-validator rules
    │   └── errorHandler.js      ← Centralised error handler + AppError
    └── utils/
        ├── apiResponse.js       ← sendSuccess / sendError / buildPaginationMeta
        ├── pagination.js        ← Query parser
        ├── recommendationEngine.js ← Scoring logic
        └── seeder.js            ← DB seeder script
```

---

## 🚀 Quick Start — Frontend

The frontend runs entirely in the browser with **no server required** (uses localStorage).

1. Open `frontend/index.html` in your browser — or serve with any static server:
   ```bash
   cd frontend
   npx serve .        # requires Node.js
   # or
   python3 -m http.server 3000
   ```

2. **Demo login credentials** (shown on the login page):
   - 🎓 Student: `student@university.edu` / `student123`
   - 🛠 Admin: `admin@university.edu` / `admin123`

---

## ⚙️ Quick Start — Backend API

### Prerequisites
- Node.js ≥ 18
- MongoDB (local or Atlas)

### Installation

```bash
cd backend
npm install
```

### Configure Environment

```bash
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
```

### Seed the Database

```bash
npm run seed
# Demo credentials after seeding:
# Admin:   admin@smartsociety.com   / Admin@1234
# Student: student@smartsociety.com / Student@1234
```

### Run the Server

```bash
npm run dev     # development (nodemon)
npm start       # production
```

Server starts at: `http://localhost:5000`  
Health check: `http://localhost:5000/health`

---

## 📡 API Reference

### Auth
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/auth/register` | Public | Register new user |
| POST | `/api/auth/login` | Public | Login, receive JWT |
| GET | `/api/auth/me` | Private | Get current user |

### Societies
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/societies` | Public | List all (paginated, searchable) |
| GET | `/api/societies/:id` | Public | Single society |
| POST | `/api/societies` | Admin | Create society |
| PUT | `/api/societies/:id` | Admin | Update society |
| DELETE | `/api/societies/:id` | Admin | Soft-delete society |

**Query params:** `?page=1&limit=10&sort=latest&search=coding&category=technical`

### Announcements
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| GET | `/api/announcements` | Public | List all (paginated) |
| GET | `/api/announcements/:id` | Public | Single announcement |
| POST | `/api/announcements` | Admin | Create announcement |
| PUT | `/api/announcements/:id` | Admin | Update announcement |
| DELETE | `/api/announcements/:id` | Admin | Soft-delete |

### Recommendations
| Method | Endpoint | Access | Description |
|--------|----------|--------|-------------|
| POST | `/api/recommend` | Public | Get ranked society recommendations |

**Body:** `{ "interests": ["coding", "ai", "technical"] }`

**Scoring:** Category match = +5 pts, Keyword match = +3 pts

---

## 📦 Example API Requests

### Register
```bash
curl -X POST http://localhost:5000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"name":"John Doe","email":"john@uni.edu","password":"secret123","role":"student","interests":["coding","ai"]}'
```

### Login
```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@smartsociety.com","password":"Admin@1234"}'
```

### Get Societies
```bash
curl "http://localhost:5000/api/societies?page=1&limit=5&sort=latest&search=coding"
```

### Create Society (Admin)
```bash
curl -X POST http://localhost:5000/api/societies \
  -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"Robotics Club","category":"technical","description":"Robotics and automation enthusiasts.","tags":["robotics","automation"]}'
```

### Get Recommendations
```bash
curl -X POST http://localhost:5000/api/recommend \
  -H "Content-Type: application/json" \
  -d '{"interests":["coding","ai","technical"]}'
```

---

## 🔒 Security Features

- **Helmet** — HTTP security headers
- **CORS** — Configurable allowed origins
- **Rate limiting** — 100 req/15min globally; 20 req/15min for auth routes
- **bcrypt** — Password hashing (12 salt rounds)
- **JWT** — Stateless authentication (7d expiry)
- **NoSQL injection prevention** — express-mongo-sanitize
- **Input validation** — express-validator on all write routes
- **Soft deletes** — Data preserved, never hard-deleted

---

## 📋 Response Format

All API responses follow this consistent format:

```json
{
  "success": true,
  "message": "Societies fetched successfully.",
  "data": [...],
  "meta": {
    "total": 8,
    "page": 1,
    "limit": 10,
    "totalPages": 1,
    "hasNext": false,
    "hasPrev": false
  }
}
```
