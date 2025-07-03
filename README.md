# 💳 Payment Management Dashboard

A secure, mobile-first full-stack application for managing payment transactions with real-time analytics, user management, and comprehensive payment simulation capabilities.

![Dashboard Preview](https://via.placeholder.com/800x400/667eea/ffffff?text=Payment+Dashboard+Preview)

## 🌟 Overview

This project demonstrates a complete payment management system built with modern technologies:

- **Frontend**: React Native (Expo) with TypeScript
- **Backend**: NestJS with MongoDB
- **Authentication**: JWT with secure token storage
- **Charts**: react-native-chart-kit for data visualization
- **Database**: MongoDB for data persistence

## 🚀 Features

### 🔐 Authentication & Security
- Secure JWT-based authentication
- Role-based access control (Admin/Viewer)
- Password hashing with bcrypt
- Secure token storage with Expo SecureStore

### 📊 Dashboard & Analytics
- Real-time payment statistics
- Revenue trends visualization
- Failed transaction monitoring
- Recent payments overview
- Interactive charts and KPIs

### 💳 Payment Management
- View and filter payment transactions
- Simulate new payments with validation
- Advanced search and filtering
- Pagination for large datasets
- Detailed transaction views

### 👥 User Management (Admin)
- Create and manage system users
- Role assignment and permissions
- User activity monitoring
- Secure user deletion with safeguards

### 📱 Mobile-First Design
- Responsive UI optimized for mobile
- Native navigation and animations
- Touch-friendly interface
- Offline-ready architecture

## 🧱 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React Native (Expo), TypeScript |
| **Backend** | NestJS, Node.js |
| **Database** | MongoDB with Mongoose |
| **Authentication** | JWT, Passport.js |
| **Charts** | react-native-chart-kit |
| **Navigation** | React Navigation v6 |
| **Storage** | Expo SecureStore |
| **HTTP Client** | Axios with interceptors |
| **Validation** | class-validator, class-transformer |

## 📁 Project Structure

```
payment-dashboard/
├── payment-dashboard-backend/     # NestJS API Server
│   ├── src/
│   │   ├── auth/                 # Authentication module
│   │   ├── payments/             # Payments module
│   │   ├── users/               # Users module
│   │   └── common/              # Shared utilities
│   ├── package.json
│   └── README.md
├── payment-dashboard-frontend/    # React Native App
│   ├── src/
│   │   ├── screens/             # App screens
│   │   ├── components/          # Reusable components
│   │   ├── services/            # API services
│   │   ├── utils/              # Utility functions
│   │   └── types/              # TypeScript definitions
│   ├── App.tsx
│   ├── package.json
│   └── README.md
└── README.md                     # This file
```

## 🛠️ Quick Start

### Prerequisites
- Node.js v16+
- MongoDB (local or cloud)
- Expo CLI: `npm install -g @expo/cli`

### 1. Clone and Setup
```bash
git clone <repository-url>
cd payment-dashboard
```

### 2. Backend Setup
```bash
cd payment-dashboard-backend
npm install

# Configure environment
cp .env.example .env
# Edit .env with your MongoDB connection and JWT secret

# Start MongoDB (if local)
brew services start mongodb/brew/mongodb-community

# Start the backend
npm run start:dev
```

### 3. Frontend Setup
```bash
cd ../payment-dashboard-frontend
npm install

# Start the Expo development server
npm start
```

### 4. Access the Application
- **Backend API**: http://localhost:3000
- **Frontend**: Scan QR code with Expo Go app or run on simulator

## 🔑 Default Credentials

For testing and demonstration:
- **Username**: `admin`
- **Password**: `admin123`
- **Role**: `admin`

## 📱 App Screenshots

### Login Screen
- Secure authentication with JWT
- Pre-filled demo credentials
- Responsive design with gradient background

### Dashboard
- Real-time payment metrics
- Revenue trend charts
- Recent transactions overview
- Pull-to-refresh functionality

### Transaction List
- Paginated transaction list
- Advanced filtering options
- Search by receiver or transaction ID
- Tap to view details

### Add Payment
- Form-based payment creation
- Multiple payment methods
- Status selection and validation
- Success confirmation

### User Management
- Admin-only user management
- Create users with role assignment
- Delete users with confirmation
- Role-based access control

## 🔌 API Endpoints

### Authentication
- `POST /auth/login` - User login
- `GET /auth/profile` - Get current user profile

### Payments
- `GET /payments` - List payments with filters
- `GET /payments/:id` - Get payment details
- `POST /payments` - Create new payment
- `GET /payments/stats` - Get dashboard statistics

### Users
- `GET /users` - List all users (admin only)
- `POST /users` - Create new user (admin only)
- `DELETE /users/:id` - Delete user (admin only)

## 🧪 Testing

### Backend API Testing
```bash
# Test login
curl -X POST http://localhost:3000/auth/login \
  -H "Content-Type: application/json" \
  -d '{"username": "admin", "password": "admin123"}'

# Test payments (with token)
curl -X GET http://localhost:3000/payments \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

### Frontend Testing
1. Login with demo credentials
2. Navigate through all screens
3. Test payment creation
4. Verify user management (admin only)
5. Test logout functionality

## 🚀 Production Deployment

### Backend (NestJS)
```bash
# Build for production
npm run build

# Start production server
npm run start:prod

# Using PM2 (recommended)
pm2 start dist/main.js --name payment-dashboard-api
```

### Frontend (React Native)
```bash
# Build with EAS
eas build --platform all

# Or traditional Expo build
expo build:ios
expo build:android
```

### Environment Variables
Update these for production:
- `JWT_SECRET`: Strong, unique secret key
- `DATABASE_URL`: Production MongoDB connection
- `FRONTEND_URL`: Production frontend URL

## 🔒 Security Considerations

### Backend Security
- JWT token expiration and rotation
- Password hashing with bcrypt
- Input validation and sanitization
- CORS configuration
- Rate limiting (recommended for production)

### Frontend Security
- Secure token storage with Expo SecureStore
- Automatic logout on token expiration
- Form validation and error handling
- No sensitive data in AsyncStorage

## 📈 Performance Optimizations

### Backend
- MongoDB indexing for queries
- Pagination for large datasets
- Efficient aggregation pipelines
- Connection pooling

### Frontend
- Lazy loading and code splitting
- Image optimization
- List virtualization for large datasets
- Caching strategies

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   ```bash
   # Start MongoDB service
   brew services start mongodb/brew/mongodb-community
   ```

2. **Expo Metro Bundler Issues**
   ```bash
   # Clear cache and restart
   expo start --clear
   ```

3. **JWT Token Errors**
   - Check JWT_SECRET in .env
   - Verify token expiration settings

4. **Network Connectivity**
   - Ensure backend is running on port 3000
   - Update API_BASE_URL in frontend

## 🔮 Future Enhancements

### Planned Features
- [ ] Real-time notifications with WebSockets
- [ ] Payment export to CSV/PDF
- [ ] Advanced analytics dashboard
- [ ] Multi-currency support
- [ ] Payment method integration
- [ ] Audit logging system
- [ ] Two-factor authentication

### Technical Improvements
- [ ] Unit and integration tests
- [ ] CI/CD pipeline setup
- [ ] Docker containerization
- [ ] API rate limiting
- [ ] Advanced error monitoring
- [ ] Performance monitoring

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👨‍💻 Author

Built with ❤️ for learning and demonstration purposes.

---

## 📞 Support

If you encounter any issues or have questions:

1. Check the troubleshooting section
2. Review the individual README files in backend/frontend folders
3. Open an issue on GitHub
4. Contact the development team

---

**Happy coding! 🚀**
