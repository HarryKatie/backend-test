# Node.js TypeScript Clean Architecture Project

A scalable, production-ready Node.js project with TypeScript following clean architecture principles. This project demonstrates best practices for building maintainable and scalable APIs with comprehensive features for real-world applications.

## 🏗️ Architecture

This project follows Clean Architecture principles with clear separation of concerns:

```
src/
├── config/           → Environment variables and app configuration
├── server.ts         → Entry point of the application
├── app.ts            → Express app setup
├── routes/           → All route definitions, organized by feature
├── controllers/      → Route logic, minimal business logic
├── services/         → Business logic layer
├── models/           → Mongoose models
├── middlewares/      → Custom Express middleware
├── utils/            → Reusable utility functions
├── validators/       → Request validation schemas (Zod)
├── types/            → Global TypeScript type definitions
├── repositories/     → Data access layer
└── interfaces/       → Abstractions for services, repositories, etc.
```

## 🚀 Key Features Implemented

### ✅ Core Architecture
- **Clean Architecture**: Complete separation of concerns with Controllers, Services, Repositories, and Models
- **TypeScript**: Full type safety with strict configuration
- **Express.js**: Fast, unopinionated web framework with middleware support
- **MongoDB & Mongoose**: NoSQL database with ODM and optimized queries

### ✅ Authentication & Authorization
- **JWT Authentication**: Secure token-based authentication system
- **Role-Based Access Control**: User, Moderator, and Admin roles
- **Password Security**: Bcrypt hashing with configurable rounds
- **Token Management**: Access tokens, refresh tokens, and password reset tokens

### ✅ Data Validation & Security
- **Zod Validation**: Comprehensive request validation with detailed error messages
- **Input Sanitization**: Protection against malicious input
- **Rate Limiting**: Configurable rate limiting to prevent abuse
- **Security Headers**: Helmet for security headers and CORS protection

### ✅ Error Handling & Logging
- **Centralized Error Handling**: Custom error classes with proper HTTP status codes
- **Structured Logging**: Winston logger with multiple transports and log levels
- **Performance Monitoring**: Request timing and slow request detection
- **Error Tracking**: Detailed error logging for debugging

### ✅ API Features
- **RESTful Endpoints**: Complete CRUD operations for Users and Products
- **Pagination**: Efficient pagination with metadata
- **Search & Filtering**: Advanced search and filtering capabilities
- **Bulk Operations**: Bulk update operations for efficiency
- **Statistics**: Analytics and reporting endpoints

### ✅ Code Quality & Testing
- **ESLint & Prettier**: Code linting and formatting
- **Jest Testing**: Comprehensive unit and integration tests
- **Type Safety**: Full TypeScript coverage with strict mode
- **Documentation**: Complete API documentation

## 📋 Prerequisites

- Node.js >= 18.0.0
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd nodejs-typescript-clean-architecture
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Environment Setup**
   ```bash
   cp env.example .env
   ```
   
   Update the `.env` file with your configuration:
   ```env
   NODE_ENV=development
   PORT=3000
   HOST=localhost
   MONGODB_URI=mongodb://localhost:27017/clean_architecture_db
   JWT_SECRET=your-super-secret-jwt-key-change-in-production
   ```

4. **Start MongoDB**
   Make sure MongoDB is running on your system or use a cloud instance.

## 🏃‍♂️ Running the Application

### Development
```bash
npm run dev
```

### Production
```bash
npm run build
npm start
```

### Testing
```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Code Quality
```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Format code
npm run format
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/users/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe"
}
```

#### Login
```http
POST /api/users/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "Password123"
}
```

### User Management Endpoints

#### Get User Profile (Authenticated)
```http
GET /api/users/profile
Authorization: Bearer <jwt-token>
```

#### Update User Profile (Authenticated)
```http
PUT /api/users/profile
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

#### Change Password (Authenticated)
```http
PUT /api/users/change-password
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "oldPassword": "Password123",
  "newPassword": "NewPassword123"
}
```

#### Get All Users (Admin Only)
```http
GET /api/users?page=1&limit=10&sortBy=createdAt&sortOrder=desc
Authorization: Bearer <jwt-token>
```

#### Get User by ID (Admin Only)
```http
GET /api/users/:id
Authorization: Bearer <jwt-token>
```

#### Update User (Admin Only)
```http
PUT /api/users/:id
Authorization: Bearer <jwt-token>
Content-Type: application/json

{
  "firstName": "Jane",
  "lastName": "Smith",
  "role": "admin"
}
```

#### Delete User (Admin Only)
```http
DELETE /api/users/:id
Authorization: Bearer <jwt-token>
```

### Health Check
```http
GET /health
```

## 🧪 Testing

The project includes comprehensive testing setup:

- **Unit Tests**: Test individual functions and classes
- **Integration Tests**: Test API endpoints
- **Test Coverage**: Coverage reports for code quality

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage

# Run specific test file
npm test -- UserService.test.ts
```

## 🚀 Quick Start

1. **Install dependencies:**
   ```bash
   npm install
   ```

2. **Set up environment:**
   ```bash
   cp env.example .env
   # Edit .env with your configuration
   ```

3. **Start MongoDB** (make sure MongoDB is running)

4. **Run in development mode:**
   ```bash
   npm run dev
   ```

5. **Test the API:**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Register a user
   curl -X POST http://localhost:3000/api/users/register \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Password123","firstName":"Admin","lastName":"User","role":"admin"}'
   
   # Login
   curl -X POST http://localhost:3000/api/users/login \
     -H "Content-Type: application/json" \
     -d '{"email":"admin@example.com","password":"Password123"}'
   ```

## 🔧 Adding New Features

1. **Create Types** (`src/types/index.ts`)
   ```typescript
   export interface IProduct {
     _id: string;
     name: string;
     price: number;
     // ... other fields
   }
   ```

8. **Register Routes** (`src/routes/index.ts`)
   ```typescript
   import productRoutes from './product';
   router.use('/api/products', productRoutes);
   ```

## 🔒 Security Features

- **JWT Authentication**: Secure token-based authentication
- **Password Hashing**: bcrypt for password security
- **Rate Limiting**: API rate limiting to prevent abuse
- **CORS**: Configurable cross-origin resource sharing
- **Helmet.js**: Security headers
- **Input Validation**: Zod schema validation
- **Error Handling**: Secure error responses

## 📦 Project Structure

```
├── src/
│   ├── config/           # Configuration files
│   ├── controllers/      # HTTP request handlers
│   ├── interfaces/       # TypeScript interfaces
│   ├── middlewares/      # Express middlewares
│   ├── models/           # Mongoose models
│   ├── repositories/     # Data access layer
│   ├── routes/           # Route definitions
│   ├── services/         # Business logic
│   ├── types/            # TypeScript types
│   ├── utils/            # Utility functions
│   ├── validators/       # Request validation
│   ├── app.ts            # Express app setup
│   └── server.ts         # Server entry point
├── tests/                # Test files
├── .env.example          # Environment variables example
├── .eslintrc.js          # ESLint configuration
├── jest.config.js        # Jest configuration
├── package.json          # Dependencies and scripts
├── tsconfig.json         # TypeScript configuration
└── README.md             # Project documentation
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

If you have any questions or need help, please open an issue on GitHub.

## 🔄 Version History

- **v1.0.0**: Initial release with basic user management and authentication 