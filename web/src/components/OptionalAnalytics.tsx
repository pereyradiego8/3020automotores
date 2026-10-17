'use client';

import { useEffect, useState } from 'react';

const STORAGE_KEY = '3020-analytics-choice-v1';

/**
 * GA4 es opcional: no se carga ningún script ni cookie estadística sin una
 * aceptación explícita. La ID debe configurarse en NEXT_PUBLIC_GA_MEASUREMENT_ID.
 */
export default function OptionalAnalytics({ measurementId }: { measurementId: string | null }) {
  const [choice, setChoice] = useState<'accepted' | 'rejected' | null>(null);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    if (!measurementId) return;
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      if (saved === 'accepted' || saved === 'rejected') setChoice(saved);
    } catch {
      // Si no hay almacenamiento, pedimos permiso igualmente.
    }
  }, [measurementId]);

  useEffect(() => {
    if (!measurementId || choice !== 'accepted' || loaded) return;
    window.gtag = (...args: unknown[]) => {
      const dataLayer = (window as Window & { dataLayer?: unknown[] }).dataLayer ??= [];
      dataLayer.push(args);
    };
    window.gtag('js', new Date());
    window.gtag('config', measurementId, { anonymize_ip: true });
    const script = document.createElement('script');
    script.async = true;
    script.src = 'https://www.googletagmanager.com/gtag/js?id=' + encodeURIComponent(measurementId);
    script.dataset.analytics3020 = 'true';
    document.head.appendChild(script);
    setLoaded(true);
  }, [choice, loaded, measurementId]);

  if (!measurementId || choice) return null;

  const choose = (allow: boolean) => {
    const next = allow ? 'accepted' : 'rejected';
    try { window.localStorage.setItem(STORAGE_KEY, next); } catch { /* Sesión sin almacenamiento. */ }
    setChoice(next);
  };

  return (
    <aside className="analytics-consent" aria-label="Preferencias de estadísticas">
      <p><strong>Estadísticas opcionales.</strong> Con tu permiso medimos visitas y clics de contacto para mejorar el sitio. <a href="/privacidad">Más información</a>.</p>
      <div className="analytics-consent-actions">
        <button className="button secondary" type="button" onClick={() => choose(false)}>Continuar sin estadísticas</button>
        <button className="button" type="button" onClick={() => choose(true)}>Aceptar estadísticas</button>
      </div>
    </aside>
  );
}
