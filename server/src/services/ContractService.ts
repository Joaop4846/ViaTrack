import { ContractRepository } from '../repositories/ContractRepository';
import { Contract } from '../models/Contract';

export class ContractService {
  private contractRepository: ContractRepository;

  constructor(contractRepository?: ContractRepository) {
    this.contractRepository = contractRepository || new ContractRepository();
  }

  getAllContracts(): Contract[] {
    return this.contractRepository.findAll();
  }

  getContractById(id: number): Contract | undefined {
    return this.contractRepository.findById(id);
  }
}
