import { z } from 'zod';

// Create product schema
export const createProductSchema = z.object({
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name is required')
      .max(100, 'Product name cannot exceed 100 characters')
      .trim(),
    description: z
      .string()
      .min(1, 'Product description is required')
      .max(1000, 'Product description cannot exceed 1000 characters')
      .trim(),
    price: z
      .number()
      .positive('Price must be positive')
      .min(0, 'Price cannot be negative'),
    category: z
      .string()
      .min(1, 'Product category is required')
      .max(50, 'Category cannot exceed 50 characters')
      .trim(),
    stock: z
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .default(0),
  }),
});

// Update product schema
export const updateProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    name: z
      .string()
      .min(1, 'Product name cannot be empty')
      .max(100, 'Product name cannot exceed 100 characters')
      .trim()
      .optional(),
    description: z
      .string()
      .min(1, 'Product description cannot be empty')
      .max(1000, 'Product description cannot exceed 1000 characters')
      .trim()
      .optional(),
    price: z
      .number()
      .positive('Price must be positive')
      .min(0, 'Price cannot be negative')
      .optional(),
    category: z
      .string()
      .min(1, 'Product category cannot be empty')
      .max(50, 'Category cannot exceed 50 characters')
      .trim()
      .optional(),
    stock: z
      .number()
      .int('Stock must be an integer')
      .min(0, 'Stock cannot be negative')
      .optional(),
    isActive: z.boolean().optional(),
  }).refine((data) => Object.keys(data).length > 0, {
    message: 'At least one field must be provided for update',
  }),
});

// Get product by ID schema
export const getProductByIdSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

// Get products with pagination and filters schema
export const getProductsSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
    sortBy: z.enum(['name', 'price', 'category', 'createdAt', 'stock']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
    search: z.string().optional(),
    category: z.string().optional(),
    minPrice: z.string().transform(Number).optional(),
    maxPrice: z.string().transform(Number).optional(),
    inStock: z.string().transform((val) => val === 'true').optional(),
    isActive: z.string().transform((val) => val === 'true').optional(),
  }),
});

// Delete product schema
export const deleteProductSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
});

// Update stock schema
export const updateStockSchema = z.object({
  params: z.object({
    id: z.string().min(1, 'Product ID is required'),
  }),
  body: z.object({
    quantity: z
      .number()
      .int('Quantity must be an integer')
      .refine((val) => val !== 0, 'Quantity cannot be zero'),
  }),
});

// Get products by category schema
export const getProductsByCategorySchema = z.object({
  params: z.object({
    category: z.string().min(1, 'Category is required'),
  }),
  query: z.object({
    page: z.string().transform(Number).default('1'),
    limit: z.string().transform(Number).default('10'),
    sortBy: z.enum(['name', 'price', 'createdAt']).default('createdAt'),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
  }),
});

// Export all schemas
export const productSchemas = {
  create: createProductSchema,
  update: updateProductSchema,
  getById: getProductByIdSchema,
  getProducts: getProductsSchema,
  delete: deleteProductSchema,
  updateStock: updateStockSchema,
  getByCategory: getProductsByCategorySchema,
}; 