import { Response } from 'express';
import { AuthenticatedRequest } from '../../middleware/authorization';
import { contractService } from './contract.service';

export class ContractController {
  public async getContractors(_req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contractors = await contractService.getContractors();
      res.json({
        success: true,
        data: contractors,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch registered contractors',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async getContracts(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const projectId = (req.query.projectId as string) || undefined;
      const contracts = await contractService.getContracts(projectId);
      res.json({
        success: true,
        data: contracts,
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to fetch contracts',
        timestamp: new Date().toISOString(),
      });
    }
  }

  public async awardContract(req: AuthenticatedRequest, res: Response): Promise<void> {
    try {
      const contract = await contractService.awardContract(req.body);
      res.status(201).json({
        success: true,
        data: contract,
        message: 'Contract awarded and Work Order issued successfully',
        timestamp: new Date().toISOString(),
      });
    } catch (error: any) {
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to award contract',
        timestamp: new Date().toISOString(),
      });
    }
  }
}

export const contractController = new ContractController();
