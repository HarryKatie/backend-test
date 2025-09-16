import { ICompatibilityDocument } from '@/models/CompatibilityMatrix';
import { CompatibilityRepository } from '@/repositories/CompatibilityRepository';
import { CompatibilityRow } from '@/types';
import { NotFoundError, ConflictError } from '@/utils/errors';
import { logger } from '@/utils/logger';

export class CompatibilityService {
    private compatibilityRepository: CompatibilityRepository;

    constructor() {
        this.compatibilityRepository = new CompatibilityRepository();
    }


    async create(data: Partial<ICompatibilityDocument>): Promise<ICompatibilityDocument> {
        const existing = await this.compatibilityRepository.findByChemical(data.chemicalName!);
        if (existing) {
            throw new ConflictError('Compatibility entry for this chemical already exists');
        }

        // ✅ check for duplicate metal inside this chemical
        if (data.compatibilities && data.compatibilities.length > 0) {
            for (const c of data.compatibilities) {
                const existsMetal = await this.compatibilityRepository.existsMetalForChemical(
                    data.chemicalName!,
                    c.metal
                );

                if (existsMetal) {
                    throw new ConflictError(
                        `Metal with id ${c.metal} already exists for chemical ${data.chemicalName}`
                    );
                }
            }
        }

        const entry = await this.compatibilityRepository.create(data);
        logger.info(`Compatibility created: ${entry.chemicalName}`);
        return entry;
    }

    async getById(id: string): Promise<ICompatibilityDocument> {
        const entry = await this.compatibilityRepository.getById(id);
        if (!entry) {
            throw new NotFoundError('Compatibility entry not found');
        }
        return entry;
    }

    async getAll(): Promise<ICompatibilityDocument[]> {
        // return this.compatibilityRepository.getAll();
        return this.compatibilityRepository.getAllWithMetals();
    }

    async update(id: string, data: Partial<ICompatibilityDocument>): Promise<ICompatibilityDocument> {
        const existing = await this.compatibilityRepository.getById(id);
        if (!existing) {
            throw new NotFoundError('Compatibility entry not found');
        }

        if (data.chemicalName && data.chemicalName !== existing.chemicalName) {
            const conflict = await this.compatibilityRepository.findByChemical(data.chemicalName);
            if (conflict) {
                throw new ConflictError('Another entry with this chemical name already exists');
            }
        }

        // ✅ Check for duplicate metals in this chemical
        // if (data.compatibilities && data.compatibilities.length > 0) {
        //     for (const c of data.compatibilities) {
        //         const existsMetal = await this.compatibilityRepository.existsMetalForChemical(
        //             data.chemicalName || existing.chemicalName, // use new or existing chemicalName
        //             c.metal
        //         );

        //         // allow if this metal already belongs to the current doc
        //         if (existsMetal &&  !existing.compatibilities.some(mc => mc.metal.toString() === c.metal.toString())) {
        //             throw new ConflictError(
        //                 `Metal with id ${c.metal} already exists for chemical ${data.chemicalName || existing.chemicalName}`
        //             );
        //         }
        //     }
        // }

        const updated = await this.compatibilityRepository.update(id, data);
        if (!updated) {
            throw new NotFoundError('Update failed - entry not found');
        }

        logger.info(`Compatibility updated: ${updated.chemicalName}`);
        return updated;
    }

    async delete(id: string): Promise<boolean> {
        const existing = await this.compatibilityRepository.getById(id);
        if (!existing) {
            throw new NotFoundError('Compatibility entry not found');
        }

        const deleted = await this.compatibilityRepository.delete(id);
        if (deleted) {
            logger.info(`Compatibility deleted: ${existing.chemicalName}`);
        }

        return deleted;
    }

    // Optional: Get all unique metals
    async getUniqueMetals(): Promise<string[]> {
        return this.compatibilityRepository.getAllMetals();
    }

    // Optional: Get matrix structure for frontend
    async getMatrixView(): Promise<{
        chemicals: string[];
        metals: string[];
        matrix: CompatibilityRow[];
    }> {
        const entries = await this.compatibilityRepository.getAll();
        const allMetalsSet = new Set<string>();

        entries.forEach(entry => {
            entry.compatibilities.forEach(c => allMetalsSet.add(c.metal.toString()));
        });

        const metals = [...allMetalsSet].sort();

        const matrix: CompatibilityRow[] = entries.map(entry => {
            const row: CompatibilityRow = {
                chemicalName: entry.chemicalName,
            };

            metals.forEach(metal => {
                const compatibility = entry.compatibilities.find(c => c.metal.toString() === metal);
                row[metal] = compatibility ? compatibility.isCompatible : null;
            });

            return row;
        });

        return {
            chemicals: entries.map(e => e.chemicalName),
            metals,
            matrix,
        };
    }

    async getAllWithVersion() {
        const data = await this.compatibilityRepository.getAllWithMetals();
        const version = await this.compatibilityRepository.getVersion();

        return { data, version };
    }

    async getVersionOnly() {
        return this.compatibilityRepository.getVersion();
    }

}
