import { useState } from 'react';
import { TrafficBackground } from '../components/TrafficBackground';
import { ViolationForm } from '../components/ViolationForm';
import { ViolationList } from '../components/ViolationList';
import './Home.css';

export function Home() {
  const [refreshKey, setRefreshKey] = useState(0);

  function handleViolationCreated() {
    setRefreshKey((prev) => prev + 1);
  }

  return (
    <div className="home-page">
      <TrafficBackground />

      <header className="page-header">
        <div className="page-header-title">
          <img src="/img/carro.png" alt="Carro" />
          <h1>Via<span className="title-track">Track</span></h1>
        </div>
        <p>Sistema de Registro de Infrações de Trânsito</p>
      </header>

      <main className="page-content">
        <div className="content-grid">
          <aside className="form-section">
            <ViolationForm onViolationCreated={handleViolationCreated} />
          </aside>
          <section className="list-section">
            <ViolationList refreshKey={refreshKey} onViolationDeleted={handleViolationCreated} />
          </section>
        </div>
      </main>
    </div>
  );
}
