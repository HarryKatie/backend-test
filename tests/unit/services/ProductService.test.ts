import { ProductService } from '@/services/ProductService';
import { ProductRepository } from '@/repositories/ProductRepository';
import { NotFoundError, ConflictError, BadRequestError } from '@/utils/errors';
import { IProduct, CreateProductData } from '@/types';

// Mock the ProductRepository
jest.mock('@/repositories/ProductRepository');

describe('ProductService', () => {
  let productService: ProductService;
  let mockProductRepository: jest.Mocked<ProductRepository>;

  const mockProduct: IProduct = {
    _id: 'product_id',
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'Electronics',
    stock: 100,
    isActive: true,
    createdBy: 'user_id',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockCreateProductData: CreateProductData = {
    name: 'Test Product',
    description: 'Test Description',
    price: 99.99,
    category: 'Electronics',
    stock: 100,
  };

  beforeEach(() => {
    jest.clearAllMocks();
    mockProductRepository = new ProductRepository() as jest.Mocked<ProductRepository>;
    productService = new ProductService();
    (productService as any).productRepository = mockProductRepository;
  });

  describe('create', () => {
    it('should create a product successfully', async () => {
      mockProductRepository.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });
      mockProductRepository.create.mockResolvedValue(mockProduct);

      const result = await productService.create(mockCreateProductData, 'user_id');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.create).toHaveBeenCalledWith({
        ...mockCreateProductData,
        createdBy: 'user_id',
      });
    });

    it('should throw ConflictError if product with same name exists', async () => {
      mockProductRepository.findAll.mockResolvedValue({
        data: [mockProduct],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      await expect(productService.create(mockCreateProductData, 'user_id')).rejects.toThrow(
        ConflictError
      );
    });
  });

  describe('getById', () => {
    it('should return product if found', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);

      const result = await productService.getById('product_id');

      expect(result).toEqual(mockProduct);
      expect(mockProductRepository.findById).toHaveBeenCalledWith('product_id');
    });

    it('should throw NotFoundError if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.getById('product_id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('update', () => {
    it('should update product successfully', async () => {
      const updatedProduct = { ...mockProduct, name: 'Updated Product' };
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.findAll.mockResolvedValue({
        data: [],
        pagination: { page: 1, limit: 10, total: 0, totalPages: 0, hasNext: false, hasPrev: false },
      });
      mockProductRepository.update.mockResolvedValue(updatedProduct);

      const result = await productService.update('product_id', { name: 'Updated Product' });

      expect(result).toEqual(updatedProduct);
      expect(mockProductRepository.update).toHaveBeenCalledWith('product_id', {
        name: 'Updated Product',
      });
    });

    it('should throw NotFoundError if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(
        productService.update('product_id', { name: 'Updated Product' })
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw ConflictError if name is already taken', async () => {
      const existingProduct = { ...mockProduct, name: 'Existing Product' };
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.findAll.mockResolvedValue({
        data: [existingProduct],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      });

      await expect(
        productService.update('product_id', { name: 'Existing Product' })
      ).rejects.toThrow(ConflictError);
    });
  });

  describe('delete', () => {
    it('should delete product successfully', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.delete.mockResolvedValue(true);

      const result = await productService.delete('product_id');

      expect(result).toBe(true);
      expect(mockProductRepository.delete).toHaveBeenCalledWith('product_id');
    });

    it('should throw NotFoundError if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.delete('product_id')).rejects.toThrow(NotFoundError);
    });
  });

  describe('updateStock', () => {
    it('should update stock successfully', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(true);

      const result = await productService.updateStock('product_id', 10);

      expect(result).toBe(true);
      expect(mockProductRepository.updateStock).toHaveBeenCalledWith('product_id', 10);
    });

    it('should throw NotFoundError if product not found', async () => {
      mockProductRepository.findById.mockResolvedValue(null);

      await expect(productService.updateStock('product_id', 10)).rejects.toThrow(NotFoundError);
    });

    it('should throw BadRequestError if stock update fails', async () => {
      mockProductRepository.findById.mockResolvedValue(mockProduct);
      mockProductRepository.updateStock.mockResolvedValue(false);

      await expect(productService.updateStock('product_id', -200)).rejects.toThrow(BadRequestError);
    });
  });

  describe('searchProducts', () => {
    it('should search products successfully', async () => {
      const searchResult = {
        data: [mockProduct],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockProductRepository.searchProducts.mockResolvedValue(searchResult);

      const result = await productService.searchProducts('test');

      expect(result).toEqual(searchResult);
      expect(mockProductRepository.searchProducts).toHaveBeenCalledWith('test', undefined);
    });

    it('should throw BadRequestError if search term is too short', async () => {
      await expect(productService.searchProducts('a')).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if search term is empty', async () => {
      await expect(productService.searchProducts('')).rejects.toThrow(BadRequestError);
    });
  });

  describe('getProductsByPriceRange', () => {
    it('should get products by price range successfully', async () => {
      const rangeResult = {
        data: [mockProduct],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockProductRepository.findAll.mockResolvedValue(rangeResult);

      const result = await productService.getProductsByPriceRange(50, 150);

      expect(result).toEqual(rangeResult);
      expect(mockProductRepository.findAll).toHaveBeenCalledWith({
        minPrice: 50,
        maxPrice: 150,
      });
    });

    it('should throw BadRequestError if minPrice is negative', async () => {
      await expect(productService.getProductsByPriceRange(-10, 100)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if maxPrice is negative', async () => {
      await expect(productService.getProductsByPriceRange(10, -100)).rejects.toThrow(BadRequestError);
    });

    it('should throw BadRequestError if minPrice is greater than maxPrice', async () => {
      await expect(productService.getProductsByPriceRange(200, 100)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getLowStockProducts', () => {
    it('should get low stock products successfully', async () => {
      const lowStockResult = {
        data: [mockProduct],
        pagination: { page: 1, limit: 10, total: 1, totalPages: 1, hasNext: false, hasPrev: false },
      };
      mockProductRepository.findAll.mockResolvedValue(lowStockResult);

      const result = await productService.getLowStockProducts(10);

      expect(result).toEqual(lowStockResult);
      expect(mockProductRepository.findAll).toHaveBeenCalledWith({
        inStock: true,
      });
    });

    it('should throw BadRequestError if threshold is negative', async () => {
      await expect(productService.getLowStockProducts(-10)).rejects.toThrow(BadRequestError);
    });
  });

  describe('getCategories', () => {
    it('should return categories successfully', async () => {
      const categories = ['Electronics', 'Clothing', 'Books'];
      mockProductRepository.getCategories.mockResolvedValue(categories);

      const result = await productService.getCategories();

      expect(result).toEqual(categories);
      expect(mockProductRepository.getCategories).toHaveBeenCalled();
    });
  });

  describe('getStats', () => {
    it('should return stats successfully', async () => {
      const stats = {
        totalProducts: 100,
        activeProducts: 95,
        outOfStock: 5,
        totalValue: 9999.99,
      };
      mockProductRepository.getStats.mockResolvedValue(stats);

      const result = await productService.getStats();

      expect(result).toEqual(stats);
      expect(mockProductRepository.getStats).toHaveBeenCalled();
    });
  });
}); 