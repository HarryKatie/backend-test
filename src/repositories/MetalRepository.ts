import { IMetal, PaginationOptions, PaginatedResult, CreateMetalData, UpdateMetalData } from '@/types';
import { MetalModel, IMetalDocument } from '@/models/Metal';
import { NotFoundError, ConflictError } from '@/utils/errors';

export class MetalRepository {
    async create(data: CreateMetalData): Promise<IMetal> {
        try {
            const metal = await MetalModel.create(data);
            return metal.toJSON() as any;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictError('Metal with this name already exists');
            }
            throw error;
        }
    }

    async findById(id: string): Promise<IMetal | null> {
        const product = await MetalModel.findById(id);
        return product ? product.toJSON() as any : null;
    }

    async findAll(): Promise<IMetal | null> {
        const metal = await MetalModel.find();
        return metal ? metal as any : null;
    }

    async update(id: string, data: UpdateMetalData): Promise<IMetal | null> {
        try {
            const metal = await MetalModel.findByIdAndUpdate(
                id,
                { $set: data },
                { new: true, runValidators: true }
            );

            return metal ? metal.toJSON() as any : null;
        } catch (error: any) {
            if (error.code === 11000) {
                throw new ConflictError('Metal with this name already exists');
            }
            throw error;
        }
    }

    async delete(id: string): Promise<boolean> {
        const result = await MetalModel.findByIdAndDelete(id);
        return !!result;
    }



} 