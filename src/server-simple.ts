import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';

const app = express();

// Security middleware
app.use(helmet());

// CORS configuration
app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  message: {
    success: false,
    message: 'Too many requests from this IP, please try again later.',
    statusCode: 429,
  },
});
app.use('/api/', limiter);

// Compression middleware
app.use(compression());

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Health check route
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Server is running',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// API Documentation route
app.get('/api/docs', (req, res) => {
  res.json({
    success: true,
    message: 'API Documentation',
    endpoints: {
      health: 'GET /health',
      users: {
        register: 'POST /api/users/register',
        login: 'POST /api/users/login',
        profile: 'GET /api/users/profile',
        all: 'GET /api/users',
      },
      products: {
        all: 'GET /api/products',
        search: 'GET /api/products/search',
        categories: 'GET /api/products/categories',
        byId: 'GET /api/products/:id',
        create: 'POST /api/products',
        update: 'PUT /api/products/:id',
        delete: 'DELETE /api/products/:id',
      }
    }
  });
});

// Mock User endpoints
app.post('/api/users/register', (req, res) => {
  const { email, password, firstName, lastName } = req.body;
  
  if (!email || !password || !firstName || !lastName) {
    return res.status(400).json({
      success: false,
      message: 'All fields are required',
      statusCode: 400,
    });
  }

  res.status(201).json({
    success: true,
    data: {
      _id: 'mock_user_id',
      email,
      firstName,
      lastName,
      role: 'user',
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    message: 'User registered successfully',
  });
});

app.post('/api/users/login', (req, res) => {
  const { email, password } = req.body;
  
  if (!email || !password) {
    return res.status(400).json({
      success: false,
      message: 'Email and password are required',
      statusCode: 400,
    });
  }

  res.status(200).json({
    success: true,
    data: {
      user: {
        _id: 'mock_user_id',
        email,
        firstName: 'John',
        lastName: 'Doe',
        role: 'user',
        isActive: true,
      },
      token: 'mock_jwt_token_here',
    },
    message: 'Login successful',
  });
});

// Mock Product endpoints
app.get('/api/products', (req, res) => {
  const { page = 1, limit = 10, search, category } = req.query;
  
  const mockProducts = [
    {
      _id: 'product_1',
      name: 'iPhone 15',
      description: 'Latest iPhone model',
      price: 999.99,
      category: 'Electronics',
      stock: 50,
      isActive: true,
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'product_2',
      name: 'MacBook Pro',
      description: 'Professional laptop',
      price: 1999.99,
      category: 'Electronics',
      stock: 25,
      isActive: true,
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    },
    {
      _id: 'product_3',
      name: 'Coffee Mug',
      description: 'Ceramic coffee mug',
      price: 15.99,
      category: 'Kitchen',
      stock: 100,
      isActive: true,
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  let filteredProducts = mockProducts;

  // Apply search filter
  if (search) {
    filteredProducts = filteredProducts.filter(product =>
      product.name.toLowerCase().includes(search.toString().toLowerCase()) ||
      product.description.toLowerCase().includes(search.toString().toLowerCase())
    );
  }

  // Apply category filter
  if (category) {
    filteredProducts = filteredProducts.filter(product =>
      product.category.toLowerCase() === category.toString().toLowerCase()
    );
  }

  // Apply pagination
  const startIndex = (Number(page) - 1) * Number(limit);
  const endIndex = startIndex + Number(limit);
  const paginatedProducts = filteredProducts.slice(startIndex, endIndex);

  res.status(200).json({
    success: true,
    data: paginatedProducts,
    message: 'Products retrieved successfully',
    pagination: {
      page: Number(page),
      limit: Number(limit),
      total: filteredProducts.length,
      totalPages: Math.ceil(filteredProducts.length / Number(limit)),
      hasNext: endIndex < filteredProducts.length,
      hasPrev: Number(page) > 1,
    },
  });
});

app.get('/api/products/search', (req, res) => {
  const { q: searchTerm } = req.query;
  
  if (!searchTerm) {
    return res.status(400).json({
      success: false,
      message: 'Search term is required',
      statusCode: 400,
    });
  }

  const mockProducts = [
    {
      _id: 'product_1',
      name: 'iPhone 15',
      description: 'Latest iPhone model',
      price: 999.99,
      category: 'Electronics',
      stock: 50,
      isActive: true,
      createdBy: 'user_1',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }
  ];

  const searchResults = mockProducts.filter(product =>
    product.name.toLowerCase().includes(searchTerm.toString().toLowerCase()) ||
    product.description.toLowerCase().includes(searchTerm.toString().toLowerCase())
  );

  res.status(200).json({
    success: true,
    data: searchResults,
    message: `Search results for '${searchTerm}'`,
    pagination: {
      page: 1,
      limit: 10,
      total: searchResults.length,
      totalPages: 1,
      hasNext: false,
      hasPrev: false,
    },
  });
});

app.get('/api/products/categories', (req, res) => {
  const categories = ['Electronics', 'Kitchen', 'Clothing', 'Books', 'Sports'];
  
  res.status(200).json({
    success: true,
    data: categories,
    message: 'Product categories retrieved successfully',
  });
});

app.get('/api/products/:id', (req, res) => {
  const { id } = req.params;
  
  const mockProduct = {
    _id: id,
    name: 'iPhone 15',
    description: 'Latest iPhone model',
    price: 999.99,
    category: 'Electronics',
    stock: 50,
    isActive: true,
    createdBy: 'user_1',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  res.status(200).json({
    success: true,
    data: mockProduct,
    message: 'Product retrieved successfully',
  });
});

// 404 handler
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
    statusCode: 404,
  });
});

const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || 'localhost';

app.listen(PORT, HOST, () => {
  console.log(`🚀 Server is running on http://${HOST}:${PORT}`);
  console.log(`📚 API Documentation: http://${HOST}:${PORT}/api/docs`);
  console.log(`❤️  Health Check: http://${HOST}:${PORT}/health`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
}); 