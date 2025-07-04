# PayFlow Payment Management Dashboard

A full-stack payment management dashboard with role-based access, real-time updates, and modern UI, built with NestJS (backend) and React Native (frontend, Expo compatible).

# Expo APK :

Direct Link to download the app on your device - https://expo.dev/accounts/ansh_743/projects/payflow/builds/919a1a2a-5de3-44ec-b33d-028d4635a663


# Screenshots

![image](https://github.com/user-attachments/assets/d7f93c61-5a9c-45fc-b2c4-437b49e26d61)

# Assignment Walkthrough

https://www.loom.com/share/4df4b83af815413f8199e6a7b343603e?sid=d609936d-8f8e-468f-a57f-d7a498c9cc98

---

## Features

### Backend (NestJS)
- **User Authentication**: JWT-based login/register for users and admins
- **Role-Based Access Control**: Users and admins can only see their own transactions/history
- **Admin User Management**: Admins can view all users, delete users, and see user details
- **Payment Management**: Create, view, update, and delete payments
- **Payment Stats**: Dashboard stats for payments, revenue, and failed transactions
- **CSV Export**: Export payment data as CSV
- **WebSocket Support**: Real-time payment and stats updates via Socket.IO
- **CORS Configured**: Secure cross-origin requests for web and mobile
- **Environment Config**: All secrets and URLs managed via `.env`
- **Production Ready**: Deployable to Render (recommended) or Vercel (with limitations)

### Frontend (React Native + Expo)
- **Modern UI**: Dark/glassmorphism theme, responsive and accessible
- **Login/Register**: Secure authentication for users and admins
- **Dashboard**: View payment stats, recent transactions, and revenue charts
- **Transaction List**: Filter, search, and view transaction details
- **User Directory**: Admins can view all users ("User Directory"), no add user button
- **Add Payment**: Add new payments (role-based access)
- **WebSocket Toasts**: Real-time notifications for payment events
- **CSV Export**: Export payments from the app
- **Role-Based Views**: Users/admins only see their own data
- **Production API URL**: Uses `.env` for backend URL, works on any device
- **Android APK/AAB**: Build and distribute for any Android phone

---

## Getting Started

### 1. Clone the Repository
```sh
git clone (https://github.com/ansh7432/YOLO_PayFlow)
cd YOLO
```

### 2. Backend Setup (`payment-dashboard-backend`)
- Copy `.env.example` to `.env` and set your MongoDB URI, JWT secret, and frontend URL
- Install dependencies:
  ```sh
  cd payment-dashboard-backend
  npm install
  ```
- Run locally:
  ```sh
  npm run start:dev
  ```
- Deploy to Render:
  - Create a new Web Service, set environment variables from `.env`
  - Use build command: `npm install && npm run build`
  - Use start command: `npm run start:prod`

### 3. Frontend Setup (`payment-dashboard-frontend`)
- Copy `.env.example` to `.env` and set your backend URL
- Install dependencies:
  ```sh
  cd payment-dashboard-frontend
  npm install
  ```
- Run locally (Expo):
  ```sh
  npx expo start
  ```
- Build APK/AAB for Android:
  ```sh
  npx eas-cli build -p android
  ```
- Set `EXPO_PUBLIC_API_URL` as an EAS environment variable for cloud builds

---

## API Endpoints (Backend)
- `POST   /auth/register` — Register user/admin
- `POST   /auth/login` — Login
- `GET    /auth/profile` — Get current user profile
- `GET    /payments` — List payments (role-based)
- `POST   /payments` — Create payment
- `GET    /payments/stats` — Get payment stats
- `GET    /payments/export/csv` — Export payments as CSV
- `GET    /users` — List users (admin only)
- `GET    /users/:id` — Get user details
- `DELETE /users/:id` — Delete user (admin only)

---

## Deployment Notes
- **Backend**: Use Render for best compatibility (Vercel not recommended for NestJS with WebSockets)
- **Frontend**: Use Expo EAS for building APK/AAB; set environment variables in EAS dashboard
- **MongoDB Atlas**: Whitelist Render’s IPs or use `0.0.0.0/0` for testing

---

## Security
- Change all secrets before production
- Restrict MongoDB Atlas access for production
- Use HTTPS for all endpoints

---


