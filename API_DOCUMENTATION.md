# API Documentation

## Base URL
```
http://localhost:3000
```

## Authentication
Most endpoints require authentication using JWT tokens. Include the token in the Authorization header:
```
Authorization: Bearer <your-jwt-token>
```

## Response Format
All API responses follow a consistent format:

### Success Response
```json
{
  "success": true,
  "data": {...},
  "message": "Operation completed successfully",
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

### Error Response
```json
{
  "success": false,
  "message": "Error description",
  "statusCode": 400,
  "errors": {
    "field": ["Error message"]
  }
}
```

## Health Check

### GET /health
Check if the server is running.

**Response:**
```json
{
  "success": true,
  "message": "Server is running",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "uptime": 123.456
}
```

## User Management

### POST /api/users/register
Register a new user.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123",
  "firstName": "John",
  "lastName": "Doe",
  "role": "user"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true,
    "createdAt": "2024-01-01T00:00:00.000Z",
    "updatedAt": "2024-01-01T00:00:00.000Z"
  },
  "message": "User registered successfully"
}
```

### POST /api/users/login
Login with email and password.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "Password123"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "user": {
      "_id": "user_id",
      "email": "user@example.com",
      "firstName": "John",
      "lastName": "Doe",
      "role": "user",
      "isActive": true
    },
    "token": "jwt_token_here"
  },
  "message": "Login successful"
}
```

### GET /api/users/profile
Get current user's profile. **Requires authentication.**

**Response:**
```json
{
  "success": true,
  "data": {
    "_id": "user_id",
    "email": "user@example.com",
    "firstName": "John",
    "lastName": "Doe",
    "role": "user",
    "isActive": true
  },
  "message": "Profile retrieved successfully"
}
```

### PUT /api/users/profile
Update current user's profile. **Requires authentication.**

**Request Body:**
```json
{
  "firstName": "Jane",
  "lastName": "Smith"
}
```

### PUT /api/users/change-password
Change current user's password. **Requires authentication.**

**Request Body:**
```json
{
  "oldPassword": "OldPassword123",
  "newPassword": "NewPassword123"
}
```

### POST /api/users/reset-password
Request password reset email.

**Request Body:**
```json
{
  "email": "user@example.com"
}
```

### GET /api/users
Get all users with pagination and filters. **Requires admin role.**

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sortBy` (string): Sort field (email, firstName, lastName, createdAt, role)
- `sortOrder` (string): Sort order (asc, desc)
- `search` (string): Search term
- `role` (string): Filter by role
- `isActive` (boolean): Filter by active status

### GET /api/users/:id
Get user by ID. **Requires admin role.**

### PUT /api/users/:id
Update user by ID. **Requires admin role.**

### DELETE /api/users/:id
Delete user by ID. **Requires admin role.**

### PUT /api/users/:id/deactivate
Deactivate user. **Requires admin role.**

### PUT /api/users/:id/activate
Activate user. **Requires admin role.**

## Product Management

### GET /api/products
Get all products with pagination and filters.

**Query Parameters:**
- `page` (number): Page number (default: 1)
- `limit` (number): Items per page (default: 10)
- `sortBy` (string): Sort field (name, price, category, createdAt, stock)
- `sortOrder` (string): Sort order (asc, desc)
- `search` (string): Search term
- `category` (string): Filter by category
- `minPrice` (number): Minimum price filter
- `maxPrice` (number): Maximum price filter
- `inStock` (boolean): Filter by stock availability
- `isActive` (boolean): Filter by active status

### GET /api/products/search
Search products by term.

**Query Parameters:**
- `q` (string): Search term (required)
- `page` (number): Page number
- `limit` (number): Items per page
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

### GET /api/products/categories
Get all product categories.

### GET /api/products/in-stock
Get products that are in stock.

### GET /api/products/price-range
Get products within a price range.

**Query Parameters:**
- `minPrice` (number): Minimum price (required)
- `maxPrice` (number): Maximum price (required)
- `page` (number): Page number
- `limit` (number): Items per page
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

### GET /api/products/low-stock
Get products with low stock.

**Query Parameters:**
- `threshold` (number): Stock threshold (default: 10)
- `page` (number): Page number
- `limit` (number): Items per page
- `sortBy` (string): Sort field
- `sortOrder` (string): Sort order

### GET /api/products/category/:category
Get products by category.

**Path Parameters:**
- `category` (string): Category name

### GET /api/products/:id
Get product by ID.

### POST /api/products
Create a new product. **Requires admin or moderator role.**

**Request Body:**
```json
{
  "name": "Product Name",
  "description": "Product description",
  "price": 99.99,
  "category": "Electronics",
  "stock": 100
}
```

### PUT /api/products/:id
Update product. **Requires admin or moderator role.**

**Request Body:**
```json
{
  "name": "Updated Product Name",
  "price": 89.99,
  "stock": 50
}
```

### DELETE /api/products/:id
Delete product. **Requires admin role.**

### PUT /api/products/:id/stock
Update product stock. **Requires admin or moderator role.**

**Request Body:**
```json
{
  "quantity": 10
}
```

### POST /api/products/bulk-update-stock
Bulk update product stock. **Requires admin or moderator role.**

**Request Body:**
```json
{
  "updates": [
    {
      "id": "product_id_1",
      "quantity": 10
    },
    {
      "id": "product_id_2",
      "quantity": -5
    }
  ]
}
```

### GET /api/products/stats/overview
Get product statistics. **Requires admin role.**

**Response:**
```json
{
  "success": true,
  "data": {
    "totalProducts": 100,
    "activeProducts": 95,
    "outOfStock": 5,
    "totalValue": 9999.99
  },
  "message": "Product statistics retrieved successfully"
}
```

## Error Codes

| Status Code | Description |
|-------------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request |
| 401 | Unauthorized |
| 403 | Forbidden |
| 404 | Not Found |
| 409 | Conflict |
| 429 | Too Many Requests |
| 500 | Internal Server Error |

## Rate Limiting

The API implements rate limiting to prevent abuse:
- **Window**: 15 minutes
- **Max Requests**: 100 requests per window per IP
- **Headers**: Rate limit information is included in response headers

## Pagination

Most list endpoints support pagination with the following parameters:
- `page`: Page number (starts from 1)
- `limit`: Number of items per page (max 100)
- `sortBy`: Field to sort by
- `sortOrder`: Sort direction (asc/desc)

Pagination information is included in the response:
```json
{
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 100,
    "totalPages": 10,
    "hasNext": true,
    "hasPrev": false
  }
}
```

## User Roles

- **USER**: Basic user permissions
- **MODERATOR**: Can manage products and some user operations
- **ADMIN**: Full system access

## Development

### Running the Server
```bash
# Install dependencies
npm install

# Development mode
npm run dev

# Production build
npm run build
npm start
```

### Testing
```bash
# Run tests
npm test

# Run tests with coverage
npm run test:coverage

# Watch mode
npm run test:watch
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