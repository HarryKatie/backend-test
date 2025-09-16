import mongoose, { Document, Schema } from 'mongoose';
import { IMetal, MongooseDocument } from '@/types';

// Product document interface
export interface IMetalDocument extends Omit<IMetal, '_id'>, Document {
    toJSON(): IMetal;
}

// Product schema
const metalSchema = new Schema<IMetalDocument>(
    {
        name: {
            type: String,
            required: [true, 'Metal name is required'],
            trim: true,
            maxlength: [100, 'Metal name cannot exceed 100 characters'],
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
metalSchema.index({ name: 1 });

// Text search index
metalSchema.index({
    name: 'text',
});


// Export the model
export const MetalModel = mongoose.model<IMetalDocument>('Metal', metalSchema); 