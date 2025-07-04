# Payment Management Dashboard - Backend

A secure NestJS backend API for the Payment Management Dashboard with JWT authentication, MongoDB integration, and comprehensive payment management features.

## 🚀 Features

- **Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control (admin, viewer)
  - Secure password hashing with bcrypt

- **Payment Management**
  - Create, read, and list payments
  - Advanced filtering (date range, status, payment method)
  - Pagination support
  - Payment statistics and analytics

- **User Management**
  - User CRUD operations
  - Role management
  - Secure user data handling

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn package manager

## 🛠️ Installation

1. Install dependencies:
```bash
npm install
```

2. Set up environment variables:
```bash
cp .env.example .env
```

Edit `.env` file with your configuration:
```env
NODE_ENV=development
PORT=3000
DATABASE_URL=mongodb://localhost:27017/payment-dashboard
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h
FRONTEND_URL=http://localhost:19006
```

3. Start MongoDB (if running locally):
```bash
# Using Docker
docker run --name mongodb -d -p 27017:27017 mongo:latest

# Or install MongoDB locally and start the service
```

## 🏃‍♂️ Running the Application

### Development
```bash
npm run start:dev
```

### Production
```bash
npm run build
npm run start:prod
```

The API will be available at `http://localhost:3000`

## 📚 API Documentation

### Authentication Endpoints

#### POST /auth/login
Login with username and password
```json
{
  "username": "admin",
  "password": "123456"
}
```

Response:
```json
{
  "access_token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "username": "admin",
    "email": "admin@example.com",
    "role": "admin"
  }
}
```

#### GET /auth/profile
Get current user profile (requires authentication)

### Payment Endpoints

#### GET /payments
List payments with optional filters
- Query parameters:
  - `page`: Page number (default: 1)
  - `limit`: Items per page (default: 10)
  - `status`: Filter by status (success, failed, pending)
  - `method`: Filter by payment method
  - `startDate`: Filter by start date (ISO string)
  - `endDate`: Filter by end date (ISO string)

#### GET /payments/stats
Get payment statistics for dashboard

#### GET /payments/:id
Get specific payment by ID

#### POST /payments
Create new payment
```json
{
  "amount": 150.00,
  "receiver": "John Doe",
  "status": "success",
  "method": "credit_card",
  "description": "Product purchase",
  "currency": "USD"
}
```

### User Endpoints

#### GET /users
List all users (admin only)

#### POST /users
Create new user (admin only)
```json
{
  "username": "newuser",
  "email": "user@example.com",
  "password": "password123",
  "role": "viewer"
}
```

#### GET /users/:id
Get user by ID

#### DELETE /users/:id
Delete user (admin only)

## 🔐 Default Credentials

The application creates a default admin user on first run:
- **Username**: `admin`
- **Password**: `123456`
- **Email**: `admin@paymentdashboard.com`
- **Role**: `admin`

## 🧪 Testing

Run tests:
```bash
npm run test
```

Run e2e tests:
```bash
npm run test:e2e
```

## 📁 Project Structure

```
src/
├── auth/                 # Authentication module
│   ├── dto/             # Data transfer objects
│   ├── guards/          # Auth guards
│   ├── auth.controller.ts
│   ├── auth.service.ts
│   ├── auth.module.ts
│   ├── jwt.strategy.ts
│   └── local.strategy.ts
├── payments/            # Payments module
│   ├── dto/            # Data transfer objects
│   ├── schemas/        # Mongoose schemas
│   ├── payments.controller.ts
│   ├── payments.service.ts
│   └── payments.module.ts
├── users/              # Users module
│   ├── dto/           # Data transfer objects
│   ├── schemas/       # Mongoose schemas
│   ├── users.controller.ts
│   ├── users.service.ts
│   └── users.module.ts
├── app.module.ts      # Main application module
└── main.ts           # Application entry point
```

## 🔧 Configuration

### Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `NODE_ENV` | Environment mode | `development` |
| `PORT` | Server port | `3000` |
| `DATABASE_URL` | MongoDB connection string | `mongodb://localhost:27017/payment-dashboard` |
| `JWT_SECRET` | JWT signing secret | Required |
| `JWT_EXPIRES_IN` | JWT expiration time | `24h` |
| `FRONTEND_URL` | Frontend URL for CORS | `http://localhost:19006` |

## 🚀 Deployment

### Using Docker

1. Build the image:
```bash
docker build -t payment-dashboard-backend .
```

2. Run the container:
```bash
docker run -p 3000:3000 --env-file .env payment-dashboard-backend
```

### Using PM2

1. Install PM2:
```bash
npm install -g pm2
```

2. Build and start:
```bash
npm run build
pm2 start dist/main.js --name payment-dashboard-api
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a Pull Request

## 📄 License

This project is licensed under the MIT License.
