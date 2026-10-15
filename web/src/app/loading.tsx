export default function Loading() {
  return (
    <main className="section">
      <div className="wrap page-loading" role="status" aria-live="polite">
        <span className="page-loading-indicator" aria-hidden="true" />
        <p className="muted">Cargando información…</p>
      </div>
    </main>
  );
}
