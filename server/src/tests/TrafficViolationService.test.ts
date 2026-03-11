import { TrafficViolationService } from '../services/TrafficViolationService';
import { TrafficViolationRepository } from '../repositories/TrafficViolationRepository';
import { ContractRepository } from '../repositories/ContractRepository';
import { CreateTrafficViolationDTO } from '../models/TrafficViolation';

jest.mock('../repositories/TrafficViolationRepository');
jest.mock('../repositories/ContractRepository');

describe('TrafficViolationService', () => {
  let service: TrafficViolationService;
  let mockViolationRepo: jest.Mocked<TrafficViolationRepository>;
  let mockContractRepo: jest.Mocked<ContractRepository>;

  beforeEach(() => {
    mockViolationRepo = new TrafficViolationRepository() as jest.Mocked<TrafficViolationRepository>;
    mockContractRepo = new ContractRepository() as jest.Mocked<ContractRepository>;
    service = new TrafficViolationService(mockViolationRepo, mockContractRepo);
  });

  describe('createViolation', () => {
    const validData: CreateTrafficViolationDTO = {
      contractId: 1,
      speed: 80,
      address: 'Rua das Flores, 123',
    };

    it('deve criar uma infração com dados válidos', () => {
      mockContractRepo.findById.mockReturnValue({
        id: 1,
        name: 'Engebras',
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      mockViolationRepo.create.mockReturnValue({
        id: 1,
        ...validData,
        createdAt: '2024-01-01',
        updatedAt: '2024-01-01',
      });

      const result = service.createViolation(validData);

      expect(result).toBeDefined();
      expect(result.id).toBe(1);
      expect(result.speed).toBe(80);
      expect(mockContractRepo.findById).toHaveBeenCalledWith(1);
      expect(mockViolationRepo.create).toHaveBeenCalledWith(validData);
    });

    it('deve lançar erro quando contractId é inválido', () => {
      expect(() =>
        service.createViolation({ ...validData, contractId: 0 })
      ).toThrow('O campo "contractId" é obrigatório e deve ser um número.');
    });

    it('deve lançar erro quando contrato não existe', () => {
      mockContractRepo.findById.mockReturnValue(undefined);

      expect(() => service.createViolation(validData)).toThrow(
        'Contrato com ID 1 não encontrado.'
      );
    });

    it('deve lançar erro quando speed é negativo', () => {
      expect(() =>
        service.createViolation({ ...validData, speed: -10 })
      ).toThrow('O campo "speed" não pode ser negativo.');
    });

    it('deve lançar erro quando address está vazio', () => {
      expect(() =>
        service.createViolation({ ...validData, address: '' })
      ).toThrow('O campo "address" é obrigatório e deve ser uma string não vazia.');
    });

    it('deve lançar erro quando address contém apenas espaços', () => {
      expect(() =>
        service.createViolation({ ...validData, address: '   ' })
      ).toThrow('O campo "address" é obrigatório e deve ser uma string não vazia.');
    });
  });

  describe('getAllViolations', () => {
    it('deve retornar todas as infrações', () => {
      const mockViolations = [
        {
          id: 1,
          contractId: 1,
          speed: 80,
          address: 'Rua A',
          createdAt: '2024-01-01',
          updatedAt: '2024-01-01',
          contractName: 'Engebras',
        },
      ];

      mockViolationRepo.findAll.mockReturnValue(mockViolations);

      const result = service.getAllViolations();

      expect(result).toHaveLength(1);
      expect(result[0].contractName).toBe('Engebras');
    });

    it('deve retornar lista vazia quando não há infrações', () => {
      mockViolationRepo.findAll.mockReturnValue([]);

      const result = service.getAllViolations();

      expect(result).toHaveLength(0);
    });
  });
});
