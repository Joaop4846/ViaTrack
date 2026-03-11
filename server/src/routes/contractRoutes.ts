import { Router } from 'express';
import { ContractController } from '../controllers/ContractController';

const router = Router();
const contractController = new ContractController();

router.get('/', contractController.getAll);

export default router;
