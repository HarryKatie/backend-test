import { Request, Response, NextFunction } from 'express';
import { ProductService } from '@/services/ProductService';
import { ApiSuccessResponse, AuthenticatedRequest } from '@/types';


export class ProductController {
  private productService: ProductService;

  constructor() {
    this.productService = new ProductService();
  }

  create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const product = await this.productService.create(req.body, req.user!._id);

      const response: ApiSuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: 'Product created successfully',
      };

      res.status(201).json(response);
    } catch (error) {
      next(error);
    }
  };

  getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required',
          statusCode: 400,
        });
        return;
      }
      const product = await this.productService.getById(id);

      const response: ApiSuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: 'Product retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const {
        page,
        limit,
        sortBy,
        sortOrder,
        search,
        category,
        minPrice,
        maxPrice,
        inStock,
        isActive,
      } = req.query;

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
        search: search as string,
        category: category as string,
        minPrice: minPrice ? Number(minPrice) : undefined,
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
        inStock: inStock ? inStock === 'true' : undefined,
        isActive: isActive ? isActive === 'true' : undefined,
      };

      const result = await this.productService.getAll(options);

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        data: result.data,
        message: 'Products retrieved successfully',
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required',
          statusCode: 400,
        });
        return;
      }
      const product = await this.productService.update(id, req.body);

      const response: ApiSuccessResponse<typeof product> = {
        success: true,
        data: product,
        message: 'Product updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required',
          statusCode: 400,
        });
        return;
      }
      await this.productService.delete(id);

      const response: ApiSuccessResponse<null> = {
        success: true,
        data: null,
        message: 'Product deleted successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  updateStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      const { quantity } = req.body;
      if (!id) {
        res.status(400).json({
          success: false,
          message: 'Product ID is required',
          statusCode: 400,
        });
        return;
      }
      await this.productService.updateStock(id, quantity);

      const response: ApiSuccessResponse<null> = {
        success: true,
        data: null,
        message: 'Product stock updated successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getByCategory = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { category } = req.params;
      if (!category) {
        res.status(400).json({
          success: false,
          message: 'Category is required',
          statusCode: 400,
        });
        return;
      }
      const { page, limit, sortBy, sortOrder } = req.query;

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await this.productService.getByCategory(category, options);

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        data: result.data,
        message: `Products in category '${category}' retrieved successfully`,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getInStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { page, limit, sortBy, sortOrder } = req.query;

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await this.productService.getInStock(options);

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        data: result.data,
        message: 'Products in stock retrieved successfully',
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  search = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { q: searchTerm } = req.query;
      const { page, limit, sortBy, sortOrder } = req.query;

      if (!searchTerm || typeof searchTerm !== 'string') {
        res.status(400).json({
          success: false,
          message: 'Search term is required',
          statusCode: 400,
        });
        return;
      }

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await this.productService.searchProducts(searchTerm, options);

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        data: result.data,
        message: `Search results for '${searchTerm}'`,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getCategories = async (_req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const categories = await this.productService.getCategories();

      const response: ApiSuccessResponse<typeof categories> = {
        success: true,
        data: categories,
        message: 'Product categories retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getStats = async (_req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const stats = await this.productService.getStats();

      const response: ApiSuccessResponse<typeof stats> = {
        success: true,
        data: stats,
        message: 'Product statistics retrieved successfully',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getByPriceRange = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { minPrice, maxPrice } = req.query;
      const { page, limit, sortBy, sortOrder } = req.query;

      if (!minPrice || !maxPrice) {
        res.status(400).json({
          success: false,
          message: 'Both minPrice and maxPrice are required',
          statusCode: 400,
        });
        return;
      }

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await this.productService.getProductsByPriceRange(
        Number(minPrice),
        Number(maxPrice),
        options
      );

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        data: result.data,
        message: `Products in price range $${minPrice} - $${maxPrice} retrieved successfully`,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  getLowStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { threshold } = req.query;
      const { page, limit, sortBy, sortOrder } = req.query;

      const options = {
        page: Number(page) || 1,
        limit: Number(limit) || 10,
        sortBy: sortBy as string || 'createdAt',
        sortOrder: sortOrder as 'asc' | 'desc' || 'desc',
      };

      const result = await this.productService.getLowStockProducts(
        threshold ? Number(threshold) : 10,
        options
      );

      const response: ApiSuccessResponse<typeof result.data> = {
        success: true,
        data: result.data,
        message: `Low stock products (threshold: ${threshold || 10}) retrieved successfully`,
        pagination: result.pagination,
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };

  bulkUpdateStock = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { updates } = req.body;

      if (!Array.isArray(updates) || updates.length === 0) {
        res.status(400).json({
          success: false,
          message: 'Updates array is required and cannot be empty',
          statusCode: 400,
        });
        return;
      }

      const result = await this.productService.bulkUpdateStock(updates);

      const response: ApiSuccessResponse<typeof result> = {
        success: true,
        data: result,
        message: 'Bulk stock update completed',
      };

      res.status(200).json(response);
    } catch (error) {
      next(error);
    }
  };
} 