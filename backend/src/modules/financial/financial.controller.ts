import { Request, Response } from 'express';
import { financialService } from './financial.service';

export class FinancialController {
  public async getBudgetSanctions(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await financialService.getBudgetSanctions(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch budget sanctions', timestamp: new Date().toISOString() });
    }
  }

  public async createBudgetSanction(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await financialService.createBudgetSanction(user, req.body);
      res.status(201).json({ success: true, message: 'Budget sanction order registered successfully', data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to register budget sanction', timestamp: new Date().toISOString() });
    }
  }

  public async getExpenditures(req: Request, res: Response): Promise<void> {
    try {
      const { projectId } = req.query;
      const data = await financialService.getExpenditures(projectId ? String(projectId) : undefined);
      res.status(200).json({ success: true, data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(500).json({ success: false, message: err.message || 'Failed to fetch expenditure vouchers', timestamp: new Date().toISOString() });
    }
  }

  public async createRaBill(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const data = await financialService.createRaBill(user, req.body);
      res.status(201).json({ success: true, message: 'Contractor RA Bill voucher generated with statutory deductions', data, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to generate RA bill voucher', timestamp: new Date().toISOString() });
    }
  }

  public async disbursePayment(req: Request, res: Response): Promise<void> {
    try {
      const user = (req as any).user;
      const { id } = req.params;
      const { treasuryVoucherNo, bankAdviceRef } = req.body;
      const result = await financialService.disbursePayment(user, { expenditureId: id!, treasuryVoucherNo, bankAdviceRef });
      res.status(200).json({ success: true, message: result.message, data: result, timestamp: new Date().toISOString() });
    } catch (err: any) {
      res.status(400).json({ success: false, message: err.message || 'Failed to disburse treasury payment', timestamp: new Date().toISOString() });
    }
  }
}

export const financialController = new FinancialController();
