import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

export interface Contract {
  id: number;
  name: string;
  createdAt: string;
  updatedAt: string;
}

export interface TrafficViolation {
  id: number;
  contractId: number;
  speed: number;
  address: string;
  createdAt: string;
  updatedAt: string;
  contractName: string;
}

export interface CreateViolationPayload {
  contractId: number;
  speed: number;
  address: string;
}

export const contractService = {
  getAll: async (): Promise<Contract[]> => {
    const response = await api.get<Contract[]>('/contracts');
    return response.data;
  },
};

export const violationService = {
  getAll: async (): Promise<TrafficViolation[]> => {
    const response = await api.get<TrafficViolation[]>('/violations');
    return response.data;
  },

  create: async (data: CreateViolationPayload): Promise<TrafficViolation> => {
    const response = await api.post<TrafficViolation>('/violations', data);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/violations/${id}`);
  },
};

export default api;
