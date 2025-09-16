import mongoose, { Document, Schema, Types } from 'mongoose';
import { CompatibilityVersionModel } from './CompatibilityVersion';

// Interface for individual metal compatibility
export interface IMetalCompatibility {
    metal: Types.ObjectId;      // e.g., "ALUMINUM 3003"
    isCompatible: boolean;  // true (✓) or false (✗)
}

// Main document interface
export interface ICompatibilityDocument extends Document {
    chemicalName: string;                 // e.g., "ACETONE"
    compatibilities: IMetalCompatibility[];
    createdAt?: Date;
    updatedAt?: Date;
}

// Schema for the compatibility array
const MetalCompatibilitySchema = new Schema<IMetalCompatibility>(
    {
        metal: {
            type: mongoose.Schema.Types.ObjectId,
            required: true,
            ref: "Metal",
        },
        isCompatible: {
            type: Boolean,
            required: true,
        },
    },
    { _id: false }
);

// Main schema
const CompatibilitySchema = new Schema<ICompatibilityDocument>(
    {
        chemicalName: {
            type: String,
            required: [true, 'Chemical name is required'],
            unique: true,
            trim: true,
            uppercase: true,
        },
        compatibilities: {
            type: [MetalCompatibilitySchema],
            default: [],
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
CompatibilitySchema.index({ chemicalName: 1 });

// 🔥 Middleware: After save, update, or delete → bump version
async function bumpVersion() {
    await CompatibilityVersionModel.updateOne(
        {},
        { $inc: { version: 1 } },
        { upsert: true }
    );
}

CompatibilitySchema.post("save", bumpVersion);
CompatibilitySchema.post("findOneAndUpdate", bumpVersion);
CompatibilitySchema.post("findOneAndDelete", bumpVersion);
CompatibilitySchema.post("deleteOne", bumpVersion);

// Export model
export const CompatibilityModel = mongoose.model<ICompatibilityDocument>(
    'Compatibility',
    CompatibilitySchema
);
