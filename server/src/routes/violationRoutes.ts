import { Router } from 'express';
import { TrafficViolationController } from '../controllers/TrafficViolationController';

const router = Router();
const violationController = new TrafficViolationController();

router.get('/', violationController.getAll);
router.post('/', violationController.create);
router.delete('/:id', violationController.delete);

export default router;
