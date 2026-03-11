import { Request, Response } from 'express';
import { TrafficViolationService } from '../services/TrafficViolationService';

export class TrafficViolationController {
  private violationService: TrafficViolationService;

  constructor() {
    this.violationService = new TrafficViolationService();
  }

  /**
   * @swagger
   * /api/violations:
   *   get:
   *     summary: Lista todas as infrações de trânsito
   *     tags: [Infrações]
   *     responses:
   *       200:
   *         description: Lista de infrações retornada com sucesso
   */
  getAll = (_req: Request, res: Response): void => {
    try {
      const violations = this.violationService.getAllViolations();
      res.json(violations);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro interno do servidor';
      res.status(500).json({ error: message });
    }
  };

  /**
   * @swagger
   * /api/violations:
   *   post:
   *     summary: Registra uma nova infração de trânsito
   *     tags: [Infrações]
   *     requestBody:
   *       required: true
   *       content:
   *         application/json:
   *           schema:
   *             type: object
   *             required:
   *               - contractId
   *               - speed
   *               - address
   *             properties:
   *               contractId:
   *                 type: integer
   *                 description: ID do contrato
   *               speed:
   *                 type: number
   *                 description: Velocidade registrada
   *               address:
   *                 type: string
   *                 description: Endereço da infração
   *     responses:
   *       201:
   *         description: Infração criada com sucesso
   *       400:
   *         description: Dados inválidos
   */
  create = (req: Request, res: Response): void => {
    try {
      const { contractId, speed, address } = req.body;
      const violation = this.violationService.createViolation({ contractId, speed, address });
      res.status(201).json(violation);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao criar infração';
      res.status(400).json({ error: message });
    }
  };

  /**
   * @swagger
   * /api/violations/{id}:
   *   delete:
   *     summary: Exclui uma infração de trânsito
   *     tags: [Infrações]
   *     parameters:
   *       - in: path
   *         name: id
   *         required: true
   *         schema:
   *           type: integer
   *     responses:
   *       204:
   *         description: Infração excluída com sucesso
   *       404:
   *         description: Infração não encontrada
   */
  delete = (req: Request, res: Response): void => {
    try {
      const id = Number(req.params.id);
      this.violationService.deleteViolation(id);
      res.status(204).send();
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Erro ao excluir infração';
      res.status(404).json({ error: message });
    }
  };
}
