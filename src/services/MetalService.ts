import { NotFoundError, ConflictError } from '@/utils/errors';
import { logger } from '@/utils/logger';
import { MetalRepository } from '@/repositories/MetalRepository';
import { CreateMetalData, IMetal, UpdateMetalData } from '@/types';

export class MetalService {
    private metalRepository: MetalRepository;

    constructor() {
        this.metalRepository = new MetalRepository();
    }

    async create(data: CreateMetalData): Promise<IMetal> {
        // Check if metal with same name already exists
        const existingMetals = await this.metalRepository.findAll();

        if (existingMetals.name && existingMetals.name.length > 0) {
            throw new ConflictError('metal with this name already exists');
        }

        // Create metal
        const metal = await this.metalRepository.create({
            ...data,
        });

        logger.info(`metal created: ${metal.name}`);
        return metal;
    }

    async getById(id: string): Promise<IMetal> {
        const metal = await this.metalRepository.findById(id);
        if (!metal) {
            throw new NotFoundError('metal not found');
        }
        return metal;
    }

    async getAll(): Promise<IMetal | null> {
        return this.metalRepository.findAll();
    }

    async update(id: string, data: UpdateMetalData): Promise<IMetal> {
        // Check if metal exists
        const existingmetal = await this.metalRepository.findById(id);
        if (!existingmetal) {
            throw new NotFoundError('metal not found');
        }

        // Check if name is being updated and if it's already taken
        if (data.name && data.name !== existingmetal.name) {
            const existingmetals = await this.metalRepository.findAll();
            if (existingmetals.name && existingmetals.name.length > 0) {
                throw new ConflictError('metal with this name already exists');
            }
        }

        const updatedmetal = await this.metalRepository.update(id, data);
        if (!updatedmetal) {
            throw new NotFoundError('metal not found');
        }

        logger.info(`metal updated: ${updatedmetal.name}`);
        return updatedmetal;
    }

    async delete(id: string): Promise<boolean> {
        const metal = await this.metalRepository.findById(id);
        if (!metal) {
            throw new NotFoundError('metal not found');
        }

        const deleted = await this.metalRepository.delete(id);
        if (deleted) {
            logger.info(`metal deleted: ${metal.name}`);
        }

        return deleted;
    }
} 