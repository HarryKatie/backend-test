import mongoose, { Schema, Document } from "mongoose";

export interface ICompatibilityVersion extends Document {
    version: number;
    updatedAt: Date;
}

const CompatibilityVersionSchema = new Schema<ICompatibilityVersion>(
    {
        version: {
            type: Number,
            required: true,
            default: 1,
        },
    },
    { timestamps: true }
);

export const CompatibilityVersionModel = mongoose.model<ICompatibilityVersion>("compatibility_versions", CompatibilityVersionSchema);
