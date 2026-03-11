import { TrafficViolationRepository } from '../repositories/TrafficViolationRepository';
import { ContractRepository } from '../repositories/ContractRepository';
import { TrafficViolation, TrafficViolationWithContract, CreateTrafficViolationDTO } from '../models/TrafficViolation';

export class TrafficViolationService {
  private violationRepository: TrafficViolationRepository;
  private contractRepository: ContractRepository;

  constructor(
    violationRepository?: TrafficViolationRepository,
    contractRepository?: ContractRepository
  ) {
    this.violationRepository = violationRepository || new TrafficViolationRepository();
    this.contractRepository = contractRepository || new ContractRepository();
  }

  getAllViolations(): TrafficViolationWithContract[] {
    return this.violationRepository.findAll();
  }

  deleteViolation(id: number): void {
    if (!id || typeof id !== 'number') {
      throw new Error('O campo "id" é obrigatório e deve ser um número.');
    }
    const deleted = this.violationRepository.deleteById(id);
    if (!deleted) {
      throw new Error(`Infração com ID ${id} não encontrada.`);
    }
  }

  createViolation(data: CreateTrafficViolationDTO): TrafficViolation {
    this.validateViolationData(data);

    const contract = this.contractRepository.findById(data.contractId);
    if (!contract) {
      throw new Error(`Contrato com ID ${data.contractId} não encontrado.`);
    }

    return this.violationRepository.create(data);
  }

  private validateViolationData(data: CreateTrafficViolationDTO): void {
    if (!data.contractId || typeof data.contractId !== 'number') {
      throw new Error('O campo "contractId" é obrigatório e deve ser um número.');
    }

    if (data.speed === undefined || data.speed === null || typeof data.speed !== 'number') {
      throw new Error('O campo "speed" é obrigatório e deve ser um número.');
    }

    if (data.speed < 0) {
      throw new Error('O campo "speed" não pode ser negativo.');
    }

    if (!data.address || typeof data.address !== 'string' || data.address.trim().length === 0) {
      throw new Error('O campo "address" é obrigatório e deve ser uma string não vazia.');
    }
  }
}
