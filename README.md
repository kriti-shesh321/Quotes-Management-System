# Quotes Management System

A full-stack web application to manage quotes with user authentication, topics, favorites, and public/private visibility.

[🌐 Live Link](https://quotes-mgmt-app.netlify.app)

## 🚀 Features
- **User authentication** (register, login, logout)
- **Roles**: `user` and `admin`
- **Role-based access control (RBAC):**
  - `user`: Can create, edit, delete, and favorite **their own quotes**.
  - `admin`: Can edit and delete **any user’s quotes**.  
    (Admin accounts must be seeded in the database manually - frontend signup is for users only.)
- **Quotes management**:
  - Add, edit, delete quotes
  - Mark quotes as **public** or **private**
  - Mark quotes as **favorite** (per user’s own quotes)
  - Filter by **topic**, **keyword**, **my quotes**, **my favorites**
- **Responsive UI** with TailwindCSS
- **Pagination & infinite loading** support
- **API tested with Postman** (collection provided)

---

## 🛠 Tech Stack
**Frontend**  
- React + Vite + TypeScript  
- Redux Toolkit (state management)  
- TailwindCSS

**Backend**  
- Node.js + Express + TypeScript  
- PostgreSQL  
- JWT authentication (with middleware)  
- Deployed on **Railway**

---

## ⚙️ Setup

### 1. Clone the repository
```bash
git clone https://github.com/kriti-shesh321/Quotes-Management-System.git
cd Quotes-Management-System
```

### 2. Backend setup
```bash
cd server
npm install
```

Create a `.env` file in `/server`:
```env
PORT=8000
DATABASE_URL=postgresql://<user>:<password>@<host>:5432/<dbname>
JWT_SECRET=your_jwt_secret
```
Run locally:
```bash
npm run dev
```

Build and run:
```bash
npm run build
npm start
```

Endpoints available at:  
```
http://localhost:8000/api/v1
```

### 3. Frontend setup
```bash
cd client
npm install
```

Create a `.env` file in `/client`:
```env
VITE_BACKEND_URL=https://your-backend-host/api/v1
```

Run locally:
```bash
npm run dev
```

Build for production:
```bash
npm run build
```

---

## 📑 API Overview

### Auth
- `POST /api/v1/auth/register` – Register new user
- `POST /api/v1/auth/login` – Login & get token
- `GET /api/v1/user` – Get current user (requires auth)

### Quotes
- `GET /api/v1/quotes` – Fetch quotes (supports `q`, `topic_id`, `is_favorite`, `only_my`, `limit`, `offset`)
- `GET /api/v1/quotes/:id` – Get quote by Id
- `POST /api/v1/quotes` – Create a new quote
- `PUT /api/v1/quotes/:id` – Update quote (owner/admin only)
- `DELETE /api/v1/quotes/:id` – Delete quote (owner/admin only)

### Topics
- `GET /api/v1/topics` – List topics

---

## 🖥 Deployment Notes
- **Backend** deployed on Railway
- **Frontend** deployed on Netlify (proxy configured with `netlify.toml`).
⚠️ Note: Admin accounts are created directly in the database. Frontend provides user flows only.

---

## ✅ Postman Collection
A Postman collection is included in `/docs/postman_collection.json` with all endpoints and sample requests.

---

## 👤 Author
Developed by Kriti Shrivastav  
Part of internship assignment project.