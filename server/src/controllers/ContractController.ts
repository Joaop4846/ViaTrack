import { Request, Response } from 'express';
import { ContractService } from '../services/ContractService';

export class ContractController {
  private contractService: ContractService;

  constructor() {
    this.contractService = new ContractService();
  }

  /**
   * @swagger
   * /api/contracts:
   *   get:
   *     summary: Lista todos os contratos
   *     tags: [Contratos]
   *     responses:
   *       200:
   *         description: Lista de contratos retornada com sucesso
   */
  getAll = (_req: Request, res: Response): void => {
    try {
      const contracts = this.contractService.getAllContracts();
      res.json(contracts);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(500).json({ error: message });
    }
  };
}
