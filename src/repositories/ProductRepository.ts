import { IProduct, PaginationOptions, PaginatedResult, CreateProductData, UpdateProductData } from '@/types';
import { ProductModel, IProductDocument } from '@/models/Product';
import { NotFoundError, ConflictError } from '@/utils/errors';

export class ProductRepository {
  async create(data: CreateProductData & { createdBy: string }): Promise<IProduct> {
    try {
      const product = await ProductModel.create(data);
      return product.toJSON() as any;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('Product with this name already exists');
      }
      throw error;
    }
  }

  async findById(id: string): Promise<IProduct | null> {
    const product = await ProductModel.findById(id);
    return product ? product.toJSON() as any : null;
  }

  async findAll(options?: PaginationOptions & {
    search?: string;
    category?: string;
    minPrice?: number;
    maxPrice?: number;
    inStock?: boolean;
    isActive?: boolean;
  }): Promise<PaginatedResult<IProduct>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
      search,
      category,
      minPrice,
      maxPrice,
      inStock,
      isActive,
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    // Build filter query
    const filter: any = {};

    if (search) {
      filter.$text = { $search: search };
    }

    if (category) {
      filter.category = category;
    }

    if (minPrice !== undefined || maxPrice !== undefined) {
      filter.price = {};
      if (minPrice !== undefined) filter.price.$gte = minPrice;
      if (maxPrice !== undefined) filter.price.$lte = maxPrice;
    }

    if (inStock !== undefined) {
      if (inStock) {
        filter.stock = { $gt: 0 };
      } else {
        filter.stock = { $lte: 0 };
      }
    }

    if (isActive !== undefined) {
      filter.isActive = isActive;
    }

    const [products, total] = await Promise.all([
      ProductModel.find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      ProductModel.countDocuments(filter),
    ]);

    const normalizedProducts: IProduct[] = products.map(u => ({
      ...u,
      _id: u._id.toString(), // 👈 fix type
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: normalizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async update(id: string, data: UpdateProductData): Promise<IProduct | null> {
    try {
      const product = await ProductModel.findByIdAndUpdate(
        id,
        { $set: data },
        { new: true, runValidators: true }
      ).populate('createdBy', 'firstName lastName email');

      return product ? product.toJSON() as any : null;
    } catch (error: any) {
      if (error.code === 11000) {
        throw new ConflictError('Product with this name already exists');
      }
      throw error;
    }
  }

  async delete(id: string): Promise<boolean> {
    const result = await ProductModel.findByIdAndDelete(id);
    return !!result;
  }

  async exists(id: string): Promise<boolean> {
    const product = await ProductModel.findById(id);
    return !!product;
  }

  async findByCategory(category: string, options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      ProductModel.find({ category, isActive: true })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      ProductModel.countDocuments({ category, isActive: true }),
    ]);

    const normalizedProducts: IProduct[] = products.map(u => ({
      ...u,
      _id: u._id.toString(), // 👈 fix type
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: normalizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async findInStock(options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      ProductModel.find({ stock: { $gt: 0 }, isActive: true })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      ProductModel.countDocuments({ stock: { $gt: 0 }, isActive: true }),
    ]);

    const normalizedProducts: IProduct[] = products.map(u => ({
      ...u,
      _id: u._id.toString(), // 👈 fix type
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: normalizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async updateStock(id: string, quantity: number): Promise<boolean> {
    const product = await ProductModel.findById(id);
    if (!product) {
      return false;
    }

    const success = (product as any).updateStock(quantity);
    if (success) {
      await product.save();
    }

    return success;
  }

  async searchProducts(searchTerm: string, options?: PaginationOptions): Promise<PaginatedResult<IProduct>> {
    const {
      page = 1,
      limit = 10,
      sortBy = 'createdAt',
      sortOrder = 'desc',
    } = options || {};

    const skip = (page - 1) * limit;
    const sortDirection = sortOrder === 'asc' ? 1 : -1;

    const [products, total] = await Promise.all([
      ProductModel.find({
        $text: { $search: searchTerm },
        isActive: true,
      })
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(limit)
        .populate('createdBy', 'firstName lastName email')
        .lean(),
      ProductModel.countDocuments({
        $text: { $search: searchTerm },
        isActive: true,
      }),
    ]);

    const normalizedProducts: IProduct[] = products.map(u => ({
      ...u,
      _id: u._id.toString(), // 👈 fix type
    }));

    const totalPages = Math.ceil(total / limit);

    return {
      data: normalizedProducts,
      pagination: {
        page,
        limit,
        total,
        totalPages,
        hasNext: page < totalPages,
        hasPrev: page > 1,
      },
    };
  }

  async getCategories(): Promise<string[]> {
    const categories = await ProductModel.distinct('category', { isActive: true });
    return categories.sort();
  }

  async getStats(): Promise<{
    totalProducts: number;
    activeProducts: number;
    outOfStock: number;
    totalValue: number;
  }> {
    const [totalProducts, activeProducts, outOfStock, totalValue] = await Promise.all([
      ProductModel.countDocuments(),
      ProductModel.countDocuments({ isActive: true }),
      ProductModel.countDocuments({ stock: { $lte: 0 }, isActive: true }),
      ProductModel.aggregate([
        { $match: { isActive: true } },
        { $group: { _id: null, total: { $sum: { $multiply: ['$price', '$stock'] } } } },
      ]),
    ]);

    return {
      totalProducts,
      activeProducts,
      outOfStock,
      totalValue: totalValue[0]?.total || 0,
    };
  }
} 