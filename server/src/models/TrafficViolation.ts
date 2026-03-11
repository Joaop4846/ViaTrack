export interface TrafficViolation {
  id: number;
  contractId: number;
  speed: number;
  address: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrafficViolationWithContract extends TrafficViolation {
  contractName: string;
}

export interface CreateTrafficViolationDTO {
  contractId: number;
  speed: number;
  address: string;
}
