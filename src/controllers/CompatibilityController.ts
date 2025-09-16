import { Request, Response, NextFunction } from 'express';
import { ApiSuccessResponse, AuthenticatedRequest } from '@/types';
import { CompatibilityService } from '@/services/CompatibilityService';

export class CompatibilityController {
    private compatibilityService = new CompatibilityService();

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const compatibility = await this.compatibilityService.create(req.body);

            const response: ApiSuccessResponse<typeof compatibility> = {
                success: true,
                data: compatibility,
                message: 'Compatibility entry created successfully',
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    getAllCompatibilitForWebApp = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.compatibilityService.getAll();

            const response: ApiSuccessResponse<typeof result> = {
                success: true,
                message: 'All compatibility entries retrieved successfully',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getAllCompatibilitForIosApp = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const { data, version } = await this.compatibilityService.getAllWithVersion();

            res.status(200).json({
                success: true,
                message: "All compatibility entries retrieved successfully",
                version,
                data,
            });
        } catch (error) {
            next(error);
        }
    };

    getAll = async (_req: Request, res: Response, next: NextFunction) => {
        try {
            const result = await this.compatibilityService.getAll();

            const response: ApiSuccessResponse<typeof result> = {
                success: true,
                message: 'All compatibility entries retrieved successfully',
                data: result,
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.compatibilityService.getById(id);

            const response: ApiSuccessResponse<typeof result> = {
                success: true,
                data: result,
                message: 'Compatibility entry retrieved successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            const result = await this.compatibilityService.update(id, req.body);

            const response: ApiSuccessResponse<typeof result> = {
                success: true,
                data: result,
                message: 'Compatibility entry updated successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
        try {
            const { id } = req.params;
            await this.compatibilityService.delete(id);

            const response: ApiSuccessResponse<null> = {
                success: true,
                data: null,
                message: 'Compatibility entry deleted successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };
}
