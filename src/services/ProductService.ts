import { IProduct, CreateProductData, UpdateProductData, PaginationOptions, PaginatedResult } from '@/types';
import { ProductRepository } from '@/repositories/ProductRepository';
import { NotFoundError, BadRequestError, ConflictError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class ProductService {
  private productRepository: ProductRepository;

  constructor() {
    this.productRepository = new ProductRepository();
  }

  async create(data: CreateProductData, createdBy: string): Promise<IProduct> {
    // Check if product with same name already exists
    const existingProducts = await this.productRepository.findAll({ 
      page: 1, 
      limit: 10, 
      search: data.name 
    });
    if (existingProducts.data.length > 0) {
      throw new ConflictError('Product with this name already exists');
    }

    // Create product
    const product = await this.productRepository.create({
      ...data,
      createdBy,
    });

    logger.info(`Product created: ${product.name} by user: ${createdBy}`);
    return product;
  }

  async getById(id: string): Promise<IProduct> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }
    return product;
  }

  async getAll(options?: PaginationOptions & {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isActive?: boolean;
  }): Promise<PaginatedResult<IProduct>> {
    return this.productRepository.findAll(options);
  }

  async update(id: string, data: UpdateProductData): Promise<IProduct> {
    // Check if product exists
    const existingProduct = await this.productRepository.findById(id);
    if (!existingProduct) {
      throw new NotFoundError('Product not found');
    }

    // Check if name is being updated and if it's already taken
    if (data.name && data.name !== existingProduct.name) {
      const existingProducts = await this.productRepository.findAll({ 
        page: 1, 
        limit: 10, 
        search: data.name 
      });
      if (existingProducts.data.length > 0) {
        throw new ConflictError('Product with this name already exists');
      }
    }

    const updatedProduct = await this.productRepository.update(id, data);
    if (!updatedProduct) {
      throw new NotFoundError('Product not found');
    }

    logger.info(`Product updated: ${updatedProduct.name}`);
    return updatedProduct;
  }

  async delete(id: string): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const deleted = await this.productRepository.delete(id);
    if (deleted) {
      logger.info(`Product deleted: ${product.name}`);
    }

    return deleted;
  }

  async updateStock(id: string, quantity: number): Promise<boolean> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new NotFoundError('Product not found');
    }

    const updated = await this.productRepository.updateStock(id, quantity);
    if (updated) {
      logger.info(`Stock updated for product: ${product.name}, quantity: ${quantity}`);
    } else {
      throw new BadRequestError('Insufficient stock or invalid quantity');
    }

    return updated;
  }

  async getByCategory(category: string, options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    return this.productRepository.findByCategory(category, options);
  }

  async getInStock(options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    return this.productRepository.findInStock(options);
  }

  async searchProducts(searchTerm: string, options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    if (!searchTerm || searchTerm.trim().length < 2) {
      throw new BadRequestError('Search term must be at least 2 characters long');
    }

    return this.productRepository.searchProducts(searchTerm, options);
  }

  async getCategories(): Promise<string[]> {
    return this.productRepository.getCategories();
  }

  async getStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    totalValue: number;
  }> {
    return this.productRepository.getStats();
  }

  // Additional business logic methods
  async getProductsByPriceRange(minPrice: number, maxPrice: number, options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    if (minPrice < 0 || maxPrice < 0) {
      throw new BadRequestError('Price range cannot be negative');
    }

    if (minPrice > maxPrice) {
      throw new BadRequestError('Minimum price cannot be greater than maximum price');
    }

    return this.productRepository.findAll({
      page: options?.page || 1,
      limit: options?.limit || 10,
      sortBy: options?.sortBy || 'createdAt',
      sortOrder: options?.sortOrder || 'desc',
      minPrice,
      maxPrice,
    });
  }

  async getLowStockProducts(threshold: number = 10, options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    if (threshold < 0) {
      throw new BadRequestError('Stock threshold cannot be negative');
    }

    const allProducts = await this.productRepository.findAll({
      page: options?.page || 1,
      limit: options?.limit || 10,
      sortBy: options?.sortBy || 'createdAt',
      sortOrder: options?.sortOrder || 'desc',
      inStock: true,
    });

    const lowStockProducts = allProducts.data.filter(product => product.stock <= threshold);

    return {
      data: lowStockProducts,
      pagination: allProducts.pagination,
    };
  }

  async bulkUpdateStock(updates: Array<{ id: string; quantity: number }>): Promise<{
    success: number;
    failed: number;
    errors: Array<{ id: string; error: string }>;
  }> {
    const results = {
      success: 0,
      failed: 0,
      errors: [] as Array<{ id: string; error: string }>,
    };

    for (const update of updates) {
      try {
        const success = await this.updateStock(update.id, update.quantity);
        if (success) {
          results.success++;
        } else {
          results.failed++;
          results.errors.push({ id: update.id, error: 'Update failed' });
        }
      } catch (error) {
        results.failed++;
        results.errors.push({ id: update.id, error: (error as Error).message });
      }
    }

    logger.info(`Bulk stock update completed: ${results.success} successful, ${results.failed} failed`);
    return results;
  }
} 