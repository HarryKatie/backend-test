import mongoose, { Document, Schema } from 'mongoose';
import { IProduct, MongooseDocument } from '@/types';

// Product document interface
export interface IProductDocument extends Omit<IProduct, '_id'>, Document {
  toJSON(): IProduct;
}

// Product schema
const productSchema = new Schema<IProductDocument>(
  {
    name: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      maxlength: [100, 'Product name cannot exceed 100 characters'],
    },
    description: {
      type: String,
      required: [true, 'Product description is required'],
      trim: true,
      maxlength: [1000, 'Product description cannot exceed 1000 characters'],
    },
    price: {
      type: Number,
      required: [true, 'Product price is required'],
      min: [0, 'Price cannot be negative'],
    },
    category: {
      type: String,
      required: [true, 'Product category is required'],
      trim: true,
      maxlength: [50, 'Category cannot exceed 50 characters'],
    },
    stock: {
      type: Number,
      required: [true, 'Product stock is required'],
      min: [0, 'Stock cannot be negative'],
      default: 0,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Product creator is required'],
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform: function (doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

// Indexes
productSchema.index({ name: 1 });
productSchema.index({ category: 1 });
productSchema.index({ isActive: 1 });
productSchema.index({ createdBy: 1 });
productSchema.index({ price: 1 });

// Text search index
productSchema.index({
  name: 'text',
  description: 'text',
  category: 'text',
});

// Static method to find products by category
productSchema.statics.findByCategory = function (category: string) {
  return this.find({ category, isActive: true });
};

// Static method to find products in stock
productSchema.statics.findInStock = function () {
  return this.find({ stock: { $gt: 0 }, isActive: true });
};

// Static method to search products
productSchema.statics.searchProducts = function (searchTerm: string) {
  return this.find({
    $text: { $search: searchTerm },
    isActive: true,
  });
};

// Instance method to update stock
productSchema.methods.updateStock = function (quantity: number): boolean {
  const newStock = this.stock + quantity;
  if (newStock < 0) {
    return false;
  }
  this.stock = newStock;
  return true;
};

// Export the model
export const ProductModel = mongoose.model<IProductDocument>('Product', productSchema); 