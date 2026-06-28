# Task Tracker (MERN Stack)

A modern, full-stack Task Tracker application built with MongoDB, Express, React, and Node.js. 

This repository was strictly developed following the `internship_handbook.md` rules, ensuring top-tier security, DRY code, proper state management, accessible UI, and a feature-based folder architecture.

## Features
- **Frontend**: React, Vite, Tailwind CSS, shadcn/ui, Zod validation, React Hook Form, Framer Motion.
- **Backend**: Express, MongoDB (Mongoose), JWT Authentication, Zod validation.
- **Architecture**: Strict feature-based folder co-location (`/features/auth`, `/features/tasks`).

## Quick Start

### 1. Environment Setup

You must create two `.env` files before starting the app.

**Backend (`backend/.env`)**
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/tasktracker
JWT_SECRET=your_super_secret_jwt_key
```
*(Note: If `JWT_SECRET` is missing, the backend will intentionally crash with a FATAL ERROR to prevent insecure deployments).*

**Frontend (`frontend/.env`)**
```env
VITE_API_URL=http://localhost:5000
```

### 2. Running the Backend

```bash
cd backend
npm install
npm run dev
```

### 3. Running the Frontend

In a separate terminal:
```bash
cd frontend
npm install
npm run dev
```
Visit `http://localhost:5173` in your browser.

## Deployment & Handoff
This repository is clean and ready for deployment. All secrets, `node_modules`, and build artifacts are excluded via `.gitignore`. 
