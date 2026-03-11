import { useState, useEffect, useRef, FormEvent, ChangeEvent } from 'react';
import { contractService, violationService, Contract, CreateViolationPayload } from '../services/api';
import './ViolationForm.css';

interface ViolationFormProps {
  onViolationCreated: () => void;
}

export function ViolationForm({ onViolationCreated }: ViolationFormProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [contractId, setContractId] = useState<number>(0);
  const [speed, setSpeed] = useState<string>('');
  const [cep, setCep] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [addressNumber, setAddressNumber] = useState<string>('');
  const [loading, setLoading] = useState(false);
  const [cepLoading, setCepLoading] = useState(false);
  const [cepStatus, setCepStatus] = useState<'idle' | 'success' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const numberInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    loadContracts();
  }, []);

  async function loadContracts() {
    try {
      const data = await contractService.getAll();
      setContracts(data);
      if (data.length > 0) {
        setContractId(data[0].id);
      }
    } catch {
      setError('Erro ao carregar contratos.');
    }
  }

  function formatCep(value: string): string {
    const digits = value.replace(/\D/g, '').slice(0, 8);
    if (digits.length > 5) {
      return `${digits.slice(0, 5)}-${digits.slice(5)}`;
    }
    return digits;
  }

  async function fetchAddress(rawCep: string) {
    const digits = rawCep.replace(/\D/g, '');
    if (digits.length !== 8) return;

    setCepLoading(true);
    setCepStatus('idle');

    try {
      const response = await fetch(`https://viacep.com.br/ws/${digits}/json/`);
      const data = await response.json();

      if (data.erro) {
        setCepStatus('error');
        setAddress('');
        return;
      }

      const parts = [
        data.logradouro,
        data.bairro,
        `${data.localidade} - ${data.uf}`,
      ].filter(Boolean);

      setAddress(parts.join(', '));
      setCepStatus('success');

      setTimeout(() => numberInputRef.current?.focus(), 100);
    } catch {
      setCepStatus('error');
    } finally {
      setCepLoading(false);
    }
  }

  function handleCepChange(e: ChangeEvent<HTMLInputElement>) {
    const formatted = formatCep(e.target.value);
    setCep(formatted);
    setCepStatus('idle');

    const digits = formatted.replace(/\D/g, '');
    if (digits.length === 8) {
      fetchAddress(digits);
    }
  }

  function getFullAddress(): string {
    const base = address.trim();
    const num = addressNumber.trim();
    if (!base) return '';
    if (!num) return base;
    const commaIndex = base.indexOf(',');
    if (commaIndex === -1) return `${base}, ${num}`;
    return `${base.slice(0, commaIndex)}, ${num}${base.slice(commaIndex)}`;
  }

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setSuccess(false);

    if (!contractId) {
      setError('Selecione um contrato.');
      return;
    }

    if (!speed || isNaN(Number(speed)) || Number(speed) < 0) {
      setError('Informe uma velocidade válida.');
      return;
    }

    const fullAddress = getFullAddress();
    if (!fullAddress) {
      setError('Informe o endereço da infração.');
      return;
    }

    setLoading(true);

    try {
      const payload: CreateViolationPayload = {
        contractId,
        speed: Number(speed),
        address: fullAddress,
      };

      await violationService.create(payload);
      setSuccess(true);
      setSpeed('');
      setCep('');
      setAddress('');
      setAddressNumber('');
      setCepStatus('idle');
      onViolationCreated();

      setTimeout(() => setSuccess(false), 3000);
    } catch (err: unknown) {
      if (err && typeof err === 'object' && 'response' in err) {
        const axiosErr = err as { response?: { data?: { error?: string } } };
        setError(axiosErr.response?.data?.error || 'Erro ao registrar infração.');
      } else {
        setError('Erro ao registrar infração.');
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="violation-form-card">
      <div className="card-title">
        <img src="/img/form.png" alt="Formulário" className="card-icon" />
        <h2>Registrar Infração</h2>
      </div>

      {error && <div className="form-alert form-alert-error">{error}</div>}
      {success && <div className="form-alert form-alert-success">Infração registrada com sucesso!</div>}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="contract">Contrato</label>
          <select
            id="contract"
            value={contractId}
            onChange={(e) => setContractId(Number(e.target.value))}
            required
          >
            <option value={0} disabled>Selecione um contrato...</option>
            {contracts.map((c) => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="form-group">
          <label htmlFor="speed">Velocidade (km/h)</label>
          <input
            id="speed"
            type="number"
            min="0"
            step="0.1"
            placeholder="Ex: 80 km/h"
            value={speed}
            onChange={(e) => setSpeed(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="cep">CEP</label>
          <div className="cep-input-wrapper">
            <input
              id="cep"
              type="text"
              inputMode="numeric"
              placeholder="Ex: 01310-100"
              value={cep}
              onChange={handleCepChange}
              maxLength={9}
              className={cepStatus === 'success' ? 'cep-success' : cepStatus === 'error' ? 'cep-error' : ''}
            />
            {cepLoading && <span className="cep-spinner" />}
            {cepStatus === 'success' && <span className="cep-check">✓</span>}
            {cepStatus === 'error' && <span className="cep-x">CEP inválido</span>}
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="address">Endereço</label>
          <input
            id="address"
            type="text"
            placeholder="Preenchido automaticamente pelo CEP"
            value={address}
            onChange={(e) => setAddress(e.target.value)}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="addressNumber">Número</label>
          <input
            id="addressNumber"
            ref={numberInputRef}
            type="text"
            placeholder="Ex: 1000"
            value={addressNumber}
            onChange={(e) => setAddressNumber(e.target.value)}
          />
        </div>

        <button type="submit" className="btn-submit" disabled={loading}>
          {loading ? 'Registrando...' : 'Registrar Infração'}
        </button>
      </form>
    </div>
  );
}
