import { z } from 'zod';

// Common metal compatibility object
const metalCompatibilitySchema = z.object({
    metal: z.string().min(1, 'Metal ID is required').max(100, 'Metal ID too long').trim(),
    isCompatible: z.boolean(),
});

// ✅ Create Compatibility Entry
export const createCompatibilitySchema = z.object({
    body: z.object({
        chemicalName: z
            .string()
            .min(1, 'Chemical name is required')
            .max(100, 'Chemical name cannot exceed 100 characters')
            .trim(),
        compatibilities: z
            .array(metalCompatibilitySchema)
            .min(1, 'At least one metal compatibility is required'),
    }),
});

// ✅ Update Compatibility Entry
export const updateCompatibilitySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Compatibility ID is required'),
    }),
    body: z
        .object({
            chemicalName: z
                .string()
                .min(1, 'Chemical name cannot be empty')
                .max(100, 'Chemical name too long')
                .trim()
                .optional(),
            compatibilities: z.array(metalCompatibilitySchema).optional(),
        })
        .refine((data) => Object.keys(data).length > 0, {
            message: 'At least one field must be provided for update',
        }),
});

// ✅ Get by ID schema
export const getCompatibilityByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Compatibility ID is required'),
    }),
});

// ✅ Delete Compatibility Entry
export const deleteCompatibilitySchema = z.object({
    params: z.object({
        id: z.string().min(1, 'Compatibility ID is required'),
    }),
});

// ✅ Get by Chemical Name
export const getByChemicalSchema = z.object({
    params: z.object({
        chemicalName: z.string().min(1, 'Chemical name is required'),
    }),
});

export const getMatrixViewSchema = z.object({
  query: z.object({
    page: z.string().transform(Number).optional(),
    limit: z.string().transform(Number).optional(),
    sortBy: z.enum(['chemicalName', 'createdAt']).optional(),
    sortOrder: z.enum(['asc', 'desc']).optional(),
    search: z.string().optional(),
  }),
});

// ✅ Export all schemas
export const compatibilitySchemas = {
    create: createCompatibilitySchema,
    update: updateCompatibilitySchema,
    getById: getCompatibilityByIdSchema,
    delete: deleteCompatibilitySchema,
    getByChemical: getByChemicalSchema,
     getMatrixView: getMatrixViewSchema,
};
