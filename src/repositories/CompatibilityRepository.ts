
import { CompatibilityModel, ICompatibilityDocument } from '@/models/CompatibilityMatrix';
import { CompatibilityVersionModel } from '@/models/CompatibilityVersion';
import { ConflictError, NotFoundError } from '@/utils/errors';
import { Types } from 'mongoose';

export class CompatibilityRepository {
    async create(data: Partial<ICompatibilityDocument>): Promise<ICompatibilityDocument> {
        try {
            const doc = await CompatibilityModel.create(data);
            return doc.toJSON() as ICompatibilityDocument;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictError('Duplicate chemical entry');
            }
            throw error;
        }
    }

    async getById(id: string): Promise<ICompatibilityDocument | null> {
        const doc = await CompatibilityModel.findById(id).populate("compatibilities.metal", "name").lean();
        return doc ?? null;
    }

    async getAll(): Promise<ICompatibilityDocument[]> {
        return CompatibilityModel.find().sort({ chemicalName: 1 }).lean();
    }

    async getAllWithMetals(): Promise<ICompatibilityDocument[]> {
        return CompatibilityModel.find()
            .sort({ chemicalName: 1 })
            .populate("compatibilities.metal", "name")
            .lean();
    }

    async getVersion(): Promise<number> {
        const versionDoc = await CompatibilityVersionModel.findOne();
        return versionDoc?.version || 1;
    }

    async existsMetalForChemical(chemicalName: string, metalId: Types.ObjectId): Promise<boolean> {
        const doc = await CompatibilityModel.findOne({
            chemicalName,
            "compatibilities.metal": metalId,
        }).lean();

        return !!doc;
    }

    async findByChemical(chemicalName: string): Promise<ICompatibilityDocument | null> {
        return CompatibilityModel.findOne({ chemicalName: chemicalName.toUpperCase() }).lean();
    }

    async update(id: string, data: Partial<ICompatibilityDocument>): Promise<ICompatibilityDocument | null> {
        const updated = await CompatibilityModel.findByIdAndUpdate(id, data, {
            new: true,
            runValidators: true,
        });

        return updated ? updated.toJSON() as ICompatibilityDocument : null;
    }

    async delete(id: string): Promise<boolean> {
        const result = await CompatibilityModel.findByIdAndDelete(id);
        return !!result;
    }

    async getAllMetals(): Promise<string[]> {
        const docs = await CompatibilityModel.find().select('compatibilities.metal').lean();
        const metalSet = new Set<string>();
        docs.forEach(doc => {
            doc.compatibilities.forEach(c => metalSet.add(c.metal));
        });
        return [...metalSet].sort();
    }
}
