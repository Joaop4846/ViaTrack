import { useState, useEffect, useRef } from 'react';
import { violationService, TrafficViolation } from '../services/api';
import './ViolationList.css';

interface ViolationListProps {
  refreshKey: number;
  onViolationDeleted: () => void;
}

type SortOption = 'date-desc' | 'date-asc' | 'contract-az' | 'speed-desc' | 'speed-asc';

const SORT_LABELS: Record<SortOption, string> = {
  'date-desc': 'Data (Recentes)',
  'date-asc': 'Data (Antigas)',
  'contract-az': 'Contrato (A-Z)',
  'speed-desc': 'Velocidade (Maior)',
  'speed-asc': 'Velocidade (Menor)',
};

function getSpeedClass(speed: number): string {
  if (speed > 100) return 'speed-high';
  if (speed > 60) return 'speed-medium';
  return 'speed-normal';
}

export function ViolationList({ refreshKey, onViolationDeleted }: ViolationListProps) {
  const [violations, setViolations] = useState<TrafficViolation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<SortOption>('date-desc');
  const [showSortMenu, setShowSortMenu] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [confirmDeleteId, setConfirmDeleteId] = useState<number | null>(null);
  const [newIds, setNewIds] = useState<Set<number>>(new Set());
  const prevIdsRef = useRef<Set<number>>(new Set());

  useEffect(() => {
    loadViolations();
  }, [refreshKey]);

  async function loadViolations() {
    setLoading(true);
    setError(null);
    try {
      const data = await violationService.getAll();

      const currentIds = new Set(data.map((v) => v.id));
      const added = new Set<number>();
      currentIds.forEach((id) => {
        if (prevIdsRef.current.size > 0 && !prevIdsRef.current.has(id)) {
          added.add(id);
        }
      });
      prevIdsRef.current = currentIds;
      setNewIds(added);
      setViolations(data);

      if (added.size > 0) {
        setTimeout(() => setNewIds(new Set()), 800);
      }
    } catch {
      setError('Erro ao carregar infrações.');
    } finally {
      setLoading(false);
    }
  }

  function requestDelete(id: number) {
    setConfirmDeleteId(id);
  }

  function cancelDelete() {
    setConfirmDeleteId(null);
  }

  async function confirmDelete() {
    if (confirmDeleteId === null || deletingId) return;
    const id = confirmDeleteId;
    setConfirmDeleteId(null);
    setDeletingId(id);
    try {
      await violationService.delete(id);
      setViolations((prev) => prev.filter((v) => v.id !== id));
      onViolationDeleted();
    } catch {
      setError('Erro ao excluir infração.');
    } finally {
      setDeletingId(null);
    }
  }

  function getSortedViolations(): TrafficViolation[] {
    const sorted = [...violations];
    switch (sortBy) {
      case 'date-desc':
        return sorted.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      case 'date-asc':
        return sorted.sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
      case 'contract-az':
        return sorted.sort((a, b) => a.contractName.localeCompare(b.contractName));
      case 'speed-desc':
        return sorted.sort((a, b) => b.speed - a.speed);
      case 'speed-asc':
        return sorted.sort((a, b) => a.speed - b.speed);
      default:
        return sorted;
    }
  }

  function formatDate(dateStr: string): string {
    const date = new Date(dateStr);
    return date.toLocaleDateString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const cardHeader = (
    <div className="list-header">
      <div className="card-title">
        <img src="/img/list.png" alt="Lista" className="card-icon" />
        <h2>Infrações Registradas</h2>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="violation-list-card">
        {cardHeader}
        <p className="loading-text">Carregando...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="violation-list-card">
        {cardHeader}
        <div className="list-alert-error">{error}</div>
      </div>
    );
  }

  const sortedViolations = getSortedViolations();

  return (
    <div className="violation-list-card">
      <div className="list-header">
        <div className="card-title">
          <img src="/img/list.png" alt="Lista" className="card-icon" />
          <h2>Infrações Registradas</h2>
        </div>
        <div className="list-header-actions">
          <div className="sort-wrapper">
            <button
              className="btn-sort"
              onClick={() => setShowSortMenu((prev) => !prev)}
              title="Ordenar"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 6h18M6 12h12M9 18h6" />
              </svg>
              {SORT_LABELS[sortBy]}
            </button>
            {showSortMenu && (
              <div className="sort-dropdown">
                {(Object.keys(SORT_LABELS) as SortOption[]).map((opt) => (
                  <button
                    key={opt}
                    className={`sort-option ${sortBy === opt ? 'active' : ''}`}
                    onClick={() => {
                      setSortBy(opt);
                      setShowSortMenu(false);
                    }}
                  >
                    {SORT_LABELS[opt]}
                  </button>
                ))}
              </div>
            )}
          </div>
          <span className="badge">{violations.length} registro(s)</span>
        </div>
      </div>

      {violations.length === 0 ? (
        <p className="empty-text">Nenhuma infração registrada ainda.</p>
      ) : (
        <div className="table-scroll-wrapper">
          <table className="violations-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Contrato</th>
                <th>Velocidade</th>
                <th>Endereço</th>
                <th>Data</th>
                <th className="th-actions"></th>
              </tr>
            </thead>
            <tbody>
              {sortedViolations.map((v) => (
                <tr key={v.id} className={`${deletingId === v.id ? 'row-deleting' : ''} ${newIds.has(v.id) ? 'row-new' : ''}`}>
                  <td className="td-id">#{v.id}</td>
                  <td className="td-contract td-truncate" title={v.contractName}>
                    <span>{v.contractName}</span>
                  </td>
                  <td className={`td-speed ${getSpeedClass(v.speed)}`}>{v.speed} km/h</td>
                  <td className="td-address td-truncate" title={v.address}>
                    <span>{v.address}</span>
                  </td>
                  <td className="td-date" title={formatDate(v.createdAt)}>{formatDate(v.createdAt)}</td>
                  <td className="td-actions">
                    <button
                      className="btn-delete-row"
                      onClick={() => requestDelete(v.id)}
                      disabled={deletingId === v.id}
                      title="Excluir infração"
                    >
                      <img src="/img/trash.png" alt="Excluir" className="delete-icon" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirmDeleteId !== null && (
        <div className="confirm-overlay" onClick={cancelDelete}>
          <div className="confirm-modal" onClick={(e) => e.stopPropagation()}>
            <div className="confirm-icon">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <p className="confirm-text">Tem certeza que deseja excluir esta infração?</p>
            <div className="confirm-actions">
              <button className="btn-confirm-yes" onClick={confirmDelete}>SIM</button>
              <button className="btn-confirm-no" onClick={cancelDelete}>NÃO</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
