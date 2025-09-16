import { z } from 'zod';

// Create metal schema
export const createMetalSchema = z.object({
    body: z.object({
        name: z
            .string()
            .min(1, 'metal name is required')
            .max(100, 'metal name cannot exceed 100 characters')
            .trim(),
    }),
});

// Update metal schema
export const updateMetalSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'metal ID is required'),
    }),
    body: z.object({
        name: z
            .string()
            .min(1, 'metal name cannot be empty')
            .max(100, 'metal name cannot exceed 100 characters')
            .trim()
            .optional(),
    }).refine((data) => Object.keys(data).length > 0, {
        message: 'At least one field must be provided for update',
    }),
});

// Get metal by ID schema
export const getMetalByIdSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'metal ID is required'),
    }),
});



// Delete metal schema
export const deleteMetalSchema = z.object({
    params: z.object({
        id: z.string().min(1, 'metal ID is required'),
    }),
});

// Export all schemas
export const MetalSchemas = {
    create: createMetalSchema,
    update: updateMetalSchema,
    getById: getMetalByIdSchema,
    delete: deleteMetalSchema,
}; 