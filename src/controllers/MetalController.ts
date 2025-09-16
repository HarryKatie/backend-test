import { Request, Response, NextFunction } from 'express';
import { ApiSuccessResponse, AuthenticatedRequest } from '@/types';
import { MetalService } from '@/services/MetalService';


export class MetalController {
    private metalService: MetalService;

    constructor() {
        this.metalService = new MetalService();
    }

    create = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const metal = await this.metalService.create(req.body);

            const response: ApiSuccessResponse<typeof metal> = {
                success: true,
                data: metal,
                message: 'Metal created successfully',
            };

            res.status(201).json(response);
        } catch (error) {
            next(error);
        }
    };

    getById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Metal ID is required',
                    statusCode: 400,
                });
                return;
            }
            const metal = await this.metalService.getById(id);

            const response: ApiSuccessResponse<typeof metal> = {
                success: true,
                data: metal,
                message: 'Metal retrieved successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    getAll = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
        try {
            
            const result = await this.metalService.getAll();

            const response: ApiSuccessResponse<typeof result> = {
                success: true,
                data: result,
                message: 'Metals retrieved successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    update = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Metal ID is required',
                    statusCode: 400,
                });
                return;
            }
            const metal = await this.metalService.update(id, req.body);

            const response: ApiSuccessResponse<typeof metal> = {
                success: true,
                data: metal,
                message: 'Metal updated successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

    delete = async (req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> => {
        try {
            const { id } = req.params;
            if (!id) {
                res.status(400).json({
                    success: false,
                    message: 'Metal ID is required',
                    statusCode: 400,
                });
                return;
            }
            await this.metalService.delete(id);

            const response: ApiSuccessResponse<null> = {
                success: true,
                data: null,
                message: 'Product deleted successfully',
            };

            res.status(200).json(response);
        } catch (error) {
            next(error);
        }
    };

} 